import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Students = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await tutorialCenterService.getStudents();
      if (response.success) {
        setStudents(response.students);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`flex justify-center p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/tutor')}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition`}
          >
            ← Back
          </button>
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enrolled Students</h1>
        </div>

        {students.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-8 md:p-12 text-center`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>No students enrolled yet</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Share your access code with students to get started</p>
          </div>
        ) : (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-x-auto`}>
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Name</th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Email</th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Attempts</th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Avg Score</th>
                  <th className={`px-4 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Enrolled</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {students.map((student) => (
                  <tr 
                    key={student.id} 
                    onClick={() => navigate(`/tutor/students/${student.id}`)}
                    className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition cursor-pointer`}
                  >
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</div>
                    </td>
                    <td className={`px-4 md:px-6 py-4 whitespace-nowrap text-sm md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {student.email}
                    </td>
                    <td className={`px-4 md:px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {student.total_attempts || 0}
                    </td>
                    <td className={`px-4 md:px-6 py-4 whitespace-nowrap`}>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        student.average_score >= 70 ? 'bg-green-100 text-green-800' :
                        student.average_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.average_score}%
                      </span>
                    </td>
                    <td className={`px-4 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(student.enrolled_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
