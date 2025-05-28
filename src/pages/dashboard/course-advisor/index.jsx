import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineRobot, AiOutlineSend, AiOutlineUser } from 'react-icons/ai';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import courseAdvisorML from '../../../services/courseAdvisorML';
import openAIService from '../../../services/openai.service';

const CourseAdvisor = () => {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({
    jambScore: '',
    stateOfOrigin: '',
    subjects: {},
    preferences: [],
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState('initial');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    addBotMessage("👋 Hello! I'm your Course Advisor AI. I can help you find the best university courses in Nigeria based on your qualifications and preferences.");
    addBotMessage("I'll need some information from you to make personalized recommendations. Let's start!");
    addBotMessage("Please enter your JAMB UTME score (0-400):");
    setCurrentStep('jamb');
  }, []);

  const addBotMessage = async (text, useAI = false) => {
    setMessages(prev => [...prev, { type: 'bot', text }]);
    
    if (useAI && aiEnabled) {
      try {
        setIsTyping(true);
        const aiResponse = await openAIService.generateResponse([
          ...chatHistory,
          { role: 'assistant', content: text },
        ], userInfo);
        
        setMessages(prev => [...prev, { type: 'bot', text: aiResponse }]);
        setChatHistory(prev => [...prev, 
          { role: 'assistant', content: text },
          { role: 'assistant', content: aiResponse }
        ]);
      } catch (error) {
        console.error('AI Response Error:', error);
        setMessages(prev => [...prev, { type: 'bot', text: 'I apologize, but I encountered an error. Let\'s continue with your course advisory session.' }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const addUserMessage = async (text) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
    setChatHistory(prev => [...prev, { role: 'user', content: text }]);
  };

  const handleJambScore = (score) => {
    const numScore = parseInt(score);
    if (courseAdvisorML.validateJambScore(numScore)) {
      setUserInfo(prev => ({ ...prev, jambScore: numScore }));
      addBotMessage("Great! Now, please enter your state of origin (e.g., Lagos, Kano, Enugu):");
      setCurrentStep('state');
    } else {
      addBotMessage("Please enter a valid JAMB score between 0 and 400.");
    }
  };

  const handleStateOfOrigin = (state) => {
    const formattedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
    if (courseAdvisorML.validateStateOfOrigin(formattedState)) {
      setUserInfo(prev => ({ ...prev, stateOfOrigin: formattedState }));
      addBotMessage("Now, I'll need your WAEC/NECO grades for core subjects (A1-F9).");
      addBotMessage("Let's start with English Language:");
      setCurrentStep('english');
    } else {
      addBotMessage("Please enter a valid Nigerian state.");
    }
  };

  const handleSubjectGrade = (subject, grade) => {
    if (!courseAdvisorML.validateSubjectGrade(grade.toUpperCase())) {
      addBotMessage("Please enter a valid grade (A1-F9).");
      return;
    }

    setUserInfo(prev => ({
      ...prev,
      subjects: { ...prev.subjects, [subject]: grade.toUpperCase() }
    }));

    const subjects = {
      english: 'English Language',
      mathematics: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology'
    };

    const nextSubject = Object.entries(subjects).find(([key]) => !userInfo.subjects[key])?.[0];

    if (nextSubject) {
      addBotMessage(`Great! Now enter your grade for ${subjects[nextSubject]}:`);
      setCurrentStep(nextSubject);
    } else {
      addBotMessage("Excellent! Finally, what courses are you interested in? Please list them separated by commas (e.g., Medicine, Engineering, Law):");
      setCurrentStep('preferences');
    }
  };

  const handlePreferences = (prefs) => {
    const preferences = prefs.split(',').map(p => p.trim());
    setUserInfo(prev => ({ ...prev, preferences }));
    generateRecommendations();
    setCurrentStep('complete');
  };

  const generateRecommendations = async () => {
    setIsTyping(true);
    
    try {
      // Get initial recommendations from our ML service
      const recommendations = courseAdvisorML.getRecommendations(userInfo);
      
      if (recommendations.length === 0) {
        await addBotMessage("Based on your qualifications, I couldn't find any direct course matches. Let me analyze your profile to suggest alternatives.", true);
      } else {
        await addBotMessage("Based on your qualifications and preferences, here are my top recommendations:");
        
        for (const rec of recommendations) {
          await addBotMessage(`${rec.course} at ${rec.university}
          - JAMB Cut-off: ${rec.cutoff}
          - Your Merit Score: ${rec.meritScore}
          - Compatibility: ${rec.compatibility}%
          ${rec.catchmentBonus > 0 ? `- Catchment Area Bonus: +${rec.catchmentBonus} points` : ''}
          - Requirements: ${rec.requirements}`);
        }
      }

      // Get AI analysis
      const aiAnalysis = await openAIService.analyzeUserProfile(userInfo);
      await addBotMessage("\n\nHere's my detailed analysis of your profile and additional recommendations:", true);
      await addBotMessage(aiAnalysis);
      
      await addBotMessage("\nFeel free to ask me any specific questions about:", true);
      await addBotMessage("1. These course recommendations\n2. Career prospects\n3. Admission processes\n4. University life\n5. Scholarship opportunities\n6. Or any other concerns you have!");
    } catch (error) {
      console.error('Recommendation Error:', error);
      await addBotMessage("I apologize, but I encountered an error generating detailed recommendations. However, you can still ask me any questions about your university and course choices!");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    addUserMessage(inputMessage);

    switch (currentStep) {
      case 'jamb':
        handleJambScore(inputMessage);
        break;
      case 'state':
        handleStateOfOrigin(inputMessage);
        break;
      case 'english':
        handleSubjectGrade('english', inputMessage);
        break;
      case 'mathematics':
        handleSubjectGrade('mathematics', inputMessage);
        break;
      case 'physics':
        handleSubjectGrade('physics', inputMessage);
        break;
      case 'chemistry':
        handleSubjectGrade('chemistry', inputMessage);
        break;
      case 'biology':
        handleSubjectGrade('biology', inputMessage);
        break;
      case 'preferences':
        handlePreferences(inputMessage);
        break;
      case 'complete':
        // Handle follow-up questions using AI
        try {
          setIsTyping(true);
          const aiResponse = await openAIService.generateResponse([
            ...chatHistory,
            { role: 'user', content: inputMessage }
          ], userInfo);
          await addBotMessage(aiResponse);
        } catch (error) {
          console.error('AI Response Error:', error);
          await addBotMessage("I apologize, but I encountered an error. Please try asking your question again.");
        } finally {
          setIsTyping(false);
        }
        break;
      default:
        break;
    }

    setInputMessage('');
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-lg shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-dark-surface border border-dark-border' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`p-4 ${
            isDarkMode ? 'bg-dark-surface-secondary border-b border-dark-border' : 'bg-green-600'
          }`}>
            <div className="flex items-center gap-3">
              <AiOutlineRobot className={`text-2xl ${isDarkMode ? 'text-green-400' : 'text-white'}`} />
              <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-white'}`}>
                Course Advisor AI
              </h1>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? isDarkMode ? 'bg-green-600' : 'bg-green-500'
                      : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {message.type === 'user' 
                      ? <AiOutlineUser className="text-white" />
                      : <AiOutlineRobot className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                    }
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? isDarkMode 
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-500 text-white'
                      : isDarkMode
                        ? 'bg-dark-surface-secondary text-dark-text-primary border border-dark-border'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-2 ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                }`}
              >
                <AiOutlineRobot className="text-xl" />
                <div className="flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className={`p-4 border-t ${
            isDarkMode ? 'border-dark-border' : 'border-gray-200'
          }`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 p-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary placeholder:text-dark-text-secondary' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              <button
                type="submit"
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } transition-colors duration-200`}
              >
                <AiOutlineSend className="text-xl" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseAdvisor; 