import React, { useState, useEffect } from 'react';
import CollaborationService from '../../services/collaborationService';
import './StudyGroups.css';

/**
 * Study Groups Page
 * Browse and manage collaborative learning groups
 */
const StudyGroups = ({ centerId, userId }) => {
  const [view, setView] = useState('browse'); // browse or my-groups
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    topic: '',
    subject: '',
  });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (view === 'browse') {
      fetchGroups();
    } else {
      fetchUserGroups();
    }
  }, [view]);

  const fetchGroups = async () => {
    setLoading(true);
    const result = await CollaborationService.getStudyGroups(centerId);
    if (result.success) {
      setGroups(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const fetchUserGroups = async () => {
    setLoading(true);
    const result = await CollaborationService.getUserStudyGroups();
    if (result.success) {
      setUserGroups(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSearchGroups = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchGroups();
      return;
    }

    setLoading(true);
    const result = await CollaborationService.searchStudyGroups(
      centerId,
      searchQuery
    );
    if (result.success) {
      setGroups(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleCreateGroup = async () => {
    if (
      !newGroupData.name.trim() ||
      !newGroupData.description.trim() ||
      !newGroupData.subject.trim()
    ) {
      setError('Please fill in all fields');
      return;
    }

    setPosting(true);
    const result = await CollaborationService.createStudyGroup(
      newGroupData.name,
      newGroupData.description,
      newGroupData.topic || newGroupData.subject,
      newGroupData.subject
    );

    if (result.success) {
      setNewGroupData({
        name: '',
        description: '',
        topic: '',
        subject: '',
      });
      setShowCreateGroup(false);
      fetchUserGroups();
      setView('my-groups');
      setError(null);
    } else {
      setError(result.error);
    }
    setPosting(false);
  };

  const handleJoinGroup = async (groupId) => {
    setPosting(true);
    const result = await CollaborationService.joinStudyGroup(groupId);
    if (result.success) {
      fetchGroups();
      setError(null);
    } else {
      setError(result.error);
    }
    setPosting(false);
  };

  const handleLeaveGroup = async (groupId) => {
    setPosting(true);
    const result = await CollaborationService.leaveStudyGroup(groupId);
    if (result.success) {
      fetchUserGroups();
      setError(null);
    } else {
      setError(result.error);
    }
    setPosting(false);
  };

  const displayGroups = view === 'browse' ? groups : userGroups;

  return (
    <div className="study-groups-page">
      <div className="sg-header">
        <h1>Study Groups</h1>
        <div className="sg-controls">
          <div className="search-bar">
            <form onSubmit={handleSearchGroups}>
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
          </div>
          <button
            className="create-btn"
            onClick={() => setShowCreateGroup(true)}
          >
            + Create Group
          </button>
        </div>
      </div>

      <div className="sg-tabs">
        <button
          className={`tab-btn ${view === 'browse' ? 'active' : ''}`}
          onClick={() => setView('browse')}
        >
          Browse
        </button>
        <button
          className={`tab-btn ${view === 'my-groups' ? 'active' : ''}`}
          onClick={() => setView('my-groups')}
        >
          My Groups
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading groups...</div>
      ) : displayGroups.length === 0 ? (
        <div className="empty-state">
          <p>
            {view === 'browse'
              ? 'No groups found'
              : 'You haven\'t joined any groups yet'}
          </p>
          {view === 'browse' ? (
            <button
              className="primary-btn"
              onClick={() => setShowCreateGroup(true)}
            >
              Create Your First Group
            </button>
          ) : (
            <button className="primary-btn" onClick={() => setView('browse')}>
              Browse Groups
            </button>
          )}
        </div>
      ) : (
        <div className="groups-grid">
          {displayGroups.map((group) => (
            <div key={group.id} className="group-card">
              {group.image_url && (
                <div className="group-image">
                  <img src={group.image_url} alt={group.name} />
                </div>
              )}
              <div className="group-content">
                <h3>{group.name}</h3>
                <p className="group-description">{group.description}</p>

                <div className="group-meta">
                  <span className="subject-tag">{group.subject}</span>
                  <span className="member-count">
                    {group.member_count || 0} members
                  </span>
                </div>

                <div className="group-stats">
                  <span className="posts">
                    {group.post_count || 0} posts
                  </span>
                </div>

                <div className="group-actions">
                  {view === 'browse' ? (
                    <button
                      className="primary-btn"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={posting}
                    >
                      {posting ? 'Joining...' : 'Join'}
                    </button>
                  ) : (
                    <>
                      <button
                        className="secondary-btn"
                        onClick={() => setSelectedGroup(group)}
                      >
                        View
                      </button>
                      <button
                        className="danger-btn"
                        onClick={() => handleLeaveGroup(group.id)}
                        disabled={posting}
                      >
                        Leave
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Study Group</h2>

            <div className="form-group">
              <label>Group Name *</label>
              <input
                type="text"
                placeholder="e.g., AP Biology Study Group"
                value={newGroupData.name}
                onChange={(e) =>
                  setNewGroupData({ ...newGroupData, name: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="What is this group about?"
                value={newGroupData.description}
                onChange={(e) =>
                  setNewGroupData({
                    ...newGroupData,
                    description: e.target.value,
                  })
                }
                className="input-field"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                placeholder="e.g., Biology"
                value={newGroupData.subject}
                onChange={(e) =>
                  setNewGroupData({ ...newGroupData, subject: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                placeholder="Optional: Specific topic"
                value={newGroupData.topic}
                onChange={(e) =>
                  setNewGroupData({ ...newGroupData, topic: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="modal-footer">
              <button
                className="secondary-btn"
                onClick={() => setShowCreateGroup(false)}
                disabled={posting}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleCreateGroup}
                disabled={posting}
              >
                {posting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
