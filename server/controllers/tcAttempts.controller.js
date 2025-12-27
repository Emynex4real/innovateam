const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Submit test attempt
exports.submitAttempt = async (req, res) => {
  try {
    const { question_set_id, answers, time_taken } = req.body;
    const studentId = req.user.id;

    console.log('📝 Submit attempt:', { question_set_id, studentId, answersCount: answers?.length });

    // Check if test has questions embedded
    const { data: testWithQuestions, error: testError } = await supabase
      .from('tc_question_sets')
      .select('*')
      .eq('id', question_set_id)
      .single();

    if (testError || !testWithQuestions) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    console.log('🔍 Test data:', { 
      id: testWithQuestions.id,
      hasQuestionsField: !!testWithQuestions.questions,
      questionsType: typeof testWithQuestions.questions,
      questionsLength: Array.isArray(testWithQuestions.questions) ? testWithQuestions.questions.length : 'not array'
    });

    // Check junction table
    const { data: junctionItems } = await supabase
      .from('tc_question_set_items')
      .select('question_id')
      .eq('question_set_id', question_set_id);

    console.log('🔍 Junction items:', junctionItems?.length || 0);

    // Use embedded questions if available, otherwise use junction table
    let questions;
    if (testWithQuestions.questions && Array.isArray(testWithQuestions.questions) && testWithQuestions.questions.length > 0) {
      questions = testWithQuestions.questions;
      console.log('✅ Using embedded questions:', questions.length);
    } else if (junctionItems && junctionItems.length > 0) {
      const questionIds = junctionItems.map(item => item.question_id);
      const { data: fetchedQuestions } = await supabase
        .from('tc_questions')
        .select('id, correct_answer, explanation')
        .in('id', questionIds);
      questions = fetchedQuestions;
      console.log('✅ Using junction table questions:', questions?.length);
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'This test has no questions. Please contact your tutor.' 
      });
    }
    let correctCount = 0;
    const totalQuestions = questions.length;
    
    const results = answers.map(ans => {
      const question = questions.find(q => q.id === ans.question_id);
      const isCorrect = question && question.correct_answer === ans.selected_answer;
      if (isCorrect) correctCount++;

      return {
        question_id: ans.question_id,
        selected_answer: ans.selected_answer,
        correct_answer: question?.correct_answer,
        is_correct: isCorrect,
        explanation: testWithQuestions.show_answers ? question?.explanation : null
      };
    });

    const score = Math.round((correctCount / totalQuestions) * 100) || 0;

    console.log('🎯 Score calculated:', { correctCount, totalQuestions, score });

    const { data: attempt, error } = await supabase
      .from('tc_student_attempts')
      .insert([{
        student_id: studentId,
        question_set_id,
        answers,
        score: score || 0,
        total_questions: totalQuestions,
        time_taken: time_taken || 0
      }])
      .select()
      .single();

    if (error) {
      console.log('❌ Insert error:', error);
      throw error;
    }

    console.log('✅ Attempt saved:', attempt.id);

    logger.info('Test attempt submitted', { 
      attemptId: attempt.id, 
      studentId, 
      score,
      isFirstAttempt: attempt.is_first_attempt 
    });

    res.json({ 
      success: true, 
      attempt: {
        ...attempt,
        results: testWithQuestions.show_answers ? results : results.map(r => ({
          question_id: r.question_id,
          is_correct: r.is_correct
        }))
      }
    });
  } catch (error) {
    logger.error('Submit attempt error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student's attempts
exports.getMyAttempts = async (req, res) => {
  try {
    const { question_set_id } = req.query;
    const studentId = req.user.id;

    let query = supabase
      .from('tc_student_attempts')
      .select(`
        *,
        question_set:question_set_id(title, passing_score, show_answers)
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (question_set_id) {
      query = query.eq('question_set_id', question_set_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, attempts: data });
  } catch (error) {
    logger.error('Get attempts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get leaderboard for a question set
exports.getLeaderboard = async (req, res) => {
  try {
    const { question_set_id } = req.params;

    const { data, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        id,
        score,
        total_questions,
        time_taken,
        completed_at,
        student:student_id(id, email, raw_user_meta_data)
      `)
      .eq('question_set_id', question_set_id)
      .eq('is_first_attempt', true)
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true })
      .limit(50);

    if (error) throw error;

    const leaderboard = data.map((attempt, index) => ({
      rank: index + 1,
      student_name: attempt.student.raw_user_meta_data?.name || attempt.student.email.split('@')[0],
      score: attempt.score,
      total_questions: attempt.total_questions,
      time_taken: attempt.time_taken,
      completed_at: attempt.completed_at
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single attempt details with answers
exports.getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.id;

    const { data: attempt, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        question_set:question_set_id(
          title,
          passing_score,
          show_answers,
          questions:tc_question_set_items(
            order_number,
            question:question_id(
              id,
              question_text,
              options,
              correct_answer,
              explanation
            )
          )
        )
      `)
      .eq('id', attemptId)
      .eq('student_id', studentId)
      .single();

    if (error || !attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }

    if (!attempt.question_set.show_answers) {
      return res.status(403).json({ success: false, error: 'Answers not available' });
    }

    // Build results with questions
    const results = attempt.question_set.questions
      .sort((a, b) => a.order_number - b.order_number)
      .map(item => {
        const userAnswer = attempt.answers.find(a => a.question_id === item.question.id);
        return {
          question_text: item.question.question_text,
          options: item.question.options,
          selected_answer: userAnswer?.selected_answer,
          correct_answer: item.question.correct_answer,
          is_correct: userAnswer?.selected_answer === item.question.correct_answer,
          explanation: item.question.explanation
        };
      });

    res.json({
      success: true,
      attempt: {
        ...attempt,
        results
      }
    });
  } catch (error) {
    logger.error('Get attempt details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all attempts for tutor's center
exports.getCenterAttempts = async (req, res) => {
  try {
    const tutorId = req.user.id;

    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) {
      return res.json({ success: true, attempts: [] });
    }

    const { data, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        student:student_id(email, raw_user_meta_data),
        question_set:question_set_id(title, center_id)
      `)
      .eq('question_set.center_id', center.id)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, attempts: data });
  } catch (error) {
    logger.error('Get center attempts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
