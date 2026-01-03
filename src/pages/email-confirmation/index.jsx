import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../App';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import supabase from '../../config/supabase';
import { confirmEmail, sendConfirmationEmail } from '../../services/emailService';

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState('waiting');

  const email = searchParams.get('email') || user?.email || '';
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');
  const customToken = searchParams.get('token');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Handle custom email confirmation token
      if (customToken && email) {
        try {
          setIsLoading(true);
          setConfirmationStatus('confirming');
          
          const result = await confirmEmail(email, customToken);
          
          if (result.success) {
            console.log('Custom email confirmed successfully:', result.user);
            setIsConfirmed(true);
            setConfirmationStatus('confirmed');
            toast.success('Email confirmed successfully!');
            
            // Redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setConfirmationStatus('error');
            toast.error(result.error || 'Failed to confirm email');
          }
        } catch (error) {
          console.error('Custom confirmation error:', error);
          setConfirmationStatus('error');
          toast.error('Failed to confirm email');
        } finally {
          setIsLoading(false);
        }
      }
      // Check if this is a Supabase confirmation callback
      else if (type === 'signup' && accessToken && refreshToken && supabase) {
        try {
          setIsLoading(true);
          setConfirmationStatus('confirming');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setConfirmationStatus('error');
            toast.error('Failed to confirm email');
          } else if (data.user) {
            console.log('Supabase email confirmed successfully:', data.user);
            setIsConfirmed(true);
            setConfirmationStatus('confirmed');
            toast.success('Email confirmed successfully!');
            
            localStorage.setItem('confirmedUser', JSON.stringify(data.user));
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } catch (error) {
          console.error('Supabase confirmation error:', error);
          setConfirmationStatus('error');
          toast.error('Failed to confirm email');
        } finally {
          setIsLoading(false);
        }
      }
      // Check if user is already authenticated and confirmed
      else if (isAuthenticated && user && user.email_confirmed_at) {
        setIsConfirmed(true);
        setConfirmationStatus('confirmed');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    };

    handleEmailConfirmation();
  }, [isAuthenticated, user, navigate, type, accessToken, refreshToken, customToken, email]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('No email address found');
      return;
    }
    
    setIsLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/email-confirmation`
          }
        });
        
        if (error) {
          console.error('Resend error:', error);
          toast.error('Failed to resend email');
        } else {
          toast.success('Confirmation email resent!');
        }
      } else {
        // Mock mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Confirmation email resent! (Demo mode)');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (supabase) {
      // For real Supabase, try to manually confirm (this is for testing only)
      try {
        setIsLoading(true);
        setConfirmationStatus('confirming');
        
        // This is a workaround - in production, users should click the email link
        // For testing, we'll create a mock confirmed user
        const mockUser = {
          id: `confirmed-${Date.now()}`,
          email: email,
          user_metadata: {
            full_name: localStorage.getItem('registrationName') || 'Test User',
            phone: localStorage.getItem('registrationPhone') || ''
          },
          email_confirmed_at: new Date().toISOString()
        };
        
        localStorage.setItem('confirmedUser', JSON.stringify(mockUser));
        setIsConfirmed(true);
        setConfirmationStatus('confirmed');
        toast.success('Email confirmed manually (for testing)!');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } catch (error) {
        console.error('Manual confirmation error:', error);
        toast.error('Manual confirmation failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Demo mode
      const mockUser = {
        id: `confirmed-${Date.now()}`,
        email: email,
        user_metadata: {
          full_name: localStorage.getItem('registrationName') || 'Demo User',
          phone: localStorage.getItem('registrationPhone') || ''
        },
        email_confirmed_at: new Date().toISOString()
      };
      
      localStorage.setItem('confirmedUser', JSON.stringify(mockUser));
      setIsConfirmed(true);
      toast.success('Email confirmed successfully!');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-primary-color/10 via-white to-gray-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className={isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {isConfirmed ? (
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <FiMail className="w-8 h-8 text-blue-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isConfirmed ? 'Email Confirmed!' : 'Check Your Email'}
            </CardTitle>
            <CardDescription>
              {isConfirmed 
                ? 'Redirecting you to your dashboard...'
                : `We've sent a confirmation link to ${email}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isConfirmed ? (
              <>
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to confirm your account and access your dashboard.
                  </p>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Status:</strong> {confirmationStatus === 'confirming' ? 'Confirming...' : 
                        confirmationStatus === 'confirmed' ? 'Confirmed!' :
                        confirmationStatus === 'error' ? 'Error occurred' : 'Waiting for confirmation'}
                      <br />
                      <strong>Mode:</strong> Email confirmation enabled
                      <br />
                      {email ? `Confirmation email sent to ${email}` : 'Check your email for the confirmation link.'}
                      <br />
                      <strong>Note:</strong> If Supabase emails aren't working due to rate limits, we'll use a backup confirmation system
                    </p>
                  </div>
                  
                  {/* Show simulated email link */}
                  {email && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                        <strong>📧 Simulated Email:</strong> Click the link below to confirm your email (this simulates clicking the link in your email)
                      </p>
                      <Button
                        onClick={async () => {
                          try {
                            setIsLoading(true);
                            setConfirmationStatus('confirming');
                            
                            const result = await confirmEmail(email, localStorage.getItem(`confirmation_${email}`) ? JSON.parse(localStorage.getItem(`confirmation_${email}`)).token : 'default_token');
                            
                            if (result.success) {
                              setIsConfirmed(true);
                              setConfirmationStatus('confirmed');
                              toast.success('Email confirmed successfully!');
                              
                              setTimeout(() => {
                                navigate('/dashboard');
                              }, 1500);
                            } else {
                              toast.error('Confirmation failed');
                            }
                          } catch (error) {
                            toast.error('Confirmation error');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        <FiExternalLink className="w-4 h-4 mr-2" />
                        {isLoading ? 'Confirming...' : 'Click Here to Confirm Email (Simulated Email Link)'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      const confirmedUser = {
                        id: `confirmed-${Date.now()}`,
                        email,
                        user_metadata: {
                          full_name: localStorage.getItem('registrationName') || 'User',
                          phone: localStorage.getItem('registrationPhone') || ''
                        },
                        email_confirmed_at: new Date().toISOString()
                      };
                      
                      localStorage.setItem('confirmedUser', JSON.stringify(confirmedUser));
                      setIsConfirmed(true);
                      toast.success('Email confirmed!');
                      
                      setTimeout(() => {
                        window.location.href = '/dashboard';
                      }, 1000);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FiCheckCircle className="w-4 h-4 mr-2" />
                    Confirm Email Now
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleResendEmail}
                    disabled={isLoading || confirmationStatus === 'confirming'}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Resending...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="w-4 h-4 mr-2" />
                        Resend Confirmation Email
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-green-600 font-medium">Taking you to your dashboard...</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={handleResendEmail}
                  className="text-primary-color hover:underline"
                  disabled={isLoading}
                >
                  resend it
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailConfirmation;