import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pin, Lock, Eye, MessageSquare, TrendingUp } from 'lucide-react';
import ForumsService from '../../services/forumsService';
import ThreadSorting from './ThreadSorting';
import RichTextEditor from './RichTextEditor';

const ThreadList = ({ centerId }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('hot');
  const [filterBy, setFilterBy] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDescription, setNewThreadDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [posting, setPosting] = useState(false);
  const observerRef = useRef();

  useEffect(() => {
    fetchCategory();
    fetchThreads(1, false);
  }, [categoryId, sortBy, filterBy]);

  useEffect(() => {
    if (page > 1) {
      fetchThreads(page, true);
    }
  }, [page]);

  const fetchCategory = async () => {
    const result = await ForumsService.getCategories(centerId);
    if (result.success) {
      const cat = result.data.find(c => c.id === categoryId);
      setCategory(cat);
    }
  };

  const fetchThreads = async (pageNum, append) => {
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
    const result = await ForumsService.createThread(
      categoryId,
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
      fetchThreads(1, false);
      setError(null);
    } else {
      setError(result.error || 'Failed to create thread');
    }
    setPosting(false);
  };

  if (loading && page === 1) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-lg"></div>;
  }

  return (
    <div className="forums-page">
      <div className="forums-header">
        <button className="back-btn" onClick={() => navigate('/student/forums')}>
          ← Back
        </button>
        <h1>{category?.name || 'Threads'}</h1>
        <button className="create-btn" onClick={() => setShowCreateThread(true)}>
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

      {threads.length === 0 ? (
        <div className="empty-state">
          <p>No threads in this category yet</p>
          <button className="primary-btn" onClick={() => setShowCreateThread(true)}>
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
              onClick={() => navigate(`/student/forums/thread/${thread.id}`)}
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
            <input
              type="text"
              placeholder="Thread title (min 10 characters)"
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              className="input-field"
            />
            <RichTextEditor
              value={newThreadDescription}
              onChange={setNewThreadDescription}
              placeholder="Describe your discussion in detail..."
              minHeight="200px"
            />
            <div className="modal-footer">
              <button className="secondary-btn" onClick={() => setShowCreateThread(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleCreateThread} disabled={posting}>
                {posting ? 'Creating...' : 'Create Thread'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadList;
