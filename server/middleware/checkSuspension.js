const supabase = require('../supabaseClient');

const checkCenterSuspension = async (req, res, next) => {
  try {
    // Get center ID from various sources
    let centerId = req.body.center_id || req.query.center_id || req.params.centerId;
    
    // If not directly provided, get from user's center
    if (!centerId && req.user) {
      const { data: center } = await supabase
        .from('tutorial_centers')
        .select('id, is_suspended, suspension_reason')
        .eq('tutor_id', req.user.id)
        .single();
      
      if (center) {
        centerId = center.id;
        
        if (center.is_suspended) {
          return res.status(403).json({
            success: false,
            error: 'Center suspended',
            message: `This tutorial center has been suspended. Reason: ${center.suspension_reason || 'Administrative action'}`,
            suspended: true
          });
        }
      }
    }
    
    // If center ID is provided, check suspension
    if (centerId) {
      const { data: center } = await supabase
        .from('tutorial_centers')
        .select('is_suspended, suspension_reason')
        .eq('id', centerId)
        .single();
      
      if (center?.is_suspended) {
        return res.status(403).json({
          success: false,
          error: 'Center suspended',
          message: `This tutorial center has been suspended. Reason: ${center.suspension_reason || 'Administrative action'}`,
          suspended: true
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Suspension check error:', error);
    next();
  }
};

module.exports = { checkCenterSuspension };
