import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import aiExaminerService from '../services/aiExaminer.service';
import { toast } from 'react-toastify';
import {
  DocumentArrowUpIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  BookOpenIcon,
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ModernAiExaminer = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  
  // State management
  const [currentView, setCurrentView] = useState('upload'); // upload, exam, results, history
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [examConfig, setExamConfig] = useState({
    questionCount: 10,
    difficulty: 'medium',
    questionTypes: ['multiple-choice', 'true-false'],
    subject: 'General'
  });
  const [currentExam, setCurrentExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [examResults, setExamResults] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && currentView === 'exam') {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentView === 'exam') {
      handleSubmitExam();
    }
  }, [timeRemaining, currentView]);

  // Load exam history on component mount
  useEffect(() => {
    loadExamHistory();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, TXT, DOC, or DOCX file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setLoading(true);
    try {
      const result = await aiExaminerService.uploadDocument(file);
      setUploadedDocument(result.data);
      toast.success('Document uploaded successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!uploadedDocument) {
      toast.error('Please upload a document first');
      return;
    }

    setLoading(true);
    try {
      const result = await aiExaminerService.generateQuestions({
        documentId: uploadedDocument.documentId,
        ...examConfig
      });
      
      setCurrentExam(result.data);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setTimeRemaining(result.data.totalQuestions * 60); // 1 minute per question
      setCurrentView('exam');
      toast.success('Questions generated successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitExam = async () => {
    if (!currentExam) return;

    setLoading(true);
    try {
      const result = await aiExaminerService.submitAnswers(currentExam.examId, userAnswers);
      setExamResults(result.data);
      setCurrentView('results');
      loadExamHistory(); // Refresh history
      toast.success('Exam submitted successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExamHistory = async () => {
    try {
      const result = await aiExaminerService.getExamHistory();
      setExamHistory(result.data);
    } catch (error) {
      console.error('Failed to load exam history:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderUploadView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <AcademicCapIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          AI Examiner
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Upload a document and generate intelligent practice questions
        </p>
      </div>

      {/* Document Upload */}
      <div className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-8 mb-8`}>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Upload Document
        </h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Drop your document here or click to browse
          </p>
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 cursor-pointer inline-block"
          >
            Choose File
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Supported formats: PDF, TXT, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {uploadedDocument && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">
                {uploadedDocument.filename} uploaded successfully
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Content length: {uploadedDocument.contentLength} characters
            </p>
          </div>
        )}
      </div>

      {/* Exam Configuration */}
      {uploadedDocument && (
        <div className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-8`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Exam Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Number of Questions
              </label>
              <select
                value={examConfig.questionCount}
                onChange={(e) => setExamConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Difficulty Level
              </label>
              <select
                value={examConfig.difficulty}
                onChange={(e) => setExamConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Subject
              </label>
              <input
                type="text"
                value={examConfig.subject}
                onChange={(e) => setExamConfig(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mathematics, Science, History"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Question Types
              </label>
              <div className="space-y-2">
                {['multiple-choice', 'true-false', 'short-answer', 'fill-blank'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={examConfig.questionTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExamConfig(prev => ({
                            ...prev,
                            questionTypes: [...prev.questionTypes, type]
                          }));
                        } else {
                          setExamConfig(prev => ({
                            ...prev,
                            questionTypes: prev.questionTypes.filter(t => t !== type)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={loading || examConfig.questionTypes.length === 0}
            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <PlayIcon className="h-5 w-5 mr-2" />
            )}
            Generate Questions
          </button>
        </div>
      )}
    </div>
  );

  const renderExamView = () => {
    if (!currentExam) return null;

    const currentQuestion = currentExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentExam.totalQuestions) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Exam Header */}
        <div className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-6 mb-6`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentExam.subject} Exam
              </h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Question {currentQuestionIndex + 1} of {currentExam.totalQuestions}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-lg font-semibold text-blue-600">
                <ClockIcon className="h-5 w-5 mr-1" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-8`}>
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
              {currentQuestion.type.replace('-', ' ').toUpperCase()} • {currentQuestion.points} points
            </span>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label key={option.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={userAnswers[currentQuestion.id] === option.id}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium mr-3">{option.id}.</span>
                    <span>{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <label key={option} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={userAnswers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'fill-blank') && (
              <textarea
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                maxLength={currentQuestion.maxLength || 500}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentQuestionIndex < currentExam.totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Exam'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResultsView = () => {
    if (!examResults) return null;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-8 mb-6`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-4 ${getGradeColor(examResults.grade)}`}>
              {examResults.grade}
            </div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              Exam Complete!
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You scored {examResults.score} out of {examResults.totalPoints} points ({examResults.percentage}%)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{examResults.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{examResults.totalQuestions - examResults.correctAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{examResults.percentage}%</div>
              <div className="text-sm text-gray-600">Score Percentage</div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-6`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Detailed Results
          </h2>
          
          <div className="space-y-6">
            {examResults.results.map((result, index) => (
              <div key={result.questionId} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Question {index + 1}
                  </h3>
                  <div className="flex items-center">
                    {result.isCorrect ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-1" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {result.points} / {result.points || 1} points
                    </span>
                  </div>
                </div>
                
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                  {result.question}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Your Answer:</span>
                    <p className={`${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {result.userAnswer || 'No answer provided'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Correct Answer:</span>
                    <p className="text-green-600">{result.correctAnswer}</p>
                  </div>
                </div>
                
                {result.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{result.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => {
              setCurrentView('upload');
              setCurrentExam(null);
              setExamResults(null);
              setUploadedDocument(null);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Take Another Exam
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            View History
          </button>
        </div>
      </div>
    );
  };

  const renderHistoryView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Exam History
        </h1>
        <button
          onClick={() => setCurrentView('upload')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          New Exam
        </button>
      </div>

      {examHistory.length === 0 ? (
        <div className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            No exam history yet
          </h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Take your first exam to see your progress here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {examHistory.map((exam) => (
            <div key={exam.id} className={`bg-white ${isDarkMode ? 'bg-gray-800' : ''} rounded-lg shadow-sm border p-6`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {exam.subject}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    {exam.total_questions} questions • {exam.difficulty} difficulty
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-right">
                  {exam.status === 'completed' ? (
                    <>
                      <div className={`text-2xl font-bold ${getGradeColor(exam.percentage >= 90 ? 'A' : exam.percentage >= 80 ? 'B' : exam.percentage >= 70 ? 'C' : exam.percentage >= 60 ? 'D' : 'F')}`}>
                        {exam.percentage}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {exam.score} / {exam.total_points} points
                      </p>
                    </>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'upload', label: 'Upload', icon: DocumentArrowUpIcon },
              { key: 'history', label: 'History', icon: ChartBarIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {currentView === 'upload' && renderUploadView()}
        {currentView === 'exam' && renderExamView()}
        {currentView === 'results' && renderResultsView()}
        {currentView === 'history' && renderHistoryView()}
      </div>
    </div>
  );
};

export default ModernAiExaminer;