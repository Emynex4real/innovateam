import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
// import NavBar from "./layouts/navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import Login from "./pages/login/index";
import SignUp from "./pages/signup";
// import NavandSideBar from "./layouts/navandsidebar";
// import Dashboard from "./main-page/dashboard/index";
// import Profiles from "./main-page/profile";
// import Wallet from "./main-page/wallet";
// import WaecResultChecker from "./main-page/result checker/waec result checker";
// import DataSubscription from "./main-page/data-subscription";
// import AirtimeSubscription from "./main-page/airtime-subscription";
// import OLevelUpload from "./main-page/jamb services/olevel upload";
// import AdmissionLetter from "./main-page/jamb services/admission letter";
// import OriginalResult from "./main-page/jamb services/original result";
// import JambPinVending from "./main-page/jamb services/pin vending";
// import CapsPrinting from "./main-page/jamb services/reprinting";
// import Transactions from "./main-page/transactions";
// import Support from "./main-page/support";
// import OLevelEntry from "./main-page/jamb services/olevel upload/new entry";
// import NecoResultChecker from "./main-page/result checker/neco result checker/index";
// import PrivateRoute from "./components/privateRouter";
// import { AuthProvider } from "./components/auth";
// import AiExaminer from "./main-page/ai examiner";
import Dashboards from './pages/dashboard/index';
import Profiles from './pages/profile/index';
import Wallet from './pages/wallet/index';
import WaecResultChecker from './pages/result checker/waec result checker/index';
import AirtimeSubscription from './pages/airtime-subscription/index';
import AdmissionLetter from './pages/jamb services/admission letter/index';
import OLevelUpload from './pages/jamb services/olevel upload/index';
import JambPinVending from './pages/jamb services/pin vending/index';
import OriginalResult from './pages/jamb services/original result/index';
import CapsPrinting from './pages/jamb services/reprinting/index';
import Transactions from './pages/transactions/index';
import Support from './pages/support/index';
import OLevelEntry from './pages/jamb services/olevel upload/new entry/index';
import NecoResultChecker from './pages/result checker/neco result checker/index';
import AiExaminer from './pages/ai examiner/index';
import NavandSideBar from './layouts/navandsidebar/index';
import PrivateRoute from './components/privateRouter/index';
import { AuthProvider } from './components/auth/index';
import DataSubscription from './pages/data-subscription/index';
import NavBar from './layouts/navbar/index';

function App() {
  const location = useLocation();
  const showNavBarRoutes = ["/", "/about", "/blogs"];
  const shouldShowNavBar = showNavBarRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {shouldShowNavBar && <NavBar />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/homepage/*"
              element={
                <PrivateRoute>
                  <NavandSideBar>
                    <div className="min-h-screen p-4 ml-16 md:ml-0">
                      <Routes>
                        <Route path="/" element={<Dashboards />} />
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
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/olevel-entry" element={<OLevelEntry />} />
                        <Route
                          path="/scratch-card/neco-checker"
                          element={<NecoResultChecker />}
                        />
                        <Route path="/ai-examiner" element={<AiExaminer />} /> {/* Add this route */}

                      </Routes>
                    </div>
                  </NavandSideBar>
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;