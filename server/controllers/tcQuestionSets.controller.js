const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Create question set (test)
exports.createQuestionSet = async (req, res) => {
  try {
    const { title, description, question_ids, time_limit, passing_score, visibility, show_answers } = req.body;
    const tutorId = req.user.id;

    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) {
      return res.status(404).json({ success: false, error: 'Create a tutorial center first' });
    }

    // Create question set
    const { data: questionSet, error } = await supabase
      .from('tc_question_sets')
      .insert([{
        tutor_id: tutorId,
        center_id: center.id,
        title,
        description,
        time_limit,
        passing_score,
        visibility: visibility || 'private',
        show_answers: show_answers || false
      }])
      .select()
      .single();

    if (error) throw error;

    // Add questions to set
    if (question_ids && question_ids.length > 0) {
      const items = question_ids.map((qid, index) => ({
        question_set_id: questionSet.id,
        question_id: qid,
        order_index: index
      }));

      const { error: itemsError } = await supabase
        .from('tc_question_set_items')
        .insert(items);

      if (itemsError) throw itemsError;
    }

    logger.info('Question set created', { setId: questionSet.id, tutorId });
    res.json({ success: true, questionSet });
  } catch (error) {
    logger.error('Create question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get question sets
exports.getQuestionSets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { center_id } = req.query;

    // DEBUG: Uncomment for debugging
    console.log('📊 [TEST-FETCH-STUDENT] getQuestionSets called', { 
      userId, 
      center_id,
      note: 'Checking if user is tutor or student'
    });

    // Check if user is tutor or student
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', userId)
      .single();

    let query = supabase
      .from('tc_question_sets')
      .select(`
        *,
        items:tc_question_set_items(count)
      `)
      .order('created_at', { ascending: false });

    if (center) {
      // DEBUG: Uncomment for debugging
      console.log('👨‍🏫 [TEST-FETCH-STUDENT] User is TUTOR', { 
        centerId: center.id,
        note: 'Should NOT see student-specific remedial tests'
      });
      
      // Tutor - show all their sets EXCEPT student-specific remedial tests
      query = query
        .eq('center_id', center.id)
        .is('student_id', null);  // ✅ FIX: Filter out student-specific tests
    } else {
      // DEBUG: Uncomment for debugging
      console.log('🎓 [TEST-FETCH-STUDENT] User is STUDENT', { 
        userId,
        note: 'Should see public tests + own remedial tests'
      });
      
      // Student - show only active sets
      query = query.eq('is_active', true);
      
      // Filter by specific center if provided
      if (center_id) {
        query = query.eq('center_id', center_id);
      }
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ [TEST-FETCH-STUDENT] Query error:', error);
      throw error;
    }

    // For students: Filter to show only public tests + own remedial tests
    let filteredData = data;
    if (!center) {
      // console.log('🔍 [TEST-FETCH-STUDENT] Filtering student tests', {
      //   totalTests: data?.length,
      //   currentUserId: userId,
      //   testsWithStudentId: data?.filter(t => t.student_id).map(t => ({
      //     id: t.id,
      //     title: t.title,
      //     student_id: t.student_id,
      //     isRemedial: t.is_remedial,
      //     belongsToCurrentUser: t.student_id === userId
      //   }))
      // });
      
      filteredData = data?.filter(test => {
        const isPublic = !test.student_id;
        const isOwnRemedial = test.student_id === userId;
        return isPublic || isOwnRemedial;
      }) || [];
    }

    // console.log('✅ [TEST-FETCH-STUDENT] Final results', {
    //   total: filteredData?.length,
    //   remedialCount: filteredData?.filter(t => t.is_remedial).length,
    //   studentSpecificCount: filteredData?.filter(t => t.student_id).length,
    //   publicCount: filteredData?.filter(t => !t.student_id).length
    // });

    res.json({ success: true, questionSets: filteredData });
  } catch (error) {
    logger.error('Get question sets error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single question set with questions
exports.getQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: set, error } = await supabase
      .from('tc_question_sets')
      .select(`
        *,
        items:tc_question_set_items(
          order_number,
          question:question_id(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const isTutor = set.tutor_id === userId;

    const questions = set.items
      ?.sort((a, b) => a.order_number - b.order_number)
      .map(item => {
        const q = item.question;
        if (!isTutor && !set.show_answers) {
          delete q.correct_answer;
          delete q.explanation;
        }
        return q;
      }) || [];

    res.json({ 
      success: true, 
      questionSet: { ...set, questions } 
    });
  } catch (error) {
    logger.error('Get question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update question set
exports.updateQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, time_limit, passing_score, show_answers, is_active, visibility } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tc_question_sets')
      .update({ title, description, time_limit, passing_score, show_answers, is_active, visibility })
      .eq('id', id)
      .eq('tutor_id', tutorId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, questionSet: data });
  } catch (error) {
    logger.error('Update question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle answer visibility
exports.toggleAnswers = async (req, res) => {
  try {
    const { id } = req.params;
    const { show_answers } = req.body;
    const tutorId = req.user.id;

    const { data, error } = await supabase
      .from('tc_question_sets')
      .update({ show_answers })
      .eq('id', id)
      .eq('tutor_id', tutorId)
      .select()
      .single();

    if (error) throw error;

    logger.info('Answer visibility toggled', { setId: id, show_answers });
    res.json({ success: true, questionSet: data });
  } catch (error) {
    logger.error('Toggle answers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete question set
exports.deleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;

    const { error } = await supabase
      .from('tc_question_sets')
      .delete()
      .eq('id', id)
      .eq('tutor_id', tutorId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    logger.error('Delete question set error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get public tests
exports.getPublicTests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tc_question_sets')
      .select(`
        *,
        items:tc_question_set_items(count),
        center:center_id(name, tutor_id)
      `)
      .eq('visibility', 'public')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, tests: data });
  } catch (error) {
    logger.error('Get public tests error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
