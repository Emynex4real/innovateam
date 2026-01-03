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
  const [deleting, setDeleting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(() => {
      // Silent refresh without showing loading state
      CollaborationService.getStudyGroupDetail(groupId).then(result => {
        if (result.success && result.data) {
          setGroup(result.data);
          setPosts(result.data.posts || []);
        }
      });
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [groupId]);

  const fetchDetails = async () => {
    const result = await CollaborationService.getStudyGroupDetail(groupId);
    if (result.success && result.data) {
      setGroup(result.data);
      setPosts(result.data.posts || []);
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    setDeleting(true);
    const result = await CollaborationService.deleteStudyGroup(groupId);
    if (result.success) {
      // Clear sessionStorage before redirecting
      sessionStorage.removeItem('selectedGroupId');
      sessionStorage.setItem('studyGroupView', 'browse');
      window.location.href = '/student/study-groups';
    } else {
      alert(result.error || 'Failed to delete group');
      setDeleting(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    
    setDeleting(true);
    const result = await CollaborationService.leaveStudyGroup(groupId);
    if (result.success) {
      sessionStorage.removeItem('selectedGroupId');
      sessionStorage.setItem('studyGroupView', 'browse');
      onBack();
    } else {
      alert(result.error || 'Failed to leave group');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loader">
        <div className="spinner"></div>
        <p>Loading group...</p>
      </div>
    );
  }
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
        <div className="banner-actions">
          {group.isJoined && group.creator_id !== user?.id && (
            <button className="leave-button" onClick={handleLeave} disabled={deleting}>
              Leave Group
            </button>
          )}
          {group.creator_id === user?.id && (
            <button className="delete-button" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          )}
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
            <h3>Members ({group.memberCount})</h3>
            <div className="member-list">
              {group.members?.slice(0, 8).map((member) => (
                <div key={member.user_id} className="member-item">
                  <div className="member-avatar">
                    {member.profile?.avatar_url ? (
                      <img src={member.profile.avatar_url} alt={member.profile?.full_name} />
                    ) : (
                      member.profile?.full_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.profile?.full_name || 'Unknown'}</span>
                    {member.role === 'admin' && <span className="admin-badge">Admin</span>}
                  </div>
                </div>
              ))}
              {group.memberCount > 8 && (
                <div className="more-members">+{group.memberCount - 8} more</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDetail;