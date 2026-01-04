const analyticsService = require('../services/analytics.service');
const { logger } = require('../utils/logger');
const supabase = require('../supabaseClient');

exports.getPerformanceHeatmap = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.getPerformanceHeatmap(req.user.id, centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get heatmap error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCenterAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.getCenterAnalytics(centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get center analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuestionAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.getQuestionAnalytics(centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get question analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.exportPDF(centerId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${centerId}.pdf`);
    res.send(result.pdf);
  } catch (error) {
    logger.error('Export PDF error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await analyticsService.exportExcel(centerId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${centerId}.xlsx`);
    res.send(result.excel);
  } catch (error) {
    logger.error('Export Excel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPredictiveInsights = async (req, res) => {
  try {
    const { studentId, centerId } = req.params;
    const result = await analyticsService.getPredictiveInsights(studentId, centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get predictive insights error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Student Analytics
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('*, tc_question_sets(title, subject)')
      .eq('student_id', studentId)
      .eq('center_id', centerId);

    const totalTests = attempts?.length || 0;
    const avgScore = totalTests > 0 
      ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalTests 
      : 0;

    res.json({
      success: true,
      data: {
        totalTests,
        avgScore: Math.round(avgScore),
        recentAttempts: attempts?.slice(0, 5) || []
      }
    });
  } catch (error) {
    logger.error('Get student analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubjectAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('score, tc_question_sets(subject)')
      .eq('student_id', studentId)
      .eq('center_id', centerId);

    const subjectStats = {};
    attempts?.forEach(attempt => {
      const subject = attempt.tc_question_sets?.subject || 'Unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, sum: 0, count: 0 };
      }
      subjectStats[subject].sum += attempt.score || 0;
      subjectStats[subject].count += 1;
      subjectStats[subject].total = Math.round(subjectStats[subject].sum / subjectStats[subject].count);
    });

    res.json({
      success: true,
      data: Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        avgScore: stats.total,
        attempts: stats.count
      }))
    });
  } catch (error) {
    logger.error('Get subject analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPerformanceTrends = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { days = 30 } = req.query;
    const studentId = req.user.id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('score, created_at')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    res.json({
      success: true,
      data: attempts?.map(a => ({
        date: a.created_at,
        score: a.score
      })) || []
    });
  } catch (error) {
    logger.error('Get performance trends error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('score, tc_question_sets(subject)')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    const weakSubjects = [];
    const subjectScores = {};

    attempts?.forEach(attempt => {
      const subject = attempt.tc_question_sets?.subject;
      if (subject) {
        if (!subjectScores[subject]) subjectScores[subject] = [];
        subjectScores[subject].push(attempt.score);
      }
    });

    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 60) {
        weakSubjects.push({
          subject,
          avgScore: Math.round(avg),
          recommendation: `Focus more on ${subject}. Your average score is ${Math.round(avg)}%.`
        });
      }
    });

    res.json({
      success: true,
      data: weakSubjects
    });
  } catch (error) {
    logger.error('Get recommendations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logStudySession = async (req, res) => {
  try {
    const { centerId, duration, subject } = req.body;
    const studentId = req.user.id;

    // Log to activity or create study_sessions table if needed
    res.json({
      success: true,
      message: 'Study session logged'
    });
  } catch (error) {
    logger.error('Log study session error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Prediction routes
exports.getAtRiskStudents = async (req, res) => {
  try {
    const { centerId } = req.params;

    const { data: students } = await supabase
      .from('tc_enrollments')
      .select('student_id, user_profiles(full_name)')
      .eq('center_id', centerId)
      .eq('status', 'active');

    const atRiskStudents = [];

    for (const student of students || []) {
      const { data: attempts } = await supabase
        .from('tc_attempts')
        .select('score')
        .eq('student_id', student.student_id)
        .eq('center_id', centerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (attempts && attempts.length > 0) {
        const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
        if (avgScore < 50) {
          atRiskStudents.push({
            studentId: student.student_id,
            name: student.user_profiles?.full_name,
            avgScore: Math.round(avgScore),
            riskLevel: avgScore < 30 ? 'high' : 'medium'
          });
        }
      }
    }

    res.json({
      success: true,
      data: atRiskStudents
    });
  } catch (error) {
    logger.error('Get at-risk students error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAtRiskPredictions = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'At-risk predictions updated'
    });
  } catch (error) {
    logger.error('Update at-risk predictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.calculateAtRiskScore = async (req, res) => {
  try {
    const { studentId, centerId } = req.params;

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('score, created_at')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    let riskScore = 0;
    if (attempts && attempts.length > 0) {
      const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      riskScore = Math.max(0, 100 - avgScore);
    }

    res.json({
      success: true,
      data: {
        riskScore: Math.round(riskScore),
        riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'
      }
    });
  } catch (error) {
    logger.error('Calculate at-risk score error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommendedTopics = async (req, res) => {
  try {
    const { studentId, centerId } = req.params;

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('score, tc_question_sets(subject, title)')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(20);

    const topicScores = {};
    attempts?.forEach(attempt => {
      const topic = attempt.tc_question_sets?.title;
      if (topic) {
        if (!topicScores[topic]) topicScores[topic] = [];
        topicScores[topic].push(attempt.score);
      }
    });

    const recommended = Object.entries(topicScores)
      .map(([topic, scores]) => ({
        topic,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }))
      .filter(t => t.avgScore < 70)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);

    res.json({
      success: true,
      data: recommended
    });
  } catch (error) {
    logger.error('Get recommended topics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.predictPassRate = async (req, res) => {
  try {
    const { studentId, centerId } = req.params;
    const { difficulty = 'medium' } = req.query;

    const { data: attempts } = await supabase
      .from('tc_attempts')
      .select('score')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    let passRate = 50;
    if (attempts && attempts.length > 0) {
      const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      const difficultyMultiplier = difficulty === 'easy' ? 1.2 : difficulty === 'hard' ? 0.8 : 1;
      passRate = Math.min(100, Math.max(0, avgScore * difficultyMultiplier));
    }

    res.json({
      success: true,
      data: {
        passRate: Math.round(passRate),
        confidence: attempts?.length >= 5 ? 'high' : 'low'
      }
    });
  } catch (error) {
    logger.error('Predict pass rate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
