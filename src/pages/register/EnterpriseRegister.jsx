import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../App';
import toast from 'react-hot-toast';
import { componentStyles } from '../../styles/designSystem';

const EnterpriseRegister = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    agreeToTerms: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(formData.email, formData.password, formData);
      if (result.success) {
        toast.success('Account created! Check your email to verify.');
        navigate('/email-confirmation');
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.fullName || !formData.email)) {
      toast.error('Please fill in all fields');
      return;
    }
    if (step === 2 && (!formData.password || !formData.confirmPassword)) {
      toast.error('Please fill in all fields');
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-600 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">Join InnovaTeam</h1>
          <p className="text-green-100 text-lg">Start your learning journey today</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">✨</div>
            <div>
              <h3 className="text-white font-semibold">Free to Start</h3>
              <p className="text-green-100 text-sm">No credit card required</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">🚀</div>
            <div>
              <h3 className="text-white font-semibold">Quick Setup</h3>
              <p className="text-green-100 text-sm">Get started in 2 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">🎯</div>
            <div>
              <h3 className="text-white font-semibold">Personalized</h3>
              <p className="text-green-100 text-sm">Adaptive learning paths</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className={componentStyles.card.default}>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex-1 h-2 rounded-full mx-1 ${s <= step ? 'bg-green-600' : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">Step {step} of 3</p>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join thousands of learners</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={componentStyles.input.default}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={componentStyles.input.default}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <button type="button" onClick={nextStep} className={componentStyles.button.primary + ' w-full'}>
                      Continue
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setPasswordStrength(calculatePasswordStrength(e.target.value));
                        }}
                        className={componentStyles.input.default}
                        placeholder="••••••••"
                        required
                      />
                      <div className="mt-2">
                        <div className="flex gap-1 h-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={`flex-1 rounded-full ${
                              i < passwordStrength ? 'bg-green-600' : 'bg-gray-200'
                            }`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {passwordStrength === 0 && 'Very weak'}
                          {passwordStrength === 1 && 'Weak'}
                          {passwordStrength === 2 && 'Medium'}
                          {passwordStrength === 3 && 'Strong'}
                          {passwordStrength === 4 && 'Very strong'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={componentStyles.input.default}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className={componentStyles.button.secondary + ' flex-1'}>
                        Back
                      </button>
                      <button type="button" onClick={nextStep} className={componentStyles.button.primary + ' flex-1'}>
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">I am a...</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'student' })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.role === 'student'
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-3xl mb-2">🎓</div>
                          <div className="font-semibold">Student</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, role: 'tutor' })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.role === 'tutor'
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-3xl mb-2">👨‍🏫</div>
                          <div className="font-semibold">Tutor</div>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={componentStyles.input.default}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the <a href="/terms" className="text-green-600 hover:underline">Terms</a> and <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(2)} className={componentStyles.button.secondary + ' flex-1'}>
                        Back
                      </button>
                      <button type="submit" disabled={loading} className={componentStyles.button.primary + ' flex-1'}>
                        {loading ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-green-600 hover:text-green-700">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnterpriseRegister;
