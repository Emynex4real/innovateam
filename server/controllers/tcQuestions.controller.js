const supabase = require("../supabaseClient");
const geminiService = require("../services/gemini.service");
const { logger } = require("../utils/logger");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Upload question image to Supabase Storage
exports.uploadQuestionImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No image file provided" });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

    if (!allowedExts.includes(ext)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Only image files are allowed (jpg, png, gif, webp, svg)",
        });
    }

    // Generate unique filename
    const fileName = `${uuidv4()}${ext}`;
    const filePath = `questions/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("question-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error("Supabase storage upload error:", error);
      return res
        .status(500)
        .json({
          success: false,
          error: "Failed to upload image: " + error.message,
        });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("question-images")
      .getPublicUrl(filePath);

    logger.info("Question image uploaded", { fileName, tutorId: req.user.id });

    res.json({
      success: true,
      image_url: urlData.publicUrl,
      file_name: fileName,
    });
  } catch (error) {
    logger.error("Upload question image error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create question
exports.createQuestion = async (req, res) => {
  try {
    const {
      question_text,
      options,
      correct_answer,
      explanation,
      subject,
      topic,
      difficulty,
      category,
      image_url,
    } = req.body;
    const tutorId = req.user.id;

    // Get tutor's center
    const { data: center } = await supabase
      .from("tutorial_centers")
      .select("id")
      .eq("tutor_id", tutorId)
      .single();

    if (!center) {
      return res
        .status(404)
        .json({ success: false, error: "Create a tutorial center first" });
    }

    const { data, error } = await supabase
      .from("tc_questions")
      .insert([
        {
          tutor_id: tutorId,
          center_id: center.id,
          question_text,
          options,
          correct_answer,
          explanation,
          subject,
          topic,
          difficulty,
          category,
          image_url: image_url || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    logger.info("Question created", { questionId: data.id, tutorId });
    res.json({ success: true, question: data });
  } catch (error) {
    logger.error("Create question error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate questions with AI
exports.generateQuestions = async (req, res) => {
  console.log("\n🎯 ========== AI GENERATION REQUEST ==========");
  console.log("Request Body:", JSON.stringify(req.body, null, 2));
  console.log("User:", req.user?.id);

  try {
    const { subject, topic, difficulty = "medium", count = 5 } = req.body;

    console.log("🎯 Parsed params:", { subject, topic, difficulty, count });

    if (!subject || !topic) {
      console.log("❌ Validation failed: Missing subject or topic");
      return res.status(400).json({
        success: false,
        error: "Subject and topic are required",
      });
    }

    console.log("✅ Validation passed, calling Gemini service...");

    // Use existing Gemini service
    const questions = await geminiService.generateQuestions({
      subject,
      topic,
      difficulty,
      totalQuestions: count,
    });

    console.log(`✅ Gemini returned ${questions?.length || 0} questions`);

    if (!questions || questions.length === 0) {
      console.log("❌ No questions generated");
      return res.status(500).json({
        success: false,
        error: "No questions were generated. Please try again.",
      });
    }

    // Format for frontend (don't save yet - tutor will edit)
    const formatted = questions.map((q) => ({
      question_text: q.question,
      options: q.options,
      correct_answer: q.answer,
      explanation: q.explanation,
      subject,
      topic,
      difficulty,
    }));

    console.log(
      `✅ Formatted ${formatted.length} questions, sending response...`,
    );
    console.log("========== END AI GENERATION ==========\n");

    res.json({ success: true, questions: formatted });
  } catch (error) {
    console.error("❌ Generate questions error:", error.message);
    console.error("Stack:", error.stack);
    logger.error("Generate questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Parse bulk questions from text
exports.parseBulkQuestions = async (req, res) => {
  try {
    const { text, subject, topic, difficulty, category } = req.body;

    if (!text || !subject) {
      return res
        .status(400)
        .json({ success: false, error: "Text and subject are required" });
    }

    // Use Gemini service to parse
    const questions = await geminiService.parseBulkQuestions({
      text,
      subject,
      topic,
      difficulty,
      category,
    });

    res.json({ success: true, questions });
  } catch (error) {
    logger.error("Parse bulk questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Save bulk questions (after AI generation and editing)
exports.saveBulkQuestions = async (req, res) => {
  console.log("\n💾 ========== BULK SAVE REQUEST ==========");
  console.log("Questions count:", req.body.questions?.length);

  try {
    const { questions } = req.body;
    const tutorId = req.user.id;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No questions provided" });
    }

    console.log(`📊 Saving ${questions.length} questions for tutor ${tutorId}`);

    // Get tutor's center
    const { data: center, error: centerError } = await supabase
      .from("tutorial_centers")
      .select("id")
      .eq("tutor_id", tutorId)
      .single();

    if (centerError || !center) {
      console.error("❌ Center lookup failed:", centerError);
      return res
        .status(404)
        .json({ success: false, error: "Create a tutorial center first" });
    }

    console.log(`✅ Found center: ${center.id}`);

    // Add tutor_id and center_id to each question
    const questionsToInsert = questions.map((q) => ({
      ...q,
      tutor_id: tutorId,
      center_id: center.id,
    }));

    // Insert in smaller batches to avoid timeout
    const BATCH_SIZE = 20;
    const allInserted = [];

    for (let i = 0; i < questionsToInsert.length; i += BATCH_SIZE) {
      const batch = questionsToInsert.slice(i, i + BATCH_SIZE);
      console.log(
        `💾 Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questionsToInsert.length / BATCH_SIZE)} (${batch.length} questions)`,
      );

      const { data, error } = await supabase
        .from("tc_questions")
        .insert(batch)
        .select();

      if (error) {
        console.error("❌ Batch insert error:", error);
        throw error;
      }

      allInserted.push(...data);
      console.log(`✅ Batch saved: ${data.length} questions`);
    }

    console.log(`✅ All ${allInserted.length} questions saved successfully`);
    logger.info("Bulk questions saved", { count: allInserted.length, tutorId });
    console.log("========== END BULK SAVE ==========\n");

    res.json({
      success: true,
      questions: allInserted,
      count: allInserted.length,
    });
  } catch (error) {
    console.error("❌ Save bulk questions error:", error);
    logger.error("Save bulk questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get questions
exports.getQuestions = async (req, res) => {
  try {
    const { subject, difficulty, category } = req.query;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const tutorId = req.user.id;

    // Get tutor's center
    const { data: center, error: centerError } = await supabase
      .from("tutorial_centers")
      .select("id")
      .eq("tutor_id", tutorId)
      .maybeSingle();

    if (centerError) {
      logger.error("Get center error:", centerError);
      return res
        .status(500)
        .json({ success: false, error: centerError.message });
    }

    if (!center) {
      return res.json({ success: true, questions: [] });
    }

    let query = supabase
      .from("tc_questions")
      .select("*")
      .eq("center_id", center.id)
      .order("created_at", { ascending: false });

    if (subject) query = query.eq("subject", subject);
    if (difficulty) query = query.eq("difficulty", difficulty);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, questions: data || [] });
  } catch (error) {
    logger.error("Get questions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question_text,
      options,
      correct_answer,
      explanation,
      subject,
      topic,
      difficulty,
      category,
      image_url,
    } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from("tc_questions")
      .update({
        question_text,
        options,
        correct_answer,
        explanation,
        subject,
        topic,
        difficulty,
        category,
        image_url: image_url || null,
      })
      .eq("id", id)
      .eq("tutor_id", tutorId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, question: data });
  } catch (error) {
    logger.error("Update question error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;

    const { error } = await supabase
      .from("tc_questions")
      .delete()
      .eq("id", id)
      .eq("tutor_id", tutorId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    logger.error("Delete question error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
