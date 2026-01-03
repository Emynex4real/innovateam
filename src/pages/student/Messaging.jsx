import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../App';
import ConversationList from '../../components/messaging/ConversationList';
import ChatInterface from '../../components/messaging/ChatInterface';
import MessagingService from '../../services/messagingService';
import './Messaging.css'; // We will put ALL styling here for consistency

const Messaging = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newConversationUser, setNewConversationUser] = useState('');
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reset modal state
  useEffect(() => {
    if (!showComposeModal) {
      setError(null);
      setNewConversationUser('');
    }
  }, [showComposeModal]);

  if (!user) return <div className="messaging-loader">Loading...</div>;

  const handleStartConversation = async () => {
    if (!newConversationUser.trim()) {
      setError('Please enter a valid email');
      return;
    }

    setComposing(true);
    setError(null);

    try {
      const result = await MessagingService.startConversation(
        newConversationUser.trim(),
        user.center_id || null
      );

      if (result.success) {
        const conversation = result.conversation || result.data;
        if (conversation) {
          setShowComposeModal(false);
          setRefreshKey(prev => prev + 1);
          setTimeout(() => setSelectedConversation(conversation), 50);
          toast.success('Chat started!');
        } else {
          setError('Failed to create conversation');
        }
      } else {
        setError(result.error || 'User not found');
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setComposing(false);
    }
  };

  return (
    <div className="messaging-layout">
      {/* Sidebar - Hidden on mobile if chat is open */}
      <div className={`messaging-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
        <ConversationList
          key={refreshKey}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onComposeNew={() => setShowComposeModal(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`messaging-main ${!selectedConversation ? 'hidden-mobile' : ''}`}>
        <ChatInterface
          conversation={selectedConversation}
          currentUserId={user.id}
          currentUserName={user.name || user.full_name}
          currentUserAvatar={user.avatar_url}
          onBack={() => setSelectedConversation(null)}
        />
      </div>

      {/* Modern Modal */}
      {showComposeModal && (
        <div className="modal-backdrop" onClick={() => setShowComposeModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="icon-btn" onClick={() => setShowComposeModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {error && <div className="error-banner">{error}</div>}
              <div className="input-field">
                <label>To:</label>
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={newConversationUser}
                  onChange={(e) => setNewConversationUser(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartConversation()}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-text" onClick={() => setShowComposeModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                disabled={composing || !newConversationUser}
                onClick={handleStartConversation}
              >
                {composing ? 'Starting...' : 'Start Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;