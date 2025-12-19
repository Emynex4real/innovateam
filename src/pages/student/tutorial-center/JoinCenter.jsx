import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';

const JoinCenter = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      const response = await studentTCService.joinCenter(accessCode.toUpperCase());
      if (response.success) {
        toast.success(`Joined ${response.center.name}!`);
        navigate('/student/centers');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join center');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Join Tutorial Center</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Access Code</label>
            <input
              type="text"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border-2 rounded-lg text-center text-2xl font-mono tracking-widest uppercase"
              placeholder="ABC123"
              maxLength="6"
            />
            <p className="text-sm text-gray-500 mt-2">Enter the 6-character code from your tutor</p>
          </div>

          <button
            type="submit"
            disabled={joining || accessCode.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {joining ? 'Joining...' : 'Join Center'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/student/centers')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back to My Centers
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCenter;
