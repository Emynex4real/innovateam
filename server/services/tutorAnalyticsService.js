const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

const tutorAnalyticsService = {
  // Get comprehensive center analytics
  async getCenterAnalytics(tutorId) {
    try {
      // Get center
      const { data: center } = await supabase
        .from('tutorial_centers')
        .select('id')
        .eq('tutor_id', tutorId)
        .single();

      if (!center) {
        return {
          success: false,
          error: 'Center not found'
        };
      }

      const centerId = center.id;

      // Get center analytics
      const { data: centerAnalytics } = await supabase
        .from('center_analytics')
        .select('*')
        .eq('center_id', centerId)
        .single();

      // Get student performance
      const { data: studentPerf } = await supabase
        .from('student_performance_analytics')
        .select('student_id, average_score, total_attempts, study_consistency')
        .eq('center_id', centerId);

      // Get at-risk students
      const { data: atRiskStudents } = await supabase
        .from('student_predictions')
        .select('student_id, at_risk_score, at_risk_level, recommended_action')
        .eq('center_id', centerId)
        .gte('at_risk_score', 25)
        .order('at_risk_score', { ascending: false });

      // Get question analytics
      const { data: questionAnalytics } = await supabase
        .from('question_performance_analytics')
        .select('question_id, accuracy_rate, total_attempts, calculated_difficulty')
        .eq('center_id', centerId)
        .order('accuracy_rate', { ascending: true })
        .limit(10);

      // Get tutor insights
      const { data: insights } = await supabase
        .from('tutor_insights')
        .select('*')
        .eq('center_id', centerId)
        .eq('tutor_id', tutorId)
        .single();

      return {
        success: true,
        analytics: centerAnalytics || {
          total_students: studentPerf?.length || 0,
          average_student_score: 0,
          pass_rate: 0,
          at_risk_students: 0
        },
        studentPerformance: studentPerf || [],
        atRiskStudents: atRiskStudents || [],
        problematicQuestions: questionAnalytics || [],
        insights: insights || {}
      };
    } catch (error) {
      logger.error('Error getting center analytics:', error);
      throw error;
    }
  },

  // Get detailed student performance for tutor view
  async getStudentDetailedPerformance(tutorId, studentId, centerId) {
    try {
      const { data: analytics } = await supabase
        .from('student_performance_analytics')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .single();

      const { data: subjects } = await supabase
        .from('student_subject_performance')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId);

      const { data: predictions } = await supabase
        .from('student_predictions')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .single();

      const { data: sessions } = await supabase
        .from('study_session_logs')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .order('session_start', { ascending: false })
        .limit(20);

      return {
        success: true,
        analytics,
        subjects: subjects || [],
        predictions: predictions || {},
        recentSessions: sessions || []
      };
    } catch (error) {
      logger.error('Error getting student details:', error);
      throw error;
    }
  },

  // Get question performance analysis
  async getQuestionAnalysis(tutorId, centerId) {
    try {
      const { data: questions } = await supabase
        .from('question_performance_analytics')
        .select(`
          id,
          question_id,
          accuracy_rate,
          total_attempts,
          calculated_difficulty,
          is_flagged,
          flag_reason,
          tc_questions!inner(question_text, subject, difficulty)
        `)
        .eq('center_id', centerId)
        .order('accuracy_rate', { ascending: true });

      // Categorize questions
      const problematic = questions?.filter(q => q.accuracy_rate < 40) || [];
      const tooDifficult = questions?.filter(q => q.calculated_difficulty === 'hard' && q.accuracy_rate < 50) || [];
      const tooEasy = questions?.filter(q => q.accuracy_rate > 90) || [];
      const flagged = questions?.filter(q => q.is_flagged) || [];

      return {
        success: true,
        allQuestions: questions || [],
        problematic,
        tooDifficult,
        tooEasy,
        flagged,
        totalQuestions: questions?.length || 0
      };
    } catch (error) {
      logger.error('Error getting question analysis:', error);
      throw error;
    }
  },

  // Get test performance metrics
  async getTestAnalytics(tutorId, centerId) {
    try {
      const { data: tests } = await supabase
        .from('tc_question_sets')
        .select('id, title, description, created_at')
        .eq('center_id', centerId)
        .eq('tutor_id', tutorId);

      const testStats = await Promise.all(
        (tests || []).map(async (test) => {
          const { data: attempts } = await supabase
            .from('tc_student_attempts')
            .select('score, time_taken, completed_at')
            .eq('question_set_id', test.id);

          const avgScore = attempts?.length > 0
            ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
            : 0;

          const avgTime = attempts?.length > 0
            ? attempts.reduce((sum, a) => sum + a.time_taken, 0) / attempts.length
            : 0;

          return {
            testId: test.id,
            title: test.title,
            totalAttempts: attempts?.length || 0,
            averageScore: Math.round(avgScore),
            averageTimeSeconds: Math.round(avgTime),
            createdAt: test.created_at
          };
        })
      );

      return {
        success: true,
        tests: testStats,
        totalTests: testStats.length
      };
    } catch (error) {
      logger.error('Error getting test analytics:', error);
      throw error;
    }
  },

  // Generate tutor insights and recommendations
  async generateTutorInsights(tutorId, centerId) {
    try {
      const { data: analytics } = await supabase
        .from('center_analytics')
        .select('*')
        .eq('center_id', centerId)
        .single();

      const { data: atRiskCount } = await supabase
        .from('student_predictions')
        .select('id', { count: 'exact' })
        .eq('center_id', centerId)
        .gte('at_risk_score', 50);

      const { data: problemQuestions } = await supabase
        .from('question_performance_analytics')
        .select('id', { count: 'exact' })
        .eq('center_id', centerId)
        .lt('accuracy_rate', 40);

      // Calculate health score
      const alerts = [];
      let healthScore = 80;

      if (atRiskCount.count > (analytics?.total_students || 1) * 0.2) {
        alerts.push('High number of at-risk students detected');
        healthScore -= 15;
      }

      if (problemQuestions.count > 0) {
        alerts.push(`${problemQuestions.count} questions with low accuracy`);
        healthScore -= 10;
      }

      const healthStatus = healthScore >= 80 ? 'excellent'
        : healthScore >= 60 ? 'good'
        : healthScore >= 40 ? 'fair'
        : healthScore >= 20 ? 'poor'
        : 'critical';

      return {
        success: true,
        insights: {
          healthScore: Math.max(0, healthScore),
          healthStatus,
          alerts,
          recommendations: [
            atRiskCount.count > 0 && `Review progress with ${atRiskCount.count} at-risk students`,
            problemQuestions.count > 0 && `Revisit ${problemQuestions.count} difficult questions`,
            `Average student score: ${analytics?.average_student_score || 0}%`
          ].filter(Boolean)
        }
      };
    } catch (error) {
      logger.error('Error generating insights:', error);
      throw error;
    }
  }
};

module.exports = tutorAnalyticsService;
