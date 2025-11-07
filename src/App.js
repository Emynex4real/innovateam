import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { DarkModeProvider } from './contexts/DarkModeContext';
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
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/course-advisor" element={<CourseAdvisor />} />
            <Route path="/question-generator" element={<QuestionGenerator />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/support" element={<Support />} />
            <Route path="/ai-examiner" element={<AIExaminer />} />
            <Route path="*" element={<div style={{padding: '20px'}}><h1>Page Not Found</h1></div>} />
          </Routes>
        </div>
      </SupabaseAuthProvider>
    </DarkModeProvider>
  );
}

export default App;