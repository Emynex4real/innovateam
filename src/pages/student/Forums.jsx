import React, { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedPostCard from '../../components/forums/EnhancedPostCard';
import RichTextEditor from '../../components/forums/RichTextEditor';
import ThreadSorting from '../../components/forums/ThreadSorting';
import ForumsService from '../../services/forumsService';
import { Pin, Lock, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import './Forums.css';

/**
 * Forums Page
 * Main forum interface with thread list, categories, and thread detail view
 */
const Forums = ({ centerId, userId, userName, userAvatar }) => {
  const [view, setView] = useState('categories'); // categories, threads, thread-detail
  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDescription, setNewThreadDescription] = useState('');
  const [sortBy, setSortBy] = useState('hot');
  const [filterBy, setFilterBy] = useState('all');
  const [tags, setTags] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef();

  useEffect(() => {
    if (view === 'categories') {
      fetchCategories();
    }
  }, [view, centerId]);

  useEffect(() => {
    if (view === 'threads' && selectedCategory && page > 1) {
      fetchThreads(selectedCategory.id, page, true);
    }
  }, [page]);
 
  useEffect(() => {
    if (view === 'threads' && selectedCategory) {
      setPage(1);
      fetchThreads(selectedCategory.id, 1, false);
    }
  }, [sortBy, filterBy]);

  useEffect(() => {
    if (view === 'thread-detail' && selectedThread?.id) {
      fetchThread(selectedThread.id);
    }
  }, [view, selectedThread?.id]);

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

  const fetchThreads = async (categoryId, pageNum = 1, append = false) => {
    setLoading(true);
    const result = await ForumsService.getThreads(categoryId, pageNum, 20, sortBy, filterBy);
    if (result.success) {
      setThreads(append ? [...threads, ...(result.data || [])] : result.data || []);
      setHasMore(result.pagination?.hasMore || false);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const lastThreadRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  const fetchThread = async (threadId) => {
    setLoading(true);
    const result = await ForumsService.getThread(threadId);
    if (result.success) {
      setSelectedThread(result.data);
      setError(null);
      setLoading(false);
    } else {
      setError(result.error || 'Failed to load thread');
      setLoading(false);
    }
  };

  const handleSearchThreads = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setView('categories');
      return;
    }

    setLoading(true);
    const result = await ForumsService.searchThreads(centerId, searchQuery);
    if (result.success) {
      setThreads(result.data || []);
      setView('search-results');
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !newThreadDescription.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (newThreadTitle.length < 10) {
      setError('Title must be at least 10 characters');
      return;
    }

    if (newThreadDescription.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    setPosting(true);
    setError(null);
    
    const result = await ForumsService.createThread(
      selectedCategory.id,
      centerId,
      newThreadTitle,
      newThreadDescription,
      tags
    );

    if (result.success) {
      setNewThreadTitle('');
      setNewThreadDescription('');
      setTags([]);
      setShowCreateThread(false);
      setPosting(false);
      fetchThreads(selectedCategory.id, 1, false);
    } else {
      setError(result.error || 'Failed to create thread');
      setPosting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      setError('Please enter a message');
      return;
    }

    if (newPostContent.length < 5) {
      setError('Post must be at least 5 characters');
      return;
    }

    setPosting(true);
    setError(null);
    const result = await ForumsService.createPost(selectedThread.id, newPostContent);

    if (result.success) {
      setNewPostContent('');
      
      // Optimistically add the new post to UI
      setSelectedThread(prev => ({
        ...prev,
        posts: [...(prev.posts || []), {
          ...result.data,
          author_name: result.data.author?.name || userName,
          upvote_count: 0,
          downvote_count: 0
        }],
        reply_count: (prev.reply_count || 0) + 1
      }));
      
      setPosting(false);
    } else {
      setError(result.error || 'Failed to create post');
      setPosting(false);
    }
  };

  const handleVotePost = async (postId, voteType) => {
    const result = await ForumsService.votePost(postId, voteType);
    if (result.success) {
      // Optimistically update vote counts
      setSelectedThread(prev => ({
        ...prev,
        posts: prev.posts.map(post => {
          if (post.id === postId) {
            const currentUpvotes = post.upvote_count || 0;
            const currentDownvotes = post.downvote_count || 0;
            
            if (result.action === 'vote_added') {
              return {
                ...post,
                upvote_count: voteType === 'upvote' ? currentUpvotes + 1 : currentUpvotes,
                downvote_count: voteType === 'downvote' ? currentDownvotes + 1 : currentDownvotes,
                user_vote: voteType
              };
            } else if (result.action === 'vote_removed') {
              return {
                ...post,
                upvote_count: voteType === 'upvote' ? currentUpvotes - 1 : currentUpvotes,
                downvote_count: voteType === 'downvote' ? currentDownvotes - 1 : currentDownvotes,
                user_vote: null
              };
            } else if (result.action === 'vote_changed') {
              return {
                ...post,
                upvote_count: voteType === 'upvote' ? currentUpvotes + 1 : currentUpvotes - 1,
                downvote_count: voteType === 'downvote' ? currentDownvotes + 1 : currentDownvotes - 1,
                user_vote: voteType
              };
            }
          }
          return post;
        })
      }));
      return { success: true };
    }
    if (result.error) {
      setError(result.error);
    }
    return { success: false };
  };

  const handleMarkAnswer = async (postId) => {
    const result = await ForumsService.markAsAnswer(postId, selectedThread.id);
    if (result.success) {
      fetchThread(selectedThread.id);
      setError(null);
    } else {
      setError(result.error || 'Failed to mark answer');
    }
  };

  const handleFollowThread = async () => {
    if (!selectedThread) return;
    
    const result = selectedThread.is_following 
      ? await ForumsService.unfollowThread(selectedThread.id)
      : await ForumsService.followThread(selectedThread.id);
    
    if (result.success) {
      fetchThread(selectedThread.id);
    } else {
      setError(result.error || 'Failed to update follow status');
    }
  };

  // Categories View
  if (view === 'categories' || (!selectedCategory && view === 'categories')) {
    return (
      <div className="forums-page">
        <div className="forums-header">
          <h1>Forums</h1>
          <div className="search-bar">
            <form onSubmit={handleSearchThreads}>
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories available</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => {
                  setSelectedCategory(category);
                  setView('threads');
                }}
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className="category-meta">
                  <span>{category.thread_count || 0} threads</span>
                  <span>{category.post_count || 0} posts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Threads View
  if (view === 'threads') {
    return (
      <div className="forums-page">
        <div className="forums-header">
          <button className="back-btn" onClick={() => setView('categories')}>
            ← Back
          </button>
          <h1>{selectedCategory.name}</h1>
          <button
            className="create-btn"
            onClick={() => setShowCreateThread(true)}
          >
            + New Thread
          </button>
        </div>

        <ThreadSorting 
          sortBy={sortBy} 
          onSortChange={setSortBy}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
        />

        {error && <div className="error-message">{error}</div>}

        {loading && page === 1 ? (
          <div className="loading">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="empty-state">
            <p>No threads in this category yet</p>
            <button
              className="primary-btn"
              onClick={() => setShowCreateThread(true)}
            >
              Start a discussion
            </button>
          </div>
        ) : (
          <div className="threads-list">
            {threads.map((thread, index) => (
              <div
                key={thread.id}
                ref={index === threads.length - 1 ? lastThreadRef : null}
                className="thread-item"
                onClick={() => {
                  setSelectedThread(thread);
                  setView('thread-detail');
                }}
              >
                <div className="thread-badges">
                  {thread.is_pinned && <Pin size={14} className="badge-icon pinned" />}
                  {thread.is_locked && <Lock size={14} className="badge-icon locked" />}
                </div>
                <div className="thread-title">{thread.title}</div>
                <div className="thread-preview">{thread.description}</div>
                <div className="thread-meta">
                  <span className="thread-author">{thread.creator_name || 'Unknown'}</span>
                  <span className="thread-stats">
                    <Eye size={14} /> {thread.view_count || 0}
                  </span>
                  <span className="thread-stats">
                    <MessageSquare size={14} /> {thread.reply_count || 0}
                  </span>
                  <span className="thread-stats">
                    <TrendingUp size={14} /> {thread.upvote_count || 0}
                  </span>
                  {thread.is_solved && <span className="solved-badge">✓ Solved</span>}
                </div>
              </div>
            ))}
            {loading && page > 1 && <div className="loading-more">Loading more...</div>}
          </div>
        )}

        {showCreateThread && (
          <div className="modal-overlay" onClick={() => setShowCreateThread(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Start New Thread</h2>
              {error && <div className="error-message">{error}</div>}
              <input
                type="text"
                placeholder="Thread title (min 10 characters)"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="input-field"
              />
              <div className="text-sm text-gray-500">{newThreadTitle.length}/10 characters</div>
              <RichTextEditor
                value={newThreadDescription}
                onChange={setNewThreadDescription}
                placeholder="Describe your discussion in detail..."
                minHeight="200px"
              />
              <div className="text-sm text-gray-500">{newThreadDescription.length}/20 characters</div>
              <div className="modal-footer">
                <button
                  className="secondary-btn"
                  onClick={() => setShowCreateThread(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-btn"
                  onClick={handleCreateThread}
                  disabled={posting}
                >
                  {posting ? 'Creating...' : 'Create Thread'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Thread Detail View
  if (view === 'thread-detail' && selectedThread) {
    return (
      <div className="forums-page">
        <div className="forums-header">
          <button className="back-btn" onClick={() => setView('threads')}>
            ← Back
          </button>
          <h1>{selectedThread.title}</h1>
          <button 
            className={`follow-btn ${selectedThread.is_following ? 'following' : ''}`}
            onClick={handleFollowThread}
          >
            {selectedThread.is_following ? '🔔 Following' : '🔕 Follow'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading thread...</div>
        ) : (
          <>
            <div className="thread-detail-container">
              <div className="thread-original-post">
                <div className="thread-header">
                  <div className="author-info">
                    <div className="author-avatar">
                      {selectedThread.creator_name ? (
                        <div className="avatar-placeholder">
                          {selectedThread.creator_name.charAt(0)}
                        </div>
                      ) : (
                        <div className="avatar-placeholder">?</div>
                      )}
                    </div>
                    <div>
                      <div className="author-name">{selectedThread.creator_name || 'Unknown'}</div>
                      <div className="post-date">
                        {selectedThread.created_at ? new Date(selectedThread.created_at).toLocaleDateString() : 'Recently'}
                      </div>
                      {selectedThread.creator_reputation > 0 && (
                        <div className="reputation">⭐ {selectedThread.creator_reputation} rep</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="thread-description">
                  {selectedThread.description}
                </div>

                <div className="thread-meta">
                  <span className="reply-count">
                    {selectedThread.reply_count || 0} replies
                  </span>
                </div>
              </div>

              {selectedThread.posts && selectedThread.posts.length > 0 && (
                <div className="posts-section">
                  <h3>{selectedThread.posts.length} {selectedThread.posts.length === 1 ? 'Reply' : 'Replies'}</h3>
                  {selectedThread.posts.map((post) => (
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
                      canMarkAnswer={selectedThread.creator_id === userId}
                      canEdit={post.author_id === userId}
                      onVote={handleVotePost}
                      onMarkAnswer={handleMarkAnswer}
                      currentUserId={userId}
                    />
                  ))}
                </div>
              )}

              <div className="reply-form">
                <h3>Add Your Reply</h3>
                <RichTextEditor
                  value={newPostContent}
                  onChange={setNewPostContent}
                  placeholder="Share your thoughts..."
                  minHeight="150px"
                />
                <button
                  className="primary-btn"
                  onClick={handleCreatePost}
                  disabled={posting || !newPostContent.trim()}
                >
                  {posting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default Forums;
