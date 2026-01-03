import React, { useState, useEffect, useRef } from 'react';
import MessagingService from '../../services/messagingService';

const ChatInterface = ({ conversation, currentUserId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Get partner details safely
  const partner = conversation?.other_user || {};
  const name = conversation?.partnerName || partner.full_name || partner.email || 'User';
  
  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const res = await MessagingService.getMessages(conversation.id);
    if (res.success) setMessages(res.messages || []);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setSending(true);
    // Optimistic UI update could go here
    const res = await MessagingService.sendMessage(
      conversation.id,
      text,
      null,
      null
    );
    
    if (res.success) {
      setText('');
      fetchMessages();
    }
    setSending(false);
  };

  if (!conversation) {
    return (
      <div className="chat-empty-state">
        <div className="icon-circle">💬</div>
        <h3>Your Messages</h3>
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <button className="back-btn-mobile" onClick={onBack}>←</button>
        <div className="header-details">
          <h3>{name}</h3>
          <span className="active-status">Active now</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="new-chat-intro">
            <p>This is the start of your conversation with <strong>{name}</strong>.</p>
          </div>
        )}
        
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={i} className={`msg-row ${isMe ? 'me' : 'them'}`}>
              <div className="msg-bubble">
                {msg.message_text}
                <div className="msg-time">
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-wrapper" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={!text.trim() || sending}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;