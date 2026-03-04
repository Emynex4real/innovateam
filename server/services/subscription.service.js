const supabase = require("../supabaseClient");
const paymentService = require("./payment.service");
const logger = require("../utils/logger");

const subscriptionService = {
  // Get all subscription plans
  async getPlans() {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price");

    if (error) throw error;

    // Enrich plans with human-readable fields from JSONB features
    const enrichedPlans = (data || []).map((plan) => {
      const features =
        typeof plan.features === "string"
          ? JSON.parse(plan.features)
          : plan.features || {};

      return {
        ...plan,
        display_name: plan.name.charAt(0).toUpperCase() + plan.name.slice(1),
        analytics_level: features.analytics || "basic",
        support_level: features.support || "community",
        ai_generations_per_month: features.ai_generations || 0,
        custom_branding: features.custom_branding || false,
        api_access: features.api_access || false,
      };
    });

    return { success: true, plans: enrichedPlans };
  },

  // Get tutor's current subscription with expiry info
  async getTutorSubscription(tutorId) {
    // Query for active, grace_period, or past_due subscriptions
    const { data, error } = await supabase
      .from("tutor_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("tutor_id", tutorId)
      .in("status", ["active", "grace_period", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    // If no subscription, check for admin-granted trial
    if (!data) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("tutor_trial_granted, tutor_trial_expires_at")
        .eq("id", tutorId)
        .single();

      const hasActiveTrial =
        profile?.tutor_trial_granted &&
        profile?.tutor_trial_expires_at &&
        new Date(profile.tutor_trial_expires_at) > new Date();

      if (hasActiveTrial) {
        const { data: proPlan } = await supabase
          .from("subscription_plans")
          .select("*")
          .ilike("name", "pro")
          .single();

        const expiresAt = new Date(profile.tutor_trial_expires_at);
        const daysRemaining = Math.max(
          0,
          Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)),
        );

        return {
          success: true,
          subscription: null,
          plan: proPlan || null,
          isTrial: true,
          trialExpiresAt: profile.tutor_trial_expires_at,
          daysRemaining,
          endDate: profile.tutor_trial_expires_at,
        };
      }

      const { data: freePlan } = await supabase
        .from("subscription_plans")
        .select("*")
        .ilike("name", "free")
        .single();

      return {
        success: true,
        subscription: null,
        plan: freePlan,
        isTrial: false,
        daysRemaining: null,
        endDate: null,
      };
    }

    // Active/grace/past_due subscription — calculate days remaining
    const endDate = data.end_date ? new Date(data.end_date) : null;
    const daysRemaining = endDate
      ? Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)))
      : null;

    // Map status to user-friendly label
    const statusLabels = {
      active: "Active",
      grace_period: "Grace Period",
      past_due: "Payment Failed",
      expired: "Expired",
      cancelled: "Cancelled",
    };

    return {
      success: true,
      subscription: data,
      plan: data.subscription_plans,
      isTrial: false,
      daysRemaining,
      endDate: data.end_date,
      autoRenew: data.auto_renew !== false,
      nextPaymentDate: data.next_payment_date,
      renewalCount: data.renewal_count || 0,
      hasPaystackSubscription: !!data.paystack_subscription_code,
      subscriptionStatus: data.status,
      statusLabel: statusLabels[data.status] || data.status,
    };
  },

  // Create subscription
  async createSubscription(tutorId, planId, paymentData) {
    const { data, error } = await supabase
      .from("tutor_subscriptions")
      .insert({
        tutor_id: tutorId,
        plan_id: planId,
        status: "active",
        payment_method: paymentData.method,
        paystack_subscription_code: paymentData.paystackCode,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, subscription: data };
  },

  // Cancel subscription (also disables Paystack recurring billing)
  async cancelSubscription(tutorId) {
    // Get the subscription first to find Paystack codes
    const { data: sub } = await supabase
      .from("tutor_subscriptions")
      .select("*")
      .eq("tutor_id", tutorId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) throw new Error("No active subscription found");

    // Disable Paystack recurring billing if applicable
    if (sub.paystack_subscription_code && sub.paystack_email_token) {
      try {
        await paymentService.disablePaystackSubscription(
          sub.paystack_subscription_code,
          sub.paystack_email_token,
        );
        logger.info("Paystack subscription disabled", {
          tutorId,
          code: sub.paystack_subscription_code,
        });
      } catch (err) {
        logger.error("Failed to disable Paystack subscription", {
          error: err.message,
          tutorId,
        });
        // Continue with local cancellation even if Paystack fails
      }
    }

    const { data, error } = await supabase
      .from("tutor_subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date(),
        auto_renew: false,
      })
      .eq("id", sub.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, subscription: data };
  },

  // Toggle auto-renewal on/off
  async toggleAutoRenew(tutorId, enable) {
    const { data: sub } = await supabase
      .from("tutor_subscriptions")
      .select("*")
      .eq("tutor_id", tutorId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) throw new Error("No active subscription found");

    // Toggle on Paystack side
    if (sub.paystack_subscription_code && sub.paystack_email_token) {
      if (enable) {
        await paymentService.enablePaystackSubscription(
          sub.paystack_subscription_code,
          sub.paystack_email_token,
        );
      } else {
        await paymentService.disablePaystackSubscription(
          sub.paystack_subscription_code,
          sub.paystack_email_token,
        );
      }
    }

    // Update local record
    const { data, error } = await supabase
      .from("tutor_subscriptions")
      .update({ auto_renew: enable })
      .eq("id", sub.id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, autoRenew: enable, subscription: data };
  },

  // Deactivate expired subscriptions (called by cron)
  // 2-stage degradation: active → grace_period (7 days), then grace_period → expired
  async deactivateExpired() {
    const now = new Date();
    const nowISO = now.toISOString();
    const graceDuration = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Stage 1: Move expired active subscriptions (auto_renew off) to grace_period
    const { data: newGrace, error: graceError } = await supabase
      .from("tutor_subscriptions")
      .update({
        status: "grace_period",
        // grace_end = end_date + 7 days
        next_payment_date: new Date(now.getTime() + graceDuration),
      })
      .eq("status", "active")
      .eq("auto_renew", false)
      .lt("end_date", nowISO)
      .select("id, tutor_id");

    if (graceError) {
      logger.error("Failed to move subscriptions to grace_period", {
        error: graceError,
      });
    } else if (newGrace?.length > 0) {
      logger.info(`Moved ${newGrace.length} subscriptions to grace_period`, {
        tutorIds: newGrace.map((s) => s.tutor_id),
      });
    }

    // Stage 2: Expire grace_period subscriptions that have been in grace for 7+ days
    // We stored the grace end date in next_payment_date
    const { data: expired, error: expireError } = await supabase
      .from("tutor_subscriptions")
      .update({ status: "expired" })
      .eq("status", "grace_period")
      .lt("next_payment_date", nowISO)
      .select("id, tutor_id");

    if (expireError) {
      logger.error("Failed to expire grace_period subscriptions", {
        error: expireError,
      });
    } else if (expired?.length > 0) {
      logger.info(`Expired ${expired.length} grace_period subscriptions`, {
        tutorIds: expired.map((s) => s.tutor_id),
      });
    }

    return {
      movedToGrace: newGrace?.length || 0,
      deactivated: expired?.length || 0,
    };
  },

  // Check subscription limits (optimized: 2 parallel batches instead of 5+ sequential)
  async checkLimits(tutorId) {
    // Batch 1: Fetch subscription info and center in parallel
    const [subResult, centerResult] = await Promise.all([
      this.getTutorSubscription(tutorId),
      supabase
        .from("tutorial_centers")
        .select("id")
        .eq("tutor_id", tutorId)
        .single(),
    ]);

    const plan = subResult.plan || {};

    if (!centerResult.data)
      return {
        success: true,
        limits: plan,
        usage: { students: 0, questions: 0, tests: 0 },
      };

    const centerId = centerResult.data.id;

    // Batch 2: Fetch all counts + grace periods in parallel
    const [students, questions, tests, graceResult] = await Promise.all([
      supabase
        .from("tc_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("center_id", centerId),
      supabase
        .from("tc_questions")
        .select("*", { count: "exact", head: true })
        .eq("center_id", centerId),
      supabase
        .from("tc_question_sets")
        .select("*", { count: "exact", head: true })
        .eq("center_id", centerId),
      supabase
        .from("subscription_grace_periods")
        .select("*")
        .eq("tutor_id", tutorId),
    ]);

    const usage = {
      students: students.count || 0,
      questions: questions.count || 0,
      tests: tests.count || 0,
    };

    const canAdd = {
      students: !plan.max_students || usage.students < plan.max_students,
      questions: !plan.max_questions || usage.questions < plan.max_questions,
      tests: !plan.max_tests || usage.tests < plan.max_tests,
    };

    const graceInfo = {};
    if (graceResult.data) {
      graceResult.data.forEach((gp) => {
        const graceEndsAt = new Date(gp.grace_ends_at);
        const now = new Date();
        const daysRemaining = Math.max(
          0,
          Math.ceil((graceEndsAt - now) / (1000 * 60 * 60 * 24)),
        );
        graceInfo[gp.resource_type] = {
          graceEndsAt: gp.grace_ends_at,
          daysRemaining,
          expired: now > graceEndsAt,
        };
      });
    }

    return { success: true, limits: plan, usage, canAdd, graceInfo };
  },
};

module.exports = subscriptionService;
