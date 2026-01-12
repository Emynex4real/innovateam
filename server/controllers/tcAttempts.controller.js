const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Submit test attempt - INDUSTRY STANDARD VERSION
exports.submitAttempt = async (req, res) => {
  try {
    // DEBUG: Uncomment for debugging
    // console.log('🎯 [BACKEND] submitAttempt called', { 
    //   question_set_id: req.body.question_set_id,
    //   studentId: req.user?.id,
    //   answersCount: req.body.answers?.length 
    // });
    
    const { question_set_id, answers, time_taken } = req.body;
    const studentId = req.user.id;

    // 1. FETCH TEST WITH QUESTIONS (Single Source of Truth)
    // DEBUG: Uncomment for debugging
    // console.log('📚 [BACKEND] Fetching question set');
    const { data: questionSet, error: fetchError } = await supabase
      .from('tc_question_sets')
      .select(`
        *,
        items:tc_question_set_items(
          order_number,
          question:question_id(
            id, 
            correct_answer, 
            explanation
          )
        )
      `)
      .eq('id', question_set_id)
      .single();

    if (fetchError || !questionSet) {
      console.error('❌ [BACKEND] Question set not found', fetchError);
      return res.status(404).json({ success: false, error: 'Test not found' });
    }
    
    // DEBUG: Uncomment for debugging
    // console.log('✅ [BACKEND] Question set fetched', { 
    //   itemsCount: questionSet.items?.length,
    //   centerId: questionSet.center_id 
    // });

    // 2. VALIDATION (Fail Fast)
    if (!questionSet.items || questionSet.items.length === 0) {
      console.error(`Integrity Error: Test ${question_set_id} has no questions linked.`);
      return res.status(500).json({ 
        success: false, 
        error: 'This test has no questions. Please contact your tutor.' 
      });
    }

    // 3. GRADING ENGINE
    let correctCount = 0;
    const totalQuestions = questionSet.items.length;
    
    const gradedResults = questionSet.items
      .sort((a, b) => a.order_number - b.order_number)
      .map(item => {
        if (!item.question) return null;

        const submitted = answers.find(a => a.question_id === item.question.id);
        const selectedOption = submitted?.selected_answer || null;
        const isCorrect = selectedOption === item.question.correct_answer;
        
        if (isCorrect) correctCount++;

        return {
          question_id: item.question.id,
          selected_answer: selectedOption,
          is_correct: isCorrect,
          correct_answer: questionSet.show_answers ? item.question.correct_answer : null,
          explanation: questionSet.show_answers ? item.question.explanation : null
        };
      })
      .filter(Boolean);

    const score = Math.round((correctCount / totalQuestions) * 100);
    // DEBUG: Uncomment for debugging
    // console.log('🎯 [BACKEND] Grading complete', { score, correctCount, totalQuestions });

    // 4. PERSISTENCE
    // DEBUG: Uncomment for debugging
    // console.log('💾 [BACKEND] Saving attempt to database');
    const { data: attempt, error: saveError } = await supabase
      .from('tc_student_attempts')
      .insert([{
        student_id: studentId,
        question_set_id,
        answers: gradedResults,
        score,
        total_questions: totalQuestions,
        time_taken: time_taken || 0
      }])
      .select()
      .single();

    if (saveError) {
      console.error('❌ [BACKEND] Save error', saveError);
      throw saveError;
    }
    
    // DEBUG: Uncomment for debugging
    // console.log('✅ [BACKEND] Attempt saved', { attemptId: attempt.id });

    // Award points for league (with error handling)
    try {
      const gamification = require('../services/gamification.service');
      const points = Math.round(score / 10); // 10 points per 10% score
      if (questionSet.center_id) {
        await gamification.awardPoints(studentId, questionSet.center_id, points);
      }
    } catch (gamificationError) {
      console.warn('⚠️ [BACKEND] Gamification error (non-critical):', gamificationError.message);
      // Don't fail the submission if gamification fails
    }

    // DEBUG: Uncomment for debugging
    // console.log('📝 [BACKEND] Test submitted successfully', { 
    //   attemptId: attempt.id, 
    //   studentId, 
    //   score,
    //   isFirstAttempt: attempt.is_first_attempt 
    // });

    // 5. RESPONSE
    // DEBUG: Uncomment for debugging
    // console.log('✅ [BACKEND] Sending success response');
    res.json({ 
      success: true, 
      attempt: {
        ...attempt,
        results: questionSet.show_answers ? gradedResults : gradedResults.map(r => ({
          question_id: r.question_id,
          is_correct: r.is_correct
        }))
      }
    });
  } catch (error) {
    console.error('💥 [BACKEND] Submit attempt error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ success: false, error: 'Submission failed. Please try again.' });
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
    console.error('Get attempts error:', error);
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
    console.error('Get leaderboard error:', error);
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
          items:tc_question_set_items(
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
    const results = attempt.question_set.items
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
    console.error('Get attempt details error:', error);
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
    console.error('Get center attempts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student attempts (for tutor viewing specific student)
exports.getStudentAttempts = async (req, res) => {
  try {
    const { studentId } = req.params;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tc_student_attempts')
      .select(`
        *,
        question_set:question_set_id(title, tutor_id)
      `)
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    // Filter only attempts from tutor's tests
    const tutorAttempts = data.filter(a => a.question_set?.tutor_id === tutorId);

    res.json({ success: true, attempts: tutorAttempts });
  } catch (error) {
    console.error('Get student attempts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
