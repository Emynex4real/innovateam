const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Join center with access code
exports.joinCenter = async (req, res) => {
  try {
    const { accessCode } = req.body;
    const studentId = req.user.id;

    // Find center by access code
    const { data: center, error: centerError } = await supabase
      .from('tutorial_centers')
      .select('*')
      .eq('access_code', accessCode.toUpperCase())
      .single();

    if (centerError || !center) {
      return res.status(404).json({
        success: false,
        error: 'Invalid access code'
      });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('tc_enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('center_id', center.id)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this center'
      });
    }

    // Enroll student
    const { data, error } = await supabase
      .from('tc_enrollments')
      .insert([{ student_id: studentId, center_id: center.id }])
      .select()
      .single();

    if (error) throw error;

    logger.info('Student enrolled', { studentId, centerId: center.id });
    res.json({ success: true, enrollment: data, center });
  } catch (error) {
    logger.error('Join center error:', error);
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
          tutor_id
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
        enrolled_at: e.enrolled_at
      };
    });

    res.json({ success: true, centers });
  } catch (error) {
    logger.error('Get enrolled centers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
