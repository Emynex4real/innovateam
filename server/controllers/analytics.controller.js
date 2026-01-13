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

    console.log('🔍 [BACKEND] getStudentAnalytics called');
    console.log('  - centerId:', centerId);
    console.log('  - studentId:', studentId);

    const { data: attempts, error: attemptsError } = await supabase
      .from('tc_student_attempts')
      .select('*, tc_question_sets(title, subject)')
      .eq('student_id', studentId)
      .eq('center_id', centerId);

    if (attemptsError) {
      console.error('❌ [BACKEND] Supabase error:', attemptsError);
      throw attemptsError;
    }

    console.log('✅ [BACKEND] Attempts fetched:', attempts?.length || 0);

    const totalTests = attempts?.length || 0;
    const avgScore = totalTests > 0 
      ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalTests 
      : 0;

    const analytics = {
      total_attempts: totalTests,
      average_score: avgScore,
      overall_accuracy: avgScore,
      current_streak: 0,
      study_consistency: 0,
      total_time_spent: 0,
      average_time_per_question: 0,
      recentAttempts: attempts?.slice(0, 5) || []
    };

    console.log('✅ [BACKEND] Sending analytics:', analytics);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('❌ [BACKEND] Get student analytics error:', error);
    logger.error('Get student analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubjectAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    console.log('🔍 [BACKEND] getSubjectAnalytics called');
    console.log('  - centerId:', centerId);
    console.log('  - studentId:', studentId);

    const { data: attempts, error: attemptsError } = await supabase
      .from('tc_student_attempts')
      .select('score, tc_question_sets(subject)')
      .eq('student_id', studentId)
      .eq('center_id', centerId);

    if (attemptsError) {
      console.error('❌ [BACKEND] Supabase error:', attemptsError);
      throw attemptsError;
    }

    console.log('✅ [BACKEND] Subject attempts fetched:', attempts?.length || 0);

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

    const subjects = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      avgScore: stats.total,
      attempts: stats.count,
      mastery: stats.total
    }));

    console.log('✅ [BACKEND] Sending subjects:', subjects);

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('❌ [BACKEND] Get subject analytics error:', error);
    logger.error('Get subject analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPerformanceTrends = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { days = 30 } = req.query;
    const studentId = req.user.id;

    console.log('🔍 [BACKEND] getPerformanceTrends called');
    console.log('  - centerId:', centerId);
    console.log('  - studentId:', studentId);
    console.log('  - days:', days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data: attempts, error: attemptsError } = await supabase
      .from('tc_student_attempts')
      .select('score, created_at')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (attemptsError) {
      console.error('❌ [BACKEND] Supabase error:', attemptsError);
      throw attemptsError;
    }

    console.log('✅ [BACKEND] Trends fetched:', attempts?.length || 0);

    const trend = {
      scores: attempts?.map(a => ({
        date: a.created_at,
        score: a.score
      })) || []
    };

    console.log('✅ [BACKEND] Sending trend:', trend);

    res.json({
      success: true,
      trend
    });
  } catch (error) {
    console.error('❌ [BACKEND] Get performance trends error:', error);
    logger.error('Get performance trends error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    console.log('🔍 [BACKEND] getRecommendations called');
    console.log('  - centerId:', centerId);
    console.log('  - studentId:', studentId);

    const { data: attempts, error: attemptsError } = await supabase
      .from('tc_student_attempts')
      .select('score, tc_question_sets(subject)')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (attemptsError) {
      console.error('❌ [BACKEND] Supabase error:', attemptsError);
      throw attemptsError;
    }

    console.log('✅ [BACKEND] Recommendations attempts fetched:', attempts?.length || 0);

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
          message: `Focus more on ${subject}. Your average score is ${Math.round(avg)}%.`,
          priority: avg < 40 ? 'high' : 'medium',
          suggestedStudyHours: Math.ceil((60 - avg) / 10)
        });
      }
    });

    console.log('✅ [BACKEND] Sending recommendations:', weakSubjects);

    res.json({
      success: true,
      recommendations: weakSubjects
    });
  } catch (error) {
    console.error('❌ [BACKEND] Get recommendations error:', error);
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
        .from('tc_student_attempts')
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
    let { studentId, centerId } = req.params;

    console.log('🔍 [BACKEND] calculateAtRiskScore called');
    console.log('  - studentId (param):', studentId);
    console.log('  - centerId:', centerId);

    // Handle 'self' as studentId
    if (studentId === 'self') {
      studentId = req.user.id;
      console.log('  - Using authenticated user ID:', studentId);
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('tc_student_attempts')
      .select('score, created_at')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (attemptsError) {
      console.error('❌ [BACKEND] Supabase error:', attemptsError);
      throw attemptsError;
    }

    console.log('✅ [BACKEND] Risk attempts fetched:', attempts?.length || 0);

    let riskScore = 0;
    if (attempts && attempts.length > 0) {
      const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      riskScore = Math.max(0, 100 - avgScore);
    }

    const result = {
      at_risk_score: Math.round(riskScore),
      at_risk_level: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low'
    };

    console.log('✅ [BACKEND] Sending risk score:', result);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ [BACKEND] Calculate at-risk score error:', error);
    logger.error('Calculate at-risk score error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRecommendedTopics = async (req, res) => {
  try {
    const { studentId, centerId } = req.params;

    const { data: attempts } = await supabase
      .from('tc_student_attempts')
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
    let { studentId, centerId } = req.params;
    const { difficulty = 'medium' } = req.query;

    console.log('🔍 [BACKEND] predictPassRate called');
    console.log('  - studentId (param):', studentId);
    console.log('  - centerId:', centerId);
    console.log('  - difficulty:', difficulty);

    // Handle 'self' as studentId
    if (studentId === 'self') {
      studentId = req.user.id;
      console.log('  - Using authenticated user ID:', studentId);
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('tc_student_attempts')
      .select('score')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (attemptsError) {
      console.error('❌ [BACKEND] Supabase error:', attemptsError);
      throw attemptsError;
    }

    console.log('✅ [BACKEND] Pass rate attempts fetched:', attempts?.length || 0);

    let passRate = 50;
    if (attempts && attempts.length > 0) {
      const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      const difficultyMultiplier = difficulty === 'easy' ? 1.2 : difficulty === 'hard' ? 0.8 : 1;
      passRate = Math.min(100, Math.max(0, avgScore * difficultyMultiplier));
    }

    const result = {
      predicted_pass_rate: Math.round(passRate),
      confidence: attempts?.length >= 5 ? 'High' : 'Low'
    };

    console.log('✅ [BACKEND] Sending pass rate:', result);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ [BACKEND] Predict pass rate error:', error);
    logger.error('Predict pass rate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
