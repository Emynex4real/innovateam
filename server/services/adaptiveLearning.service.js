const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Check if student can access a test (prerequisite check)
exports.checkTestAccess = async (req, res) => {
  try {
    const { question_set_id } = req.params;
    const studentId = req.user.id;

    const { data: test } = await supabase
      .from('tc_question_sets')
      .select('id, title, prerequisite_set_id, mastery_threshold')
      .eq('id', question_set_id)
      .single();

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // No prerequisite = always unlocked
    if (!test.prerequisite_set_id) {
      return res.json({ success: true, unlocked: true });
    }

    // Check mastery of prerequisite
    const { data: mastery } = await supabase
      .from('tc_student_mastery')
      .select('mastery_level')
      .eq('student_id', studentId)
      .eq('question_set_id', test.prerequisite_set_id)
      .single();

    const unlocked = mastery && mastery.mastery_level >= test.mastery_threshold;

    res.json({ 
      success: true, 
      unlocked,
      prerequisite_mastery: mastery?.mastery_level || 0,
      required_mastery: test.mastery_threshold
    });
  } catch (error) {
    console.error('Check test access error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student's mastery progress
exports.getStudentMastery = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data, error } = await supabase
      .from('tc_student_mastery')
      .select(`
        *,
        question_set:question_set_id(title, subject, topic)
      `)
      .eq('student_id', studentId)
      .order('last_attempt_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, mastery: data });
  } catch (error) {
    console.error('Get mastery error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate remedial test based on failed questions
exports.generateRemedialTest = async (req, res) => {
  try {
    // DEBUG: Uncomment for debugging
    console.log('🎯 [REMEDIAL] generateRemedialTest called', { 
      attemptId: req.body.attempt_id,
      studentId: req.user?.id 
    });
    
    const { attempt_id } = req.body;
    const studentId = req.user.id;

    if (!attempt_id) {
      console.error('❌ [REMEDIAL] Missing attempt_id');
      return res.status(400).json({ success: false, error: 'Attempt ID is required' });
    }

    // Get failed questions from attempt
    console.log('🔍 [REMEDIAL] Fetching attempt data');
    const { data: attempt, error: attemptError } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        question_set:question_set_id(title, center_id, tutor_id)
      `)
      .eq('id', attempt_id)
      .eq('student_id', studentId)
      .single();

    if (attemptError) {
      console.error('❌ [REMEDIAL] Error fetching attempt:', attemptError);
      throw attemptError;
    }

    if (!attempt) {
      console.error('❌ [REMEDIAL] Attempt not found');
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }

    console.log('✅ [REMEDIAL] Attempt found', { 
      attemptId: attempt.id, 
      answersCount: attempt.answers?.length 
    });

    // Extract failed question IDs
    const failedQuestionIds = attempt.answers
      .filter(a => !a.is_correct)
      .map(a => a.question_id)
      .slice(0, 5); // Max 5 questions for remedial

    console.log('📊 [REMEDIAL] Failed questions analysis', {
      totalAnswers: attempt.answers?.length,
      failedCount: failedQuestionIds.length,
      failedIds: failedQuestionIds
    });

    if (failedQuestionIds.length === 0) {
      console.warn('⚠️ [REMEDIAL] No failed questions to remediate');
      return res.json({ success: false, error: 'No failed questions to remediate' });
    }

    // Create remedial test
    console.log('💾 [REMEDIAL-VISIBILITY] Creating remedial test', {
      tutorId: attempt.question_set.tutor_id,
      centerId: attempt.question_set.center_id,
      studentId: studentId,
      isRemedial: true
    });
    
    const remedialData = {
      tutor_id: attempt.question_set.tutor_id,
      center_id: attempt.question_set.center_id,
      student_id: studentId,
      title: `Remedial: ${attempt.question_set.title}`,
      description: 'Auto-generated remedial test for concepts you missed',
      time_limit: 10,
      passing_score: 70,
      show_answers: true,
      is_active: true,
      is_remedial: true,
      parent_set_id: attempt.question_set_id
    };
    
    console.log('📋 [REMEDIAL-DB] Inserting:', JSON.stringify(remedialData, null, 2));
    
    const { data: remedialTest, error } = await supabase
      .from('tc_question_sets')
      .insert([remedialData])
      .select()
      .single();

    if (error) {
      console.error('❌ [REMEDIAL] Error creating remedial test:', error);
      throw error;
    }

    console.log('✅ [REMEDIAL-DB] Returned from DB:', JSON.stringify(remedialTest, null, 2));
    console.log('🔍 [REMEDIAL-CHECK] student_id in response:', {
      hasStudentId: !!remedialTest.student_id,
      studentIdValue: remedialTest.student_id,
      expectedValue: studentId,
      match: remedialTest.student_id === studentId
    });

    // Link questions to remedial test
    console.log('🔗 [REMEDIAL] Linking questions to test');
    const items = failedQuestionIds.map((qid, index) => ({
      question_set_id: remedialTest.id,
      question_id: qid,
      order_number: index
    }));

    const { error: itemsError } = await supabase.from('tc_question_set_items').insert(items);
    
    if (itemsError) {
      console.error('❌ [REMEDIAL] Error linking questions:', itemsError);
      throw itemsError;
    }

    console.log('✅ [REMEDIAL] Questions linked successfully');
    console.log('🎉 [REMEDIAL] Remedial test generation complete');
    console.log('✅ [REMEDIAL] Sending success response');

    res.json({ success: true, remedial_test: remedialTest });
  } catch (error) {
    console.error('💥 [REMEDIAL] Generate remedial test error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkTestAccess: exports.checkTestAccess,
  getStudentMastery: exports.getStudentMastery,
  generateRemedialTest: exports.generateRemedialTest
};
