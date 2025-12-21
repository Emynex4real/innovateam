import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudyPlan = () => {
  const { isDarkMode } = useDarkMode();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [centerId, setCenterId] = useState(null);

  useEffect(() => {
    loadStudyPlan();
  }, []);

  const loadStudyPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get enrolled center
      const enrollRes = await axios.get(`${API_URL}/tc-enrollments/my-enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (enrollRes.data.enrollments?.[0]) {
        setCenterId(enrollRes.data.enrollments[0].center_id);
      }

      const res = await axios.get(`${API_URL}/gamification/study-plan/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPlan(res.data.plan);
    } catch (error) {
      console.error('Failed to load study plan');
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!centerId) {
      toast.error('Please enroll in a tutorial center first');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/gamification/study-plan/generate`,
        { centerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Study plan generated!');
      loadStudyPlan();
    } catch (error) {
      toast.error('Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const updateItem = async (itemId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/gamification/study-plan/items/${itemId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadStudyPlan();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
        <div className="max-w-2xl mx-auto pt-20">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-8 text-center`}>
            <div className="text-6xl mb-4">📚</div>
            <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Study Plan Yet
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Generate an AI-powered personalized study plan based on your performance
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Study Plan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const completedItems = plan.study_plan_items?.filter(i => i.status === 'completed').length || 0;
  const totalItems = plan.study_plan_items?.length || 0;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-2xl p-6 mb-6`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📚 {plan.title}
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {plan.description}
              </p>
            </div>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Overall Progress</span>
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {completedItems} / {totalItems} completed
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Start: {new Date(plan.start_date).toLocaleDateString()}
            </span>
            <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              End: {new Date(plan.end_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {plan.study_plan_items?.map((item, idx) => (
            <div
              key={item.id}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    item.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : item.status === 'in_progress'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.status === 'completed' ? '✓' : idx + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateItem(item.id, 'in_progress')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Start
                      </button>
                    )}
                    {item.status === 'in_progress' && (
                      <button
                        onClick={() => updateItem(item.id, 'completed')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-green-500 font-semibold">✓ Completed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyPlan;
