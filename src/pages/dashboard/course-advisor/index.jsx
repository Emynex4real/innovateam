import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AiOutlineRobot, AiOutlineSend, AiOutlineUser } from 'react-icons/ai';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import deepseekService from '../../../services/deepseek.service';
import toast from 'react-hot-toast';

const CourseAdvisor = () => {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsTyping(true);
        const systemMessage = {
          role: 'system',
          content: 'You are a knowledgeable course advisor for Nigerian universities. You help students choose suitable courses based on their interests, qualifications, and career goals. Be friendly, professional, and provide detailed, accurate advice.'
        };
        
        const userMessage = {
          role: 'user',
          content: 'Start a friendly conversation with a student seeking university course advice in Nigeria. Introduce yourself and ask about their interests and qualifications.'
        };

        const initialHistory = [systemMessage, userMessage];
        const initialResponse = await deepseekService.generateResponse(initialHistory);
        
        setConversationHistory(initialHistory);
        setMessages([{ type: 'bot', text: initialResponse }]);
      } catch (error) {
        console.error('Initialization Error:', error);
        let fallbackMessage = "👋 Hello! I'm your Course Advisor AI. ";
        
        if (error.message.includes('API key')) {
          fallbackMessage += "I'm currently experiencing some technical difficulties with my connection. Please try refreshing the page or come back in a few minutes.";
        } else if (error.message.includes('too many requests')) {
          fallbackMessage += "I'm handling a lot of requests right now. Please try again in a moment.";
        } else if (error.message.includes('service is currently experiencing issues')) {
          fallbackMessage += "I'm temporarily unavailable. Please try again later.";
        } else {
          fallbackMessage += "I'm here to help you find the perfect university course in Nigeria. Tell me about your interests and qualifications!";
        }

        setMessages([{ 
          type: 'bot', 
          text: fallbackMessage
        }]);
      } finally {
        setIsTyping(false);
      }
    };

    initializeChat();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    // Add user message to UI
    setMessages(prev => [...prev, { type: 'user', text: inputMessage }]);
    setInputMessage('');
    
    try {
      setIsTyping(true);

      // Update conversation history
      const newHistory = [...conversationHistory, userMessage];
      
      // Get AI response
      const response = await deepseekService.generateResponse(newHistory);
      
      // Add AI response to conversation history
      const assistantMessage = {
        role: 'assistant',
        content: response
      };
      
      setConversationHistory([...newHistory, assistantMessage]);
      
      // Add AI response to UI messages
      setMessages(prev => [...prev, { type: 'bot', text: response }]);

    } catch (error) {
      console.error('Chat Error:', error);
      let errorMessage = "I apologize, but I encountered an error. ";
      
      if (error.message.includes('API key')) {
        errorMessage += "There seems to be an issue with the API configuration. Please try again later.";
      } else if (error.message.includes('too many requests')) {
        errorMessage += "We're experiencing high traffic. Please try again in a moment.";
      } else if (error.message.includes('service is currently experiencing issues')) {
        errorMessage += "The service is temporarily unavailable. Please try again later.";
      } else {
        errorMessage += "Could you please rephrase your message or try again?";
      }

      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: errorMessage
      }]);
    } finally {
      setIsTyping(false);
    }
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