// src/routes/publicRoutes.js
import React from "react";

// Regular imports to avoid chunk loading issues
import Home from "../pages/Home";
import About from "../pages/About";
import Blogs from "../pages/Blogs";
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/NotFound";

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
  { 
    path: "/404", 
    element: <NotFound />,
    title: "Page Not Found" 
  },
];

export default publicRoutes;