import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { WalletProvider } from './contexts/WalletContext';
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
import AIExaminer from './pages/ai examiner';
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

// Initialize Supabase with validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate Supabase configuration
if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Supabase configuration required in production');
}

const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Authentication service unavailable');
      }
      console.warn('Supabase not configured, using mock auth');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    setLoading(true);
    try {
      if (!supabase) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Authentication service unavailable');
        }
        // Mock signup
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, data: { user: { email } } };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName,
            phone: userData?.phone
          }
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (!supabase) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Authentication service unavailable');
        }
        // Mock signin
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUser = { email, id: 'mock-user' };
        setUser(mockUser);
        return { success: true, data: { user: mockUser } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!supabase) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Authentication service unavailable');
        }
        setUser(null);
        return { success: true };
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      if (!supabase) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Authentication service unavailable');
        }
        return { success: true };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
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
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/course-advisor" element={<CourseAdvisor />} />
            <Route path="/question-generator" element={<QuestionGenerator />} />
            <Route path="/dashboard" element={<EducationalSidebar><Dashboard /></EducationalSidebar>} />
            <Route path="/dashboard/profile" element={<EducationalSidebar><Profile /></EducationalSidebar>} />
            <Route path="/dashboard/wallet" element={<EducationalSidebar><Wallet /></EducationalSidebar>} />
            <Route path="/dashboard/transactions" element={<EducationalSidebar><Transactions /></EducationalSidebar>} />
            <Route path="/dashboard/support" element={<EducationalSidebar><Support /></EducationalSidebar>} />
            <Route path="/dashboard/ai-examiner" element={<EducationalSidebar><AIExaminer /></EducationalSidebar>} />
            <Route path="/dashboard/course-advisor" element={<EducationalSidebar><CourseAdvisor /></EducationalSidebar>} />
            <Route path="/dashboard/buy-olevel-upload" element={<EducationalSidebar><OLevelUploadExisting /></EducationalSidebar>} />
            <Route path="/dashboard/buy-admission-letter" element={<EducationalSidebar><AdmissionLetter /></EducationalSidebar>} />
            <Route path="/dashboard/buy-original-result" element={<EducationalSidebar><OriginalResult /></EducationalSidebar>} />
            <Route path="/dashboard/buy-pin-vending" element={<EducationalSidebar><PinVending /></EducationalSidebar>} />
            <Route path="/dashboard/reprinting-jamb-caps" element={<EducationalSidebar><Reprinting /></EducationalSidebar>} />
            <Route path="/dashboard/scratch-card/waec-checker" element={<EducationalSidebar><WaecResultChecker /></EducationalSidebar>} />
            <Route path="/dashboard/scratch-card/neco-checker" element={<EducationalSidebar><NecoResultChecker /></EducationalSidebar>} />
            <Route path="/dashboard/scratch-card/nbais-checker" element={<EducationalSidebar><NbaisResultChecker /></EducationalSidebar>} />
            <Route path="/dashboard/scratch-card/nabteb-checker" element={<EducationalSidebar><NabtebResultChecker /></EducationalSidebar>} />
            <Route path="/dashboard/scratch-card/waec-gce" element={<EducationalSidebar><WaecGceChecker /></EducationalSidebar>} />
            {/* Legacy routes for backward compatibility */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/ai-examiner" element={<AIExaminer />} />
            <Route path="*" element={<div style={{padding: '20px'}}><h1>Page Not Found</h1></div>} />
            </Routes>
          </div>
        </WalletProvider>
      </SupabaseAuthProvider>
    </DarkModeProvider>
  );
}

export default App;