const supabase = require('../supabaseClient');
const { v4: uuidv4 } = require('uuid');

class AIExaminerController {
  // Process text input
  processTextInput(text) {
    if (!text || text.trim().length < 100) {
      throw new Error('Text content is too short to generate meaningful questions');
    }
    return text.trim();
  }

  // Generate questions using AI/ML approach
  async generateQuestionsFromText(text, options = {}) {
    const {
      questionCount = 10,
      difficulty = 'medium',
      questionTypes = ['multiple-choice', 'true-false', 'short-answer']
    } = options;

    // Split text into sentences and paragraphs
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    
    const questions = [];
    const usedSentences = new Set();

    // Generate different types of questions
    for (let i = 0; i < questionCount; i++) {
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      let question;

      switch (questionType) {
        case 'multiple-choice':
          question = this.generateMultipleChoice(sentences, usedSentences, difficulty);
          break;
        case 'true-false':
          question = this.generateTrueFalse(sentences, usedSentences);
          break;
        case 'short-answer':
          question = this.generateShortAnswer(sentences, usedSentences);
          break;
        case 'fill-blank':
          question = this.generateFillInBlank(sentences, usedSentences);
          break;
      }

      if (question) {
        questions.push({
          id: uuidv4(),
          ...question,
          difficulty,
          points: this.getPointsByDifficulty(difficulty)
        });
      }
    }

    return questions;
  }

  generateMultipleChoice(sentences, usedSentences, difficulty) {
    const availableSentences = sentences.filter(s => !usedSentences.has(s) && s.length > 30);
    if (availableSentences.length === 0) return null;

    const sentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    usedSentences.add(sentence);

    // Extract key terms from sentence
    const words = sentence.split(' ').filter(w => w.length > 4);
    const keyWord = words[Math.floor(Math.random() * words.length)];

    // Generate distractors
    const distractors = this.generateDistractors(keyWord, difficulty);
    const options = [keyWord, ...distractors].sort(() => Math.random() - 0.5);

    return {
      type: 'multiple-choice',
      question: `Based on the text, what is the correct term that fits in this context: "${sentence.replace(keyWord, '______')}"?`,
      options: options.map((opt, idx) => ({ id: String.fromCharCode(65 + idx), text: opt })),
      correctAnswer: String.fromCharCode(65 + options.indexOf(keyWord)),
      explanation: `The correct answer is "${keyWord}" as mentioned in the source text.`
    };
  }

  generateTrueFalse(sentences, usedSentences) {
    const availableSentences = sentences.filter(s => !usedSentences.has(s) && s.length > 20);
    if (availableSentences.length === 0) return null;

    const sentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    usedSentences.add(sentence);

    const isTrue = Math.random() > 0.5;
    let statement = sentence.trim();

    if (!isTrue) {
      // Modify statement to make it false
      const words = statement.split(' ');
      const randomIndex = Math.floor(words.length / 2);
      words[randomIndex] = this.getOppositeWord(words[randomIndex]);
      statement = words.join(' ');
    }

    return {
      type: 'true-false',
      question: `True or False: ${statement}`,
      correctAnswer: isTrue ? 'True' : 'False',
      explanation: isTrue ? 'This statement is directly supported by the text.' : 'This statement contradicts the information in the text.'
    };
  }

  generateShortAnswer(sentences, usedSentences) {
    const availableSentences = sentences.filter(s => !usedSentences.has(s) && s.length > 30);
    if (availableSentences.length === 0) return null;

    const sentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    usedSentences.add(sentence);

    const words = sentence.split(' ').filter(w => w.length > 4);
    const keyPhrase = words.slice(0, 3).join(' ');

    return {
      type: 'short-answer',
      question: `What does the text say about "${keyPhrase}"? Provide a brief answer.`,
      correctAnswer: sentence.trim(),
      explanation: 'Answer should reflect the information provided in the source text.',
      maxLength: 200
    };
  }

