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
    const { attempt_id } = req.body;
    const studentId = req.user.id;

    // Get failed questions from attempt
    const { data: attempt } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        question_set:question_set_id(title, center_id, tutor_id, subject, topic)
      `)
      .eq('id', attempt_id)
      .eq('student_id', studentId)
      .single();

    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }

    // Extract failed question IDs
    const failedQuestionIds = attempt.answers
      .filter(a => !a.is_correct)
      .map(a => a.question_id)
      .slice(0, 5); // Max 5 questions for remedial

    if (failedQuestionIds.length === 0) {
      return res.json({ success: false, error: 'No failed questions to remediate' });
    }

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

    if (error) throw error;

    // Link questions to remedial test
    const items = failedQuestionIds.map((qid, index) => ({
      question_set_id: remedialTest.id,
      question_id: qid,
      order_number: index
    }));

    await supabase.from('tc_question_set_items').insert(items);

    logger.info('Remedial test generated', { remedialTestId: remedialTest.id, studentId });

    res.json({ success: true, remedial_test: remedialTest });
  } catch (error) {
    logger.error('Generate remedial test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
