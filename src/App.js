import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Home from './pages/Home';
import CourseAdvisor from './pages/course-advisor';
import QuestionGenerator from './pages/question-generator';

function App() {
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