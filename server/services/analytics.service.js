const supabase = require('../supabaseClient');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const analyticsService = {
  // Get performance heatmap
  async getPerformanceHeatmap(studentId, centerId) {
    const { data, error } = await supabase
      .from('performance_heatmaps')
      .select('*')
      .eq('student_id', studentId)
      .eq('center_id', centerId);

    if (error) throw error;

    // Group by subject
    const heatmap = {};
    data.forEach(item => {
      if (!heatmap[item.subject]) {
        heatmap[item.subject] = [];
      }
      heatmap[item.subject].push({
        topic: item.topic,
        difficulty: item.difficulty_level,
        successRate: item.success_rate,
        questionsAttempted: item.questions_attempted,
        avgTime: item.avg_time_seconds
      });
    });

    return { success: true, heatmap };
  },

  // Get center analytics
  async getCenterAnalytics(centerId) {
    // Get all students in center
    const { data: students } = await supabase
      .from('student_analytics')
      .select('*')
      .eq('center_id', centerId);

    // Get all attempts
    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('*, tc_question_sets!inner(center_id)')
      .eq('tc_question_sets.center_id', centerId);

    // Calculate metrics
    const totalStudents = students.length;
    const avgScore = students.reduce((sum, s) => sum + parseFloat(s.avg_score), 0) / totalStudents || 0;
    const totalAttempts = attempts.length;
    const passRate = attempts.filter(a => a.score >= 70).length / totalAttempts * 100 || 0;

    // Performance by subject
    const { data: questions } = await supabase
      .from('tc_questions')
      .select('subject, difficulty')
      .eq('center_id', centerId);

    const subjectStats = {};
    questions.forEach(q => {
      if (!subjectStats[q.subject]) {
        subjectStats[q.subject] = { easy: 0, medium: 0, hard: 0 };
      }
      subjectStats[q.subject][q.difficulty]++;
    });

    // At-risk students (avg score < 50%)
    const atRiskStudents = students.filter(s => s.avg_score < 50);

    // Top performers
    const topPerformers = students
      .sort((a, b) => b.xp_points - a.xp_points)
      .slice(0, 10);

    return {
      success: true,
      analytics: {
        totalStudents,
        avgScore,
        totalAttempts,
        passRate,
        subjectStats,
        atRiskStudents: atRiskStudents.length,
        topPerformers
      }
    };
  },

  // Get question analytics
  async getQuestionAnalytics(centerId) {
    const { data, error } = await supabase
      .from('tc_questions')
      .select('*')
      .eq('center_id', centerId)
      .order('times_answered', { ascending: false });

    if (error) throw error;

    const analytics = data.map(q => ({
      id: q.id,
      question: q.question_text.substring(0, 100),
      subject: q.subject,
      difficulty: q.difficulty,
      timesAnswered: q.times_answered,
      timesCorrect: q.times_correct,
      successRate: q.times_answered > 0 ? (q.times_correct / q.times_answered * 100).toFixed(1) : 0,
      avgTime: q.avg_time_seconds
    }));

    // Most difficult questions
    const mostDifficult = analytics
      .filter(q => q.timesAnswered >= 5)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 10);

    // Most answered questions
    const mostAnswered = analytics.slice(0, 10);

    return {
      success: true,
      analytics: {
        all: analytics,
        mostDifficult,
        mostAnswered
      }
    };
  },

  // Export report as PDF
  async exportPDF(centerId, reportType = 'full') {
    const analytics = await this.getCenterAnalytics(centerId);
    
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    
    // Header
    doc.fontSize(20).text('Tutorial Center Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(16).text('Summary');
    doc.fontSize(12);
    doc.text(`Total Students: ${analytics.analytics.totalStudents}`);
    doc.text(`Average Score: ${analytics.analytics.avgScore.toFixed(1)}%`);
    doc.text(`Total Attempts: ${analytics.analytics.totalAttempts}`);
    doc.text(`Pass Rate: ${analytics.analytics.passRate.toFixed(1)}%`);
    doc.text(`At-Risk Students: ${analytics.analytics.atRiskStudents}`);
    doc.moveDown(2);

    // Top Performers
    doc.fontSize(16).text('Top Performers');
    doc.fontSize(12);
    analytics.analytics.topPerformers.forEach((student, idx) => {
      doc.text(`${idx + 1}. ${student.xp_points} XP - Level ${student.level}`);
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve({ success: true, pdf: pdfBuffer });
      });
    });
  },

  // Export report as Excel
  async exportExcel(centerId) {
    const analytics = await this.getCenterAnalytics(centerId);
    const questionAnalytics = await this.getQuestionAnalytics(centerId);

    const workbook = new ExcelJS.Workbook();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ];
    summarySheet.addRows([
      { metric: 'Total Students', value: analytics.analytics.totalStudents },
      { metric: 'Average Score', value: `${analytics.analytics.avgScore.toFixed(1)}%` },
      { metric: 'Total Attempts', value: analytics.analytics.totalAttempts },
      { metric: 'Pass Rate', value: `${analytics.analytics.passRate.toFixed(1)}%` },
      { metric: 'At-Risk Students', value: analytics.analytics.atRiskStudents }
    ]);

    // Questions sheet
    const questionsSheet = workbook.addWorksheet('Questions');
    questionsSheet.columns = [
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Subject', key: 'subject', width: 15 },
      { header: 'Difficulty', key: 'difficulty', width: 15 },
      { header: 'Times Answered', key: 'timesAnswered', width: 15 },
      { header: 'Success Rate', key: 'successRate', width: 15 }
    ];
    questionsSheet.addRows(questionAnalytics.analytics.all);

    const buffer = await workbook.xlsx.writeBuffer();
    return { success: true, excel: buffer };
  },

  // Predictive insights
  async getPredictiveInsights(studentId, centerId) {
    const { data: analytics } = await supabase
      .from('student_analytics')
      .select('*')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .single();

    if (!analytics) {
      return { success: true, insights: [] };
    }

    const insights = [];

    // Dropout risk
    if (analytics.current_streak === 0 && analytics.total_tests_taken > 5) {
      insights.push({
        type: 'warning',
        title: 'Dropout Risk',
        message: 'Student has broken their streak. Consider reaching out.',
        action: 'Send encouragement message'
      });
    }

    // Performance prediction
    const trendScore = analytics.avg_score;
    if (trendScore < 50) {
      insights.push({
        type: 'danger',
        title: 'Low Performance',
        message: 'Student is struggling. Recommend additional practice.',
        action: 'Create personalized study plan'
      });
    } else if (trendScore >= 80) {
      insights.push({
        type: 'success',
        title: 'High Achiever',
        message: 'Student is excelling. Consider advanced material.',
        action: 'Assign challenging tests'
      });
    }

    // Engagement prediction
    if (analytics.total_tests_taken < 3 && analytics.current_streak < 2) {
      insights.push({
        type: 'info',
        title: 'Low Engagement',
        message: 'Student needs motivation. Try gamification features.',
        action: 'Enable challenges'
      });
    }

    return { success: true, insights };
  }
};

module.exports = analyticsService;
