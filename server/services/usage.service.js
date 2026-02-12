/**
 * Student Usage Service
 * Tracks free tier sessions and enforces pay-per-use gating.
 *
 * Students get 3 free AI Examiner / practice exam sessions.
 * After that, each session costs ₦100 deducted from wallet.
 */

const supabase = require('../supabaseClient');
const logger = require('../utils/logger');

const FREE_SESSION_LIMIT = 3;
const SESSION_COST = 100; // NGN

const ELIGIBLE_SERVICES = ['ai_examiner', 'practice_exam'];

/**
 * Check if a student can use a paid service.
 * @param {string} userId
 * @param {string} serviceType - 'ai_examiner' or 'practice_exam'
 * @returns {{ canUse: boolean, isFree: boolean, freeRemaining: number, cost: number, balance: number }}
 */
async function checkCanUseService(userId, serviceType) {
  // Count total free sessions used (across all eligible services)
  const { count: freeUsed, error: countError } = await supabase
    .from('student_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_free', true);

  if (countError) {
    logger.error('Usage count query failed', { error: countError.message, userId });
    throw new Error('Failed to check usage');
  }

  const freeRemaining = Math.max(0, FREE_SESSION_LIMIT - (freeUsed || 0));
  const isFree = freeRemaining > 0;

  if (isFree) {
    return { canUse: true, isFree: true, freeRemaining: freeRemaining - 1, cost: 0, balance: null };
  }

  // Not free — check wallet balance
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('wallet_balance')
    .eq('id', userId)
    .single();

  const balance = profile?.wallet_balance || 0;
  const canUse = balance >= SESSION_COST;

  return {
    canUse,
    isFree: false,
    freeRemaining: 0,
    cost: SESSION_COST,
    balance
  };
}

/**
 * Record a usage event and deduct wallet if not free.
 * @param {string} userId
 * @param {string} serviceType
 * @param {string|null} examId
 * @param {boolean} wasFree
 */
async function recordUsage(userId, serviceType, examId, wasFree) {
  // Insert usage record
  const { error: insertError } = await supabase
    .from('student_usage')
    .insert({
      user_id: userId,
      service_type: serviceType,
      exam_id: examId || null,
      was_free: wasFree,
      amount_charged: wasFree ? 0 : SESSION_COST
    });

  if (insertError) {
    logger.error('Failed to record usage', { error: insertError.message, userId, serviceType });
    throw new Error('Failed to record usage');
  }

  // Deduct from wallet if paid session
  if (!wasFree) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.wallet_balance || 0;
    const newBalance = currentBalance - SESSION_COST;

    await supabase
      .from('user_profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    // Record transaction
    const Transaction = require('../models/Transaction');
    await Transaction.create({
      userId,
      type: 'debit',
      amount: SESSION_COST,
      description: `${serviceType === 'ai_examiner' ? 'AI Examiner' : 'Practice Exam'} session`,
      status: 'completed',
      category: 'service_usage'
    });
  }
}

/**
 * Get usage stats for a student.
 * @param {string} userId
 */
async function getUsageStats(userId) {
  const { data: rows, error } = await supabase
    .from('student_usage')
    .select('was_free, amount_charged, service_type')
    .eq('user_id', userId);

  if (error) {
    logger.error('Failed to get usage stats', { error: error.message });
    return { freeSessions: 0, paidSessions: 0, totalSpent: 0, freeRemaining: FREE_SESSION_LIMIT };
  }

  const freeSessions = (rows || []).filter(r => r.was_free).length;
  const paidSessions = (rows || []).filter(r => !r.was_free).length;
  const totalSpent = (rows || []).reduce((sum, r) => sum + (r.amount_charged || 0), 0);

  return {
    freeSessions,
    paidSessions,
    totalSessions: freeSessions + paidSessions,
    totalSpent,
    freeRemaining: Math.max(0, FREE_SESSION_LIMIT - freeSessions),
    sessionCost: SESSION_COST
  };
}

module.exports = {
  checkCanUseService,
  recordUsage,
  getUsageStats,
  FREE_SESSION_LIMIT,
  SESSION_COST
};
