const supabase = require("../supabaseClient");
const geminiService = require("../services/gemini.service");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const logger = require("../utils/logger");

/**
 * Helper: Extract text from uploaded file buffer
 * Reuses the same PDF/DOCX logic from aiExaminer.controller.js
 */
async function extractTextFromFile(buffer, mimeType) {
  let text = "";

  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    text = data.text;

    // If very little text (scanned PDF), try Gemini Vision OCR
    if (text.length < 500 || text.includes("Scanned by CamScanner")) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use flash model (cheapest) for OCR
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash-lite",
        });

        const base64Data = buffer.toString("base64");
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
          "Extract all text from this document, preserving structure. Focus on questions, options (A/B/C/D), and answers.",
        ]);

        const ocrText = result.response.text();
        if (ocrText && ocrText.length > text.length) {
          text = ocrText;
          console.log(`✅ OCR extracted ${ocrText.length} characters`);
        }
      } catch (err) {
        console.error("❌ OCR failed:", err.message);
      }
    }
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (mimeType === "text/plain") {
    text = buffer.toString("utf-8");
  }

  return text.replace(/\s+/g, " ").trim();
}

/**
 * POST /upload-pdf
 * Upload PDF/DOCX → extract text → AI parse into questions → return for preview
 */
exports.uploadAndParse = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const { exam_body = "jamb", exam_year = "2024", subject = "", diet = "", skill_level = "" } = req.body;

    if (!subject) {
      return res
        .status(400)
        .json({ success: false, error: "Subject is required" });
    }

    console.log(
      `📄 Processing ${req.file.originalname} (${req.file.mimetype}, ${(req.file.size / 1024).toFixed(1)}KB)`,
    );

    // Step 1: Extract text from file
    const extractedText = await extractTextFromFile(
      req.file.buffer,
      req.file.mimetype,
    );

    if (extractedText.length < 50) {
      return res.status(400).json({
        success: false,
        error:
          "Could not extract sufficient text from file. Try a clearer PDF or paste text instead.",
      });
    }

    console.log(
      `📝 Extracted ${extractedText.length} characters, parsing with AI...`,
    );

    // Step 2: Parse with AI (uses existing geminiService — cheapest model)
    const questions = await geminiService.parseBulkQuestions({
      text: extractedText,
      subject,
      topic: "",
      difficulty: "medium",
      category: "",
    });

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "AI could not extract valid questions from this file. Please check format.",
      });
    }

    // Step 3: Attach exam metadata to each question
    const enrichedQuestions = questions.map((q) => ({
      ...q,
      exam_body,
      exam_year: parseInt(exam_year),
      subject,
      // ICAN-specific fields (only populated for ICAN uploads)
      ...(exam_body === "ican" && diet ? { diet } : {}),
      ...(exam_body === "ican" && skill_level ? { skill_level } : {}),
    }));

    console.log(
      `✅ Parsed ${enrichedQuestions.length} questions from ${req.file.originalname}`,
    );

    res.json({
      success: true,
      questions: enrichedQuestions,
      count: enrichedQuestions.length,
      textPreview: extractedText.substring(0, 200),
    });
  } catch (error) {
    logger.error("Upload and parse error:", error);
    res
      .status(500)
      .json({
        success: false,
        error: error.message || "Failed to process file",
      });
  }
};

/**
 * POST /save
 * Save reviewed/edited questions to past_questions table
 */
exports.saveQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || questions.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No questions to save" });
    }

    // Map to past_questions format
    const rows = questions.map((q) => ({
      exam_body: q.exam_body || "jamb",
      exam_year: parseInt(q.exam_year) || 2024,
      subject: q.subject,
      topic: q.topic || "",
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      // ICAN-specific fields
      ...(q.exam_body === "ican" && q.diet ? { diet: q.diet } : {}),
      ...(q.exam_body === "ican" && q.skill_level ? { skill_level: q.skill_level } : {}),
    }));

    const { data, error } = await supabase
      .from("past_questions")
      .insert(rows)
      .select();

    if (error) throw error;

    logger.info("Admin past questions saved", { count: data.length });

    res.json({
      success: true,
      saved: data.length,
      message: `${data.length} past questions saved successfully!`,
    });
  } catch (error) {
    const errMsg = error?.message || error?.details || error?.hint || "Failed to save";
    console.error("❌ Save past questions error:", errMsg, error);
    logger.error("Save past questions error", { message: errMsg, code: error?.code });
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: errMsg });
    }
  }
};

module.exports = exports;
