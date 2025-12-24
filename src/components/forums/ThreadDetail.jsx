import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { supabase } from '../../config/supabase';
import EnhancedPostCard from './EnhancedPostCard';
import RichTextEditor from './RichTextEditor';
import ForumsService from '../../services/forumsService';
import { ArrowLeft, Bell, BellOff, AlertCircle } from 'lucide-react';
import 'katex/dist/katex.min.css';

const ThreadDetail = ({ userId, userName, userAvatar }) => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  useEffect(() => {
    loadThreadData();
    // Update page title
    return () => {
      document.title = 'JAMB Forum | InnovaTeam';
    };
  }, [threadId]);

  useEffect(() => {
    if (thread?.title) {
      document.title = `${thread.title} - JAMB Forum | InnovaTeam`;
    }
  }, [thread]);

  // REAL-TIME LISTENER with connection status
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          console.log('✅ Real-time update received:', payload.eventType);
          if (payload.eventType === 'INSERT') {
            loadThreadData();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
          console.log('✅ Real-time connected for thread:', threadId);
        } else if (status === 'CLOSED') {
          setRealtimeConnected(false);
          console.log('❌ Real-time disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  const loadThreadData = async () => {
    try {
      const result = await ForumsService.getThread(threadId);
      if (result.success) {
        setThread(result.data);
        setPosts(result.data.posts || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to load thread');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      setError('Please enter a message');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (newPostContent.length < 5) {
      setError('Post must be at least 5 characters');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setPosting(true);
    setError(null);
    
    try {
      const result = await ForumsService.createPost(threadId, newPostContent);

      if (result.success) {
        setNewPostContent('');
        await loadThreadData();
        // Scroll to bottom to show new post
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleVotePost = async (postId, voteType) => {
    const result = await ForumsService.votePost(postId, voteType);
    if (result.success) {
      await loadThreadData();
      return { success: true };
    }
    return { success: false };
  };

  const handleMarkAnswer = async (postId) => {
    const result = await ForumsService.markAsAnswer(postId, threadId);
    if (result.success) {
      await loadThreadData();
      setError(null);
    } else {
      setError(result.error || 'Failed to mark answer');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFollowThread = async () => {
    if (!thread) return;
    
    const result = thread.is_following 
      ? await ForumsService.unfollowThread(threadId)
      : await ForumsService.followThread(threadId);
    
    if (result.success) {
      await loadThreadData();
    } else {
      setError(result.error || 'Failed to update follow status');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Thread Not Found</h2>
          <p className="text-gray-600 mb-6">This thread may have been deleted or doesn't exist.</p>
          <button
            onClick={() => navigate('/student/forums')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Back to Forums
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forums-page">
      {/* Header with breadcrumb navigation */}
      <div className="forums-header flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            thread.is_following 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={handleFollowThread}
          aria-label={thread.is_following ? 'Unfollow thread' : 'Follow thread'}
        >
          {thread.is_following ? <Bell size={18} /> : <BellOff size={18} />}
          <span className="font-medium">{thread.is_following ? 'Following' : 'Follow'}</span>
        </button>
      </div>

      {/* Real-time connection indicator */}
      {realtimeConnected && (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates enabled</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="thread-detail-container">
        {/* Original Post */}
        <article className="thread-original-post bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <header className="thread-header mb-4">
            <div className="author-info flex items-start gap-3">
              <div className="author-avatar">
                {thread.creator_name ? (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {thread.creator_name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                    ?
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{thread.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-medium">{thread.creator_name || 'Unknown'}</span>
                  <span>•</span>
                  <time dateTime={thread.created_at}>
                    {new Date(thread.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  {thread.creator_reputation > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600 font-medium">⭐ {thread.creator_reputation} rep</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="prose max-w-none mt-4">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {thread.description}
            </ReactMarkdown>
          </div>

          <footer className="thread-meta mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {thread.reply_count || 0} {thread.reply_count === 1 ? 'reply' : 'replies'}
            </span>
          </footer>
        </article>

        {/* Answers Section */}
        {posts.length > 0 && (
          <section className="posts-section mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {posts.length} {posts.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <EnhancedPostCard
                  key={post.id}
                  post={{
                    ...post,
                    author_name: post.author?.name || 'Unknown',
                    author_avatar: post.author?.avatar_url,
                    is_answer: post.is_marked_answer,
                    upvotes: post.upvote_count || 0,
                    downvotes: post.downvote_count || 0
                  }}
                  isAnswer={post.is_marked_answer}
                  canMarkAnswer={thread.creator_id === userId}
                  canEdit={post.author_id === userId}
                  onVote={handleVotePost}
                  onMarkAnswer={handleMarkAnswer}
                  currentUserId={userId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Reply Form */}
        <section className="reply-form bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Answer</h3>
          <RichTextEditor
            value={newPostContent}
            onChange={setNewPostContent}
            placeholder="Share your knowledge and help others..."
            minHeight="150px"
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Tip: Use $ for math equations (e.g., $x^2 + y^2 = z^2$)
            </p>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreatePost}
              disabled={posting || !newPostContent.trim()}
              aria-label="Post your answer"
            >
              {posting ? 'Posting...' : 'Post Answer'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ThreadDetail;
