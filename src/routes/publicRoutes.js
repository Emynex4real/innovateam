// src/routes/publicRoutes.js
import React from "react";

// Regular imports to avoid chunk loading issues
import Home from "../pages/Home";
import About from "../pages/About";
import Blogs from "../pages/Blogs";
import Contact from "../pages/Contact";
import Login from "../pages/login";
import Register from "../pages/register";
import NotFound from "../pages/NotFound";

// Import admin and course advisor
import AdminPanel from "../pages/admin";
import CourseAdvisor from "../pages/course-advisor";

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
    path: "/contact", 
    element: <Contact />,
    title: "Contact" 
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
    path: "/admin", 
    element: <AdminPanel />,
    title: "Admin Panel" 
  },
  { 
    path: "/course-advisor", 
    element: <CourseAdvisor />,
    title: "Course Advisor" 
  },
  { 
    path: "/404", 
    element: <NotFound />,
    title: "Page Not Found" 
  },
];

export default publicRoutes;