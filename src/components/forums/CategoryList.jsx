import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, BookOpen, ChevronRight } from 'lucide-react';
import ForumsService from '../../services/forumsService';
import { ForumSkeleton } from './Skeleton';
import { useDarkMode } from '../../contexts/DarkModeContext';

const CategoryList = ({ centerId }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      if (!centerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await ForumsService.getCategories(centerId);
      if (res.success) setCategories(res.data || []);
      setLoading(false);
    };
    fetchCats();
  }, [centerId]); 

  if (loading) return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[1,2,3,4,5,6].map(i => <ForumSkeleton key={i} />)}
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto p-6 ${isDarkMode ? 'bg-gray-900' : ''}`}>
      <div className="mb-8 text-center md:text-left">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Study Forums</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Join the discussion with other JAMB students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No forum categories yet</p>
            <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>Check back soon for discussions!</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => navigate(`/student/forums/category/${cat.id}`)}
              className={`rounded-xl p-6 shadow-sm border cursor-pointer transition-all group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-300'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon || '📚'}
                </span>
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cat.name}</h3>
              <p className={`text-sm mb-6 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cat.description}</p>
              
              <div className={`flex items-center justify-between text-xs font-medium pt-4 border-t ${isDarkMode ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-100'}`}>
                 <div className="flex items-center gap-1">
                   <MessageSquare size={14} /> {cat.thread_count || 0} Topics
                 </div>
                 <div className="flex items-center gap-1">
                   <Users size={14} /> {cat.post_count || 0} Posts
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryList;