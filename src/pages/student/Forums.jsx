import React, { useState, useEffect } from 'react';
import PostCard from '../../components/forums/PostCard';
import ForumsService from '../../services/forumsService';
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

  useEffect(() => {
    if (view === 'categories') {
      fetchCategories();
    }
  }, [view, centerId]);

  useEffect(() => {
    if (view === 'threads' && selectedCategory) {
      fetchThreads(selectedCategory.id);
    }
  }, [view, selectedCategory]);

  useEffect(() => {
    if (view === 'thread-detail' && selectedThread) {
      fetchThread(selectedThread.id);
    }
  }, [view, selectedThread]);

  const fetchCategories = async () => {
    setLoading(true);
    const result = await ForumsService.getCategories(centerId);
    if (result.success) {
      setCategories(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const fetchThreads = async (categoryId) => {
    setLoading(true);
    const result = await ForumsService.getThreads(categoryId);
    if (result.success) {
      setThreads(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const fetchThread = async (threadId) => {
    setLoading(true);
    const result = await ForumsService.getThread(threadId);
    if (result.success) {
      setSelectedThread(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
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

    setPosting(true);
    const result = await ForumsService.createThread(
      selectedCategory.id,
      newThreadTitle,
      newThreadDescription
    );

    if (result.success) {
      setNewThreadTitle('');
      setNewThreadDescription('');
      setShowCreateThread(false);
      fetchThreads(selectedCategory.id);
      setError(null);
    } else {
      setError(result.error);
    }
    setPosting(false);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      setError('Please enter a message');
      return;
    }

    setPosting(true);
    const result = await ForumsService.createPost(selectedThread.id, newPostContent);

    if (result.success) {
      setNewPostContent('');
      fetchThread(selectedThread.id);
      setError(null);
    } else {
      setError(result.error);
    }
    setPosting(false);
  };

  const handleVotePost = async (postId) => {
    const result = await ForumsService.votePost(postId, 'upvote');
    if (result.success) {
      fetchThread(selectedThread.id);
      return { success: true };
    }
    return { success: false };
  };

  const handleMarkAnswer = async (postId) => {
    const result = await ForumsService.markAsAnswer(postId, selectedThread.id);
    if (result.success) {
      fetchThread(selectedThread.id);
    } else {
      setError(result.error);
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

        {error && <div className="error-message">{error}</div>}

        {loading ? (
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
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="thread-item"
                onClick={() => {
                  setSelectedThread(thread);
                  setView('thread-detail');
                }}
              >
                <div className="thread-title">{thread.title}</div>
                <div className="thread-preview">{thread.description}</div>
                <div className="thread-meta">
                  <span className="thread-author">{thread.author_name}</span>
                  <span className="thread-replies">
                    {thread.reply_count || 0} replies
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateThread && (
          <div className="modal-overlay" onClick={() => setShowCreateThread(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Start New Thread</h2>
              <input
                type="text"
                placeholder="Thread title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                className="input-field"
              />
              <textarea
                placeholder="Describe your discussion..."
                value={newThreadDescription}
                onChange={(e) => setNewThreadDescription(e.target.value)}
                className="input-field"
                rows="6"
              />
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
                      {selectedThread.author_avatar ? (
                        <img src={selectedThread.author_avatar} alt={selectedThread.author_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {selectedThread.author_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="author-name">{selectedThread.author_name}</div>
                      <div className="post-date">
                        {new Date(selectedThread.created_at).toLocaleDateString()}
                      </div>
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
                  <h3>Replies</h3>
                  {selectedThread.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      isAnswer={post.is_answer}
                      canMarkAnswer={selectedThread.author_id === userId}
                      onVote={handleVotePost}
                      onMarkAnswer={handleMarkAnswer}
                    />
                  ))}
                </div>
              )}

              <div className="reply-form">
                <h3>Add Your Reply</h3>
                <textarea
                  placeholder="Share your thoughts..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="input-field"
                  rows="5"
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
