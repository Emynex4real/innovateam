const supabase = require('../supabaseClient');

const subscriptionService = {
  // Get all subscription plans
  async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return { success: true, plans: data };
  },

  // Get tutor's current subscription
  async getTutorSubscription(tutorId) {
    const { data, error } = await supabase
      .from('tutor_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('tutor_id', tutorId)
      .eq('status', 'active')
      .single();

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
        // Return Pro plan features as a trial
        const { data: proPlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'pro')
          .single();

        return {
          success: true,
          subscription: null,
          plan: proPlan || null,
          isTrial: true,
          trialExpiresAt: profile.tutor_trial_expires_at
        };
      }

      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'free')
        .single();

      return { success: true, subscription: null, plan: freePlan };
    }

    return { success: true, subscription: data, plan: data.subscription_plans };
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
        stripe_subscription_id: paymentData.stripeId,
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
    const { subscription, plan } = await this.getTutorSubscription(tutorId);
    
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

    return { success: true, limits: plan, usage, canAdd };
  }
};

module.exports = subscriptionService;
