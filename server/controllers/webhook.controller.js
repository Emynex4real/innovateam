const crypto = require('crypto');
const supabase = require('../supabaseClient');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

/**
 * Verify Paystack webhook signature.
 */
function verifySignature(rawBody, signature) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return hash === signature;
}

/**
 * POST /api/webhooks/paystack
 * Paystack sends webhook events here after payment.
 */
exports.handlePaystack = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!signature || !req.rawBody) {
      return res.status(400).send('Invalid request');
    }

    if (!verifySignature(req.rawBody, signature)) {
      logger.warn('Paystack webhook signature mismatch');
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    logger.info('Paystack webhook received', { event: event.event });

    if (event.event === 'charge.success') {
      await handleChargeSuccess(event.data);
    }

    // Always return 200 so Paystack doesn't retry
    res.sendStatus(200);
  } catch (error) {
    logger.error('Webhook processing error', { error: error.message });
    // Still return 200 to prevent retries
    res.sendStatus(200);
  }
};

async function handleChargeSuccess(data) {
  const reference = data.reference;
  const metadata = data.metadata || {};
  const amountInNaira = data.amount / 100;

  // Idempotency: skip if already processed
  const existing = await Transaction.findByPaystackReference(reference);
  if (existing) {
    logger.info('Webhook: payment already processed', { reference });
    return;
  }

  if (metadata.type === 'wallet_funding') {
    const userId = metadata.userId;
    if (!userId) {
      logger.error('Webhook: wallet funding missing userId', { reference });
      return;
    }

    // Credit wallet
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const newBalance = (profile?.wallet_balance || 0) + amountInNaira;

    await supabase
      .from('user_profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    await Transaction.create({
      userId,
      userEmail: data.customer?.email || null,
      type: 'credit',
      amount: amountInNaira,
      description: 'Wallet funding via Paystack (webhook)',
      status: 'successful',
      category: 'wallet_funding',
      reference,
      paystackReference: reference
    });

    logger.info('Webhook: wallet credited', { userId, amount: amountInNaira, reference });
  }

  if (metadata.type === 'subscription') {
    const userId = metadata.userId;
    if (!userId) {
      logger.error('Webhook: subscription missing userId', { reference });
      return;
    }

    // Activate/renew tutor subscription
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_name: 'Pro',
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        paystack_reference: reference
      }, { onConflict: 'user_id' });

    await Transaction.create({
      userId,
      userEmail: data.customer?.email || null,
      type: 'debit',
      amount: amountInNaira,
      description: 'Tutor subscription payment',
      status: 'successful',
      category: 'subscription',
      reference,
      paystackReference: reference
    });

    logger.info('Webhook: subscription activated', { userId, reference });
  }
}
