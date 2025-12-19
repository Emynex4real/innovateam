import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';

const MyCenters = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const response = await studentTCService.getMyCenters();
      if (response.success) {
        setCenters(response.centers);
      }
    } catch (error) {
      toast.error('Failed to load centers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tutorial Centers</h1>
        <button
          onClick={() => navigate('/student/centers/join')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Join Center
        </button>
      </div>

      {centers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't joined any centers yet</p>
          <button
            onClick={() => navigate('/student/centers/join')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Join Your First Center
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centers.map((center) => (
            <div key={center.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              <h3 className="text-xl font-bold mb-2">{center.name}</h3>
              <p className="text-gray-600 mb-4">{center.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                <p>Tutor: {center.tutor_name}</p>
                <p>Joined: {new Date(center.enrolled_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => navigate('/student/tests')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                View Tests
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCenters;
