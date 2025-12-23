import React, { useState, useEffect } from 'react';
import Forums from './Forums';
import { useAuth } from '../../App';
import supabase from '../../config/supabase';

const ForumsWrapper = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [centerId, setCenterId] = useState(null);

  useEffect(() => {
    if (user) loadForum();
  }, [user]);

  const loadForum = async () => {
    try {
      setLoading(true);
      
      // Just get the first available center
      const { data: centers, error: fetchError } = await supabase
        .from('tutorial_centers')
        .select('id')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (!centers) throw new Error('No tutorial centers found');

      setCenterId(centers.id);
      setError(null);
    } catch (err) {
      console.error('Forum error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !centerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Forum</h2>
          <p className="text-gray-600 mb-6">{error || 'No centers available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Forums
      centerId={centerId}
      userId={user.id}
      userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
      userAvatar={user.user_metadata?.avatar_url}
    />
  );
};

export default ForumsWrapper;
