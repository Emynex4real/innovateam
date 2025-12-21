import React, { useState, useEffect } from 'react';
import MessagingService from '../../services/messagingService';
import './ConversationList.css';

/**
 * ConversationList Component
 * Displays all conversations and allows selection
 */
const ConversationList = ({ selectedConversation, onSelectConversation, onComposeNew }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    const result = await MessagingService.getConversations();
    if (result.success) {
      setConversations(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const formatLastMessage = (conversation) => {
    if (!conversation.last_message) return 'No messages yet';

    let preview = conversation.last_message;
    if (preview.length > 50) {
      preview = preview.substring(0, 50) + '...';
    }
    return preview;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="conversation-list loading">Loading conversations...</div>;
  }

  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>Messages</h2>
        <button
          className="compose-btn"
          onClick={onComposeNew}
          title="Start new conversation"
        >
          ✎
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>No conversations yet</p>
          <button onClick={onComposeNew} className="primary-btn">
            Start a conversation
          </button>
        </div>
      ) : (
        <div className="conversations">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                selectedConversation?.id === conversation.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-avatar">
                {conversation.other_user_avatar ? (
                  <img src={conversation.other_user_avatar} alt={conversation.other_user_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {conversation.other_user_name?.charAt(0) || 'U'}
                  </div>
                )}
                {conversation.unread_count > 0 && (
                  <div className="unread-badge">{conversation.unread_count}</div>
                )}
              </div>

              <div className="conversation-info">
                <div className="conversation-name">{conversation.other_user_name}</div>
                <div className="conversation-preview">
                  {formatLastMessage(conversation)}
                </div>
              </div>

              <div className="conversation-meta">
                <div className="conversation-time">
                  {formatTime(conversation.last_message_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
