// src/routes/privateRoutes.js
import React from "react";

// Regular imports to avoid chunk loading issues
import Dashboard from "../pages/EducationalDashboard";
import Profile from "../pages/profile";
import Wallet from "../pages/wallet";
import WaecResultChecker from "../pages/result checker/waec result checker";
import NecoResultChecker from "../pages/result checker/neco result checker";
import NbaisResultChecker from "../pages/result checker/nbais result checker";
import NabtebResultChecker from "../pages/result checker/nabteb result checker";
import WaecGce from "../pages/result checker/waec gce";

import OLevelUpload from "../pages/jamb services/olevel upload";
import AdmissionLetter from "../pages/jamb services/admission letter";
import OriginalResult from "../pages/jamb services/original result";
import JambPinVending from "../pages/jamb services/pin vending";
import CapsPrinting from "../pages/jamb services/reprinting";
import OLevelEntry from "../pages/jamb services/olevel upload/new entry";
import Transactions from "../pages/transactions";
import Support from "../pages/support";
import AiExaminer from "../pages/ai examiner";
import CourseAdvisor from "../pages/course-advisor";

// Define private routes
const privateRoutes = [
  { 
    path: "/", 
    element: <Dashboard />,
    title: "Dashboard" 
  },
  { 
    path: "/dashboard", 
    element: <Dashboard />,
    title: "Dashboard" 
  },
  { 
    path: "/profile", 
    element: <Profile />,
    title: "Profile" 
  },
  { 
    path: "/wallet", 
    element: <Wallet />,
    title: "Wallet" 
  },

  { 
    path: "/scratch-card/waec-checker", 
    element: <WaecResultChecker />,
    title: "WAEC Result Checker" 
  },
  { 
    path: "/scratch-card/neco-checker", 
    element: <NecoResultChecker />,
    title: "NECO Result Checker" 
  },
  { 
    path: "/scratch-card/nbais-checker", 
    element: <NbaisResultChecker />,
    title: "NBAIS Result Checker" 
  },
  { 
    path: "/scratch-card/nabteb-checker", 
    element: <NabtebResultChecker />,
    title: "NABTEB Result Checker" 
  },
  { 
    path: "/scratch-card/waec-gce", 
    element: <WaecGce />,
    title: "WAEC GCE" 
  },

  { 
    path: "/buy-admission-letter", 
    element: <AdmissionLetter />,
    title: "Admission Letter" 
  },
  { 
    path: "/buy-olevel-upload", 
    element: <OLevelUpload />,
    title: "O-Level Upload" 
  },
  { 
    path: "/buy-pin-vending", 
    element: <JambPinVending />,
    title: "JAMB Pin Vending" 
  },
  { 
    path: "/buy-original-result", 
    element: <OriginalResult />,
    title: "Original Result" 
  },
  { 
    path: "/reprinting-jamb-caps", 
    element: <CapsPrinting />,
    title: "CAPS Printing" 
  },
  { 
    path: "/olevel-entry", 
    element: <OLevelEntry />,
    title: "O-Level Entry" 
  },
  { 
    path: "/transactions", 
    element: <Transactions />,
    title: "Transactions" 
  },
  { 
    path: "/support", 
    element: <Support />,
    title: "Support" 
  },
  { 
    path: "/ai-examiner", 
    element: <AiExaminer />,
    title: "AI Examiner" 
  },
  { 
    path: "/course-advisor", 
    element: <CourseAdvisor />,
    title: "Course Advisor (AI)" 
  },

];

export default privateRoutes;