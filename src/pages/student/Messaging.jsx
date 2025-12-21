import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConversationList from '../../components/messaging/ConversationList';
import ChatInterface from '../../components/messaging/ChatInterface';
import MessagingService from '../../services/messagingService';
import './Messaging.css';

/**
 * Messaging Page
 * Main messaging interface with conversation list and chat
 */
const Messaging = () => {
  const { user, authToken } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newConversationUser, setNewConversationUser] = useState('');
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <div className="messaging-page">
        <div className="error-state">
          <p>Please log in to access messaging</p>
        </div>
      </div>
    );
  }

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowComposeModal(false);
  };

  const handleComposeNew = () => {
    setShowComposeModal(true);
  };

  const handleStartConversation = async () => {
    if (!newConversationUser.trim()) {
      setError('Please enter a user ID or email');
      return;
    }

    setComposing(true);
    const result = await MessagingService.startConversation(
      newConversationUser.trim(),
      user.center_id
    );

    if (result.success) {
      setSelectedConversation(result.data);
      setNewConversationUser('');
      setShowComposeModal(false);
      setError(null);
    } else {
      setError(result.error || 'Failed to start conversation');
    }
    setComposing(false);
  };

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        <ConversationList
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onComposeNew={handleComposeNew}
        />

        <ChatInterface
          conversation={selectedConversation}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserAvatar={user.avatar_url}
        />
      </div>

      {showComposeModal && (
        <div className="modal-overlay" onClick={() => setShowComposeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start New Conversation</h2>
              <button
                className="close-btn"
                onClick={() => setShowComposeModal(false)}
              >
                ✕
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="user-input">User ID or Email</label>
                <input
                  id="user-input"
                  type="text"
                  placeholder="Enter user ID or email"
                  value={newConversationUser}
                  onChange={(e) => setNewConversationUser(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStartConversation()}
                  disabled={composing}
                />
              </div>

              <div className="modal-footer">
                <button
                  className="secondary-btn"
                  onClick={() => setShowComposeModal(false)}
                  disabled={composing}
                >
                  Cancel
                </button>
                <button
                  className="primary-btn"
                  onClick={handleStartConversation}
                  disabled={composing || !newConversationUser.trim()}
                >
                  {composing ? 'Starting...' : 'Start Conversation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;
