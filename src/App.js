import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Toaster } from 'react-hot-toast'; // ✅ FIXED: Added this import
import { DarkModeProvider } from './contexts/DarkModeContext';
import { WalletProvider } from './contexts/WalletContext';
import { sendConfirmationEmail } from './services/emailService';
import adminService from './services/admin.service';
import Home from './pages/Home';
import Login from './pages/login';
import Register from './pages/register';
import About from './pages/About';
import Contact from './pages/Contact';
import CourseAdvisor from './pages/course-advisor';
import QuestionGenerator from './pages/question-generator';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Wallet from './pages/wallet';
import Transactions from './pages/transactions';
import Support from './pages/support';
import AIExaminer from './pages/ai examiner'; // Ensure folder name matches exactly in your project
import OLevelUploadExisting from './pages/jamb services/olevel upload';
import WaecResultChecker from './pages/result checker/waec result checker';
import NecoResultChecker from './pages/result checker/neco result checker';
import NbaisResultChecker from './pages/result checker/nbais result checker';
import NabtebResultChecker from './pages/result checker/nabteb result checker';
import WaecGceChecker from './pages/result checker/waec gce';
import AdmissionLetter from './pages/jamb services/admission letter';
import OriginalResult from './pages/jamb services/original result';
import PinVending from './pages/jamb services/pin vending';
import Reprinting from './pages/jamb services/reprinting';
import EducationalSidebar from './components/EducationalSidebar';
import AdminDashboard from './pages/admin/AdminDashboard';
import SimpleAdminDashboard from './pages/admin/SimpleAdminDashboard';
import EmailConfirmation from './pages/email-confirmation';
import ProtectedRoute from './components/ProtectedRoute';

// Initialize Supabase with validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO';

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') && 
  supabaseUrl.includes('.supabase.co') &&
  !supabaseUrl.includes('your_supabase_url_here') &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here') &&
  supabaseAnonKey.length > 20;

const supabase = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log('🔍 Supabase Configuration Check:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Service Key:', 'Present');

