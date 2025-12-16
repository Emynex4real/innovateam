const supabase = require('../supabaseClient');
const GeminiService = require('../services/gemini.service');

// ==========================================
// 1. GENERATE QUESTIONS (AI Powered)
// ==========================================
exports.generateQuestions = async (req, res) => {
  console.log("📝 Received Generation Request:", req.body);

  try {
    const { 
      text, 
      subject, 
      topic, 
      bankName, 
      questionCount = 10, 
      difficulty = 'medium' 
    } = req.body;

    // --- A. INPUT SANITIZATION & VALIDATION ---
    if (!bankName || typeof bankName !== 'string' || !bankName.trim()) {
      return res.status(400).json({ success: false, message: "Bank Name is required." });
    }

    // Ensure valid integer for count
    const safeCount = Math.min(Math.max(parseInt(questionCount) || 10, 1), 50); // Cap at 50 questions
    
    // Ensure strings for AI context to prevent crashes
    const safeSubject = (subject || 'General').toString().trim();
    const safeTopic = (topic || 'General').toString().trim();
    const safeDifficulty = (difficulty || 'medium').toString().trim();

    const hasText = text && typeof text === 'string' && text.length > 10;
    const hasTopic = subject && topic;

    if (!hasText && !hasTopic) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid Request. Please provide either a 'text' passage OR a 'subject' and 'topic'." 
      });
    }

    // --- B. CALL AI SERVICE ---
    console.log(`🤖 Generating ${safeCount} questions for "${bankName}"...`);
    
    const questions = await GeminiService.generateQuestions({
      text: hasText ? text : null,
      subject: safeSubject,
      topic: safeTopic,
      difficulty: safeDifficulty,
      totalQuestions: safeCount
    });

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI Service returned no valid questions.");
    }

    console.log(`✅ AI generated ${questions.length} questions. Saving to DB...`);

    // --- C. SAVE TO SUPABASE ---
    
    // 1. Create the Question Bank
    const { data: bankData, error: bankError } = await supabase
      .from('question_banks')
      .insert([{
        name: bankName.trim(),
        subject: safeSubject,
        topic: hasTopic ? safeTopic : 'Text Analysis', 
        difficulty: safeDifficulty,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (bankError) {
      console.error("❌ Bank Creation Error:", bankError);
      throw new Error(`Failed to create Question Bank: ${bankError.message}`);
    }

    // 2. Prepare Questions for Bulk Insert
    const questionsToInsert = questions.map(q => {
      // Ensure options is always a JSON string for the DB
      let optionsStr;
      try {
        optionsStr = typeof q.options === 'string' ? q.options : JSON.stringify(q.options || []);
      } catch (e) {
        optionsStr = '[]';
      }

      return {
        bank_id: bankData.id,
        question: q.question || "Untitled Question",
        options: optionsStr,
        correct_answer: q.answer || q.correct_answer || "",
        explanation: q.explanation || "No explanation provided.",
        type: 'multiple-choice',
        difficulty: safeDifficulty,
        is_active: true,
        created_at: new Date().toISOString()
      };
    });

    // 3. Bulk Insert
    const { error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    // Rollback logic: If questions fail, delete the empty bank to keep DB clean
    if (insertError) {
      console.error("❌ Questions Insert Error:", insertError);
      await supabase.from('question_banks').delete().eq('id', bankData.id);
      throw new Error(`Failed to save questions: ${insertError.message}`);
    }

    // --- D. SUCCESS RESPONSE ---
    res.status(200).json({
      success: true,
      message: `Generated ${questions.length} questions successfully`,
      bankId: bankData.id,
      questions: questionsToInsert
    });

  } catch (error) {
    console.error("❌ Generate Controller Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};

// ==========================================
// 2. BANK MANAGEMENT (CRUD)
// ==========================================

exports.getQuestionBanks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('question_banks')
      .select(`*, questions:questions(count)`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten structure for frontend convenience
    const formattedData = data.map(bank => ({
      ...bank,
      questionCount: bank.questions ? bank.questions[0]?.count : 0
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Get Banks Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete questions first (Cascading delete manual handling)
    await supabase.from('questions').delete().eq('bank_id', id);
    
    // Delete bank
    const { error } = await supabase.from('question_banks').delete().eq('id', id);

    if (error) throw error;
    res.status(200).json({ success: true, message: "Bank deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. QUESTION MANAGEMENT (CRUD)
// ==========================================

exports.getQuestionsByBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('bank_id', bankId)
      .order('id', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteQuestions = async (req, res) => {
  try {
    const { questionIds } = req.body;
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Question IDs array is required' });
    }
    const { error } = await supabase.from('questions').delete().in('id', questionIds);
    if (error) throw error;
    res.json({ success: true, message: `${questionIds.length} questions deleted successfully` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // First fetch current status
    const { data: question } = await supabase.from('questions').select('is_active').eq('id', id).single();
    
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    // Then toggle it
    const { data, error } = await supabase
      .from('questions')
      .update({ is_active: !question.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    // 'head: true' gets the count without fetching all data (Performance optimization)
    const { count: bankCount } = await supabase.from('question_banks').select('*', { count: 'exact', head: true });
    const { count: questionCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });

    const stats = {
      totalBanks: bankCount || 0,
      totalQuestions: questionCount || 0,
      totalUsage: 0, 
      correctAnswers: 0 
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};