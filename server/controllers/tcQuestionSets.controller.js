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
      console.log('\n' + '='.repeat(60));
      console.log('🎓 [STUDENT] Fetching tests for student');
      console.log('User ID:', userId);
      
      // Get centers student is enrolled in
      const { data: enrollments, error: enrollError } = await supabase
        .from('tc_enrollments')
        .select('center_id')
        .eq('student_id', userId);
      
      console.log('\n📋 Enrollment Query Results:');
      console.log('Total enrollments:', enrollments?.length || 0);
      if (enrollments && enrollments.length > 0) {
        enrollments.forEach((e, i) => {
          console.log(`  ${i+1}. Center: ${e.center_id}`);
        });
      }
      if (enrollError) {
        console.error('❌ Enrollment query error:', enrollError);
      }
      
      const enrolledCenterIds = enrollments?.map(e => e.center_id) || [];
      
      console.log('\n✅ Total enrollments:', enrollments?.length || 0);
      console.log('Enrolled center IDs:', enrolledCenterIds);
      
      if (enrolledCenterIds.length === 0) {
        console.log('⚠️  No active enrollments - returning empty');
        console.log('='.repeat(60) + '\n');
        return res.json({ success: true, questionSets: [] });
      }
      
      // Student - show only active sets from enrolled centers
      query = query
        .eq('is_active', true)
        .in('center_id', enrolledCenterIds);
      
      console.log('\n🔍 Query filters applied:');
      console.log('- is_active: true');
      console.log('- center_id IN:', enrolledCenterIds);
      
      // Filter by specific center if provided
      if (center_id) {
        console.log('- center_id filter:', center_id);
        if (!enrolledCenterIds.includes(center_id)) {
          console.log('⚠️  Not enrolled in requested center');
          console.log('='.repeat(60) + '\n');
          return res.json({ success: true, questionSets: [] });
        }
        query = query.eq('center_id', center_id);
      }
    }

    console.log('\n🔄 Executing query...');
    const { data, error } = await query;
    
    if (error) {
      console.error('\n❌ Query error:', error);
      console.log('='.repeat(60) + '\n');
      throw error;
    }

    console.log('\n✅ Query successful');
    console.log('Tests found:', data?.length || 0);
    if (data && data.length > 0) {
      data.forEach((t, i) => {
        console.log(`  ${i+1}. ${t.title} (ID: ${t.id}, Active: ${t.is_active}, Student: ${t.student_id || 'none'})`);
      });
    }

    // For students: Filter to show only public tests + own remedial tests
    let filteredData = data;
    if (!center) {
      console.log('\n🔍 Applying student filters...');
      
      filteredData = data?.filter(test => {
        const isPublic = !test.student_id;
        const isOwnRemedial = test.student_id === userId;
        const keep = isPublic || isOwnRemedial;
        if (!keep) {
          console.log(`  ❌ Filtered out: ${test.title} (belongs to ${test.student_id})`);
        }
        return keep;
      }) || [];
      
      console.log('\n📦 Final results:', filteredData.length);
      if (filteredData.length > 0) {
        filteredData.forEach((t, i) => {
          console.log(`  ${i+1}. ${t.title}`);
        });
      }
    }
    console.log('='.repeat(60) + '\n');

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
