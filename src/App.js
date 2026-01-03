import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { WalletProvider } from './contexts/WalletContext';
import emailService from './services/email/emailService';

// Pages
import Home from './pages/Home';
import Login from './pages/login/EnterpriseLogin.jsx';
import Register from './pages/register/EnterpriseRegister.jsx';
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
import EmailConfirmation from './pages/email-confirmation';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';

// JAMB Services & Result Checkers
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

// Components
import EducationalSidebar from './components/EducationalSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute'; // Ensure this exists

// Student Pages
import PracticeQuestions from './pages/student/PracticeQuestions';
import PerformanceAnalytics from './pages/student/PerformanceAnalytics';
import Leaderboard from './pages/student/Leaderboard';
import JoinCenter from './pages/student/tutorial-center/JoinCenter';
import MyCenters from './pages/student/tutorial-center/MyCenters';
import StudentTests from './pages/student/tutorial-center/EnterpriseTestList.jsx';
import PublicTests from './pages/student/tutorial-center/PublicTests';
import TakeTest from './pages/student/tutorial-center/EnterpriseTakeTest.jsx';
import Results from './pages/student/tutorial-center/EnterpriseResults.jsx';
import ReviewAnswers from './pages/student/tutorial-center/ReviewAnswers';
import StudentAnalytics from './pages/student/analytics/MyAnalytics';
import Messaging from './pages/student/Messaging';
import ForumsWrapper from './pages/student/ForumsWrapper';
import ForumsLayout from './pages/student/ForumsLayout';
import StudyGroups from './pages/student/StudyGroups';
import TutoringMarketplace from './pages/student/TutoringMarketplace';

// Tutor & Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TutorDashboard from './pages/tutor/EnterpriseDashboard.jsx';
import TutorQuestions from './pages/tutor/Questions';
import AIGenerator from './pages/tutor/AIGenerator';
import BulkQuestionImport from './pages/tutor/BulkQuestionImport';
import TestBuilder from './pages/tutor/TestBuilder';
import Tests from './pages/tutor/Tests';
import Students from './pages/tutor/Students';
import StudentDetail from './pages/tutor/StudentDetail';
import StudentProfile from './pages/tutor/StudentProfile';
import StudentAlerts from './pages/tutor/StudentAlerts';
import ComparativeAnalytics from './pages/tutor/ComparativeAnalytics';
import TutorLeaderboard from './pages/tutor/Leaderboard';
import TutorAnalyticsDashboard from './pages/tutor/AnalyticsDashboard';
import AdvancedAnalyticsDashboard from './pages/tutor/AdvancedAnalyticsDashboard';
import StudentDashboard from './pages/student/tutorial-center/EnterpriseDashboard.jsx';
import ThemeEditor from './pages/tutor/ThemeEditor';
import NotFound from './pages/NotFound';

import supabase from './config/supabase';

