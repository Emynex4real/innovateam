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
import OLevelUpload from "./main-page/jamb services/olevel upload";
import AdmissionLetter from "./main-page/jamb services/admission letter";
import OriginalResult from "./main-page/jamb services/original result";
import JambPinVending from "./main-page/jamb services/pin vending";
import CapsPrinting from "./main-page/jamb services/reprinting";
import Transactions from "./main-page/transactions";
import Support from "./main-page/support";

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
              <div className="bg-gray-100 min-h-screen mt-20 p-6 ml-20 md:ml-0">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profiles />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/buy-data" element={<DataSubscription />} />
                  <Route
                    path="/scratch-card/waec-checker"
                    element={<WaecResultChecker />}
                  />
                  <Route
                    path="/buy-airtime"
                    element={<AirtimeSubscription />}
                  />
                  <Route
                    path="/buy-admission-letter"
                    element={<AdmissionLetter />}
                  />
                  <Route
                    path="/buy-olevel-upload"
                    element={<OLevelUpload />}
                  />
                  <Route
                    path="/buy-pin-vending"
                    element={<JambPinVending />}
                  />
                  <Route
                    path="/buy-original-result"
                    element={<OriginalResult />}
                  />
                  <Route
                    path="/reprinting-jamb-caps"
                    element={<CapsPrinting />}
                  />
                  <Route
                    path="/transactions"
                    element={<Transactions />}
                  />
                  <Route
                    path="/support"
                    element={<Support />}
                  />
                </Routes>
              </div>
            </NavandSideBar>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
