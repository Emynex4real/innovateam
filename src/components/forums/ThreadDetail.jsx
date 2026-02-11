import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { supabase } from '../../config/supabase';
import ForumsService from '../../services/forumsService';
import EnhancedPostCard from './EnhancedPostCard';
import RichTextEditor from './RichTextEditor';
import { ArrowLeft, Bell, BellOff, CheckCircle, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import 'katex/dist/katex.min.css';

const ThreadDetail = ({ userId }) => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const { isDarkMode } = useDarkMode();

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    loadThreadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // 2. Real-time Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`room-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT (replies) and UPDATE (votes/edits)
          schema: 'public',
          table: 'forum_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          loadThreadData(true); 
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  const loadThreadData = async (isBackgroundUpdate = false) => {
    if (!isBackgroundUpdate) setLoading(true);
    
    try {
      const result = await ForumsService.getThread(threadId);
      if (result.success) {
        setThread(result.data);
        setPosts(result.data.posts || []);
        document.title = `${result.data.title} | Forum`;
      } else {
        setError(result.error || 'Failed to load thread');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setPosting(true);
    
    const result = await ForumsService.createPost(threadId, newPostContent);
    
    if (result.success) {
      setNewPostContent('');
      await loadThreadData(true);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      alert(result.error || 'Failed to post reply');
    }
    setPosting(false);
  };

  const handleVote = async (postId, type) => {
    const result = await ForumsService.votePost(postId, type);
    return result;
  };

  const handleMarkAnswer = async (postId) => {
    await ForumsService.markAsAnswer(postId, threadId);
  };

  const handleFollow = async () => {
    const action = thread.is_following ? ForumsService.unfollowThread : ForumsService.followThread;
    await action(threadId);
    loadThreadData(true);
  };

  const handleDeleteThread = async () => {
    if (window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      const result = await ForumsService.deleteThread(threadId);
      if (result.success) {
        navigate(`/student/forums/category/${thread.category_id}`);
      } else {
        alert(result.error || 'Failed to delete thread');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    const result = await ForumsService.deletePost(postId);
    if (result.success) {
      await loadThreadData(true);
    } else {
      alert(result.error || 'Failed to delete post');
    }
  };

  if (loading) return (
    <div className={`p-8 text-center animate-pulse ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      Loading discussion...
    </div>
  );
  
  if (error || !thread) return (
    <div className={`p-8 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="text-xl font-bold text-red-600">Error</h2>
      <p>{error || "Thread not found"}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 underline">Go Back</button>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto p-2 sm:p-4 md:p-6 pb-20">
        {/* Navigation Header */}
        <div className={`flex justify-between items-center mb-3 sm:mb-6 sticky top-0 py-2 sm:py-4 z-10 backdrop-blur ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-50/90'}`}>
          <button 
            onClick={() => navigate(-1)} 
            className={`flex items-center gap-1 sm:gap-2 font-medium transition-colors text-sm sm:text-base ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden xs:inline">Back</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            {isLive && <span className="text-xs font-bold text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <span className="hidden sm:inline">LIVE</span></span>}
            <button 
              onClick={handleFollow}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                thread.is_following 
                  ? 'bg-blue-600/20 text-blue-500 border border-blue-500/20' 
                  : isDarkMode 
                    ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {thread.is_following ? <Bell className="w-3 h-3 sm:w-4 sm:h-4" /> : <BellOff className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{thread.is_following ? 'Following' : 'Follow'}</span>
            </button>
          </div>
        </div>

        {/* Main Question (Thread Starter) */}
        <article className={`rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-6 mb-4 sm:mb-8 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <header className="flex gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-green-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md flex-shrink-0">
              {thread.creator_name?.[0] || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{thread.title}</h1>
              <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className={`font-medium truncate max-w-[120px] sm:max-w-none ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{thread.creator_name}</span>
                <span className="hidden xs:inline">•</span>
                <span className="text-xs">{new Date(thread.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {thread.is_solved && (
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> <span className="hidden xs:inline">Solved</span>
                  </span>
                )}
              </div>
            </div>
          </header>

          <div className={`prose prose-sm sm:prose-lg max-w-none ${isDarkMode ? 'prose-invert' : 'text-gray-800'}`}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {thread.description}
            </ReactMarkdown>
          </div>

          <div className={`mt-3 sm:mt-6 pt-3 sm:pt-4 border-t flex justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
            <div className="flex gap-3 sm:gap-4">
              <span>{thread.view_count} views</span>
              <span>{posts.length} replies</span>
            </div>
            {thread.creator_id === userId && (
              <button
                onClick={handleDeleteThread}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        </article>

        {/* Answers Section */}
        <div className="mb-4 sm:mb-8">
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 px-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {posts.length} Answers
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {posts.map(post => (
              <EnhancedPostCard 
                key={post.id}
                post={post}
                currentUserId={userId}
                isAnswer={post.is_marked_answer}
                canMarkAnswer={thread.creator_id === userId}
                canEdit={post.author_id === userId}
                onVote={handleVote}
                onMarkAnswer={handleMarkAnswer}
                onDelete={handleDeletePost}
                isDarkMode={isDarkMode} // <--- Passing Dark Mode
              />
            ))}
          </div>
        </div>

        {/* Reply Input */}
        <div className={`rounded-lg sm:rounded-xl shadow-lg border p-3 sm:p-6 sticky bottom-2 sm:bottom-4 transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Post your answer</h4>
          <RichTextEditor 
            value={newPostContent} 
            onChange={setNewPostContent}
            placeholder="Help them out! Use $ for math..."
            minHeight="100px"
            isDarkMode={isDarkMode}
          />
          <div className="flex justify-end mt-2 sm:mt-3">
            <button 
              onClick={handleCreatePost}
              disabled={posting || !newPostContent.trim()}
              className="bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? 'Publishing...' : 'Post Answer'}
            </button>
          </div>
        </div>
        
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ThreadDetail;