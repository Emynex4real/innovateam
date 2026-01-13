const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const tutorialCenterService = require('../services/tutorialCenter.service');

// Create tutorial center
exports.createCenter = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tutorId = req.user.id;

    // Check if tutor has any center (including soft-deleted)
    const { data: existing, error: existingError } = await supabase
      .from('tutorial_centers')
      .select('id, deleted_at')
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (existingError) {
      logger.error('Error checking existing center:', existingError);
      throw existingError;
    }

    // If center exists and is deleted, restore it
    if (existing && existing.deleted_at) {
      const { data, error } = await supabase
        .from('tutorial_centers')
        .update({ 
          name, 
          description, 
          deleted_at: null 
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      logger.info('Tutorial center restored', { centerId: data.id, tutorId });
      return res.json({ success: true, center: data });
    }

    // If center exists and is active
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You already have a tutorial center'
      });
    }

    // Create new center
    const { data, error: insertError } = await supabase
      .from('tutorial_centers')
      .insert([{ tutor_id: tutorId, name, description }])
      .select()
      .single();

    if (insertError) {
      logger.error('Error inserting center:', insertError);
      throw insertError;
    }

    logger.info('Tutorial center created', { centerId: data.id, tutorId });
    res.json({ success: true, center: data });
  } catch (error) {
    logger.error('Create center error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get tutor's center with analytics
exports.getMyCenter = async (req, res) => {
  try {
    console.log('🔍 getMyCenter called for user:', req.user.id);
    const result = await tutorialCenterService.getMyCenter(req.user.id);
    console.log('✅ getMyCenter result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    logger.error('Get center error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete center (soft delete)
exports.deleteCenter = async (req, res) => {
  try {
    const { reason } = req.body;
    const tutorId = req.user.id;

    console.log('Delete request from tutor:', tutorId);

    // Get center ID
    const { data: center, error: selectError } = await supabase
      .from('tutorial_centers')
      .select('id, name, deleted_at')
      .eq('tutor_id', tutorId);

    console.log('Query result:', { center, selectError });

    if (selectError) throw selectError;
    
    if (!center || center.length === 0) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    const centerData = center[0];

    // Call stored procedure with tutor_id
    const { data, error } = await supabase.rpc('delete_tutorial_center', {
      center_id_param: centerData.id,
      tutor_id_param: tutorId,
      reason: reason || 'No reason provided'
    });

    console.log('RPC result:', { data, error });

    if (error) throw error;
    
    if (data && !data.success) {
      throw new Error(data.error || 'Failed to delete center');
    }

    logger.info('Tutorial center deleted', { centerId: centerData.id, tutorId });
    res.json(data);
  } catch (error) {
    logger.error('Delete center error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update center
exports.updateCenter = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tutorial_centers')
      .update({ name, description })
      .eq('tutor_id', tutorId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, center: data });
  } catch (error) {
    logger.error('Update center error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get center students
exports.getCenterStudents = async (req, res) => {
  console.log('🎯 getCenterStudents called - User:', req.user?.id);
  try {
    const tutorId = req.user.id;

    // Get center first
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    // Get enrolled students
    const { data: enrollments, error } = await supabase
      .from('tc_enrollments')
      .select('student_id, enrolled_at')
      .eq('center_id', center.id);

    if (error) throw error;

    // Get student details from user_profiles
    const studentIds = enrollments.map(e => e.student_id);
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .in('id', studentIds);

    // Get attempt stats for each student
    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('student_id, score, question_set_id')
      .in('student_id', studentIds);

    // Combine data
    const students = enrollments.map(e => {
      const profile = profiles?.find(p => p.id === e.student_id);
      const studentAttempts = attempts?.filter(a => a.student_id === e.student_id) || [];
      const avgScore = studentAttempts.length > 0
        ? Math.round(studentAttempts.reduce((sum, a) => sum + a.score, 0) / studentAttempts.length)
        : 0;

      return {
        id: e.student_id,
        email: profile?.email || 'Unknown',
        name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
        enrolled_at: e.enrolled_at,
        total_attempts: studentAttempts.length,
        average_score: avgScore
      };
    });

    res.json({ success: true, students, center_id: center.id });
  } catch (error) {
    logger.error('Get students error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;
    const { filter } = req.query;
    const result = await tutorialCenterService.getLeaderboard(testId, filter);
    res.json(result);
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student analytics
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await tutorialCenterService.getStudentAnalytics(req.user.id, centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get advanced analytics
exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const advancedAnalyticsService = require('../services/advancedAnalytics.service');
    const result = await advancedAnalyticsService.getAdvancedAnalytics(req.user.id, timeRange);
    res.json(result);
  } catch (error) {
    logger.error('Get advanced analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student achievements
exports.getMyAchievements = async (req, res) => {
  try {
    const result = await tutorialCenterService.getStudentAchievements(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Get achievements error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const result = await tutorialCenterService.getAllAchievements();
    res.json(result);
  } catch (error) {
    logger.error('Get all achievements error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== ENHANCED STUDENT MANAGEMENT =====

// Get individual student profile
exports.getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user.id;

    console.log('🔍 Getting student profile:', { studentId, tutorId });

    // Get tutor's center
    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (centerError) {
      console.error('❌ Center error:', centerError);
      throw centerError;
    }

    if (!center) {
      console.log('❌ No center found for tutor');
      return res.status(404).json({ success: false, error: 'Tutorial center not found' });
    }

    console.log('✅ Center found:', center.id);

    // Check enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('tc_enrollments')
      .select('*')
      .eq('center_id', center.id)
      .eq('student_id', studentId)
      .maybeSingle();

    if (enrollError) {
      console.error('❌ Enrollment error:', enrollError);
      throw enrollError;
    }

    if (!enrollment) {
      console.log('❌ Student not enrolled in this center');
      return res.status(403).json({ success: false, error: 'Student not enrolled in your center' });
    }

    console.log('✅ Enrollment found');

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      throw profileError;
    }

    console.log('✅ Profile found:', profile?.email);

    // Get attempts for this center's tests
    const { data: centerTests } = await supabase
      .from('tc_question_sets')
      .select('id')
      .eq('center_id', center.id);

    const testIds = centerTests?.map(t => t.id) || [];

    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('*')
      .eq('student_id', studentId)
      .in('question_set_id', testIds);

    console.log('✅ Found attempts:', attempts?.length || 0);

    const avgScore = attempts?.length ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0;
    const totalXP = attempts?.reduce((sum, a) => sum + (a.xp_earned || 0), 0) || 0;

    const student = {
      id: studentId,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
      email: profile?.email,
      enrolled_at: enrollment.enrolled_at,
      total_tests: attempts?.length || 0,
      average_score: avgScore,
      total_xp: totalXP,
      level: Math.floor(totalXP / 100) + 1,
      tier: totalXP > 1000 ? 'gold' : totalXP > 500 ? 'silver' : 'bronze'
    };

    console.log('✅ Sending student data:', student);

    res.json({ success: true, student });
  } catch (error) {
    console.error('❌ Get student profile error:', error);
    logger.error('Get student profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student test history
exports.getStudentTestHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user.id;

    console.log('🔍 Getting test history:', { studentId, tutorId });

    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) {
      console.log('❌ No center found');
      return res.status(404).json({ success: false, error: 'Center not found' });
    }

    console.log('✅ Center found:', center.id);

    // Get all tests from this center
    const { data: centerTests } = await supabase
      .from('tc_question_sets')
      .select('id')
      .eq('center_id', center.id);

    const testIds = centerTests?.map(t => t.id) || [];
    console.log('📝 Center test IDs:', testIds);

    // Get attempts for these tests only
    const { data: attempts, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        tc_question_sets(title)
      `)
      .eq('student_id', studentId)
      .in('question_set_id', testIds)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('❌ Query error:', error);
      throw error;
    }

    console.log('✅ Found attempts:', attempts?.length || 0);

    res.json({ success: true, attempts: attempts || [] });
  } catch (error) {
    console.error('❌ Get test history error:', error);
    logger.error('Get test history error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student detailed analytics
exports.getStudentDetailedAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get attempts with question set details
    // Note: tc_question_sets doesn't have subject/topic columns
    // We'll group by test title instead
    const { data: attempts, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        score,
        question_set_id,
        tc_question_sets!inner(title)
      `)
      .eq('student_id', studentId);

    if (error) throw error;

    // Group by test/question set and calculate performance
    const testPerformance = {};
    attempts?.forEach(a => {
      const testTitle = a.tc_question_sets?.title || 'Unknown Test';
      if (!testPerformance[testTitle]) {
        testPerformance[testTitle] = { total: 0, count: 0, scores: [] };
      }
      testPerformance[testTitle].total += a.score;
      testPerformance[testTitle].count++;
      testPerformance[testTitle].scores.push(a.score);
    });

    // Format analytics with detailed metrics
    const analytics = Object.entries(testPerformance).map(([subject, data]) => {
      const avgScore = Math.round(data.total / data.count);
      const maxScore = Math.max(...data.scores);
      const minScore = Math.min(...data.scores);
      const trend = data.scores.length > 1 
        ? data.scores[data.scores.length - 1] - data.scores[0]
        : 0;

      return {
        subject, // Using test title as subject for now
        avgScore,
        maxScore,
        minScore,
        attempts: data.count,
        trend,
        performance: avgScore >= 80 ? 'excellent' : avgScore >= 60 ? 'good' : avgScore >= 40 ? 'fair' : 'needs improvement'
      };
    });

    // Sort by average score descending
    analytics.sort((a, b) => b.avgScore - a.avgScore);

    res.json({ success: true, analytics });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student progress over time
exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = 'month' } = req.query;

    const daysAgo = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const { data: attempts } = await supabase
      .from('tc_student_attempts')
      .select('score, completed_at')
      .eq('student_id', studentId)
      .gte('completed_at', startDate)
      .order('completed_at');

    res.json({ success: true, progress: attempts || [] });
  } catch (error) {
    logger.error('Get progress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate student report
exports.generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = 'week' } = req.body;

    const daysAgo = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', studentId).single();
    const { data: attempts } = await supabase.from('tc_student_attempts').select('*').eq('student_id', studentId).gte('completed_at', startDate);

    const avgScore = attempts?.length ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0;

    const report = {
      student: { name: profile?.full_name, email: profile?.email },
      period,
      generated_at: new Date().toISOString(),
      summary: {
        tests_taken: attempts?.length || 0,
        average_score: avgScore,
        highest_score: Math.max(...(attempts?.map(a => a.score) || [0])),
        lowest_score: Math.min(...(attempts?.map(a => a.score) || [100]))
      },
      attempts: attempts || []
    };

    res.json({ success: true, report });
  } catch (error) {
    logger.error('Generate report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student notes
exports.getStudentNotes = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user.id;

    const { data: notes } = await supabase
      .from('tutor_notes')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    res.json({ success: true, notes: notes || [] });
  } catch (error) {
    logger.error('Get notes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add student note
exports.addStudentNote = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { note } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tutor_notes')
      .insert([{ tutor_id: tutorId, student_id: studentId, note }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, note: data });
  } catch (error) {
    logger.error('Add note error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student alerts
exports.getStudentAlerts = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase.from('tc_student_attempts').select('student_id').gte('completed_at', sevenDaysAgo);
    const activeStudentIds = [...new Set(recentAttempts?.map(a => a.student_id) || [])];

    const { data: enrollments } = await supabase.from('tc_enrollments').select('student_id').eq('center_id', center.id);
    const inactiveStudents = enrollments?.filter(e => !activeStudentIds.includes(e.student_id)) || [];

    res.json({ success: true, alerts: { inactive_count: inactiveStudents.length, inactive_students: inactiveStudents } });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== QUESTIONS MANAGEMENT =====

exports.createQuestion = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    const result = await tutorialCenterService.createQuestion(tutorId, center.id, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Create question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('❌ No user in request');
      return res.status(401).json({ success: false, error: 'Unauthorized - No user found' });
    }
    
    const tutorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // Increased for test builder
    const offset = (page - 1) * limit;

    console.log('📝 getQuestions called:', { tutorId, page, limit });

    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (centerError) {
      console.log('❌ Center query error:', centerError);
      return res.status(500).json({ success: false, error: centerError.message });
    }

    if (!center) {
      console.log('✅ No center found, returning empty array');
      return res.json({ success: true, questions: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    console.log('✅ Center found:', center.id);

    const { data, error, count } = await supabase
      .from('tc_questions')
      .select('*', { count: 'exact' })
      .eq('center_id', center.id)
      .order('subject', { ascending: true })
      .order('topic', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log('❌ Questions query error:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} questions`);

    res.json({
      success: true,
      questions: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ getQuestions error:', error);
    logger.error('Get questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;
    
    // Verify ownership
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });
    
    const { data: question } = await supabase.from('tc_questions').select('center_id').eq('id', id).single();
    if (!question || question.center_id !== center.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const { data, error } = await supabase.from('tc_questions').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, question: data });
  } catch (error) {
    logger.error('Update question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;
    
    // Verify ownership
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });
    
    const { data: question } = await supabase.from('tc_questions').select('center_id').eq('id', id).single();
    if (!question || question.center_id !== center.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const { error } = await supabase.from('tc_questions').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateQuestionsAI = async (req, res) => {
  console.log('\n🎯 ========== AI GENERATION REQUEST ==========');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user?.id);
  
  try {
    const { subject, topic, difficulty = 'medium', count = 5 } = req.body;

    console.log('🎯 Parsed params:', { subject, topic, difficulty, count });

    if (!subject || !topic) {
      console.log('❌ Validation failed: Missing subject or topic');
      return res.status(400).json({ 
        success: false, 
        error: 'Subject and topic are required' 
      });
    }

    console.log('✅ Validation passed, calling Gemini service...');
    
    // Over-generate to account for invalid questions (industry standard)
    const QUALITY_BUFFER = 1.2; // Request 20% extra
    const adjustedCount = Math.ceil(count * QUALITY_BUFFER);
    
    console.log(`📊 Requesting ${adjustedCount} questions (${count} needed + ${adjustedCount - count} buffer)`);
    
    // Use existing Gemini service
    const geminiService = require('../services/gemini.service');
    const questions = await geminiService.generateQuestions({
      subject,
      topic,
      difficulty,
      totalQuestions: adjustedCount
    });

    console.log(`✅ Gemini returned ${questions?.length || 0} questions`);

    if (!questions || questions.length === 0) {
      console.log('❌ No questions generated');
      return res.status(500).json({ 
        success: false, 
        error: 'No questions were generated. Please try again.' 
      });
    }

    // Validate and filter questions - ensure all have required fields
    const validQuestions = questions.filter(q => {
      const isValid = q.question && 
                     Array.isArray(q.options) && 
                     q.options.length === 4 && 
                     q.answer && 
                     q.explanation;
      
      if (!isValid) {
        console.warn('⚠️ Skipping invalid question:', { 
          hasQuestion: !!q.question, 
          hasOptions: Array.isArray(q.options), 
          optionsCount: q.options?.length,
          hasAnswer: !!q.answer,
          hasExplanation: !!q.explanation
        });
      }
      
      return isValid;
    });

    const invalidCount = questions.length - validQuestions.length;
    const qualityRate = ((validQuestions.length / questions.length) * 100).toFixed(1);
    
    console.log(`✅ Quality: ${validQuestions.length}/${questions.length} valid (${qualityRate}%)`);
    
    // Log quality metrics for monitoring
    if (invalidCount > 0) {
      logger.warn('AI quality metrics', { 
        requested: adjustedCount,
        generated: questions.length,
        valid: validQuestions.length,
        invalid: invalidCount,
        qualityRate: `${qualityRate}%`
      });
    }

    if (validQuestions.length === 0) {
      console.log('❌ No valid questions after filtering');
      return res.status(500).json({ 
        success: false, 
        error: 'Generated questions were invalid. Please try again.' 
      });
    }

    // Return exactly the requested count (or all if less)
    const finalQuestions = validQuestions.slice(0, count);
    
    // Format for frontend
    const formatted = finalQuestions.map(q => ({
      question_text: q.question,
      options: q.options,
      correct_answer: q.answer.trim().toUpperCase().charAt(0),
      explanation: q.explanation,
      subject,
      topic,
      difficulty
    }));

    console.log(`✅ Returning ${formatted.length}/${count} requested questions`);
    console.log('========== END AI GENERATION ==========\n');
    
    res.json({ success: true, questions: formatted });
  } catch (error) {
    console.error('❌ Generate questions error:', error.message);
    console.error('Stack:', error.stack);
    logger.error('Generate questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateQuestionsAIStream = async (req, res) => {
  const { subject, topic, difficulty = 'medium', count = 5 } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const geminiService = require('../services/gemini.service');
    
    const questions = await geminiService.generateQuestions({
      subject,
      topic,
      difficulty,
      totalQuestions: count,
      onProgress: (progress) => {
        res.write(`data: ${JSON.stringify({ type: 'progress', ...progress })}\n\n`);
      }
    });

    const formatted = questions.map(q => ({
      question_text: q.question,
      options: q.options,
      correct_answer: q.answer,
      explanation: q.explanation,
      subject,
      topic,
      difficulty
    }));

    res.write(`data: ${JSON.stringify({ type: 'complete', questions: formatted })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
};

exports.parseBulkQuestions = async (req, res) => {
  try {
    const { text, subject, topic, difficulty, category } = req.body;

    if (!text || !subject) {
      return res.status(400).json({ success: false, error: 'Text and subject are required' });
    }

    const geminiService = require('../services/gemini.service');
    const questions = await geminiService.parseBulkQuestions({
      text,
      subject,
      topic,
      difficulty,
      category
    });

    res.json({ success: true, questions });
  } catch (error) {
    logger.error('Parse bulk questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveBulkQuestions = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { questions } = req.body;
    const tutorId = req.user.id;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, error: 'No questions provided' });
    }

    logger.info('Bulk save started', { tutorId, count: questions.length });

    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (centerError || !center) {
      logger.error('Center not found', { tutorId, error: centerError });
      return res.status(404).json({ success: false, error: 'Create a tutorial center first' });
    }

    // Validate and sanitize questions
    const questionsToInsert = questions.map((q, idx) => {
      // Validate required fields
      if (!q.question_text || typeof q.question_text !== 'string') {
        throw new Error(`Question ${idx + 1}: Missing or invalid question_text`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx + 1}: Must have exactly 4 options`);
      }
      if (!q.correct_answer) {
        throw new Error(`Question ${idx + 1}: Missing correct_answer`);
      }
      if (!q.subject) {
        throw new Error(`Question ${idx + 1}: Missing subject`);
      }

      // Sanitize correct_answer
      const sanitizedAnswer = String(q.correct_answer).trim().toUpperCase().charAt(0);
      if (!['A', 'B', 'C', 'D'].includes(sanitizedAnswer)) {
        throw new Error(`Question ${idx + 1}: Invalid correct_answer "${q.correct_answer}". Must be A, B, C, or D`);
      }

      return {
        question_text: q.question_text.trim(),
        options: q.options,
        correct_answer: sanitizedAnswer,
        explanation: q.explanation || '',
        subject: q.subject,
        topic: q.topic || '',
        difficulty: q.difficulty || 'medium',
        category: q.category || '',
        tutor_id: tutorId,
        center_id: center.id
      };
    });

    // Insert in batches with retry logic
    const BATCH_SIZE = 20;
    const allInserted = [];
    
    for (let i = 0; i < questionsToInsert.length; i += BATCH_SIZE) {
      const batch = questionsToInsert.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i/BATCH_SIZE) + 1;
      
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          const { data, error } = await supabase
            .from('tc_questions')
            .insert(batch)
            .select();

          if (error) throw error;
          
          allInserted.push(...data);
          success = true;
          
          if (i + BATCH_SIZE < questionsToInsert.length) {
            await new Promise(r => setTimeout(r, 500));
          }
        } catch (err) {
          retries--;
          
          if (retries === 0) {
            logger.error('Batch insert failed', { batchNum, error: err.message });
            throw err;
          }
          
          await new Promise(r => setTimeout(r, 1000 * (4 - retries)));
        }
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Bulk save completed', { 
      tutorId, 
      count: allInserted.length, 
      durationMs: duration 
    });
    
    res.json({ success: true, questions: allInserted, count: allInserted.length });
  } catch (error) {
    logger.error('Save bulk questions error', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== QUESTION SETS (TESTS) MANAGEMENT =====

exports.createQuestionSet = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    const result = await tutorialCenterService.createQuestionSet(tutorId, center.id, req.body);
    res.json(result);
  } catch (error) {
    logger.error('Create question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuestionSets = async (req, res) => {
  console.log('🎯 [TEST-FETCH-TUTOR] getQuestionSets called - User:', req.user?.id);
  try {
    const tutorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    // DEBUG: Uncomment for debugging
    console.log('📊 [TEST-FETCH-TUTOR] Fetching tests for tutor', {
      tutorId,
      centerId: center.id,
      note: 'Filtering out student-specific remedial tests'
    });

    const { data, error, count } = await supabase
      .from('tc_question_sets')
      .select(`
        *,
        question_count:tc_question_set_items(count)
      `, { count: 'exact' })
      .eq('center_id', center.id)
      .is('student_id', null)  // ✅ FIX: Only show tutor-created tests (not student remedial)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // DEBUG: Uncomment for debugging
    console.log('✅ [TEST-FETCH-TUTOR] Query results', {
      total: data?.length,
      remedialCount: data?.filter(t => t.is_remedial).length,
      studentSpecificCount: data?.filter(t => t.student_id).length,
      note: 'studentSpecificCount should be 0 for tutor view'
    });

    res.json({
      success: true,
      questionSets: data || [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Get question sets error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('tc_question_sets').select('*').eq('id', id).single();
    if (error) throw error;
    res.json({ success: true, questionSet: data });
  } catch (error) {
    logger.error('Get question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;
    const updateData = req.body;
    
    // Verify ownership
    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();
    
    if (centerError || !center) {
      return res.status(404).json({ success: false, error: 'Center not found' });
    }
    
    const { data: questionSet, error: qsError } = await supabase
      .from('tc_question_sets')
      .select('center_id')
      .eq('id', id)
      .single();
    
    if (qsError || !questionSet || questionSet.center_id !== center.id) {
      return res.status(qsError ? 404 : 403).json({ 
        success: false, 
        error: qsError ? 'Test not found' : 'Unauthorized' 
      });
    }
    
    const { data, error } = await supabase
      .from('tc_question_sets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ success: false, error: 'Update failed' });
    }
    
    res.json({ success: true, questionSet: data });
  } catch (error) {
    logger.error('Update question set error', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.toggleAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const { show_answers } = req.body;
    const { data, error } = await supabase.from('tc_question_sets').update({ show_answers }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, questionSet: data });
  } catch (error) {
    logger.error('Toggle answers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;
    
    // Verify ownership
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });
    
    const { data: questionSet } = await supabase.from('tc_question_sets').select('center_id').eq('id', id).single();
    if (!questionSet || questionSet.center_id !== center.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const { error } = await supabase.from('tc_question_sets').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== QUESTION SET QUESTIONS MANAGEMENT =====

exports.addQuestionsToTest = async (req, res) => {
  try {
    const { id: testId } = req.params;
    const { question_ids } = req.body;
    const tutorId = req.user.id;

    if (!Array.isArray(question_ids) || question_ids.length === 0) {
      return res.status(400).json({ success: false, error: 'question_ids array required' });
    }

    console.log('📝 Adding questions to test:', { testId, questionIds: question_ids, tutorId });

    // Verify test ownership
    const { data: test } = await supabase
      .from('tc_question_sets')
      .select('id, tutor_id')
      .eq('id', testId)
      .eq('tutor_id', tutorId)
      .single();

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found or unauthorized' });
    }

    // Insert into junction table
    const items = question_ids.map((qid, index) => ({
      question_set_id: testId,
      question_id: qid,
      order_number: index + 1
    }));

    const { data, error } = await supabase
      .from('tc_question_set_items')
      .insert(items)
      .select();

    if (error) {
      console.log('❌ Insert error:', error);
      throw error;
    }

    console.log('✅ Added questions:', data?.length);
    res.json({ success: true, count: data?.length, added: data?.length });
  } catch (error) {
    logger.error('Add questions to test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeQuestionFromTest = async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const tutorId = req.user.id;

    const { data, error } = await supabase.rpc('remove_question_from_test', {
      test_id: testId,
      question_id_param: questionId,
      tutor_user_id: tutorId
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.error);

    res.json(data);
  } catch (error) {
    logger.error('Remove question from test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTestQuestions = async (req, res) => {
  try {
    const { id: testId } = req.params;

    const { data, error } = await supabase
      .from('tc_question_set_questions')
      .select(`
        order_index,
        points,
        tc_questions(
          id,
          question_text,
          options,
          correct_answer,
          explanation,
          subject,
          difficulty
        )
      `)
      .eq('question_set_id', testId)
      .order('order_index');

    if (error) throw error;

    const questions = data.map(item => ({
      ...item.tc_questions,
      order_index: item.order_index,
      points: item.points
    }));

    res.json({ success: true, questions });
  } catch (error) {
    logger.error('Get test questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ===== ATTEMPTS =====

exports.getCenterAttempts = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const { data: center } = await supabase.from('tutorial_centers').select('id').eq('tutor_id', tutorId).single();
    if (!center) return res.status(404).json({ success: false, error: 'Center not found' });

    const { data, error } = await supabase.from('tc_student_attempts').select('*').order('completed_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, attempts: data || [] });
  } catch (error) {
    logger.error('Get attempts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStudentAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        question_set:question_set_id(title, tutor_id)
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const tutorAttempts = data.filter(a => a.question_set?.tutor_id === tutorId);

    res.json({ success: true, attempts: tutorAttempts });
  } catch (error) {
    logger.error('Get student attempts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update theme
exports.updateTheme = async (req, res) => {
  try {
    const { theme_config } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tutorial_centers')
      .update({ theme_config })
      .eq('tutor_id', tutorId)
      .select()
      .single();

    if (error) throw error;

    logger.info('Theme updated', { tutorId });
    res.json({ success: true, center: data });
  } catch (error) {
    logger.error('Update theme error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
