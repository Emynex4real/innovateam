// src/routes/publicRoutes.js
import React, { lazy } from "react";

// Lazy load components
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Blogs = lazy(() => import("../pages/Blogs"));
const Login = lazy(() => import("../pages/login"));
const Register = lazy(() => import("../pages/register"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Define public routes
const publicRoutes = [
  { 
    path: "/", 
    element: React.createElement(Home),
    title: "Home" 
  },
  { 
    path: "/about", 
    element: React.createElement(About),
    title: "About" 
  },
  { 
    path: "/blogs", 
    element: React.createElement(Blogs),
    title: "Blogs" 
  },
  { 
    path: "/login", 
    element: React.createElement(Login),
    title: "Login" 
  },
  { 
    path: "/register", 
    element: React.createElement(Register),
    title: "Register" 
  },
  { 
    path: "*", 
    element: React.createElement(NotFound),
    title: "Not Found" 
  },
];

export default publicRoutes;