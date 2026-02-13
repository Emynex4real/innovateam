const supabase = require('../supabaseClient');

/**
 * Check subscription limits for a tutor's tutorial center.
 * Returns { allowed, warning, usage, limit, plan } or throws on DB error.
 *
 * Behavior:
 * - Admins always pass (no limits enforced)
 * - If tutor has no center yet, allow (they'll create one)
 * - If usage is under limit, allow
 * - If usage is over limit, block with upgrade message
 *
 * @param {string} tutorId - The tutor's user ID
 * @param {'students'|'questions'|'tests'} resource - Which resource to check
 * @param {number} addCount - How many new items being added (default 1)
 * @param {boolean} isAdmin - Whether the user is an admin
 */
async function checkSubscriptionLimit(tutorId, resource, addCount = 1, isAdmin = false) {
  // Admins bypass all limits
  if (isAdmin) {
    return { allowed: true, warning: null };
  }

  // Map resource to plan column and table
  const resourceMap = {
    students: { planCol: 'max_students', table: 'tc_enrollments', countCol: 'center_id' },
    questions: { planCol: 'max_questions', table: 'tc_questions', countCol: 'center_id' },
    tests: { planCol: 'max_tests', table: 'tc_question_sets', countCol: 'center_id' }
  };

  const config = resourceMap[resource];
  if (!config) return { allowed: true, warning: null };

  // Get tutor's center
  const { data: center } = await supabase
    .from('tutorial_centers')
    .select('id')
    .eq('tutor_id', tutorId)
    .single();

  if (!center) return { allowed: true, warning: null };

  // Get current plan
  const plan = await getTutorPlan(tutorId);
  const limit = plan?.[config.planCol];

  // No limit set = unlimited
  if (!limit) return { allowed: true, warning: null };

  // Count current usage
  const { count } = await supabase
    .from(config.table)
    .select('*', { count: 'exact', head: true })
    .eq('center_id', center.id);

  const currentUsage = count || 0;
  const afterAdd = currentUsage + addCount;

  // Check if adding would exceed limit
  if (afterAdd > limit) {
    return {
      allowed: false,
      warning: null,
      usage: currentUsage,
      limit,
      plan: plan?.name || 'Free',
      message: `You've reached your ${plan?.name || 'Free'} plan limit of ${limit} ${resource}. Upgrade your plan to add more.`
    };
  }

  // Warn if near limit (80%+)
  const pct = Math.round((afterAdd / limit) * 100);
  const warning = pct >= 80
    ? `You're using ${afterAdd} of ${limit} ${resource} (${pct}%). Consider upgrading soon.`
    : null;

  return { allowed: true, warning, usage: currentUsage, limit, plan: plan?.name };
}

/**
 * Get the tutor's active subscription plan (or free plan as default)
 */
async function getTutorPlan(tutorId) {
  // Check for active paid subscription
  const { data: sub } = await supabase
    .from('tutor_subscriptions')
    .select('*, subscription_plans(*)')
    .eq('tutor_id', tutorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sub?.subscription_plans) return sub.subscription_plans;

  // Check for admin-granted trial
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tutor_trial_granted, tutor_trial_expires_at')
    .eq('id', tutorId)
    .single();

  if (profile?.tutor_trial_granted &&
    profile?.tutor_trial_expires_at &&
    new Date(profile.tutor_trial_expires_at) > new Date()) {
    const { data: proPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .ilike('name', 'pro')
      .single();
    return proPlan;
  }

  // Default to free plan
  const { data: freePlan } = await supabase
    .from('subscription_plans')
    .select('*')
    .ilike('name', 'free')
    .single();

  return freePlan;
}

/**
 * Express middleware factory for subscription limit checking.
 * Use in routes: router.post('/questions', checkLimit('questions'), controller.createQuestion)
 *
 * For enrollment, the center_id comes from the request flow, so we handle it differently.
 */
function checkLimit(resource, getCountFromReq) {
  return async (req, res, next) => {
    try {
      const tutorId = req.user?.id;
      if (!tutorId) return next();

      const isAdmin = req.user?.role === 'admin';
      const addCount = getCountFromReq ? getCountFromReq(req) : 1;

      const result = await checkSubscriptionLimit(tutorId, resource, addCount, isAdmin);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: result.message,
          limitReached: true,
          usage: result.usage,
          limit: result.limit,
          plan: result.plan
        });
      }

      // Attach warning to response if near limit (controller can include it)
      if (result.warning) {
        req.subscriptionWarning = result.warning;
      }

      next();
    } catch (error) {
      // Don't block on limit check failures — let the request through
      console.error('Subscription limit check error:', error.message);
      next();
    }
  };
}

/**
 * Middleware specifically for student enrollment.
 * The tutor is the center owner, not the requesting user (who is a student).
 */
function checkEnrollmentLimit() {
  return async (req, res, next) => {
    try {
      const { accessCode } = req.body;
      if (!accessCode) return next();

      // Find the center and its tutor
      const { data: center } = await supabase
        .from('tutorial_centers')
        .select('id, tutor_id')
        .eq('access_code', accessCode.toUpperCase())
        .single();

      if (!center) return next(); // Let the controller handle the 404

      // Check against the tutor's plan, not the student
      const isAdmin = false; // Student enrolling — always check limits
      const result = await checkSubscriptionLimit(center.tutor_id, 'students', 1, isAdmin);

      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: 'This tutorial center has reached its student capacity. Ask the tutor to upgrade their plan.',
          limitReached: true
        });
      }

      next();
    } catch (error) {
      console.error('Enrollment limit check error:', error.message);
      next();
    }
  };
}

module.exports = { checkLimit, checkEnrollmentLimit, checkSubscriptionLimit };
