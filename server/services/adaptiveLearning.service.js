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
    logger.error('Check test access error:', error);
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
    logger.error('Get mastery error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate remedial test based on failed questions
exports.generateRemedialTest = async (req, res) => {
  try {
    console.log('🔍 Remedial test generation started', { body: req.body, user: req.user?.id });
    
    const { attempt_id } = req.body;
    const studentId = req.user.id;

    if (!attempt_id) {
      return res.status(400).json({ success: false, error: 'Attempt ID is required' });
    }

    // Get failed questions from attempt
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
      console.error('❌ Error fetching attempt:', attemptError);
      throw attemptError;
    }

    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }

    console.log('✅ Attempt found:', { attemptId: attempt.id, answers: attempt.answers?.length });

    // Extract failed question IDs
    const failedQuestionIds = attempt.answers
      .filter(a => !a.is_correct)
      .map(a => a.question_id)
      .slice(0, 5); // Max 5 questions for remedial

    if (failedQuestionIds.length === 0) {
      return res.json({ success: false, error: 'No failed questions to remediate' });
    }

    console.log('📝 Failed questions:', failedQuestionIds);

    // Create remedial test
    const { data: remedialTest, error } = await supabase
      .from('tc_question_sets')
      .insert([{
        tutor_id: attempt.question_set.tutor_id,
        center_id: attempt.question_set.center_id,
        title: `Remedial: ${attempt.question_set.title}`,
        description: 'Auto-generated remedial test for concepts you missed',
        time_limit: 10,
        passing_score: 70,
        show_answers: true,
        is_active: true,
        is_remedial: true,
        parent_set_id: attempt.question_set_id
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating remedial test:', error);
      throw error;
    }

    console.log('✅ Remedial test created:', remedialTest.id);

    // Link questions to remedial test
    const items = failedQuestionIds.map((qid, index) => ({
      question_set_id: remedialTest.id,
      question_id: qid,
      order_number: index
    }));

    const { error: itemsError } = await supabase.from('tc_question_set_items').insert(items);
    
    if (itemsError) {
      console.error('❌ Error linking questions:', itemsError);
      throw itemsError;
    }

    logger.info('Remedial test generated', { remedialTestId: remedialTest.id, studentId });

    res.json({ success: true, remedial_test: remedialTest });
  } catch (error) {
    console.error('❌ Generate remedial test error:', error);
    logger.error('Generate remedial test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkTestAccess: exports.checkTestAccess,
  getStudentMastery: exports.getStudentMastery,
  generateRemedialTest: exports.generateRemedialTest
};
