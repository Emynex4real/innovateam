const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

const analyticsService = {
  // Get student's overall performance analytics
  async getStudentAnalytics(studentId, centerId) {
    try {
      const { data: analytics, error } = await supabase
        .from('student_performance_analytics')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const { data: subjectPerf } = await supabase
        .from('student_subject_performance')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .order('mastery_level', { ascending: false });

      const { data: history } = await supabase
        .from('performance_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .order('snapshot_date', { ascending: false })
        .limit(30);

      return {
        success: true,
        analytics: analytics || {
          total_attempts: 0,
          average_score: 0,
          overall_accuracy: 0,
          study_consistency: 0,
          current_streak: 0,
          strongest_subject: null,
          weakest_subject: null
        },
        subjects: subjectPerf || [],
        history: history || []
      };
    } catch (error) {
      logger.error('Error getting student analytics:', error);
      throw error;
    }
  },

  // Get student performance by subject
  async getStudentSubjectAnalytics(studentId, centerId) {
    try {
      const { data: subjects, error } = await supabase
        .from('student_subject_performance')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .order('mastery_level', { ascending: false });

      if (error) throw error;

      // Identify weak areas (< 60% mastery)
      const weakAreas = subjects.filter(s => s.mastery_level < 60);
      const strongAreas = subjects.filter(s => s.mastery_level >= 80);

      return {
        success: true,
        subjects,
        weakAreas,
        strongAreas,
        totalSubjects: subjects.length,
        averageMastery: subjects.length > 0
          ? subjects.reduce((sum, s) => sum + s.mastery_level, 0) / subjects.length
          : 0
      };
    } catch (error) {
      logger.error('Error getting subject analytics:', error);
      throw error;
    }
  },

  // Get performance trends
  async getPerformanceTrends(studentId, centerId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: history, error } = await supabase
        .from('performance_history')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;

      // Calculate trend
      const trend = {
        scores: history.map(h => ({ date: h.snapshot_date, score: h.daily_average_score })),
        accuracy: history.map(h => ({ date: h.snapshot_date, accuracy: h.daily_accuracy })),
        attempts: history.map(h => ({ date: h.snapshot_date, attempts: h.daily_attempts }))
      };

      return { success: true, trend, dataPoints: history.length };
    } catch (error) {
      logger.error('Error getting trends:', error);
      throw error;
    }
  },

  // Get study recommendations based on weak areas
  async getStudyRecommendations(studentId, centerId) {
    try {
      const { data: weakSubjects } = await supabase
        .from('student_subject_performance')
        .select('subject, mastery_level, accuracy')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .lt('mastery_level', 60)
        .order('mastery_level', { ascending: true })
        .limit(5);

      const recommendations = weakSubjects?.map(s => ({
        subject: s.subject,
        currentMastery: s.mastery_level,
        suggestedStudyHours: Math.ceil((100 - s.mastery_level) / 20),
        priority: s.mastery_level < 40 ? 'high' : 'medium',
        message: `Improve your ${s.subject} skills (Current: ${s.mastery_level}%)`
      })) || [];

      return {
        success: true,
        recommendations,
        totalWeakAreas: recommendations.length,
        estimatedHoursNeeded: recommendations.reduce((sum, r) => sum + r.suggestedStudyHours, 0)
      };
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Log study session
  async logStudySession(studentId, centerId, sessionData) {
    try {
      const { data, error } = await supabase
        .from('study_session_logs')
        .insert({
          student_id: studentId,
          center_id: centerId,
          question_set_id: sessionData.question_set_id || null,
          session_start: sessionData.start_time,
          session_end: sessionData.end_time,
          duration_seconds: Math.floor((new Date(sessionData.end_time) - new Date(sessionData.start_time)) / 1000),
          questions_attempted: sessionData.questions_attempted,
          questions_correct: sessionData.questions_correct,
          session_score: sessionData.score,
          focus_quality: sessionData.focus_quality || 'normal'
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, session: data };
    } catch (error) {
      logger.error('Error logging study session:', error);
      throw error;
    }
  }
};

module.exports = analyticsService;
