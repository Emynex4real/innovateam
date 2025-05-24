// src/routes/publicRoutes.js
import { lazy } from "react";

const Home = lazy(() => import("../pages/Home/index"));
const About = lazy(() => import("../pages/About/index"));
const Blogs = lazy(() => import("../pages/Blogs/index"));
const Login = lazy(() => import("../pages/login/index"));
const Register = lazy(() => import("../pages/register/index"));
const NotFound = lazy(() => import("../pages/NotFound/index"));

const publicRoutes = [
  { path: "/", element: <Home />, title: "Home" },
  { path: "/about", element: <About />, title: "About" },
  { path: "/blogs", element: <Blogs />, title: "Blogs" },
  { path: "/login", element: <Login />, title: "Login" },
  { path: "/register", element: <Register />, title: "Register" },
  { path: "*", element: <NotFound />, title: "Not Found" },
];

export default publicRoutes;