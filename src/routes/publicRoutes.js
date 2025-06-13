// src/routes/publicRoutes.js
import React, { lazy } from "react";

// Lazy load components
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Blogs = lazy(() => import("../pages/Blogs"));
const Login = lazy(() => import("../pages/login"));
const Register = lazy(() => import("../pages/register"));

// Define public routes
const publicRoutes = [
  { 
    path: "/", 
    element: <Home />,
    title: "Home" 
  },
  { 
    path: "/about", 
    element: <About />,
    title: "About" 
  },
  { 
    path: "/blogs", 
    element: <Blogs />,
    title: "Blogs" 
  },
  { 
    path: "/login", 
    element: <Login />,
    title: "Login" 
  },
  { 
    path: "/register", 
    element: <Register />,
    title: "Register" 
  },
];

export default publicRoutes;