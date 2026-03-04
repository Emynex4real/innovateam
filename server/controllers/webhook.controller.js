const crypto = require("crypto");
const supabase = require("../supabaseClient");
const Transaction = require("../models/Transaction");
const logger = require("../utils/logger");

/**
 * Verify Paystack webhook signature.
 */
function verifySignature(rawBody, signature) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

/**
 * POST /api/webhooks/paystack
 * Paystack sends webhook events here after payment.
 */
exports.handlePaystack = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    if (!signature || !req.rawBody) {
      return res.status(400).send("Invalid request");
    }

    if (!verifySignature(req.rawBody, signature)) {
      logger.warn("Paystack webhook signature mismatch");
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;
    logger.info("Paystack webhook received", { event: event.event });

    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "subscription.create":
        await handleSubscriptionCreate(event.data);
        break;
      case "subscription.not_renew":
        await handleSubscriptionNotRenew(event.data);
        break;
      case "subscription.disable":
        await handleSubscriptionDisable(event.data);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data);
        break;
      default:
        logger.info("Unhandled webhook event:", { event: event.event });
    }

    // Always return 200 so Paystack doesn't retry
    res.sendStatus(200);
  } catch (error) {
    logger.error("Webhook processing error", { error: error.message });
    // Still return 200 to prevent retries
    res.sendStatus(200);
  }
};

/**
 * Handle successful charge — activates or renews a subscription.
 */
async function handleChargeSuccess(data) {
  const reference = data.reference;
  const metadata = data.metadata || {};
  const amountInNaira = data.amount / 100;

  // Idempotency: skip if already processed
  const existing = await Transaction.findByPaystackReference(reference);
  if (existing) {
    logger.info("Webhook: payment already processed", { reference });
    return;
  }

  if (metadata.type === "wallet_funding") {
    const userId = metadata.userId;
    if (!userId) {
      logger.error("Webhook: wallet funding missing userId", { reference });
      return;
    }

    // Credit wallet
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    const newBalance = (profile?.wallet_balance || 0) + amountInNaira;

    await supabase
      .from("user_profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    await Transaction.create({
      userId,
      userEmail: data.customer?.email || null,
      type: "credit",
      amount: amountInNaira,
      description: "Wallet funding via Paystack (webhook)",
      status: "successful",
      category: "wallet_funding",
      reference,
      paystackReference: reference,
    });

    logger.info("Webhook: wallet credited", {
      userId,
      amount: amountInNaira,
      reference,
    });
  }

  if (metadata.type === "subscription") {
    const tutorId = metadata.tutorId;
    const planId = metadata.planId;
    if (!tutorId || !planId) {
      logger.error("Webhook: subscription missing tutorId/planId", {
        reference,
        metadata,
      });
      return;
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Check if this is a renewal (existing active subscription) or new subscription
    const { data: existingSub } = await supabase
      .from("tutor_subscriptions")
      .select("id, renewal_count")
      .eq("tutor_id", tutorId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      // Renewal: extend the existing subscription
      const { error: renewError } = await supabase
        .from("tutor_subscriptions")
        .update({
          end_date: endDate,
          paystack_reference: reference,
          next_payment_date: endDate,
          renewal_count: (existingSub.renewal_count || 0) + 1,
        })
        .eq("id", existingSub.id);

      if (renewError) {
        logger.error("Webhook: failed to renew subscription", {
          error: renewError,
          tutorId,
        });
      } else {
        logger.info("Webhook: subscription renewed", {
          tutorId,
          renewalCount: (existingSub.renewal_count || 0) + 1,
          reference,
        });
      }
    } else {
      // New subscription: deactivate any old ones and create new
      await supabase
        .from("tutor_subscriptions")
        .update({ status: "replaced" })
        .eq("tutor_id", tutorId)
        .in("status", ["active", "expired"]);

      const { error: insertError } = await supabase
        .from("tutor_subscriptions")
        .insert({
          tutor_id: tutorId,
          plan_id: planId,
          status: "active",
          payment_method: "paystack",
          paystack_reference: reference,
          end_date: endDate,
          next_payment_date: endDate,
          auto_renew: true,
          renewal_count: 0,
        });

      if (insertError) {
        logger.error("Webhook: failed to create subscription", {
          error: insertError,
          tutorId,
        });
      } else {
        logger.info("Webhook: new subscription created", {
          tutorId,
          planId,
          reference,
        });
      }
    }

    await Transaction.create({
      userId: tutorId,
      userEmail: data.customer?.email || null,
      type: "debit",
      amount: amountInNaira,
      description: existingSub
        ? "Subscription renewal payment"
        : "Subscription activation payment",
      status: "successful",
      category: "subscription",
      reference,
      paystackReference: reference,
    });
  }
}

