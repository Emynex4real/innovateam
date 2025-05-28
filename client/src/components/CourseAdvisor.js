import React, { useState } from 'react';
import { getCourseRecommendations } from '../utils/api';

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];
const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];

const CourseAdvisor = () => {
  const [waecGrades, setWaecGrades] = useState({});
  const [jambScore, setJambScore] = useState('');
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRecommendations('');

    // Validate inputs
    if (Object.keys(waecGrades).length < 5) {
      setError('Please select grades for all subjects');
      return;
    }

    const score = parseInt(jambScore);
    if (isNaN(score) || score < 0 || score > 400) {
      setError('JAMB score must be between 0 and 400');
      return;
    }

    if (!interests.trim()) {
      setError('Please enter your interests');
      return;
    }

    setLoading(true);
    try {
      const response = await getCourseRecommendations({
        waecGrades,
        jambScore: score,
        interests
      });
      setRecommendations(response.recommendations);
    } catch (error) {
      setError(error.error || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">WAEC Grades</h3>
          {SUBJECTS.map((subject) => (
            <div key={subject} className="flex items-center space-x-4">
              <label className="w-32">{subject}:</label>
              <select
                value={waecGrades[subject] || ''}
                onChange={(e) => setWaecGrades({
                  ...waecGrades,
                  [subject]: e.target.value
                })}
                className="form-select mt-1 block w-40 rounded-md border-gray-300 shadow-sm"
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
          <label className="block">
            JAMB Score (0-400):
            <input
              type="number"
              min="0"
              max="400"
              value={jambScore}
              onChange={(e) => setJambScore(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="block">
            Interests and Career Goals:
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows="3"
              required
              placeholder="What subjects do you enjoy? What career interests you?"
            />
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Getting Recommendations...' : 'Get Course Recommendations'}
        </button>
      </form>

      {recommendations && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Recommendations:</h3>
          <div className="mt-2 text-green-700 whitespace-pre-wrap">
            {recommendations}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseAdvisor; 