if (!supabase) {
  console.warn('❌ Supabase not configured properly. Using mock authentication mode.');
  console.log('Missing:', !supabaseUrl ? 'URL' : 'Anon Key');
} else {
  const skipEmailConfirmation = process.env.REACT_APP_SKIP_EMAIL_CONFIRMATION === 'true';
  if (skipEmailConfirmation) {
    console.log('🚀 Development mode: Email confirmation disabled');
  } else {
    console.log('✅ Supabase configured with email confirmation fallback');
  }
  console.log('Supabase URL:', supabaseUrl);
}

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured, using mock authentication mode');
      // Check if user was confirmed in demo mode
      const confirmedUser = localStorage.getItem('confirmedUser');
      if (confirmedUser) {
        setUser(JSON.parse(confirmedUser));
      }
      setLoading(false);
      return;
    }
    
    // Also check for confirmed user in localStorage for custom email flow
    const confirmedUser = localStorage.getItem('confirmedUser');
    if (confirmedUser) {
      const userData = JSON.parse(confirmedUser);
      if (userData.email_confirmed_at) {
        setUser(userData);
        setLoading(false);
        return;
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email_confirmed_at);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // If email is confirmed, redirect to dashboard
        if (session.user.email_confirmed_at) {
          console.log('Email confirmed, redirecting to dashboard');
          setTimeout(() => window.location.href = '/dashboard', 1000);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    setLoading(true);
    try {
      const skipEmailConfirmation = process.env.REACT_APP_SKIP_EMAIL_CONFIRMATION === 'true';
      
      if (!supabase) {
        console.warn('Supabase not configured, using mock authentication');
        // Mock signup with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Generate real UUID format for compatibility
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        const mockUser = { 
          id: generateUUID(), 
          email, 
          user_metadata: { 
            full_name: userData?.fullName,
            phone: userData?.phone 
          },
          email_confirmed_at: skipEmailConfirmation ? new Date().toISOString() : null
        };
        
        // Store registration data for later use
        localStorage.setItem('registrationName', userData?.fullName || '');
        localStorage.setItem('registrationPhone', userData?.phone || '');
        
        // Store user data locally for fallback
        const userData_local = {
          id: mockUser.id,
          name: userData?.fullName,
          email: email,
          created_at: new Date().toISOString(),
          email_confirmed_at: skipEmailConfirmation ? new Date().toISOString() : null
        };
        const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]');
        allUsers.push(userData_local);
        localStorage.setItem('allRegisteredUsers', JSON.stringify(allUsers));
        
        if (skipEmailConfirmation) {
          // Auto-confirm in development mode
          localStorage.setItem('confirmedUser', JSON.stringify(mockUser));
          setUser(mockUser);
          return { success: true, data: { user: mockUser }, needsEmailConfirmation: false };
        }
        
        return { success: true, data: { user: mockUser }, needsEmailConfirmation: true };
      }

      if (skipEmailConfirmation) {
        console.log('🚀 Development mode: Skipping email confirmation');
        // Generate real UUID format for compatibility
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        const mockUser = {
          id: generateUUID(),
          email,
          user_metadata: {
            full_name: userData?.fullName,
            phone: userData?.phone
          },
          email_confirmed_at: new Date().toISOString()
        };
        
        localStorage.setItem('registrationName', userData?.fullName || '');
        localStorage.setItem('registrationPhone', userData?.phone || '');
        localStorage.setItem('confirmedUser', JSON.stringify(mockUser));
        setUser(mockUser);
        
        return { success: true, data: { user: mockUser }, needsEmailConfirmation: false };
      }

      // Try Supabase first, but fallback to custom email service
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: userData?.fullName,
              phone: userData?.phone
            },
            emailRedirectTo: `${window.location.origin}/email-confirmation`
          }
        });
        
        if (error) {
          console.warn('Supabase signup failed, using custom email service:', error.message);
          throw error;
        }
        
        console.log('✅ Supabase signup successful');
        
        // User will be automatically added to database via trigger
        console.log('✅ User created in Supabase:', data.user?.id);
        
        return { success: true, data, needsEmailConfirmation: !data.user?.email_confirmed_at };
      } catch (supabaseError) {
        console.log('📧 Using custom email confirmation service');
        
        // Generate confirmation token
        const confirmationToken = `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store user data
        localStorage.setItem('registrationName', userData?.fullName || '');
        localStorage.setItem('registrationPhone', userData?.phone || '');
        
        // Generate real UUID format for compatibility
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        // Store user data locally for fallback
        const userData_local = {
          id: generateUUID(),
          name: userData?.fullName,
          email: email,
          created_at: new Date().toISOString(),
          email_confirmed_at: null
        };
        const allUsers = JSON.parse(localStorage.getItem('allRegisteredUsers') || '[]');
        allUsers.push(userData_local);
        localStorage.setItem('allRegisteredUsers', JSON.stringify(allUsers));
        
        // Send custom confirmation email
        const emailResult = await sendConfirmationEmail(email, confirmationToken);
        
        if (emailResult.success) {
          const pendingUser = {
            id: generateUUID(),
            email,
            user_metadata: {
              full_name: userData?.fullName,
              phone: userData?.phone
            },
            email_confirmed_at: null,
            confirmation_token: confirmationToken
          };
          
          return { success: true, data: { user: pendingUser }, needsEmailConfirmation: true, customEmail: true };
        } else {
          throw new Error('Failed to send confirmation email');
        }
      }
    } catch (error) {
      console.error('SignUp error:', error);
      return { success: false, error: error.message || 'Failed to create account' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      // Import and use the secure authentication service
      const supabaseAuthService = (await import('./services/supabaseAuth.service')).default;
      const result = await supabaseAuthService.login({ email, password });
      
      if (result.success) {
        setUser(result.user);
        return { success: true, data: { user: result.user } };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('SignIn error:', error);
      return { success: false, error: error.message || 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear user state immediately
      setUser(null);
      
      // Clear all localStorage auth data
      localStorage.removeItem('confirmedUser');
      localStorage.removeItem('wallet_balance');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('userEmailMap');
      
      if (!supabase) {
        console.warn('Supabase not configured, using mock authentication');
        return { success: true };
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase signout error:', error);
        // Still return success since we cleared local state
      }
      
      return { success: true };
    } catch (error) {
      console.error('SignOut error:', error);
      // Even if there's an error, we cleared the local state
      return { success: true };
    }
  };

  const resetPassword = async (email) => {
    try {
      if (!supabase) {
        console.warn('Supabase not configured, using mock authentication');
        return { success: true };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function App() {
  return (
    <DarkModeProvider>
      <SupabaseAuthProvider>
        <WalletProvider>
          <div className="App">
            {/* ✅ FIXED: Added Toaster here so alerts show up! */}
            <Toaster position="top-right" /> 
            
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/course-advisor" element={<CourseAdvisor />} />
            <Route path="/question-generator" element={<QuestionGenerator />} />
            <Route path="/dashboard" element={<ProtectedRoute><EducationalSidebar><Dashboard /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><EducationalSidebar><Profile /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/wallet" element={<ProtectedRoute><EducationalSidebar><Wallet /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/transactions" element={<ProtectedRoute><EducationalSidebar><Transactions /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/support" element={<ProtectedRoute><EducationalSidebar><Support /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/ai-examiner" element={<ProtectedRoute><EducationalSidebar><AIExaminer /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/course-advisor" element={<ProtectedRoute><EducationalSidebar><CourseAdvisor /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/buy-olevel-upload" element={<ProtectedRoute><EducationalSidebar><OLevelUploadExisting /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/buy-admission-letter" element={<ProtectedRoute><EducationalSidebar><AdmissionLetter /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/buy-original-result" element={<ProtectedRoute><EducationalSidebar><OriginalResult /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/buy-pin-vending" element={<ProtectedRoute><EducationalSidebar><PinVending /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/reprinting-jamb-caps" element={<ProtectedRoute><EducationalSidebar><Reprinting /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/scratch-card/waec-checker" element={<ProtectedRoute><EducationalSidebar><WaecResultChecker /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/scratch-card/neco-checker" element={<ProtectedRoute><EducationalSidebar><NecoResultChecker /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/scratch-card/nbais-checker" element={<ProtectedRoute><EducationalSidebar><NbaisResultChecker /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/scratch-card/nabteb-checker" element={<ProtectedRoute><EducationalSidebar><NabtebResultChecker /></EducationalSidebar></ProtectedRoute>} />
            <Route path="/dashboard/scratch-card/waec-gce" element={<ProtectedRoute><EducationalSidebar><WaecGceChecker /></EducationalSidebar></ProtectedRoute>} />
            {/* Legacy routes for backward compatibility */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/ai-examiner" element={<AIExaminer />} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/simple" element={<ProtectedRoute><SimpleAdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<div style={{padding: '20px'}}><h1>Page Not Found</h1></div>} />
            </Routes>
          </div>
        </WalletProvider>
      </SupabaseAuthProvider>
    </DarkModeProvider>
  );
}

export default App;