/**
 * Handle subscription.create — store Paystack subscription code and email token.
 */
async function handleSubscriptionCreate(data) {
  const subscriptionCode = data.subscription_code;
  const emailToken = data.email_token;
  const customerEmail = data.customer?.email;
  const nextPayment = data.next_payment_date;

  logger.info("Webhook: subscription.create", {
    subscriptionCode,
    customerEmail,
    nextPayment,
  });

  if (!customerEmail) {
    logger.error("Webhook: subscription.create missing customer email");
    return;
  }

  // Find the tutor by email to update their subscription record
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const user = authUsers?.users?.find((u) => u.email === customerEmail);

  if (!user) {
    logger.error("Webhook: could not find user for subscription", {
      customerEmail,
    });
    return;
  }

  // Update the most recent active subscription with Paystack details
  const { error } = await supabase
    .from("tutor_subscriptions")
    .update({
      paystack_subscription_code: subscriptionCode,
      paystack_email_token: emailToken,
      next_payment_date: nextPayment,
    })
    .eq("tutor_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    logger.error("Webhook: failed to store subscription code", {
      error,
      userId: user.id,
    });
  } else {
    logger.info("Webhook: subscription code stored", {
      userId: user.id,
      subscriptionCode,
    });
  }
}

/**
 * Handle subscription.not_renew — Paystack can't renew, deactivate.
 */
async function handleSubscriptionNotRenew(data) {
  const subscriptionCode = data.subscription_code;
  logger.info("Webhook: subscription.not_renew", { subscriptionCode });

  const { error } = await supabase
    .from("tutor_subscriptions")
    .update({
      status: "expired",
      auto_renew: false,
    })
    .eq("paystack_subscription_code", subscriptionCode);

  if (error) {
    logger.error("Webhook: failed to deactivate subscription", {
      error,
      subscriptionCode,
    });
  } else {
    logger.info("Webhook: subscription deactivated due to non-renewal", {
      subscriptionCode,
    });
  }
}

/**
 * Handle subscription.disable — user or system disabled the subscription.
 */
async function handleSubscriptionDisable(data) {
  const subscriptionCode = data.subscription_code;
  logger.info("Webhook: subscription.disable", { subscriptionCode });

  const { error } = await supabase
    .from("tutor_subscriptions")
    .update({ auto_renew: false })
    .eq("paystack_subscription_code", subscriptionCode);

  if (error) {
    logger.error("Webhook: failed to update auto_renew on disable", {
      error,
      subscriptionCode,
    });
  } else {
    logger.info("Webhook: auto_renew disabled", { subscriptionCode });
  }
}

/**
 * Handle invoice.payment_failed — renewal charge failed.
 */
async function handlePaymentFailed(data) {
  const subscriptionCode = data.subscription?.subscription_code;
  logger.info("Webhook: invoice.payment_failed", { subscriptionCode });

  if (!subscriptionCode) return;

  // Mark the subscription — Paystack will retry a few times before disabling
  const { error } = await supabase
    .from("tutor_subscriptions")
    .update({
      status: "past_due",
    })
    .eq("paystack_subscription_code", subscriptionCode)
    .eq("status", "active");

  if (error) {
    logger.error("Webhook: failed to mark subscription as past_due", {
      error,
      subscriptionCode,
    });
  } else {
    logger.info("Webhook: subscription marked as past_due", {
      subscriptionCode,
    });
  }
}

module.exports = exports;
