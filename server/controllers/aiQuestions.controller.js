const supabase = require('../supabaseClient');
const GeminiService = require('../services/gemini.service');
const {
  sanitizeAIInput,
  validateAmount,
  validateStringLength,
  validateEnum,
  validateArray,
  validateUUID
} = require('../utils/comprehensiveValidator');

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

    // --- A. STRICT INPUT VALIDATION ---
    const safeBankName = validateStringLength(bankName, {
      minLength: 1,
      maxLength: 200,
      fieldName: 'Bank Name'
    });

    const safeCount = validateAmount(questionCount, {
      min: 1,
      max: 60,
      allowDecimals: false,
      fieldName: 'Question count'
    });
    
    const safeDifficulty = validateEnum(
      difficulty,
      ['easy', 'medium', 'hard'],
      'Difficulty'
    );

    const safeSubject = validateStringLength(subject || 'General', {
      minLength: 1,
      maxLength: 100,
      fieldName: 'Subject'
    });
    
    const safeTopic = validateStringLength(topic || 'General', {
      minLength: 1,
      maxLength: 200,
      fieldName: 'Topic'
    });

    let safeText = null;
    if (text && typeof text === 'string' && text.length > 10) {
      safeText = sanitizeAIInput(text);
      validateStringLength(safeText, {
        minLength: 10,
        maxLength: 100000,
        fieldName: 'Text content'
      });
    }
    const hasText = safeText && safeText.length > 10;
    const hasTopic = safeSubject && safeTopic;

    if (!hasText && !hasTopic) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid Request. Please provide either a 'text' passage OR a 'subject' and 'topic'." 
      });
    }

    // --- B. INDUSTRY STANDARD: Choose strategy based on count ---
    const USE_BATCHING = safeCount > 30;
    
    // Generate minimal content for topic-based generation
    const generateTopicContent = (subject, topic) => {
      return `Generate JAMB/WAEC ${subject} questions about ${topic} based on Nigerian curriculum.`;
    };
    
    const generationContent = safeText || generateTopicContent(safeSubject, safeTopic);
    
    console.log(`🚀 Generating ${safeCount} questions (${USE_BATCHING ? 'BATCHED' : 'FAST'} mode)...`);
    
    const questions = USE_BATCHING 
      ? await GeminiService.generateQuestions({
          content: generationContent,
          subject: safeSubject,
          topic: safeTopic,
          difficulty: safeDifficulty,
          totalQuestions: safeCount,
          userId: req.user?.id,
          isTopicBased: !hasText
        })
      : await GeminiService.generateQuestionsFast({
          content: generationContent,
          subject: safeSubject,
          topic: safeTopic,
          difficulty: safeDifficulty,
          totalQuestions: safeCount,
          userId: req.user?.id,
          isTopicBased: !hasText
        });

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI Service returned no valid questions.");
    }

    console.log(`✅ AI generated ${questions.length} questions. Saving to DB...`);

    // --- C. SAVE TO SUPABASE ---
    const { data: bankData, error: bankError } = await supabase
      .from('question_banks')
      .insert([{
        name: safeBankName,
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

    const questionsToInsert = questions.map(q => {
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

    const { error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

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
    const validId = validateUUID(req.params.id, 'Bank ID');
    
    // Delete questions first (Cascading delete manual handling)
    await supabase.from('questions').delete().eq('bank_id', validId);
    
    // Delete bank
    const { error } = await supabase.from('question_banks').delete().eq('id', validId);

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
    const validBankId = validateUUID(req.params.bankId, 'Bank ID');
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('bank_id', validBankId)
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
    const validId = validateUUID(req.params.id, 'Question ID');
    const updates = req.body;

    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', validId)
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
    const validId = validateUUID(req.params.id, 'Question ID');
    const { error } = await supabase.from('questions').delete().eq('id', validId);
    if (error) throw error;
    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkDeleteQuestions = async (req, res) => {
  try {
    const { questionIds } = req.body;
    
    // Validate array and each UUID
    const validIds = validateArray(questionIds, {
      minLength: 1,
      maxLength: 100,
      itemValidator: (id) => validateUUID(id, 'Question ID'),
      fieldName: 'Question IDs'
    });
    
    const { error } = await supabase.from('questions').delete().in('id', validIds);
    if (error) throw error;
    res.json({ success: true, message: `${validIds.length} questions deleted successfully` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleQuestionStatus = async (req, res) => {
  try {
    const validId = validateUUID(req.params.id, 'Question ID');
    // First fetch current status
    const { data: question } = await supabase.from('questions').select('is_active').eq('id', validId).single();
    
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    // Then toggle it
    const { data, error } = await supabase
      .from('questions')
      .update({ is_active: !question.is_active })
      .eq('id', validId)
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