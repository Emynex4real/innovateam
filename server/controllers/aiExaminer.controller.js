const supabase = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/gemini.service');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class AIExaminerController {

  // 1. Handle File Upload
  async uploadDocument(req, res) {
    try {
      const userId = req.user?.sub || req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      let extractedText = '';
      const buffer = req.file.buffer;
      const mimeType = req.file.mimetype;

      if (mimeType === 'application/pdf') {
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (mimeType === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported file type' });
      }

      extractedText = extractedText.replace(/\s+/g, ' ').trim();

      // Lower limit for testing
      if (extractedText.length < 5) {
        return res.status(400).json({ success: false, message: 'Document text is too short.' });
      }

      const documentId = uuidv4();
      const { error } = await supabase.from('ai_documents').insert({
        id: documentId,
        user_id: userId,
        filename: req.file.originalname,
        content: extractedText,
        file_size: req.file.size,
        mime_type: mimeType,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      res.json({
        success: true,
        data: { documentId, filename: req.file.originalname, preview: extractedText.substring(0, 100) },
        message: 'Document processed successfully'
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: 'Failed to process document: ' + error.message });
    }
  }

  // 2. Handle Pasted Text
  async submitText(req, res) {
    try {
      const { text, title = 'Study Material' } = req.body;
      const userId = req.user?.sub || req.user?.id;

      if (!text || text.length < 5) {
        return res.status(400).json({ success: false, message: 'Text too short (min 5 chars)' });
      }

      const documentId = uuidv4();
      const { error } = await supabase.from('ai_documents').insert({
        id: documentId,
        user_id: userId,
        filename: title,
        content: text,
        file_size: text.length,
        mime_type: 'text/plain',
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      res.json({
        success: true,
        data: { documentId, filename: title },
        message: 'Text submitted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 3. Generate Questions
  async generateQuestions(req, res) {
    try {
      const { documentId, questionCount, difficulty, questionTypes } = req.body;
      const userId = req.user?.sub || req.user?.id;

      const { data: doc } = await supabase.from('ai_documents').select('*').eq('id', documentId).single();
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

      // Call Gemini Service
      const questions = await geminiService.generateQuestions(doc.content, {
        questionCount, difficulty, questionTypes
      });

      // Process for DB
      const processedQuestions = questions.map(q => ({
        id: uuidv4(),
        ...q,
        difficulty,
        points: 1,
        explanation: q.explanation || `The correct answer is ${q.correct_answer || q.correctAnswer}.`
      }));

      // Save Exam
      const examId = uuidv4();
      await supabase.from('ai_exams').insert({
        id: examId,
        user_id: userId,
        document_id: documentId,
        questions: JSON.stringify(processedQuestions),
        difficulty,
        subject: doc.filename,
        total_questions: processedQuestions.length,
        total_points: processedQuestions.length,
        status: 'active'
      });

      // Send to frontend (Hide answers)
      const frontendQuestions = processedQuestions.map(q => {
        const { correct_answer, explanation, ...rest } = q;
        return rest;
      });

      res.json({
        success: true,
        data: { examId, questions: frontendQuestions, totalQuestions: processedQuestions.length }
      });

    } catch (error) {
      console.error('Generate Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 4. Submit & Grade (SMART GRADING FIX)
  async submitAnswers(req, res) {
    try {
      const { examId } = req.params;
      const { answers } = req.body;

      const { data: exam } = await supabase.from('ai_exams').select('*').eq('id', examId).single();
      if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

      const allQuestions = JSON.parse(exam.questions);
      let score = 0;

      const results = allQuestions.map(q => {
        const userAns = answers[q.id];
        const correctAns = q.correct_answer || q.correctAnswer;
        
        // SMART GRADING: Handle "B" vs "B. Option Text"
        const cleanUser = String(userAns || "").trim().toLowerCase();
        const cleanCorrect = String(correctAns || "").trim().toLowerCase();
        let isCorrect = false;

        // Direct match
        if (cleanUser === cleanCorrect) {
          isCorrect = true;
        } 
        // Partial match (User selected "A. Text" but answer is "A")
        else if (cleanUser.length > 1 && cleanCorrect.length === 1 && 
          (cleanUser.startsWith(cleanCorrect + ".") || cleanUser.startsWith(cleanCorrect + ")") || cleanUser.startsWith(cleanCorrect + " "))) {
          isCorrect = true;
        }
        // Partial match (User selected "A", but answer is "A. Text")
        else if (cleanCorrect.length > 1 && cleanUser.length === 1 && 
          (cleanCorrect.startsWith(cleanUser + ".") || cleanCorrect.startsWith(cleanUser + ")") || cleanCorrect.startsWith(cleanUser + " "))) {
          isCorrect = true;
        }

        if (isCorrect) score++;

        return {
          questionId: q.id,
          question: q.question,
          userAnswer: userAns || "Skipped",
          correctAnswer: correctAns,
          explanation: q.explanation, 
          isCorrect
        };
      });

      const percentage = Math.round((score / allQuestions.length) * 100);

      await supabase.from('ai_exams').update({
        status: 'completed',
        score,
        percentage,
        results: JSON.stringify(results),
        completed_at: new Date().toISOString()
      }).eq('id', examId);

      res.json({
        success: true,
        data: {
          score,
          percentage,
          totalQuestions: allQuestions.length,
          grade: percentage >= 50 ? 'Pass' : 'Fail',
          results 
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AIExaminerController();