console.log('✅ Supabase configured and ready');

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
    // Check for confirmed user in localStorage
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
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          user_metadata: session.user.user_metadata,
          role: session.user.user_metadata?.role // Ensure role is top level for easier access
        };
        localStorage.setItem('confirmedUser', JSON.stringify(userData));
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName,
            phone: userData?.phone,
            role: userData?.role || 'student'
          }
        }
      });
      
      if (error) throw error;
      
      // Profile creation is handled by database trigger
      return { success: true, data, needsEmailConfirmation: !data.user?.email_confirmed_at };
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
      // Use Supabase signInWithPassword to set proper session
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          role: data.user.user_metadata?.role || 'student',
          user_metadata: data.user.user_metadata,
          email_confirmed_at: data.user.email_confirmed_at
        };
        localStorage.setItem('confirmedUser', JSON.stringify(userData));
        localStorage.setItem('token', data.session.access_token);
        setUser(data.user);
        return { success: true, data: { user: data.user } };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('SignIn error:', error);
      return { success: false, error: error.message || 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('confirmedUser');
      localStorage.removeItem('wallet_balance');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      await supabase.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('SignOut error:', error);
      return { success: true };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  };

  const value = { user, loading, signUp, signIn, signOut, resetPassword, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function App() {
  return (
    <DarkModeProvider>
      <SupabaseAuthProvider>
        <WalletProvider>
          <div className="App">
            <Toaster position="top-right" /> 
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-confirmation" element={<EmailConfirmation />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/course-advisor" element={<CourseAdvisor />} />
              <Route path="/question-generator" element={<QuestionGenerator />} />

              {/* General Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><EducationalSidebar><Dashboard /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><EducationalSidebar><Profile /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/wallet" element={<ProtectedRoute><EducationalSidebar><Wallet /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/transactions" element={<ProtectedRoute><EducationalSidebar><Transactions /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/support" element={<ProtectedRoute><EducationalSidebar><Support /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/ai-examiner" element={<ProtectedRoute><EducationalSidebar><AIExaminer /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/course-advisor" element={<ProtectedRoute><EducationalSidebar><CourseAdvisor /></EducationalSidebar></ProtectedRoute>} />
              
              {/* JAMB Services */}
              <Route path="/dashboard/buy-olevel-upload" element={<ProtectedRoute><EducationalSidebar><OLevelUploadExisting /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/buy-admission-letter" element={<ProtectedRoute><EducationalSidebar><AdmissionLetter /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/buy-original-result" element={<ProtectedRoute><EducationalSidebar><OriginalResult /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/buy-pin-vending" element={<ProtectedRoute><EducationalSidebar><PinVending /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/reprinting-jamb-caps" element={<ProtectedRoute><EducationalSidebar><Reprinting /></EducationalSidebar></ProtectedRoute>} />
              
              {/* Result Checkers */}
              <Route path="/dashboard/scratch-card/waec-checker" element={<ProtectedRoute><EducationalSidebar><WaecResultChecker /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/scratch-card/neco-checker" element={<ProtectedRoute><EducationalSidebar><NecoResultChecker /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/scratch-card/nbais-checker" element={<ProtectedRoute><EducationalSidebar><NbaisResultChecker /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/scratch-card/nabteb-checker" element={<ProtectedRoute><EducationalSidebar><NabtebResultChecker /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/scratch-card/waec-gce" element={<ProtectedRoute><EducationalSidebar><WaecGceChecker /></EducationalSidebar></ProtectedRoute>} />
              
              {/* Student Specific Routes */}
              <Route path="/dashboard/practice-questions" element={<ProtectedRoute><EducationalSidebar><PracticeQuestions /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute><EducationalSidebar><PerformanceAnalytics /></EducationalSidebar></ProtectedRoute>} />
              <Route path="/dashboard/leaderboard" element={<ProtectedRoute><EducationalSidebar><Leaderboard /></EducationalSidebar></ProtectedRoute>} />
              
              {/* Legacy Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/support" element={<Support />} />
              <Route path="/ai-examiner" element={<AIExaminer />} />

              {/* Tutor Routes (Accessible by Tutor and Admin) */}
              <Route path="/tutor" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><TutorDashboard /></RoleProtectedRoute>} />
              <Route path="/tutor/dashboard" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><TutorDashboard /></RoleProtectedRoute>} />
              <Route path="/tutor/questions" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><TutorQuestions /></RoleProtectedRoute>} />
              <Route path="/tutor/questions/generate" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><AIGenerator /></RoleProtectedRoute>} />
              <Route path="/tutor/questions/bulk-import" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><BulkQuestionImport /></RoleProtectedRoute>} />
              <Route path="/tutor/tests" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><Tests /></RoleProtectedRoute>} />
              <Route path="/tutor/tests/create" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><TestBuilder /></RoleProtectedRoute>} />
              <Route path="/tutor/students" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><Students /></RoleProtectedRoute>} />
              <Route path="/tutor/students/:studentId" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><StudentDetail /></RoleProtectedRoute>} />
              <Route path="/tutor/students/:studentId/profile" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><StudentProfile /></RoleProtectedRoute>} />
              <Route path="/tutor/students/alerts/all" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><StudentAlerts /></RoleProtectedRoute>} />
              <Route path="/tutor/analytics/comparative" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><ComparativeAnalytics /></RoleProtectedRoute>} />
              <Route path="/tutor/leaderboard/:testId" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><TutorLeaderboard /></RoleProtectedRoute>} />
              <Route path="/tutor/analytics" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><AdvancedAnalyticsDashboard /></RoleProtectedRoute>} />
              <Route path="/tutor/analytics/advanced" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><AdvancedAnalyticsDashboard /></RoleProtectedRoute>} />
              <Route path="/tutor/theme" element={<RoleProtectedRoute allowedRoles={['tutor', 'admin']}><ThemeEditor /></RoleProtectedRoute>} />
              
              {/* Student Tutorial Center Routes (Students only) */}
              <Route path="/student/dashboard" element={<RoleProtectedRoute allowedRoles={['student']}><StudentDashboard /></RoleProtectedRoute>} />
              <Route path="/student/centers" element={<RoleProtectedRoute allowedRoles={['student']}><EducationalSidebar><MyCenters /></EducationalSidebar></RoleProtectedRoute>} />
              <Route path="/student/centers/join" element={<RoleProtectedRoute allowedRoles={['student']}><EducationalSidebar><JoinCenter /></EducationalSidebar></RoleProtectedRoute>} />
              <Route path="/student/tests" element={<RoleProtectedRoute allowedRoles={['student']}><StudentTests /></RoleProtectedRoute>} />
              <Route path="/student/tests/public" element={<RoleProtectedRoute allowedRoles={['student']}><PublicTests /></RoleProtectedRoute>} />
              <Route path="/student/test/:testId" element={<RoleProtectedRoute allowedRoles={['student']}><TakeTest /></RoleProtectedRoute>} />
              <Route path="/student/results/:testId" element={<RoleProtectedRoute allowedRoles={['student']}><Results /></RoleProtectedRoute>} />
              <Route path="/student/review/:attemptId" element={<RoleProtectedRoute allowedRoles={['student']}><ReviewAnswers /></RoleProtectedRoute>} />
              <Route path="/student/analytics/:centerId" element={<RoleProtectedRoute allowedRoles={['student']}><StudentAnalytics /></RoleProtectedRoute>} />
              
              {/* Collaboration Routes (Accessible by Students AND Admins) */}
              {/* This explains your issue: allowedRoles includes 'admin', RoleProtectedRoute must support it */}
              <Route path="/student/messaging" element={<RoleProtectedRoute allowedRoles={['student', 'admin']}><EducationalSidebar><Messaging /></EducationalSidebar></RoleProtectedRoute>} />
              <Route path="/student/forums/*" element={<RoleProtectedRoute allowedRoles={['student', 'admin']}><EducationalSidebar><ForumsWrapper /></EducationalSidebar></RoleProtectedRoute>} />
              <Route path="/student/study-groups" element={<RoleProtectedRoute allowedRoles={['student', 'admin']}><EducationalSidebar><StudyGroups /></EducationalSidebar></RoleProtectedRoute>} />
              <Route path="/student/tutoring" element={<RoleProtectedRoute allowedRoles={['student', 'admin']}><EducationalSidebar><TutoringMarketplace /></EducationalSidebar></RoleProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </WalletProvider>
      </SupabaseAuthProvider>
    </DarkModeProvider>
  );
}

export default App;