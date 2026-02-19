const supabase = require('../supabaseClient');

const subscriptionService = {
  // Get all subscription plans
  async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price');

    if (error) throw error;

    // Enrich plans with human-readable fields from JSONB features
    const enrichedPlans = (data || []).map(plan => {
      const features = typeof plan.features === 'string'
        ? JSON.parse(plan.features)
        : (plan.features || {});

      return {
        ...plan,
        display_name: plan.name.charAt(0).toUpperCase() + plan.name.slice(1),
        analytics_level: features.analytics || 'basic',
        support_level: features.support || 'community',
        ai_generations_per_month: features.ai_generations || 0,
        custom_branding: features.custom_branding || false,
        api_access: features.api_access || false
      };
    });

    return { success: true, plans: enrichedPlans };
  },

  // Get tutor's current subscription with expiry info
  async getTutorSubscription(tutorId) {
    const { data, error } = await supabase
      .from('tutor_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('tutor_id', tutorId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    // If no subscription, check for admin-granted trial
    if (!data) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tutor_trial_granted, tutor_trial_expires_at')
        .eq('id', tutorId)
        .single();

      const hasActiveTrial = profile?.tutor_trial_granted &&
        profile?.tutor_trial_expires_at &&
        new Date(profile.tutor_trial_expires_at) > new Date();

      if (hasActiveTrial) {
        const { data: proPlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .ilike('name', 'pro')
          .single();

        const expiresAt = new Date(profile.tutor_trial_expires_at);
        const daysRemaining = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)));

        return {
          success: true,
          subscription: null,
          plan: proPlan || null,
          isTrial: true,
          trialExpiresAt: profile.tutor_trial_expires_at,
          daysRemaining,
          endDate: profile.tutor_trial_expires_at
        };
      }

      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .ilike('name', 'free')
        .single();

      return {
        success: true,
        subscription: null,
        plan: freePlan,
        isTrial: false,
        daysRemaining: null,
        endDate: null
      };
    }

    // Active paid subscription — calculate days remaining
    const endDate = data.end_date ? new Date(data.end_date) : null;
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      success: true,
      subscription: data,
      plan: data.subscription_plans,
      isTrial: false,
      daysRemaining,
      endDate: data.end_date
    };
  },

  // Create subscription
  async createSubscription(tutorId, planId, paymentData) {
    const { data, error } = await supabase
      .from('tutor_subscriptions')
      .insert({
        tutor_id: tutorId,
        plan_id: planId,
        status: 'active',
        payment_method: paymentData.method,
        paystack_subscription_code: paymentData.paystackCode,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, subscription: data };
  },

  // Cancel subscription
  async cancelSubscription(tutorId) {
    const { data, error } = await supabase
      .from('tutor_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date(),
        auto_renew: false
      })
      .eq('tutor_id', tutorId)
      .eq('status', 'active')
      .select()
      .single();

    if (error) throw error;
    return { success: true, subscription: data };
  },

  // Check subscription limits
  async checkLimits(tutorId) {
    const result = await this.getTutorSubscription(tutorId);
    const plan = result.plan || {};

    // Get current usage
    const { data: center } = await supabase
      .from('tutorial_centers')
      .select('id')
      .eq('tutor_id', tutorId)
      .single();

    if (!center) return { success: true, limits: plan, usage: { students: 0, questions: 0, tests: 0 } };

    const [students, questions, tests] = await Promise.all([
      supabase.from('tc_enrollments').select('*', { count: 'exact', head: true }).eq('center_id', center.id),
      supabase.from('tc_questions').select('*', { count: 'exact', head: true }).eq('center_id', center.id),
      supabase.from('tc_question_sets').select('*', { count: 'exact', head: true }).eq('center_id', center.id)
    ]);

    const usage = {
      students: students.count || 0,
      questions: questions.count || 0,
      tests: tests.count || 0
    };

    const canAdd = {
      students: !plan.max_students || usage.students < plan.max_students,
      questions: !plan.max_questions || usage.questions < plan.max_questions,
      tests: !plan.max_tests || usage.tests < plan.max_tests
    };

    // Get grace period info for exceeded limits
    const { data: gracePeriods } = await supabase
      .from('subscription_grace_periods')
      .select('*')
      .eq('tutor_id', tutorId);

    const graceInfo = {};
    if (gracePeriods) {
      gracePeriods.forEach(gp => {
        const graceEndsAt = new Date(gp.grace_ends_at);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((graceEndsAt - now) / (1000 * 60 * 60 * 24)));
        graceInfo[gp.resource_type] = {
          graceEndsAt: gp.grace_ends_at,
          daysRemaining,
          expired: now > graceEndsAt
        };
      });
    }

    return { success: true, limits: plan, usage, canAdd, graceInfo };
  }
};

module.exports = subscriptionService;
