const supabase = require('../supabaseClient');
const geminiService = require('../services/gemini.service');
const { logger } = require('../utils/logger');

// Create question
exports.createQuestion = async (req, res) => {
  try {
    const { question_text, options, correct_answer, explanation, subject, topic, difficulty, category } = req.body;
    const tutorId = req.user.id;

    // Get tutor's center
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) {
      return res.status(404).json({ success: false, error: 'Create a tutorial center first' });
    }

    const { data, error } = await supabase
      .from('tc_questions')
      .insert([{
        tutor_id: tutorId,
        center_id: center.id,
        question_text,
        options,
        correct_answer,
        explanation,
        subject,
        topic,
        difficulty,
        category
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info('Question created', { questionId: data.id, tutorId });
    res.json({ success: true, question: data });
  } catch (error) {
    logger.error('Create question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate questions with AI
exports.generateQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty = 'medium', count = 5 } = req.body;

    // Use existing Gemini service
    const questions = await geminiService.generateQuestions({
      subject,
      topic,
      difficulty,
      totalQuestions: count
    });

    // Format for frontend (don't save yet - tutor will edit)
    const formatted = questions.map(q => ({
      question_text: q.question,
      options: q.options,
      correct_answer: q.answer,
      explanation: q.explanation,
      subject,
      topic,
      difficulty
    }));

    res.json({ success: true, questions: formatted });
  } catch (error) {
    logger.error('Generate questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save bulk questions (after AI generation and editing)
exports.saveBulkQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    const tutorId = req.user.id;

    // Get tutor's center
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) {
      return res.status(404).json({ success: false, error: 'Create a tutorial center first' });
    }

    // Add tutor_id and center_id to each question
    const questionsToInsert = questions.map(q => ({
      ...q,
      tutor_id: tutorId,
      center_id: center.id
    }));

    const { data, error } = await supabase
      .from('tc_questions')
      .insert(questionsToInsert)
      .select();

    if (error) throw error;

    logger.info('Bulk questions saved', { count: data.length, tutorId });
    res.json({ success: true, questions: data, count: data.length });
  } catch (error) {
    logger.error('Save bulk questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get questions
exports.getQuestions = async (req, res) => {
  try {
    const { subject, difficulty, category } = req.query;
    const tutorId = req.user.id;

    // Get tutor's center
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) {
      return res.json({ success: true, questions: [] });
    }

    let query = supabase
      .from('tc_questions')
      .select('*')
      .eq('center_id', center.id)
      .order('created_at', { ascending: false });

    if (subject) query = query.eq('subject', subject);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, questions: data });
  } catch (error) {
    logger.error('Get questions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, options, correct_answer, explanation, subject, topic, difficulty, category } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tc_questions')
      .update({ question_text, options, correct_answer, explanation, subject, topic, difficulty, category })
      .eq('id', id)
      .eq('tutor_id', tutorId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, question: data });
  } catch (error) {
    logger.error('Update question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;

    const { error } = await supabase
      .from('tc_questions')
      .delete()
      .eq('id', id)
      .eq('tutor_id', tutorId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete question error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
