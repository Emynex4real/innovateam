const supabase = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/gemini.service');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const officeParser = require('officeparser');

class AIExaminerController {

  /**
   * 📤 UPLOAD DOCUMENT
   * Handles file upload and text extraction
   */
  async uploadDocument(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      let extractedText = '';
      const buffer = req.file.buffer;
      const mimeType = req.file.mimetype;

      // Extract text based on file type
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        extractedText = await officeParser.parseOfficeAsync(buffer);
      } else if (mimeType === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT files.' 
        });
      }

      // Clean extracted text
      extractedText = extractedText.replace(/\s+/g, ' ').trim();

      if (extractedText.length < 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Could not extract sufficient text from document' 
        });
      }

      const documentId = uuidv4();
      
      console.log('🔍 Executing query on ai_documents');
      
      const { error } = await supabase.from('ai_documents').insert({
        id: documentId,
        user_id: userId,
        filename: req.file.originalname,
        content: extractedText,
        file_size: req.file.size,
        mime_type: mimeType,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }

      console.log('✅ Document uploaded successfully');

      res.json({
        success: true,
        data: { 
          documentId, 
          filename: req.file.originalname, 
          preview: extractedText.substring(0, 100) 
        },
        message: 'Document processed successfully'
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to process document' 
      });
    }
  }

  /**
   * 📝 SUBMIT TEXT
   * Handles pasted text submission
   */
  async submitText(req, res) {
    try {
      console.log('📝 submitText called');
      
      const { text, title = 'Study Material' } = req.body;
      const userId = req.user?.id;
      
      console.log('👤 User ID:', userId);

      if (!text || text.length < 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Text too short. Please provide at least 5 characters.' 
        });
      }

      const documentId = uuidv4();
      
      console.log('🔍 Executing query on ai_documents');
      
      const { error } = await supabase.from('ai_documents').insert({
        id: documentId,
        user_id: userId,
        filename: title,
        content: text,
        file_size: text.length,
        mime_type: 'text/plain',
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('❌ Database error:', error);
        return res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }

      console.log('✅ Text document inserted');
      
      res.json({
        success: true,
        data: { documentId, filename: title },
        message: 'Text submitted successfully'
      });

    } catch (error) {
      console.error('❌ Submit text error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  /**
   * 🤖 GENERATE QUESTIONS
   * Generates AI-powered questions based on document content
   * ✅ CORRECTED: Now uses actual document content
   */
  async generateQuestions(req, res) {
    try {
      // 1. Extract parameters from request body
      const { 
        documentId, 
        subject,              // This will be the document title/filename
        questionCount = 45, 
        difficulty = 'medium', 
        questionTypes,
        duration 
      } = req.body;

      const userId = req.user?.id;

      // 2. Validate required parameters
      if (!documentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Document ID is required' 
        });
      }

      // 3. Log request for debugging
      console.log('📝 Generating questions with params:', {
        documentId,
        subject,
        questionCount,
        difficulty,
        questionTypes
      });

      // 4. Fetch document from database
      console.log('🔍 Executing query on ai_documents');
      
      const { data: doc, error: docError } = await supabase
        .from('ai_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !doc) {
        console.error('❌ Document not found:', docError);
        return res.status(404).json({ 
          success: false, 
          message: 'Document not found' 
        });
      }

      // 5. Validate document has content
      if (!doc.content || doc.content.length < 10) {
        return res.status(400).json({ 
          success: false, 
          message: 'Document content is too short to generate questions' 
        });
      }

      // 6. ✅ Generate questions using document CONTENT (not just metadata)
      console.log('🤖 Generating questions from document content...');
      console.log(`📄 Document has ${doc.content.length} characters of text`);
      
      const questions = await geminiService.generateQuestionsFromContent({
        content: doc.content,
        subject: subject || doc.filename,
        topic: doc.filename || 'Document Analysis',
        difficulty: difficulty,
        totalQuestions: parseInt(questionCount) || 45,
        userId: userId
      });

      // 7. Validate generated questions
      if (!questions || questions.length === 0) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to generate questions. Please try again.' 
        });
      }

      // 8. Process questions with IDs and additional metadata
      const processedQuestions = questions.map(q => ({
        id: uuidv4(),
        question: q.question,
        options: q.options || [],
        correct_answer: q.answer || q.correctAnswer,
        explanation: q.explanation || `The correct answer is ${q.answer || q.correctAnswer}.`,
        type: q.type || 'multiple-choice',
        difficulty: difficulty,
        points: 1
      }));

      // 9. Create exam record
      const examId = uuidv4();
      
      console.log('🔍 Executing query on ai_exams');
      
      const { error: examError } = await supabase.from('ai_exams').insert({
        id: examId,
        user_id: userId,
        document_id: documentId,
        questions: JSON.stringify(processedQuestions),
        difficulty: difficulty,
        subject: subject || doc.filename,
        total_questions: processedQuestions.length,
        total_points: processedQuestions.length,
        status: 'active',
        created_at: new Date().toISOString()
      });

      if (examError) {
        console.error('❌ Failed to create exam:', examError);
        throw examError;
      }

      // 10. Prepare questions for frontend (hide answers)
      const frontendQuestions = processedQuestions.map(q => {
        // For flashcards, send the correct_answer so it can be revealed
        if (q.type === 'flashcard') {
          const { explanation, ...rest } = q;
          return rest;
        }
        // For other types, hide correct_answer and explanation
        const { correct_answer, explanation, ...rest } = q;
        return rest;
      });

      console.log(`✅ Successfully generated ${processedQuestions.length} questions from document content`);

      // 11. Return success response
      res.json({
        success: true,
        data: { 
          examId, 
          questions: frontendQuestions, 
          totalQuestions: processedQuestions.length 
        },
        metadata: {
          subject: subject || doc.filename,
          difficulty: difficulty,
          documentName: doc.filename,
          contentLength: doc.content.length
        }
      });

    } catch (error) {
      console.error('❌ Generate Questions Error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to generate questions' 
      });
    }
  }

  /**
   * ✅ SUBMIT ANSWERS
   * Handles answer submission and grading
   */
  async submitAnswers(req, res) {
    try {
      const { examId } = req.params;
      const { answers } = req.body;

      if (!answers) {
        return res.status(400).json({ 
          success: false, 
          message: 'No answers provided' 
        });
      }

      console.log('🔍 Executing query on ai_exams');
      
      const { data: exam, error: examError } = await supabase
        .from('ai_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError || !exam) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exam not found' 
        });
      }

      const allQuestions = JSON.parse(exam.questions);
      let score = 0;

      // Grade each question
      const results = await Promise.all(allQuestions.map(async (q) => {
        const userAns = answers[q.id];
        const correctAns = q.correct_answer || q.correctAnswer;
        const questionType = q.type || 'multiple-choice';
        
        const cleanUser = String(userAns || "").trim();
        const cleanCorrect = String(correctAns || "").trim();
        let isCorrect = false;
        let feedback = '';
        let issues = [];

        // For flashcard, use self-assessment
        if (questionType === 'flashcard') {
          isCorrect = userAns === 'correct';
          feedback = isCorrect ? 'Great! You knew this concept.' : 'Review this concept again.';
        }
        // For fill-in-blank, use AI validation if available
        else if (questionType === 'fill-in-blank' && userAns && geminiService.validateAnswer) {
          try {
            const validation = await geminiService.validateAnswer(userAns, correctAns, q.question);
            isCorrect = validation.isCorrect;
            feedback = validation.feedback;
            issues = validation.issues || [];
          } catch (err) {
            isCorrect = cleanUser.toLowerCase() === cleanCorrect.toLowerCase();
          }
        } 
        // Standard matching for multiple-choice and true-false
        else {
          let userOptionLetter = cleanUser;
          let correctOptionLetter = cleanCorrect;
          
          // If user provided option text (not just A/B/C/D), find which option it matches
          if (q.options && Array.isArray(q.options)) {
            // Check if user answer is NOT already a single letter A-D
            if (!['A', 'B', 'C', 'D'].includes(cleanUser.toUpperCase())) {
              const matchedIndex = q.options.findIndex(opt => 
                opt.trim().toLowerCase() === cleanUser.toLowerCase()
              );
              if (matchedIndex !== -1) {
                userOptionLetter = String.fromCharCode(65 + matchedIndex);
              }
            }
            
            // Check if correct answer is NOT already a single letter A-D
            if (!['A', 'B', 'C', 'D'].includes(cleanCorrect.toUpperCase())) {
              const matchedIndex = q.options.findIndex(opt => 
                opt.trim().toLowerCase() === cleanCorrect.toLowerCase()
              );
              if (matchedIndex !== -1) {
                correctOptionLetter = String.fromCharCode(65 + matchedIndex);
              }
            }
          }
          
          const userLetter = userOptionLetter.toUpperCase().charAt(0);
          const correctLetter = correctOptionLetter.toUpperCase().charAt(0);
          
          isCorrect = userLetter === correctLetter;
        }

        if (isCorrect) score++;

        return {
          questionId: q.id,
          question: q.question,
          userAnswer: userAns || "Skipped",
          correctAnswer: correctAns,
          explanation: q.explanation,
          feedback: feedback || (isCorrect && issues.length > 0 ? `Correct! Note: ${issues.join(', ')}` : ''),
          issues: issues,
          isCorrect
        };
      }));

      const percentage = Math.round((score / allQuestions.length) * 100);

      // Update exam with results
      const { error: updateError } = await supabase.from('ai_exams').update({
        status: 'completed',
        score: score,
        percentage: percentage,
        results: JSON.stringify(results),
        completed_at: new Date().toISOString()
      }).eq('id', examId);

      if (updateError) {
        console.error('❌ Failed to update exam:', updateError);
        throw updateError;
      }

      console.log(`✅ Exam graded: ${score}/${allQuestions.length} (${percentage}%)`);

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
      console.error('❌ Submit answers error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  /**
   * 📊 GET EXAM STATUS
   * Check if an exam is completed or active
   */
  async getExamStatus(req, res) {
    try {
      const { examId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      console.log('🔍 Executing query on ai_exams');
      
      const { data: exam, error } = await supabase
        .from('ai_exams')
        .select('status')
        .eq('id', examId)
        .eq('user_id', userId)
        .single();

      if (error || !exam) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exam not found' 
        });
      }
      
      res.json({
        success: true,
        status: exam.status
      });

    } catch (error) {
      console.error('❌ Get exam status error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  /**
   * 📚 GET EXAM HISTORY
   * Retrieves user's exam history
   */
  async getExamHistory(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      console.log('🔍 Executing query on ai_exams');
      
      const { data: exams, error } = await supabase
        .from('ai_exams')
        .select('id, subject, difficulty, total_questions, score, percentage, status, created_at, completed_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch exam history:', error);
        throw error;
      }

      res.json({
        success: true,
        data: exams || [],
        count: exams?.length || 0
      });

    } catch (error) {
      console.error('❌ Get exam history error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  /**
   * 📊 GET EXAM RESULTS
   * Retrieves detailed results for a specific exam
   */
  async getExamResults(req, res) {
    try {
      const { examId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      console.log('🔍 Executing query on ai_exams');
      
      const { data: exam, error } = await supabase
        .from('ai_exams')
        .select('*')
        .eq('id', examId)
        .eq('user_id', userId)
        .single();

      if (error || !exam) {
        return res.status(404).json({ 
          success: false, 
          message: 'Exam not found' 
        });
      }

      res.json({
        success: true,
        data: {
          examId: exam.id,
          subject: exam.subject,
          difficulty: exam.difficulty,
          totalQuestions: exam.total_questions,
          score: exam.score,
          percentage: exam.percentage,
          status: exam.status,
          results: exam.results ? JSON.parse(exam.results) : null,
          createdAt: exam.created_at,
          completedAt: exam.completed_at
        }
      });

    } catch (error) {
      console.error('❌ Get exam results error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  /**
   * 📚 GET USER DOCUMENTS
   * Retrieves all documents uploaded by a specific user
   */
  async getUserDocuments(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      console.log('🔍 Executing query on ai_documents');
      
      const { data, error } = await supabase
        .from('ai_documents')
        .select('id, filename, file_size, mime_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch documents:', error);
        throw error;
      }

      res.json({ 
        success: true, 
        documents: data || [],
        count: data?.length || 0
      });

    } catch (error) {
      console.error('❌ Get documents error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  /**
   * 🗑️ DELETE DOCUMENT
   * Deletes a document and its associated exams
   */
  async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      if (!documentId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Document ID is required' 
        });
      }

      console.log('🔍 Executing query on ai_documents');
      
      // Verify ownership
      const { data: document, error: fetchError } = await supabase
        .from('ai_documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !document) {
        return res.status(404).json({ 
          success: false, 
          message: 'Document not found or access denied' 
        });
      }

      // Delete associated exams first
      await supabase
        .from('ai_exams')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userId);

      // Delete document
      const { error: deleteError } = await supabase
        .from('ai_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Failed to delete document:', deleteError);
        throw deleteError;
      }

      console.log('✅ Document deleted successfully');

      res.json({ 
        success: true, 
        message: 'Document deleted successfully' 
      });

    } catch (error) {
      console.error('❌ Delete document error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new AIExaminerController();