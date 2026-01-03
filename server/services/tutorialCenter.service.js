const supabase = require('../supabaseClient');

const tutorialCenterService = {
  // Get tutor's center with enhanced analytics
  async getMyCenter(tutorId) {
    try {
      // Get active center (not soft-deleted)
      const { data: center, error: centerError } = await supabase
        .from('tutorial_centers')
        .select('*')
        .eq('tutor_id', tutorId)
        .is('deleted_at', null)
        .maybeSingle();

      if (centerError) throw centerError;
      
      if (!center) {
        return {
          success: true,
          center: null,
          message: 'No tutorial center found. Create one to get started.'
        };
      }

      // Get counts
      const [studentCount, questionCount, testCount] = await Promise.all([
        supabase.from('tc_enrollments').select('*', { count: 'exact', head: true }).eq('center_id', center.id),
        supabase.from('tc_questions').select('*', { count: 'exact', head: true }).eq('center_id', center.id),
        supabase.from('tc_question_sets').select('*', { count: 'exact', head: true }).eq('center_id', center.id)
      ]);

      // Get analytics
      const { data: attempts } = await supabase
        .from('tc_student_attempts')
        .select('score, completed_at')
        .in('question_set_id', 
          (await supabase.from('tc_question_sets').select('id').eq('center_id', center.id)).data?.map(t => t.id) || []
        )
        .order('completed_at', { ascending: false })
        .limit(100);

      const totalAttempts = attempts?.length || 0;
      const avgScore = attempts?.length > 0 
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length 
        : 0;

      // Get top students
      const { data: topStudents } = await supabase
        .from('student_analytics')
        .select(`
          student_id,
          xp_points,
          level,
          tier,
          avg_score,
          total_tests_taken
        `)
        .eq('center_id', center.id)
        .order('xp_points', { ascending: false })
        .limit(5);

      // Get recent activity
      const recentActivity = attempts?.slice(0, 5).map(a => ({
        type: 'test',
        message: `Student scored ${a.score}% on a test`,
        time: new Date(a.completed_at).toLocaleString()
      })) || [];

      return {
        success: true,
        center: {
          ...center,
          student_count: [{ count: studentCount.count }],
          question_count: [{ count: questionCount.count }],
          test_count: [{ count: testCount.count }]
        },
        analytics: {
          totalAttempts,
          avgScore,
          topStudents: topStudents?.map(s => ({
            name: s.student_id,
            xp: s.xp_points,
            level: s.level,
            tier: s.tier,
            avgScore: s.avg_score
          })) || []
        },
        recentActivity
      };
    } catch (error) {
      console.error('Error getting center:', error);
      throw error;
    }
  },

  // Get enhanced leaderboard
  async getLeaderboard(questionSetId, filter = 'all') {
    try {
      let query = supabase
        .from('tc_student_attempts')
        .select('student_id, score, completed_at')
        .eq('question_set_id', questionSetId)
        .eq('is_first_attempt', true);

      // Apply time filter
      if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('completed_at', weekAgo.toISOString());
      } else if (filter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('completed_at', monthAgo.toISOString());
      }

      const { data: attempts, error } = await query.order('score', { ascending: false });

      if (error) throw error;

      // Get test info
      const { data: testInfo } = await supabase
        .from('tc_question_sets')
        .select('title, description')
        .eq('id', questionSetId)
        .single();

      // Get user details
      const studentIds = [...new Set(attempts.map(a => a.student_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      const userMap = {};
      profiles?.forEach(p => {
        userMap[p.id] = {
          email: p.email,
          name: p.full_name || p.email?.split('@')[0] || 'Unknown'
        };
      });

      const leaderboard = attempts.map((attempt, index) => ({
        rank: index + 1,
        studentId: attempt.student_id,
        studentName: userMap[attempt.student_id]?.name || 'Unknown',
        email: userMap[attempt.student_id]?.email || '',
        score: attempt.score,
        completedAt: attempt.completed_at
      }));

      return {
        success: true,
        leaderboard,
        testInfo
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  },

  // Get student analytics
  async getStudentAnalytics(studentId, centerId) {
    try {
      const { data: analytics, error } = await supabase
        .from('student_analytics')
        .select('*')
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: true,
        analytics: analytics || {
          xpPoints: 0,
          level: 1,
          tier: 'bronze',
          totalTestsTaken: 0,
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
          avgScore: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      };
    } catch (error) {
      console.error('Error getting student analytics:', error);
      throw error;
    }
  },

  // Get student achievements
  async getStudentAchievements(studentId) {
    try {
      const { data: studentAchievements, error } = await supabase
        .from('student_achievements')
        .select(`
          earned_at,
          achievements(*)
        `)
        .eq('student_id', studentId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        achievements: studentAchievements?.map(sa => ({
          ...sa.achievements,
          earnedAt: sa.earned_at
        })) || []
      };
    } catch (error) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  },

  // Get all available achievements
  async getAllAchievements() {
    try {
      const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        achievements: achievements || []
      };
    } catch (error) {
      console.error('Error getting all achievements:', error);
      throw error;
    }
  },

  // Create question with image support
  async createQuestion(tutorId, centerId, questionData) {
    try {
      const { data, error } = await supabase
        .from('tc_questions')
        .insert({
          tutor_id: tutorId,
          center_id: centerId,
          question_text: questionData.question_text,
          options: questionData.options,
          correct_answer: questionData.correct_answer,
          explanation: questionData.explanation,
          subject: questionData.subject,
          topic: questionData.topic,
          difficulty: questionData.difficulty,
          category: questionData.category,
          image_url: questionData.image_url || null,
          tags: questionData.tags || [],
          difficulty_level: questionData.difficulty_level || questionData.difficulty,
          subcategory: questionData.subcategory,
          year: questionData.year,
          exam_type: questionData.exam_type
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        question: data
      };
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Create question set with mode (practice/exam)
  async createQuestionSet(tutorId, centerId, setData) {
    try {
      const { data, error } = await supabase
        .from('tc_question_sets')
        .insert({
          tutor_id: tutorId,
          center_id: centerId,
          title: setData.title,
          description: setData.description,
          time_limit: setData.time_limit,
          passing_score: setData.passing_score,
          show_answers: setData.show_answers || false,
          is_active: setData.is_active !== false,
          mode: setData.mode || 'exam',
          visibility: setData.visibility || 'private'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        questionSet: data
      };
    } catch (error) {
      console.error('Error creating question set:', error);
      throw error;
    }
  },

  // Submit test attempt (triggers analytics update automatically)
  async submitAttempt(studentId, questionSetId, attemptData) {
    try {
      const { data, error } = await supabase
        .from('tc_student_attempts')
        .insert({
          student_id: studentId,
          question_set_id: questionSetId,
          answers: attemptData.answers,
          score: attemptData.score,
          total_questions: attemptData.total_questions,
          time_taken: attemptData.time_taken
        })
        .select()
        .single();

      if (error) throw error;

      // Get updated analytics
      const { data: analytics } = await supabase
        .from('student_analytics')
        .select('*')
        .eq('student_id', studentId)
        .single();

      // Check for new achievements
      const { data: newAchievements } = await supabase
        .from('student_achievements')
        .select(`
          achievements(*)
        `)
        .eq('student_id', studentId)
        .gte('earned_at', new Date(Date.now() - 5000).toISOString()); // Last 5 seconds

      return {
        success: true,
        attempt: data,
        analytics,
        newAchievements: newAchievements?.map(a => a.achievements) || []
      };
    } catch (error) {
      console.error('Error submitting attempt:', error);
      throw error;
    }
  }
};

module.exports = tutorialCenterService;
