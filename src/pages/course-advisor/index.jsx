import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import debounce from 'lodash/debounce';
import deepseekService from '../../services/deepseek.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create debounced API call function
const debouncedApiCall = debounce((request) => request(), 1000);

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];
const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const CourseAdvisor = () => {
  const { isDarkMode } = useDarkMode();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Course Recommendation State
  const [waecGrades, setWaecGrades] = useState({});
  const [jambScore, setJambScore] = useState('');
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [recommendLoading, setRecommendLoading] = useState(false);

  // Question Generator State
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setRecommendations('');

    // Validate inputs
    if (Object.keys(waecGrades).length < 5) {
      toast.error('Please select grades for all subjects');
      return;
    }

    const score = parseInt(jambScore);
    if (isNaN(score) || score < 0 || score > 400) {
      toast.error('JAMB score must be between 0 and 400');
      return;
    }

    if (!interests.trim()) {
      toast.error('Please enter your interests');
      return;
    }

    setRecommendLoading(true);
    try {
      const recommendations = await deepseekService.generateCourseRecommendations(
        waecGrades,
        score,
        interests
      );
      setRecommendations(recommendations);
      toast.success('Recommendations generated successfully!');
    } catch (error) {
      console.error('Recommendation Error:', error);
      toast.error(error.message || 'Failed to get recommendations');
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setQuestions('');

    if (!selectedFile) return;

    if (selectedFile.type !== 'text/plain') {
      toast.error('Please upload a .txt file');
      fileInputRef.current.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setQuestionLoading(true);
    setQuestions('');

    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      const generatedQuestions = await deepseekService.generateQuestions(text);
      setQuestions(generatedQuestions);
      toast.success('Questions generated successfully!');
    } catch (error) {
      console.error('Question Generation Error:', error);
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              JAMB Course Advisor & Question Generator
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Get course recommendations and generate practice questions
            </p>
          </div>

          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow dark:bg-gray-800 dark:text-blue-400'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Course Advisor
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow dark:bg-gray-800 dark:text-blue-400'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Question Generator
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel
                className={classNames(
                  'rounded-xl bg-white p-3 dark:bg-gray-800',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                <form onSubmit={handleRecommendationSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">WAEC Grades</h3>
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center space-x-4">
                        <label className="w-32 text-gray-700 dark:text-gray-300">{subject}:</label>
                        <select
                          value={waecGrades[subject] || ''}
                          onChange={(e) => setWaecGrades({
                            ...waecGrades,
                            [subject]: e.target.value
                          })}
                          className="form-select mt-1 block w-40 rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        >
                          <option value="">Select Grade</option>
                          {GRADES.map((grade) => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-300">
                      JAMB Score (0-400):
                      <input
                        type="number"
                        min="0"
                        max="400"
                        value={jambScore}
                        onChange={(e) => setJambScore(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Interests and Career Goals:
                      <textarea
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows="3"
                        required
                        placeholder="What subjects do you enjoy? What career interests you?"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={recommendLoading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      recommendLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {recommendLoading ? 'Getting Recommendations...' : 'Get Course Recommendations'}
                  </button>
                </form>

                {recommendations && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-400">Recommendations:</h3>
                    <div className="mt-2 text-green-700 dark:text-green-300 whitespace-pre-wrap">
                      {recommendations}
                    </div>
                  </div>
                )}
              </Tab.Panel>

              <Tab.Panel
                className={classNames(
                  'rounded-xl bg-white p-3 dark:bg-gray-800',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                <form onSubmit={handleQuestionSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-medium text-gray-900 dark:text-white">
                      Upload Text Document
                    </label>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900/20 dark:file:text-blue-400"
                      required
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a .txt file (max 5MB) containing the text you want to generate questions from.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={questionLoading || !file}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      (questionLoading || !file) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {questionLoading ? 'Generating Questions...' : 'Generate Questions'}
                  </button>
                </form>

                {questions && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-400">Generated Questions:</h3>
                    <div className="mt-2 text-green-700 dark:text-green-300 whitespace-pre-wrap">
                      {questions}
                    </div>
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default CourseAdvisor; 