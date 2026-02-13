import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import supabase from '../../config/supabase';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { API_BASE_URL } from '../../config/api';

const API_BASE = `${API_BASE_URL}/api`;

// Helper to format features from plan data
const getPlanFeatures = (plan) => {
  const features = typeof plan.features === 'string'
    ? JSON.parse(plan.features)
    : (plan.features || {});

  return [
    {
      label: plan.max_students ? `Up to ${plan.max_students.toLocaleString()} students` : 'Unlimited students',
      included: true
    },
    {
      label: plan.max_questions ? `Up to ${plan.max_questions.toLocaleString()} questions` : 'Unlimited questions',
      included: true
    },
    {
      label: plan.max_tests ? `Up to ${plan.max_tests} tests` : 'Unlimited tests',
      included: true
    },
    {
      label: `${plan.ai_generations_per_month === -1 ? 'Unlimited' : (plan.ai_generations_per_month || features.ai_generations || 0)} AI-generated questions/month`,
      included: true
    },
    {
      label: `${capitalize(plan.analytics_level || features.analytics || 'basic')} analytics & reports`,
      included: true
    },
    {
      label: `${capitalize(plan.support_level || features.support || 'community')} support`,
      included: true
    },
    {
      label: `${plan.commission_rate || 20}% platform commission`,
      included: true
    },
    {
      label: 'Custom branding',
      included: features.custom_branding || plan.custom_branding || false
    },
    {
      label: 'API access',
      included: features.api_access || plan.api_access || false
    }
  ];
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const Subscription = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [plans, setPlans] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      const [plansRes, subRes, limitsRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/subscriptions/plans`),
        axios.get(`${API_BASE}/subscriptions/my-subscription`, { headers }),
        axios.get(`${API_BASE}/subscriptions/limits`, { headers })
      ]);

      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data.plans || []);
      if (subRes.status === 'fulfilled') setSubscriptionData(subRes.value.data);
      if (limitsRes.status === 'fulfilled') setLimits(limitsRes.value.data);
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await axios.post(
        `${API_BASE}/subscriptions/checkout`,
        { planId },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      // Validate redirect URL
      try {
        const redirectUrl = new URL(data.url);
        const allowedHosts = [window.location.hostname, 'checkout.paystack.com', 'paystack.com'];
        if (!allowedHosts.some(host => redirectUrl.hostname.endsWith(host))) {
          throw new Error('Untrusted redirect URL');
        }
        window.location.href = data.url;
      } catch {
        toast.error('Invalid checkout URL received');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start checkout');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel? You will lose access to paid features at the end of your billing period.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(
        `${API_BASE}/subscriptions/cancel`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      toast.success('Subscription cancelled. You can still use paid features until your current period ends.');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  // Determine current plan name
  const currentPlanName = subscriptionData?.plan
    ? subscriptionData.plan.name?.toLowerCase()
    : 'free';
  const isTrial = subscriptionData?.isTrial || false;
  const daysRemaining = subscriptionData?.daysRemaining;
  const endDate = subscriptionData?.endDate;
  const hasActiveSubscription = subscriptionData?.subscription?.status === 'active';

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Back Button + Header */}
        <div>
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className={`mb-4 flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}
          >
            <span>&larr;</span> Back to Dashboard
          </button>
          <div className="text-center">
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subscription Plans
            </h1>
            <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose the right plan to grow your tutorial center
            </p>
          </div>
        </div>

        {/* Current Plan Status Card */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isTrial ? 'Trial Plan' : 'Current Plan'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {capitalize(currentPlanName)}
                </h2>
                {isTrial && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    TRIAL
                  </span>
                )}
                {hasActiveSubscription && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                )}
                {currentPlanName === 'free' && !isTrial && (
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    FREE
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              {daysRemaining !== null && daysRemaining !== undefined && (
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {isTrial ? 'Trial expires in' : 'Renews in'}
                  </p>
                  <p className={`text-2xl font-bold ${daysRemaining <= 5 ? 'text-red-500' : daysRemaining <= 10 ? 'text-amber-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                  </p>
                  {endDate && (
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(endDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
              {currentPlanName === 'free' && !isTrial && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No expiry — free forever
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trial Banner */}
        {isTrial && (
          <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              You're on a free trial of the Pro plan. Upgrade before it expires to keep all your Pro features.
            </p>
          </div>
        )}

        {/* Usage Summary */}
        {limits && (
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Usage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Students', used: limits.usage?.students || 0, max: limits.limits?.max_students },
                { label: 'Questions', used: limits.usage?.questions || 0, max: limits.limits?.max_questions },
                { label: 'Tests', used: limits.usage?.tests || 0, max: limits.limits?.max_tests }
              ].map(({ label, used, max }) => {
                const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0;
                const isNearLimit = max && pct >= 80;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                      <span className={`text-sm font-semibold ${isNearLimit ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {used} / {max || '\u221E'}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-2 rounded-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: max ? `${pct}%` : '0%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const planName = plan.name?.toLowerCase();
            const isCurrentPlan = currentPlanName === planName;
            const isPopular = planName === 'pro';
            const features = getPlanFeatures(plan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-all ${
                  isPopular
                    ? isDarkMode
                      ? 'bg-gray-800 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : isCurrentPlan
                    ? isDarkMode
                      ? 'bg-gray-800 border-2 border-blue-500'
                      : 'bg-white border-2 border-blue-500'
                    : isDarkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      CURRENT
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className={`text-xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {plan.display_name || capitalize(planName)}
                </h3>

                {/* Price */}
                <div className="mt-3 mb-6">
                  {plan.price === 0 ? (
                    <div>
                      <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free</span>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No credit card required</p>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {'\u20A6'}{plan.price.toLocaleString()}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Billed monthly
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6">
                  {features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 text-sm ${
                      feature.included
                        ? isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        : isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {feature.included ? (
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">{'\u2713'}</span>
                      ) : (
                        <span className="text-gray-400 mt-0.5 flex-shrink-0">{'\u2717'}</span>
                      )}
                      <span className={!feature.included ? 'line-through' : ''}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    className={`w-full py-3 rounded-xl font-semibold text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Current Plan
                  </button>
                ) : plan.price === 0 ? (
                  <button
                    disabled
                    className={`w-full py-3 rounded-xl font-semibold text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Free Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing === plan.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition ${
                      subscribing === plan.id
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    } ${
                      isPopular
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                        : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {subscribing === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Processing...
                      </span>
                    ) : (
                      currentPlanName !== 'free' && plan.price < (subscriptionData?.plan?.price || 0)
                        ? 'Downgrade'
                        : 'Upgrade Now'
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Cancel Subscription */}
        {hasActiveSubscription && (
          <div className="text-center pt-2">
            <button
              onClick={handleCancel}
              className={`text-sm font-medium ${isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'} transition`}
            >
              Cancel subscription
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className={`rounded-2xl p-6 mt-4 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Can I switch plans anytime?',
                a: 'Yes! You can upgrade at any time and the new plan takes effect immediately. If you downgrade, your current plan features stay active until the billing period ends.'
              },
              {
                q: 'What happens when I hit a limit?',
                a: 'You\'ll see a notification when approaching limits. You won\'t lose existing data — you just can\'t add new students, questions, or tests until you upgrade.'
              },
              {
                q: 'What is the platform commission?',
                a: 'When you sell paid tests to students, InnovaTeam takes a small percentage. Higher plans have lower commission rates, meaning you keep more of your earnings.'
              },
              {
                q: 'Is there a free trial?',
                a: 'New tutors may receive a free trial of the Pro plan from the admin team. Contact support to learn more.'
              }
            ].map(({ q, a }, i) => (
              <div key={i}>
                <p className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{q}</p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust / Contact */}
        <div className="text-center pb-8">
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            All payments are processed securely via Paystack. Need help? Contact us at support@innovateam.ng
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
