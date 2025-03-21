import React from 'react';
import { lazy } from 'react';

// Lazy load public page components
const Home = lazy(() => import('./../pages/Home/index'));
const About = lazy(() => import('../pages/About/index'));
const Blogs = lazy(() => import('./../pages/Blogs/index'));
const Login = lazy(() => import('./../pages/login/index'));
const SignUp = lazy(() => import('./../pages/signup/index'));
const NotFound = lazy(() => import('./../pages/NotFound/index'));
// import NotFound from './../pages/NotFound/index';


const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/blogs', element: <Blogs /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <SignUp /> },
  { path: '*', element: <NotFound /> }, // Catch-all for 404 errors
];

export default publicRoutes;