import React, { useState, useEffect, useRef } from 'react';
import MessagingService from '../../services/messagingService';
import MessageBubble from './MessageBubble';
import './ChatInterface.css';

/**
 * ChatInterface Component
 * Displays messages for a conversation and allows composing new messages
 */
const ChatInterface = ({ conversation, currentUserId, currentUserName, currentUserAvatar }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      // Mark messages as read
      MessagingService.markMessagesAsRead(conversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversation) return;

    const result = await MessagingService.getMessages(conversation.id, 50, 0);
    if (result.success) {
      setMessages(result.data || []);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    setSending(true);
    const result = await MessagingService.sendMessage(
      conversation.id,
      messageText.trim(),
      null,
      null
    );

    if (result.success) {
      setMessageText('');
      fetchMessages();
    } else {
      setError(result.error || 'Failed to send message');
    }
    setSending(false);
  };

  if (!conversation) {
    return (
      <div className="chat-interface empty">
        <div className="empty-state">
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            {conversation.other_user_avatar ? (
              <img src={conversation.other_user_avatar} alt={conversation.other_user_name} />
            ) : (
              <div className="avatar-placeholder">
                {conversation.other_user_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div>
            <h3>{conversation.other_user_name}</h3>
            <p className="status">Active now</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                senderName={
                  message.sender_id === currentUserId
                    ? currentUserName
                    : conversation.other_user_name
                }
                senderAvatar={
                  message.sender_id === currentUserId
                    ? currentUserAvatar
                    : conversation.other_user_avatar
                }
                showTimestamp
                showAvatar
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="message-input-area">
        <form onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sending}
              className="message-input"
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="send-btn"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
