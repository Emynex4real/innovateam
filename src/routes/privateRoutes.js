import { lazy } from 'react';

// Lazy load private page components
const Dashboards = lazy(() => import('./../pages/dashboard/index'));
const Profiles = lazy(() => import('./../pages/profile/index'));
const Wallet = lazy(() => import('./../pages/wallet/index'));
const WaecResultChecker = lazy(() => import('./../pages/result checker/waec result checker/index'));
const NecoResultChecker = lazy(() => import('./../pages/result checker/neco result checker/index'));
const DataSubscription = lazy(() => import('./../pages/data-subscription/index'));
const AirtimeSubscription = lazy(() => import('./../pages/airtime-subscription/index'));
const OLevelUpload = lazy(() => import('./../pages/jamb services/olevel upload/index'));
const AdmissionLetter = lazy(() => import('./../pages/jamb services/admission letter/index'));
const OriginalResult = lazy(() => import('./../pages/jamb services/original result/index'));
const JambPinVending = lazy(() => import('./../pages/jamb services/pin vending/index'));
const CapsPrinting = lazy(() => import('./../pages/jamb services/reprinting/index'));
const OLevelEntry = lazy(() => import('./../pages/jamb services/olevel upload/new entry/index'));
const Transactions = lazy(() => import('./../pages/transactions/index'));
const Support = lazy(() => import('./../pages/support/index'));
const AiExaminer = lazy(() => import('./../pages/ai examiner/index'));
// import Dashboards from './../pages/dashboard/index';
// import Profiles from './../pages/profile/index';
// import Wallet from './../pages/wallet/index';
// import DataSubscription from './../pages/data-subscription/index';
// import WaecResultChecker from './../pages/result checker/waec result checker/index';
// import NecoResultChecker from './../pages/result checker/neco result checker/index';
// import AirtimeSubscription from './../pages/airtime-subscription/index';
// import AdmissionLetter from './../pages/jamb services/admission letter/index';
// import OLevelUpload from './../pages/jamb services/olevel upload/index';
// import JambPinVending from './../pages/jamb services/pin vending/index';
// import OriginalResult from './../pages/jamb services/original result/index';
// import CapsPrinting from './../pages/jamb services/reprinting/index';
// import OLevelEntry from './../pages/jamb services/olevel upload/new entry/index';
// import Transactions from './../pages/transactions/index';
// import Support from './../pages/support/index';
// import AiExaminer from './../pages/ai examiner/index';

const privateRoutes = [
  { path: '/', element: <Dashboards /> },
  { path: '/profile', element: <Profiles /> },
  { path: '/wallet', element: <Wallet /> },
  { path: '/buy-data', element: <DataSubscription /> },
  { path: '/scratch-card/waec-checker', element: <WaecResultChecker /> },
  { path: '/scratch-card/neco-checker', element: <NecoResultChecker /> },
  { path: '/buy-airtime', element: <AirtimeSubscription /> },
  { path: '/buy-admission-letter', element: <AdmissionLetter /> },
  { path: '/buy-olevel-upload', element: <OLevelUpload /> },
  { path: '/buy-pin-vending', element: <JambPinVending /> },
  { path: '/buy-original-result', element: <OriginalResult /> },
  { path: '/reprinting-jamb-caps', element: <CapsPrinting /> },
  { path: '/olevel-entry', element: <OLevelEntry /> },
  { path: '/transactions', element: <Transactions /> },
  { path: '/support', element: <Support /> },
  { path: '/ai-examiner', element: <AiExaminer /> },
];

export default privateRoutes;