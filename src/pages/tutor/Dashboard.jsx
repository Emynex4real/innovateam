import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState({ students: 0, questions: 0, tests: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCenter();
  }, []);

  const loadCenter = async () => {
    try {
      const response = await tutorialCenterService.getMyCenter();
      if (response.success && response.center) {
        setCenter(response.center);
        setStats({
          students: response.center.student_count?.[0]?.count || 0,
          questions: response.center.question_count?.[0]?.count || 0,
          tests: response.center.test_count?.[0]?.count || 0
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load center');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      const response = await tutorialCenterService.createCenter(formData);
      if (response.success) {
        toast.success('Tutorial center created!');
        setCenter(response.center);
        setShowCreateModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create center');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto pt-20 p-8">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-8 text-center`}>
            <h2 className="text-2xl font-bold mb-4">Welcome, Tutor!</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Create your tutorial center to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Tutorial Center
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-8 max-w-md w-full`}>
                <h3 className="text-xl font-bold mb-4">Create Tutorial Center</h3>
                <form onSubmit={handleCreateCenter}>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Center Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="e.g., Ade's Tutorial Center"
                    />
                  </div>
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      rows="3"
                      placeholder="Brief description of your center"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`flex-1 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 mb-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{center.name}</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm md:text-base`}>{center.description}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-mono text-base md:text-lg font-bold">
                {center.access_code}
              </div>
              <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Access Code</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-2`}>Students</p>
            <p className="text-3xl md:text-4xl font-bold">{stats.students}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-2`}>Questions</p>
            <p className="text-3xl md:text-4xl font-bold">{stats.questions}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-2`}>Tests</p>
            <p className="text-3xl md:text-4xl font-bold">{stats.tests}</p>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6`}>
          <h2 className="text-lg md:text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={() => navigate('/tutor/questions')}
              className={`p-4 border-2 rounded-lg transition ${isDarkMode ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-700' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
            >
              <p className="font-semibold text-sm md:text-base">Add Questions</p>
            </button>
            <button
              onClick={() => navigate('/tutor/questions/generate')}
              className={`p-4 border-2 rounded-lg transition ${isDarkMode ? 'border-gray-700 hover:border-green-500 hover:bg-gray-700' : 'border-gray-200 hover:border-green-500 hover:bg-green-50'}`}
            >
              <p className="font-semibold text-sm md:text-base">AI Generate</p>
            </button>
            <button
              onClick={() => navigate('/tutor/tests/create')}
              className={`p-4 border-2 rounded-lg transition ${isDarkMode ? 'border-gray-700 hover:border-purple-500 hover:bg-gray-700' : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'}`}
            >
              <p className="font-semibold text-sm md:text-base">Create Test</p>
            </button>
            <button
              onClick={() => navigate('/tutor/students')}
              className={`p-4 border-2 rounded-lg transition ${isDarkMode ? 'border-gray-700 hover:border-orange-500 hover:bg-gray-700' : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'}`}
            >
              <p className="font-semibold text-sm md:text-base">View Students</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
