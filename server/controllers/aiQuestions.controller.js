// server/controllers/aiQuestions.controller.js

const supabase = require('../supabaseClient');
const geminiService = require('../services/gemini.service');

// ==========================================
// 1. GENERATE QUESTIONS (Improved & Safe)
// ==========================================
exports.generateQuestions = async (req, res) => {
  try {
    const { text, questionCount = 10, difficulty = 'medium', questionTypes = ['multiple-choice'], bankName, subject } = req.body;
    
    // 1. Validation
    if (!text || text.length < 10) {
      return res.status(400).json({ success: false, message: 'Text is required and must be at least 10 characters' });
    }

    console.log(`🤖 Generating ${questionCount} questions [${difficulty}]...`);

    // 2. Generate questions using Gemini Service
    // This calls the "cleanAndParseJSON" version we fixed earlier
    const questions = await geminiService.generateQuestions(text, { questionCount, difficulty, questionTypes });

    if (!questions || !Array.isArray(questions)) {
      throw new Error("AI Service returned invalid data structure (not an array)");
    }

    console.log(`✅ AI generated ${questions.length} questions. Saving to DB...`);

    // 3. Create question bank if name provided
    let bankId = null;
    if (bankName) {
      // A. Create Bank
      const { data: bank, error: bankError } = await supabase
        .from('question_banks')
        .insert([{
          name: bankName,
          subject: subject || 'General',
          difficulty,
          created_by: req.user.id
        }])
        .select()
        .single();

      if (bankError) {
        console.error('❌ Bank creation error:', bankError);
        throw new Error(`Failed to create question bank: ${bankError.message}`);
      }
      bankId = bank.id;

      // B. Format questions for Supabase
      // We map the AI data to exactly match your Supabase table columns
      const questionsToInsert = questions.map(q => ({
        bank_id: bankId,
        type: q.type,
        question: q.question,
        // Ensure options is always an array or null (never undefined)
        options: Array.isArray(q.options) ? q.options : null, 
        correct_answer: q.correct_answer,
        explanation: q.explanation || 'No explanation provided.',
        difficulty: difficulty,
        is_active: true
      }));

      // C. Bulk Insert Questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) {
        console.error('❌ Questions insert error:', questionsError);
        // Clean up: Delete the empty bank so we don't have clutter
        await supabase.from('question_banks').delete().eq('id', bankId);
        throw new Error(`Failed to save questions: ${questionsError.message}`);
      }
    }

    // Success!
    res.json({ success: true, questions, bankId });

  } catch (error) {
    console.error('❌ Generate Controller Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error' 
    });
  }
};

// ==========================================
// 2. OTHER CRUD FUNCTIONS (Unchanged)
// ==========================================

// Get all question banks
exports.getQuestionBanks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('question_banks')
      .select(`
        *,
        questions:questions(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const banks = data.map(bank => ({
      ...bank,
      questionCount: bank.questions[0]?.count || 0,
      creatorName: 'Admin'
    }));

    res.json({ success: true, data: banks });
  } catch (error) {
    console.error('Get question banks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get questions by bank ID
exports.getQuestionsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('bank_id', bankId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete question bank
exports.deleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;

    // Note: If you have foreign key constraints set to CASCADE in Supabase, 
    // deleting the bank will automatically delete the questions. 
    // If not, you might need to delete questions first.
    const { error } = await supabase
      .from('question_banks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Question bank deleted successfully' });
  } catch (error) {
    console.error('Delete question bank error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get question statistics
exports.getQuestionStats = async (req, res) => {
  try {
    const { data: banks } = await supabase.from('question_banks').select('id', { count: 'exact' });
    const { data: questions } = await supabase.from('questions').select('id, type, difficulty', { count: 'exact' });
    const { data: usage } = await supabase.from('question_usage').select('id, is_correct', { count: 'exact' });

    const stats = {
      totalBanks: banks?.length || 0,
      totalQuestions: questions?.length || 0,
      totalUsage: usage?.length || 0,
      correctAnswers: usage?.filter(u => u.is_correct).length || 0,
      byType: {
        'multiple-choice': questions?.filter(q => q.type === 'multiple-choice').length || 0,
        'true-false': questions?.filter(q => q.type === 'true-false').length || 0,
        'fill-in-blank': questions?.filter(q => q.type === 'fill-in-blank').length || 0,
        'flashcard': questions?.filter(q => q.type === 'flashcard').length || 0
      },
      byDifficulty: {
        'easy': questions?.filter(q => q.difficulty === 'easy').length || 0,
        'medium': questions?.filter(q => q.difficulty === 'medium').length || 0,
        'hard': questions?.filter(q => q.difficulty === 'hard').length || 0
      }
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk delete questions
exports.bulkDeleteQuestions = async (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Question IDs array is required' });
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .in('id', questionIds);

    if (error) throw error;
    res.json({ success: true, message: `${questionIds.length} questions deleted successfully` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle question active status
exports.toggleQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: question } = await supabase
      .from('questions')
      .select('is_active')
      .eq('id', id)
      .single();

    if (!question) {
       return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const { data, error } = await supabase
      .from('questions')
      .update({ is_active: !question.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};