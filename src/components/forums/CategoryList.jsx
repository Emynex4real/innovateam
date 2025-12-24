import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, Users, TrendingUp } from 'lucide-react';
import ForumsService from '../../services/forumsService';
import { ForumSkeleton } from '../ui/Skeleton';

const CategoryList = ({ centerId }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [centerId]);

  const fetchCategories = async () => {
    setLoading(true);
    const result = await ForumsService.getCategories(centerId);
    if (result.success) {
      setCategories(result.data || []);
      setError(null);
    } else {
      setError(result.error || 'Failed to load categories');
    }
    setLoading(false);
  };

  const handleSearchThreads = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    const result = await ForumsService.searchThreads(centerId, searchQuery);
    if (result.success) {
      navigate('/student/forums/search', { state: { results: result.data, query: searchQuery } });
    } else {
      setError(result.error);
      setTimeout(() => setError(null), 3000);
    }
    setSearching(false);
  };

  if (loading) {
    return (
      <div className="forums-page">
        <div className="forums-header mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Forums</h1>
        </div>
        <div className="space-y-4">
          <ForumSkeleton />
          <ForumSkeleton />
          <ForumSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forums-page">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="forums-page">
      {/* Header */}
      <header className="forums-header mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">JAMB Forums</h1>
            <p className="text-gray-600">Ask questions, share knowledge, and connect with fellow students</p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchThreads} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                aria-label="Search forum discussions"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </form>
        </div>
      </header>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Available</h3>
          <p className="text-gray-500">Check back later for forum categories</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <article
              key={category.id}
              className="category-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              onClick={() => navigate(`/student/forums/category/${category.id}`)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/student/forums/category/${category.id}`);
                }
              }}
              aria-label={`View ${category.name} category`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                </div>
                <TrendingUp className="text-blue-500 flex-shrink-0 ml-2" size={24} />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span className="font-medium">{category.thread_count || 0}</span>
                  <span>threads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span className="font-medium">{category.post_count || 0}</span>
                  <span>posts</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Help Section */}
      <aside className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Forum Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use the search bar to find existing answers before posting</li>
          <li>• Write clear, descriptive titles for your questions</li>
          <li>• Use math equations with $ symbols (e.g., $x^2 + y^2 = z^2$)</li>
          <li>• Mark helpful answers to help others find solutions</li>
        </ul>
      </aside>
    </div>
  );
};

export default CategoryList;
