import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pin, Lock, MessageSquare, TrendingUp, Plus, Search } from 'lucide-react';
import ForumsService from '../../services/forumsService';
import ThreadSorting from './ThreadSorting';
import RichTextEditor from './RichTextEditor';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ThreadList = ({ centerId }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('hot');
  const [showModal, setShowModal] = useState(false);
  
  // Create Thread State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchThreads();
  }, [categoryId, sortBy]);

  const fetchThreads = async () => {
    setLoading(true);
    const res = await ForumsService.getThreads(categoryId, 1, 50, sortBy);
    if (res.success) setThreads(res.data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    setError('');
    if (!newTitle || !newDesc) return;
    setCreating(true);
    const res = await ForumsService.createThread(categoryId, centerId, newTitle, newDesc);
    if (res.success) {
      setShowModal(false);
      setNewTitle(''); setNewDesc(''); setError('');
      fetchThreads();
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = '✓ Question posted successfully!';
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } else {
      setError(res.error || 'Failed to create thread');
    }
    setCreating(false);
  };

  return (
    <div className={`max-w-5xl mx-auto p-4 md:p-6 ${isDarkMode ? 'bg-gray-900' : ''}`}>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <button onClick={() => navigate('/student/forums')} className={`font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>← All Categories</button>
        <div className="flex w-full md:w-auto gap-3">
          <ThreadSorting sortBy={sortBy} onSortChange={setSortBy} />
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} /> Ask Question
          </button>
        </div>
      </div>

      {/* List */}
      <div className={`rounded-xl shadow-sm border overflow-hidden min-h-[50vh] ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className={`p-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="p-12 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}><MessageSquare size={24}/></div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No discussions yet</h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Be the first to ask a question in this category.</p>
          </div>
        ) : (
          threads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => navigate(`/student/forums/thread/${thread.id}`)}
              className={`p-5 border-b cursor-pointer transition-colors flex gap-4 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="flex flex-col items-center min-w-[3rem] gap-1 text-gray-500">
                 <span className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{thread.upvote_count}</span>
                 <span className="text-xs">votes</span>
              </div>
              <div className="flex-1">
                 <h3 className={`text-lg font-semibold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {thread.is_pinned && <Pin size={14} className="text-blue-500 fill-blue-500"/>}
                    {thread.title}
                 </h3>
                 <p className={`text-sm line-clamp-2 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{thread.description}</p>
                 <div className={`flex items-center gap-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{thread.creator_name}</span>
                    <span>• {new Date(thread.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12}/> {thread.reply_count} replies</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ask a Question</h2>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title <span className="text-xs text-gray-500">({newTitle.length}/10 min)</span></label>
                <input 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  placeholder="e.g., How do I solve this integration problem?"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Details <span className="text-xs text-gray-500">({newDesc.length}/20 min)</span></label>
                <RichTextEditor 
                  value={newDesc}
                  onChange={setNewDesc}
                  placeholder="Explain your problem... Use $ for math formulas."
                  minHeight="200px"
                />
              </div>
            </div>
            <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <button onClick={() => setShowModal(false)} className={`px-4 py-2 font-medium rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>Cancel</button>
              <button 
                onClick={handleCreate}
                disabled={creating || !newTitle || !newDesc}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Posting...' : 'Post Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadList;