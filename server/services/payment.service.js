const https = require("https");
const supabase = require("../supabaseClient");
const logger = require("../utils/logger");

const paymentService = {
  // Helper: Make a Paystack API request
  paystackRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const bodyStr = body ? JSON.stringify(body) : null;
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path,
        method,
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
          ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (e) {
            reject(new Error("Invalid JSON response from Paystack"));
          }
        });
      });

      req.on("error", reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  },

  // Create or retrieve a Paystack Plan for a subscription plan
  async createOrGetPaystackPlan(plan) {
    // Check if we already have a cached plan code
    if (plan.paystack_plan_code) {
      return plan.paystack_plan_code;
    }

    logger.info("Creating Paystack plan for:", {
      planId: plan.id,
      name: plan.name,
      price: plan.price,
    });

    const response = await this.paystackRequest("POST", "/plan", {
      name: `InnovaTeam ${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} Plan`,
      interval: "monthly",
      amount: Math.round(plan.price * 100), // kobo
      currency: plan.currency || "NGN",
      description: `InnovaTeam ${plan.name} subscription - billed monthly`,
    });

    if (!response.status) {
      throw new Error(response.message || "Failed to create Paystack plan");
    }

    const planCode = response.data.plan_code;

    // Cache the plan code in our database
    await supabase
      .from("subscription_plans")
      .update({ paystack_plan_code: planCode })
      .eq("id", plan.id);

    logger.info("Paystack plan created:", { planCode, planId: plan.id });
    return planCode;
  },

  // Create Paystack payment link for subscription (with recurring billing)
  async createSubscriptionPayment(tutorId, planId, callbackUrl) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error(
        "Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.",
      );
    }

    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    // Get or create the Paystack plan for recurring billing
    const paystackPlanCode = await this.createOrGetPaystackPlan(plan);

    // Get actual tutor email from auth
    const {
      data: { user: authUser },
    } = await supabase.auth.admin.getUserById(tutorId);
    const tutorEmail = authUser?.email || `tutor_${tutorId}@example.com`;

    const response = await this.paystackRequest(
      "POST",
      "/transaction/initialize",
      {
        email: tutorEmail,
        amount: Math.round(plan.price * 100),
        currency: plan.currency,
        callback_url: callbackUrl,
        plan: paystackPlanCode, // This makes Paystack create a subscription after payment
        metadata: {
          tutorId,
          planId,
          type: "subscription",
        },
      },
    );

    if (!response.status) {
      throw new Error(response.message || "Failed to initialize payment");
    }

    return {
      success: true,
      reference: response.data.reference,
      url: response.data.authorization_url,
    };
  },

  // Disable a Paystack subscription (stop auto-renewal)
  async disablePaystackSubscription(subscriptionCode, emailToken) {
    logger.info("Disabling Paystack subscription:", { subscriptionCode });
    const response = await this.paystackRequest(
      "POST",
      "/subscription/disable",
      {
        code: subscriptionCode,
        token: emailToken,
      },
    );

    if (!response.status) {
      throw new Error(response.message || "Failed to disable subscription");
    }

    return { success: true };
  },

  // Enable a Paystack subscription (restart auto-renewal)
  async enablePaystackSubscription(subscriptionCode, emailToken) {
    logger.info("Enabling Paystack subscription:", { subscriptionCode });
    const response = await this.paystackRequest(
      "POST",
      "/subscription/enable",
      {
        code: subscriptionCode,
        token: emailToken,
      },
    );

    if (!response.status) {
      throw new Error(response.message || "Failed to enable subscription");
    }

    return { success: true };
  },

  // Create Paystack payment for test purchase
  async createTestPurchasePayment(studentId, testId, callbackUrl) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error(
        "Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.",
      );
    }

    const { data: paidTest } = await supabase
      .from("paid_tests")
      .select("*, tc_question_sets(title)")
      .eq("test_id", testId)
      .single();

    // Get actual student email from auth
    const {
      data: { user: studentUser },
    } = await supabase.auth.admin.getUserById(studentId);
    const studentEmail =
      studentUser?.email || `student_${studentId}@example.com`;

    const params = JSON.stringify({
      email: studentEmail,
      amount: Math.round(paidTest.price * 100), // Paystack expects amount in kobo
      currency: paidTest.currency,
      callback_url: callbackUrl,
      metadata: {
        studentId,
        testId,
        paidTestId: paidTest.id,
        type: "test_purchase",
      },
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(params),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const response = JSON.parse(data);
          if (response.status) {
            resolve({
              success: true,
              reference: response.data.reference,
              url: response.data.authorization_url,
            });
          } else {
            reject(new Error(response.message));
          }
        });
      });

      req.on("error", reject);
      req.write(params);
      req.end();
    });
  },

  // Verify Paystack payment
  async verifyPayment(reference) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error(
        "Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.",
      );
    }

    logger.info("Verifying payment with Paystack:", { reference });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", async () => {
          try {
            const response = JSON.parse(data);
            logger.info("Paystack verify response:", {
              status: response.status,
              txStatus: response.data?.status,
              metadata: response.data?.metadata,
            });
            if (response.status && response.data.status === "success") {
              const result = await this.handlePaymentSuccess(response.data);
              resolve(result);
            } else {
              logger.error("Payment verification failed:", {
                message: response.message,
                status: response.data?.status,
              });
              reject(
                new Error(response.message || "Payment verification failed"),
              );
            }
          } catch (parseError) {
            logger.error("Error processing Paystack response:", parseError);
            reject(parseError);
          }
        });
      });

      req.on("error", (err) => {
        logger.error("Paystack request error:", err);
        reject(err);
      });
      req.end();
    });
  },

  async handlePaymentSuccess(paymentData) {
    const { tutorId, planId, studentId, testId, paidTestId, type } =
      paymentData.metadata;
    logger.info("Handling payment success:", {
      type,
      tutorId,
      planId,
      studentId,
      testId,
    });

    if (type === "subscription" && tutorId && planId) {
      // Deactivate any existing active/grace subscriptions first
      const { error: deactivateError } = await supabase
        .from("tutor_subscriptions")
        .update({ status: "replaced" })
        .eq("tutor_id", tutorId)
        .in("status", ["active", "grace_period", "past_due"]);

      if (deactivateError) {
        logger.error(
          "Failed to deactivate old subscriptions:",
          deactivateError,
        );
      }

      // Clear all grace periods — fresh start on upgrade
      const { error: graceError } = await supabase
        .from("subscription_grace_periods")
        .delete()
        .eq("tutor_id", tutorId);

      if (graceError) {
        logger.error("Failed to clear grace periods:", graceError);
      }

      // Insert new active subscription
      const { data: insertedSub, error: insertError } = await supabase
        .from("tutor_subscriptions")
        .insert({
          tutor_id: tutorId,
          plan_id: planId,
          status: "active",
          payment_method: "paystack",
          paystack_reference: paymentData.reference,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
        .select();

      if (insertError) {
        logger.error("Failed to insert subscription:", insertError);
        throw new Error(
          "Failed to activate subscription: " + insertError.message,
        );
      }

      logger.info("Subscription activated successfully:", {
        subscriptionId: insertedSub?.[0]?.id,
        planId,
      });
    } else if (type === "test_purchase" && studentId && testId) {
      // Test purchase
      const { error: purchaseError } = await supabase
        .from("test_purchases")
        .insert({
          student_id: studentId,
          test_id: testId,
          paid_test_id: paidTestId,
          amount_paid: paymentData.amount / 100,
          payment_status: "completed",
          payment_method: "paystack",
          paystack_reference: paymentData.reference,
        });

      if (purchaseError) {
        logger.error("Failed to insert test purchase:", purchaseError);
        throw new Error(
          "Failed to record test purchase: " + purchaseError.message,
        );
      }

      // Update sales count
      await supabase.rpc("increment", {
        table_name: "paid_tests",
        row_id: paidTestId,
        column_name: "sales_count",
      });
    } else {
      logger.warn(
        "Payment success handler: unrecognized payment type or missing metadata",
        { type, tutorId, planId },
      );
    }

    return { success: true };
  },

  // Get tutor earnings
  async getTutorEarnings(tutorId) {
    const { data, error } = await supabase
      .from("tutor_earnings")
      .select("*")
      .eq("tutor_id", tutorId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const total = data.reduce((sum, e) => sum + parseFloat(e.net_amount), 0);
    const pending = data
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + parseFloat(e.net_amount), 0);
    const paid = data
      .filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + parseFloat(e.net_amount), 0);

    return { success: true, earnings: data, summary: { total, pending, paid } };
  },
};

module.exports = paymentService;