  generateFillInBlank(sentences, usedSentences) {
    const availableSentences = sentences.filter(s => !usedSentences.has(s) && s.length > 25);
    if (availableSentences.length === 0) return null;

    const sentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    usedSentences.add(sentence);

    const words = sentence.split(' ').filter(w => w.length > 4);
    const blankWord = words[Math.floor(Math.random() * words.length)];
    const questionText = sentence.replace(blankWord, '______');

    return {
      type: 'fill-blank',
      question: `Fill in the blank: ${questionText}`,
      correctAnswer: blankWord,
      explanation: `The correct word is "${blankWord}" as it appears in the original text.`
    };
  }

  generateDistractors(correctAnswer, difficulty) {
    const distractors = [];
    const commonWords = ['information', 'process', 'system', 'method', 'approach', 'concept', 'principle', 'theory'];
    
    // Add some common distractors
    for (let i = 0; i < 3; i++) {
      let distractor;
      if (difficulty === 'easy') {
        distractor = commonWords[Math.floor(Math.random() * commonWords.length)];
      } else {
        // For harder difficulties, create more similar distractors
        distractor = this.createSimilarWord(correctAnswer);
      }
      
      if (!distractors.includes(distractor) && distractor !== correctAnswer) {
        distractors.push(distractor);
      }
    }
    
    return distractors;
  }

  createSimilarWord(word) {
    const prefixes = ['pre', 'post', 'anti', 'pro', 'sub', 'super'];
    const suffixes = ['tion', 'ment', 'ness', 'ity', 'ing', 'ed'];
    
    if (Math.random() > 0.5) {
      return prefixes[Math.floor(Math.random() * prefixes.length)] + word.toLowerCase();
    } else {
      return word + suffixes[Math.floor(Math.random() * suffixes.length)];
    }
  }

  getOppositeWord(word) {
    const opposites = {
      'is': 'is not',
      'are': 'are not',
      'can': 'cannot',
      'will': 'will not',
      'should': 'should not',
      'must': 'must not',
      'always': 'never',
      'often': 'rarely',
      'increase': 'decrease',
      'improve': 'worsen',
      'positive': 'negative',
      'good': 'bad',
      'high': 'low',
      'large': 'small'
    };
    
    return opposites[word.toLowerCase()] || `not ${word}`;
  }

