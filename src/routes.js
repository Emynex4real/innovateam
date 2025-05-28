import { lazy } from 'react';

const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/login'));
const Register = lazy(() => import('./pages/register'));
const ForgotPassword = lazy(() => import('./pages/forgot-password'));
const ResetPassword = lazy(() => import('./pages/reset-password'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Profile = lazy(() => import('./pages/profile'));
const CourseAdvisor = lazy(() => import('./pages/course-advisor'));

export const publicRoutes = [
  {
    path: '/',
    element: <Home />,
    title: 'Home'
  },
  {
    path: '/login',
    element: <Login />,
    title: 'Login'
  },
  {
    path: '/register',
    element: <Register />,
    title: 'Register'
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    title: 'Forgot Password'
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    title: 'Reset Password'
  }
];

export const privateRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    title: 'Dashboard'
  },
  {
    path: '/profile',
    element: <Profile />,
    title: 'Profile'
  },
  {
    path: '/course-advisor',
    element: <CourseAdvisor />,
    title: 'Course Advisor'
  }
]; 