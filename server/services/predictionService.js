const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

const predictionService = {
  // Calculate at-risk score for a student
  async calculateAtRiskScore(studentId, centerId) {
    try {
      const { data: analytics } = await supabase
        .from('student_performance_analytics')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .single();

      if (!analytics) {
        return { at_risk_score: 0, at_risk_level: 'low' };
      }

      let score = 0;
      const factors = {
        score_declining: false,
        low_engagement: false,
        high_difficulty_struggle: false,
        inconsistent_performance: false
      };

      // Factor 1: Low average score (0-30 points)
      if (analytics.average_score < 50) {
        score += 30;
        factors.low_engagement = true;
      } else if (analytics.average_score < 70) {
        score += 15;
      }

      // Factor 2: Inactivity (0-25 points)
      if (analytics.last_activity) {
        const daysSinceActivity = Math.floor(
          (Date.now() - new Date(analytics.last_activity).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceActivity > 14) {
          score += 25;
          factors.low_engagement = true;
        } else if (daysSinceActivity > 7) {
          score += 12;
        }
      }

      // Factor 3: Declining trend (0-20 points)
      if (analytics.recent_score_trend < -10) {
        score += 20;
        factors.score_declining = true;
      }

      // Factor 4: Low consistency (0-15 points)
      if (analytics.study_consistency < 40) {
        score += 15;
        factors.inconsistent_performance = true;
      }

      // Factor 5: High failure rate on hard questions (0-10 points)
      const { data: hardAttempts } = await supabase
        .from('tc_student_attempts')
        .select('score')
        .eq('student_id', studentId)
        .gte('score', 0)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (hardAttempts && hardAttempts.length > 0) {
        const avgRecentScore = hardAttempts.reduce((sum, a) => sum + a.score, 0) / hardAttempts.length;
        if (avgRecentScore < analytics.average_score - 15) {
          score += 10;
          factors.high_difficulty_struggle = true;
        }
      }

      const at_risk_score = Math.min(100, Math.max(0, score));
      const at_risk_level = at_risk_score >= 75 ? 'critical'
        : at_risk_score >= 50 ? 'high'
        : at_risk_score >= 25 ? 'medium'
        : 'low';

      return {
        at_risk_score,
        at_risk_level,
        factors
      };
    } catch (error) {
      logger.error('Error calculating at-risk score:', error);
      throw error;
    }
  },

  // Get recommended topics for a student
  async getRecommendedTopics(studentId, centerId) {
    try {
      const { data: subjects } = await supabase
        .from('student_subject_performance')
        .select('subject, mastery_level, accuracy')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .order('mastery_level', { ascending: true });

      const recommended = (subjects || [])
        .filter(s => s.mastery_level < 70)
        .slice(0, 5)
        .map(s => ({
          subject: s.subject,
          currentMastery: s.mastery_level,
          target: 85
        }));

      return recommended;
    } catch (error) {
      logger.error('Error getting recommended topics:', error);
      throw error;
    }
  },

  // Predict pass rate on next test
  async predictPassRate(studentId, centerId, nextTestDifficulty = 'medium') {
    try {
      const { data: analytics } = await supabase
        .from('student_performance_analytics')
        .select('average_score, recent_score_trend')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .single();

      if (!analytics) return { predicted_pass_rate: 0 };

      let baseRate = analytics.average_score;

      // Adjust for trend
      if (analytics.recent_score_trend > 0) {
        baseRate += analytics.recent_score_trend / 2;
      } else {
        baseRate += analytics.recent_score_trend;
      }

      // Adjust for difficulty
      const difficultyModifier = nextTestDifficulty === 'hard' ? -10
        : nextTestDifficulty === 'easy' ? 10
        : 0;

      const predicted_pass_rate = Math.min(100, Math.max(0, baseRate + difficultyModifier));

      return {
        predicted_pass_rate: Math.round(predicted_pass_rate),
        confidence: Math.abs(analytics.recent_score_trend) < 5 ? 'high' : 'medium'
      };
    } catch (error) {
      logger.error('Error predicting pass rate:', error);
      throw error;
    }
  },

  // Update all at-risk predictions for a center
  async updateCenterAtRiskPredictions(centerId) {
    try {
      // Get all students in center
      const { data: enrollments } = await supabase
        .from('tc_enrollments')
        .select('student_id')
        .eq('center_id', centerId);

      if (!enrollments || enrollments.length === 0) {
        return { success: true, updated: 0 };
      }

      let updatedCount = 0;

      for (const enrollment of enrollments) {
        const { at_risk_score, at_risk_level, factors } = await this.calculateAtRiskScore(
          enrollment.student_id,
          centerId
        );

        const recommendedTopics = await this.getRecommendedTopics(enrollment.student_id, centerId);
        const { predicted_pass_rate } = await this.predictPassRate(enrollment.student_id, centerId);

        // Get recommendation
        let recommendedAction = null;
        if (at_risk_level === 'critical') {
          recommendedAction = 'Immediate intervention required - Contact student immediately';
        } else if (at_risk_level === 'high') {
          recommendedAction = 'Schedule a review session with student';
        } else if (at_risk_level === 'medium') {
          recommendedAction = 'Monitor progress closely';
        }

        // Upsert prediction
        const { error } = await supabase
          .from('student_predictions')
          .upsert({
            student_id: enrollment.student_id,
            center_id: centerId,
            at_risk_score,
            at_risk_level,
            score_declining: factors.score_declining,
            low_engagement: factors.low_engagement,
            high_difficulty_struggle: factors.high_difficulty_struggle,
            inconsistent_performance: factors.inconsistent_performance,
            predicted_pass_rate,
            recommended_action: recommendedAction,
            recommended_topics: recommendedTopics,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'student_id,center_id'
          });

        if (!error) updatedCount++;
      }

      logger.info(`Updated at-risk predictions for ${updatedCount} students in center ${centerId}`);

      return { success: true, updated: updatedCount };
    } catch (error) {
      logger.error('Error updating center predictions:', error);
      throw error;
    }
  },

  // Get at-risk students for a tutor
  async getAtRiskStudents(tutorId, centerId) {
    try {
      const { data: atRiskStudents } = await supabase
        .from('student_predictions')
        .select(`
          student_id,
          at_risk_score,
          at_risk_level,
          recommended_action,
          score_declining,
          low_engagement,
          high_difficulty_struggle,
          predicted_pass_rate,
          recommended_topics,
          updated_at
        `)
        .eq('center_id', centerId)
        .gte('at_risk_score', 25)
        .order('at_risk_score', { ascending: false });

      // Get student details
      const enrichedStudents = await Promise.all(
        (atRiskStudents || []).map(async (student) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', student.student_id)
            .single();

          const { data: analytics } = await supabase
            .from('student_performance_analytics')
            .select('average_score, total_attempts, current_streak, last_activity')
            .eq('student_id', student.student_id)
            .eq('center_id', centerId)
            .single();

          return {
            ...student,
            studentName: profile?.full_name || 'Unknown',
            email: profile?.email || '',
            averageScore: analytics?.average_score || 0,
            totalAttempts: analytics?.total_attempts || 0,
            lastActivity: analytics?.last_activity
          };
        })
      );

      // Group by risk level
      const grouped = {
        critical: enrichedStudents.filter(s => s.at_risk_level === 'critical'),
        high: enrichedStudents.filter(s => s.at_risk_level === 'high'),
        medium: enrichedStudents.filter(s => s.at_risk_level === 'medium')
      };

      return {
        success: true,
        all: enrichedStudents,
        ...grouped,
        total: enrichedStudents.length,
        criticalCount: grouped.critical.length
      };
    } catch (error) {
      logger.error('Error getting at-risk students:', error);
      throw error;
    }
  }
};

module.exports = predictionService;
