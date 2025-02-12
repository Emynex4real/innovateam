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
import WaecResultChecker from "./main-page/result checker/waec result checker";
import DataSubscription from "./main-page/data-subscription";
import AirtimeSubscription from "./main-page/airtime-subscription";

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
                <Route path="/buy-data" element={<DataSubscription />} />
                <Route path="/scratch-card/waec-checker" element={<WaecResultChecker />} />
                <Route path="/buy-airtime" element={<AirtimeSubscription />} />
                <Route path="/buy-admission-letter" element={<AirtimeSubscription />} />
                <Route path="/buy-olevel-upload" element={<AirtimeSubscription />} />
                <Route path="/buy-pin-vending" element={<AirtimeSubscription />} />
                <Route path="/buy-original-result" element={<AirtimeSubscription />} />
                <Route path="/buy-reprinting" element={<AirtimeSubscription />} />
                
              </Routes>
            </NavandSideBar>
          }
        />
      </Routes>
    </div>
  );
}

export default App;