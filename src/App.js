import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { secureLogger } from './utils/secureLogger';
import { securityMonitor } from './utils/securityMonitor';
import { clientSecurity } from './utils/clientSecurity';

// Import your existing components
import Home from './components/Home';
import CourseAdvisor from './components/CourseAdvisor';
import QuestionGenerator from './components/QuestionGenerator';

function App() {
  useEffect(() => {
    // Initialize security systems
    secureLogger.setupGlobalErrorHandling();
    securityMonitor.setupRealTimeMonitoring();
    clientSecurity.preventClickjacking();
    clientSecurity.setupDataClearing();

    // Log application start
    secureLogger.logEvent('app_started', {
      version: process.env.REACT_APP_VERSION,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course-advisor" element={<CourseAdvisor />} />
            <Route path="/question-generator" element={<QuestionGenerator />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;