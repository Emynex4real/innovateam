import React, { useState, useEffect, useRef } from 'react';
import CollaborationService from '../../services/collaborationService';
import { useAuth } from '../../App';
import './StudyGroupDetail.css';

const StudyGroupDetail = ({ groupId, onBack }) => {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchDetails();
  }, [groupId]);

  const fetchDetails = async () => {
    setLoading(true);
    const result = await CollaborationService.getStudyGroupDetail(groupId);
    if (result.success) {
      setGroup(result.group);
      setPosts(result.group.posts || []);
    }
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    const result = await CollaborationService.postInStudyGroup(groupId, newPost);
    if (result.success) {
      setNewPost('');
      fetchDetails(); 
    }
    setPosting(false);
  };

  if (loading) return <div className="detail-loader">Loading group...</div>;
  if (!group) return <div className="detail-error">Group not found</div>;

  return (
    <div className="group-detail-container">
      <div className="group-banner">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="banner-content">
          <h1>{group.name}</h1>
          <div className="banner-badges">
            <span className="badge-tag">{group.subject}</span>
            {group.topic && <span className="badge-tag outline">{group.topic}</span>}
          </div>
        </div>
      </div>

      <div className="group-content-layout">
        <div className="group-feed">
          <div className="post-composer">
            <div className="composer-avatar">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <form onSubmit={handlePost} className="composer-form">
              <input
                type="text"
                placeholder="Share something with the group..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                disabled={posting}
              />
              <button type="submit" disabled={!newPost.trim() || posting}>
                {posting ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>

          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-feed">No posts yet. Start the discussion!</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-avatar">
                      {post.author?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="post-meta">
                      <span className="author-name">{post.author?.full_name || 'Unknown'}</span>
                      <span className="post-date">
                        {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <div className="post-body">
                    {post.content}
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="group-sidebar">
          <div className="sidebar-box">
            <h3>About</h3>
            <p>{group.description || 'No description provided.'}</p>
          </div>
          <div className="sidebar-box">
            <h3>Members</h3>
            <div className="member-list-placeholder">
              <div className="member-row">
                <div className="member-dot"></div>
                <span>{group.members?.[0]?.count || 1} Members joined</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDetail;