import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Subscription = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      const [plansRes, subRes, limitsRes] = await Promise.all([
        axios.get(`${API_BASE}/subscriptions/plans`),
        axios.get(`${API_BASE}/subscriptions/my-subscription`, { headers }),
        axios.get(`${API_BASE}/subscriptions/limits`, { headers })
      ]);

      setPlans(plansRes.data.plans);
      setCurrentSubscription(subRes.data.subscription);
      setLimits(limitsRes.data);
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await axios.post(
        `${API_BASE}/subscriptions/checkout`,
        { planId },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(
        `${API_BASE}/subscriptions/cancel`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      
      toast.success('Subscription cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Plan
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Unlock more features and grow your tutorial center
          </p>
        </div>

        {/* Current Usage */}
        {limits && (
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Usage
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {limits.usage.students} / {limits.limits.max_students || '∞'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Questions</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {limits.usage.questions} / {limits.limits.max_questions || '∞'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tests</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {limits.usage.tests} / {limits.limits.max_tests || '∞'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id || (!currentSubscription && plan.name === 'free');
            const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
            
            return (
              <div
                key={plan.id}
                className={`${isDarkMode ? 'bg-gray-800 border-2' : 'bg-white shadow-xl'} rounded-2xl p-8 ${
                  plan.name === 'pro' ? 'border-blue-500 transform scale-105' : isDarkMode ? 'border-gray-700' : ''
                }`}
              >
                {plan.name === 'pro' && (
                  <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {plan.display_name}
                </h3>
                
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.max_students ? `Up to ${plan.max_students} students` : 'Unlimited students'}
                  </li>
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.max_questions ? `Up to ${plan.max_questions} questions` : 'Unlimited questions'}
                  </li>
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.max_tests ? `Up to ${plan.max_tests} tests` : 'Unlimited tests'}
                  </li>
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.ai_generations_per_month} AI generations/month
                  </li>
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.analytics_level} analytics
                  </li>
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.support_level} support
                  </li>
                  <li className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.platform_commission_rate}% platform fee
                  </li>
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-gray-400 text-white font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                      plan.name === 'pro'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Cancel Subscription */}
        {currentSubscription && currentSubscription.status === 'active' && (
          <div className="text-center">
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
