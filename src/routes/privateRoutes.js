// src/routes/privateRoutes.js
import React, { lazy } from "react";

// Lazy load components
const Dashboard = lazy(() => import("../pages/dashboard"));
const Profiles = lazy(() => import("../pages/profile"));
const Wallet = lazy(() => import("../pages/wallet"));
const WaecResultChecker = lazy(() => import("../pages/result checker/waec result checker"));
const NecoResultChecker = lazy(() => import("../pages/result checker/neco result checker"));
const NbaisResultChecker = lazy(() => import("../pages/result checker/nbais result checker"));
const NabtebResultChecker = lazy(() => import("../pages/result checker/nabteb result checker"));
const WaecGce = lazy(() => import("../pages/result checker/waec gce"));
const DataSubscription = lazy(() => import("../pages/data-subscription"));
const AirtimeSubscription = lazy(() => import("../pages/airtime-subscription"));
const OLevelUpload = lazy(() => import("../pages/jamb services/olevel upload"));
const AdmissionLetter = lazy(() => import("../pages/jamb services/admission letter"));
const OriginalResult = lazy(() => import("../pages/jamb services/original result"));
const JambPinVending = lazy(() => import("../pages/jamb services/pin vending"));
const CapsPrinting = lazy(() => import("../pages/jamb services/reprinting"));
const OLevelEntry = lazy(() => import("../pages/jamb services/olevel upload/new entry"));
const Transactions = lazy(() => import("../pages/transactions"));
const Support = lazy(() => import("../pages/support"));
const AiExaminer = lazy(() => import("../pages/ai examiner"));
const CourseAdvisor = lazy(() => import("../pages/dashboard/course-advisor"));

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
    element: <Profiles />,
    title: "Profile" 
  },
  { 
    path: "/wallet", 
    element: <Wallet />,
    title: "Wallet" 
  },
  { 
    path: "/buy-data", 
    element: <DataSubscription />,
    title: "Data Subscription" 
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
    path: "/buy-airtime", 
    element: <AirtimeSubscription />,
    title: "Airtime Subscription" 
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
    title: "Course Advisor AI" 
  },
];

export default privateRoutes;