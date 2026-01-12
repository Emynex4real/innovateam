const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Join center with access code
exports.joinCenter = async (req, res) => {
  try {
    // DEBUG: Uncomment for debugging
    // console.log('🎯 [BACKEND] joinCenter called', { 
    //   accessCode: req.body.accessCode,
    //   studentId: req.user?.id
    // });
    
    const { accessCode } = req.body;
    const studentId = req.user.id;

    // Find center by access code
    // DEBUG: Uncomment for debugging
    // console.log('🔍 [BACKEND] Looking up center by access code');
    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('*')
      .eq('access_code', accessCode.toUpperCase())
      .single();

    if (centerError || !center) {
      console.error('❌ [BACKEND] Center not found', centerError);
      return res.status(404).json({
        success: false,
        error: 'Invalid access code'
      });
    }
    
    // DEBUG: Uncomment for debugging
    // console.log('✅ [BACKEND] Center found', { 
    //   centerId: center.id,
    //   centerName: center.name 
    // });

    // Check if already enrolled
    // DEBUG: Uncomment for debugging
    // console.log('🔍 [BACKEND] Checking existing enrollment');
    const { data: existing } = await supabase
      .from('tc_enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('center_id', center.id)
      .single();

    if (existing) {
      console.warn('⚠️ [BACKEND] Student already enrolled');
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this center'
      });
    }
    
    // DEBUG: Uncomment for debugging
    // console.log('✅ [BACKEND] No existing enrollment, proceeding');

    // Enroll student
    // DEBUG: Uncomment for debugging
    // console.log('💾 [BACKEND] Creating enrollment');
    const { data, error } = await supabase
      .from('tc_enrollments')
      .insert([{ student_id: studentId, center_id: center.id }])
      .select()
      .single();

    if (error) {
      console.error('❌ [BACKEND] Enrollment error', error);
      throw error;
    }
    
    // DEBUG: Uncomment for debugging
    // console.log('✅ [BACKEND] Enrollment created', { enrollmentId: data.id });
    // console.log('🎉 [BACKEND] Student enrolled successfully');
    // console.log('✅ [BACKEND] Sending success response');

    res.json({ success: true, enrollment: data, center });
  } catch (error) {
    console.error('💥 [BACKEND] Join center error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student's enrolled centers
exports.getEnrolledCenters = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data, error } = await supabase
      .from('tc_enrollments')
      .select(`
        id,
        enrolled_at,
        center:center_id (
          id,
          name,
          description,
          tutor_id,
          theme_config
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;

    // Get tutor details separately
    const centerIds = data.map(e => e.center.id);
    const { data: centers_with_tutors } = await supabase
      .from('tutorial_centers')
      .select('id, tutor_id')
      .in('id', centerIds);

    const tutorIds = centers_with_tutors?.map(c => c.tutor_id) || [];
    const { data: tutors } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', tutorIds);

    // Format response
    const centers = data.map(e => {
      const centerData = centers_with_tutors?.find(c => c.id === e.center.id);
      const tutor = tutors?.find(t => t.id === centerData?.tutor_id);
      return {
        id: e.center.id,
        name: e.center.name,
        description: e.center.description,
        tutor_name: tutor?.full_name || tutor?.email?.split('@')[0] || 'Unknown',
        enrolled_at: e.enrolled_at,
        theme_config: e.center.theme_config
      };
    });

    res.json({ success: true, centers });
  } catch (error) {
    console.error('Get enrolled centers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
