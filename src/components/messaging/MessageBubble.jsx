import React from 'react';
import './MessageBubble.css';

/**
 * MessageBubble Component
 * Displays a single message in the conversation
 */
const MessageBubble = ({
  message,
  isOwn,
  showTimestamp = true,
  showAvatar = true,
  senderName,
  senderAvatar,
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          {senderAvatar ? (
            <img src={senderAvatar} alt={senderName || 'User'} />
          ) : (
            <div className="avatar-placeholder">{senderName?.charAt(0) || 'U'}</div>
          )}
        </div>
      )}

      <div className={`message-content ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && senderName && <div className="message-sender">{senderName}</div>}

        <div className="message-text">
          {message.media_url && message.media_type?.startsWith('image') && (
            <img src={message.media_url} alt="Message attachment" className="message-image" />
          )}
          {message.message_text && <p>{message.message_text}</p>}
        </div>

        {showTimestamp && (
          <div className="message-timestamp">
            {formatTime(message.created_at)}
          </div>
        )}

        {isOwn && message.read && (
          <div className="message-read-receipt">✓✓</div>
        )}
        {isOwn && !message.read && (
          <div className="message-unread-receipt">✓</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