  getPointsByDifficulty(difficulty) {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 2;
    }
  }

  // Controller methods
  async submitText(req, res) {
    try {
      const { text, title = 'Study Material' } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'No text content provided'
        });
      }

      const userId = req.user.id;
      const processedText = this.processTextInput(text);

      // Store text content in database
      const documentId = uuidv4();
      const { error } = await supabase
        .from('ai_documents')
        .insert({
          id: documentId,
          user_id: userId,
          filename: title,
          content: processedText,
          file_size: processedText.length,
          mime_type: 'text/plain',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      res.json({
        success: true,
        data: {
          documentId,
          filename: title,
          contentLength: processedText.length,
          preview: processedText.substring(0, 200) + '...'
        },
        message: 'Text content processed successfully'
      });
    } catch (error) {
      console.error('Submit text error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process text'
      });
    }
  }

  async generateQuestions(req, res) {
    try {
      const userId = req.user.id;
      const {
        documentId,
        questionCount = 10,
        difficulty = 'medium',
        questionTypes = ['multiple-choice', 'true-false'],
        subject = 'General'
      } = req.body;

      let content = '';

      if (documentId) {
        // Get content from uploaded document
        const { data: document, error } = await supabase
          .from('ai_documents')
          .select('content')
          .eq('id', documentId)
          .eq('user_id', userId)
          .single();

        if (error || !document) {
          return res.status(404).json({
            success: false,
            message: 'Document not found'
          });
        }

        content = document.content;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      // Generate questions
      const questions = await this.generateQuestionsFromText(content, {
        questionCount,
        difficulty,
        questionTypes
      });

      if (questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Could not generate questions from the provided content'
        });
      }

      // Create exam session
      const examId = uuidv4();
      const { error: examError } = await supabase
        .from('ai_exams')
        .insert({
          id: examId,
          user_id: userId,
          document_id: documentId,
          questions: JSON.stringify(questions),
          difficulty,
          subject,
          total_questions: questions.length,
          total_points: questions.reduce((sum, q) => sum + q.points, 0),
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (examError) throw examError;

      // Remove correct answers from questions sent to frontend
      const questionsForFrontend = questions.map(q => {
        const { correctAnswer, explanation, ...questionWithoutAnswer } = q;
        return questionWithoutAnswer;
      });

      res.json({
        success: true,
        data: {
          examId,
          questions: questionsForFrontend,
          totalQuestions: questions.length,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
          difficulty,
          subject
        },
        message: 'Questions generated successfully'
      });
    } catch (error) {
      console.error('Generate questions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate questions'
      });
    }
  }

  async submitAnswers(req, res) {
    try {
      const userId = req.user.id;
      const { examId } = req.params;
      const { answers } = req.body;

      // Get exam data
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

      const questions = JSON.parse(exam.questions);
      let score = 0;
      let correctAnswers = 0;
      const results = [];

      // Grade answers
      questions.forEach((question, index) => {
        const userAnswer = answers[question.id];
        const isCorrect = this.checkAnswer(question, userAnswer);
        
        if (isCorrect) {
          score += question.points;
          correctAnswers++;
        }

        results.push({
          questionId: question.id,
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          points: isCorrect ? question.points : 0,
          explanation: question.explanation
        });
      });

      const percentage = Math.round((score / exam.total_points) * 100);

      // Update exam with results
      await supabase
        .from('ai_exams')
        .update({
          status: 'completed',
          score,
          percentage,
          correct_answers: correctAnswers,
          user_answers: JSON.stringify(answers),
          results: JSON.stringify(results),
          completed_at: new Date().toISOString()
        })
        .eq('id', examId);

      res.json({
        success: true,
        data: {
          examId,
          score,
          totalPoints: exam.total_points,
          percentage,
          correctAnswers,
          totalQuestions: exam.total_questions,
          results,
          grade: this.getGrade(percentage)
        },
        message: 'Exam submitted successfully'
      });
    } catch (error) {
      console.error('Submit answers error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit answers'
      });
    }
  }

  checkAnswer(question, userAnswer) {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        return userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
      
      case 'short-answer':
      case 'fill-blank':
        const correctWords = question.correctAnswer.toLowerCase().split(' ');
        const userWords = userAnswer.toLowerCase().split(' ');
        const matchCount = correctWords.filter(word => 
          userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
        ).length;
        return matchCount >= correctWords.length * 0.7; // 70% match threshold
      
      default:
        return false;
    }
  }

  getGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  async getExamHistory(req, res) {
    try {
      const userId = req.user.id;

      const { data: exams, error } = await supabase
        .from('ai_exams')
        .select(`
          id,
          subject,
          difficulty,
          total_questions,
          total_points,
          score,
          percentage,
          status,
          created_at,
          completed_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: exams || [],
        message: 'Exam history retrieved successfully'
      });
    } catch (error) {
      console.error('Get exam history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get exam history'
      });
    }
  }

  async getExamResults(req, res) {
    try {
      const userId = req.user.id;
      const { examId } = req.params;

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

      const results = exam.results ? JSON.parse(exam.results) : [];

      res.json({
        success: true,
        data: {
          examId: exam.id,
          subject: exam.subject,
          difficulty: exam.difficulty,
          score: exam.score,
          totalPoints: exam.total_points,
          percentage: exam.percentage,
          correctAnswers: exam.correct_answers,
          totalQuestions: exam.total_questions,
          grade: this.getGrade(exam.percentage),
          results,
          completedAt: exam.completed_at
        },
        message: 'Exam results retrieved successfully'
      });
    } catch (error) {
      console.error('Get exam results error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get exam results'
      });
    }
  }
}

module.exports = new AIExaminerController();