import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import NavBar from "./navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import Login from "./pages/login/index";
import SignUp from "./pages/signup";
import NavandSideBar from "./main-page/navandsidebar";
import Dashboard from "./main-page/dashboard/index";
import Profiles from "./main-page/profile";
import Wallet from "./main-page/wallet";

function App() {
  const location = useLocation();

  // Define routes where the NavBar should be shown
  const showNavBarRoutes = ["/", "/about", "/blogs"];

  // Check if the current route should show the NavBar
  const shouldShowNavBar = showNavBarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {/* Conditionally render the NavBar based on the route */}
      {shouldShowNavBar && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Wrap dashboard and profile pages with NavandSideBar */}
        <Route
          path="/homepage/*"
          element={
            <NavandSideBar>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profiles />} />
                <Route path="/wallet" element={<Wallet />} />
              </Routes>
            </NavandSideBar>
          }
        />
      </Routes>
    </div>
  );
}

export default App;