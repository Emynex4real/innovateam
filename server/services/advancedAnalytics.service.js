const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class AdvancedAnalyticsService {
  /**
   * Get comprehensive analytics for tutor's center
   */
  async getAdvancedAnalytics(tutorId, timeRange = 'week') {
    try {
      // Get tutor's center
      const { data: center } = await supabase
        .from('tutorial_centers')
        .select('id')
        .eq('tutor_id', tutorId)
        .single();

      if (!center) {
        return { success: false, error: 'Center not found' };
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      switch(timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate = new Date('2000-01-01');
      }

      // Get all analytics data
      const [
        students,
        attempts,
        atRiskStudents,
        topicPerformance,
        performanceTrend,
        topPerformers
      ] = await Promise.all([
        this.getTotalStudents(center.id),
        this.getAttempts(center.id, startDate),
        this.getAtRiskStudents(center.id),
        this.getTopicPerformance(center.id, startDate),
        this.getPerformanceTrend(center.id, startDate),
        this.getTopPerformers(center.id, startDate)
      ]);

      const avgScore = attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0;

      return {
        success: true,
        analytics: {
          totalStudents: students.length,
          totalAttempts: attempts.length,
          avgScore,
          atRiskStudents: atRiskStudents.length,
          atRiskList: atRiskStudents,
          topicPerformance,
          performanceTrend,
          topPerformers
        }
      };
    } catch (error) {
      logger.error('Get advanced analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get total students in center
   */
  async getTotalStudents(centerId) {
    const { data } = await supabase
      .from('tc_enrollments')
      .select('student_id')
      .eq('center_id', centerId);
    return data || [];
  }

  /**
   * Get all attempts in time range
   */
  async getAttempts(centerId, startDate) {
    const { data } = await supabase
      .from('tc_student_attempts')
      .select('*, question_set:tc_question_sets!inner(center_id)')
      .eq('question_set.center_id', centerId)
      .gte('completed_at', startDate.toISOString());
    return data || [];
  }

  /**
   * Identify at-risk students
   */
  async getAtRiskStudents(centerId) {
    // Get all students with their attempts
    const { data: enrollments } = await supabase
      .from('tc_enrollments')
      .select('student_id')
      .eq('center_id', centerId);

    if (!enrollments) return [];

    const studentIds = enrollments.map(e => e.student_id);
    
    // Get attempts for these students
    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('student_id, score, question_set:tc_question_sets!inner(center_id)')
      .eq('question_set.center_id', centerId)
      .in('student_id', studentIds);

    // Get student profiles
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', studentIds);

    // Analyze each student
    const atRisk = [];
    for (const profile of profiles || []) {
      const studentAttempts = (attempts || []).filter(a => a.student_id === profile.id);
      
      if (studentAttempts.length === 0) {
        // No attempts = high risk
        atRisk.push({
          id: profile.id,
          name: profile.full_name || profile.email,
          avgScore: 0,
          attempts: 0,
          riskLevel: 'high',
          recommendation: 'No test attempts yet. Encourage participation.'
        });
        continue;
      }

      const avgScore = studentAttempts.reduce((sum, a) => sum + a.score, 0) / studentAttempts.length;
      const recentAttempts = studentAttempts.slice(-3);
      const recentAvg = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;

      // Risk criteria
      if (avgScore < 50 || recentAvg < 40) {
        atRisk.push({
          id: profile.id,
          name: profile.full_name || profile.email,
          avgScore: Math.round(avgScore),
          attempts: studentAttempts.length,
          riskLevel: avgScore < 40 ? 'high' : 'medium',
          recommendation: avgScore < 40 
            ? 'Urgent: Schedule one-on-one tutoring session.'
            : 'Consider additional practice materials.'
        });
      }
    }

    return atRisk.sort((a, b) => a.avgScore - b.avgScore);
  }

  /**
   * Get performance by topic/subject
   */
  async getTopicPerformance(centerId, startDate) {
    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select(`
        score,
        question_set:tc_question_sets!inner(
          center_id,
          questions:tc_question_set_items(
            question:tc_questions(subject)
          )
        )
      `)
      .eq('question_set.center_id', centerId)
      .gte('completed_at', startDate.toISOString());

    if (!attempts) return [];

    // Group by subject
    const subjectMap = new Map();
    for (const attempt of attempts) {
      const subjects = attempt.question_set.questions
        .map(q => q.question?.subject)
        .filter(Boolean);
      
      for (const subject of subjects) {
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, { scores: [], students: new Set() });
        }
        subjectMap.get(subject).scores.push(attempt.score);
        subjectMap.get(subject).students.add(attempt.student_id);
      }
    }

    // Calculate averages
    const performance = [];
    for (const [subject, data] of subjectMap.entries()) {
      performance.push({
        subject,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.scores.length,
        students: data.students.size
      });
    }

    return performance.sort((a, b) => a.avgScore - b.avgScore);
  }

  /**
   * Get performance trend over time
   */
  async getPerformanceTrend(centerId, startDate) {
    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('score, completed_at, question_set:tc_question_sets!inner(center_id)')
      .eq('question_set.center_id', centerId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: true });

    if (!attempts || attempts.length === 0) return [];

    // Group by date
    const dateMap = new Map();
    for (const attempt of attempts) {
      const date = new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date).push(attempt.score);
    }

    // Calculate daily averages
    const trend = [];
    for (const [date, scores] of dateMap.entries()) {
      trend.push({
        date,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        attempts: scores.length
      });
    }

    return trend.slice(-7); // Last 7 data points
  }

  /**
   * Get top performing students
   */
  async getTopPerformers(centerId, startDate) {
    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('student_id, score, question_set:tc_question_sets!inner(center_id)')
      .eq('question_set.center_id', centerId)
      .gte('completed_at', startDate.toISOString());

    if (!attempts) return [];

    // Group by student
    const studentMap = new Map();
    for (const attempt of attempts) {
      if (!studentMap.has(attempt.student_id)) {
        studentMap.set(attempt.student_id, []);
      }
      studentMap.get(attempt.student_id).push(attempt.score);
    }

    // Get student profiles
    const studentIds = Array.from(studentMap.keys());
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', studentIds);

    // Calculate averages
    const performers = [];
    for (const profile of profiles || []) {
      const scores = studentMap.get(profile.id);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      
      performers.push({
        id: profile.id,
        name: profile.full_name || profile.email,
        avgScore,
        attempts: scores.length
      });
    }

    return performers
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5); // Top 5
  }
}

module.exports = new AdvancedAnalyticsService();
