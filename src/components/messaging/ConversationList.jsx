import React, { useState, useEffect } from 'react';
import MessagingService from '../../services/messagingService';

const ConversationList = ({ selectedConversation, onSelectConversation, onComposeNew }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const res = await MessagingService.getConversations();
    if (res.success) {
      setConversations(res.conversations || []);
      setLoading(false);
    }
  };

  const filtered = conversations.filter(c => {
    const name = c.partnerName || c.other_user?.full_name || c.other_user?.email || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getDetails = (c) => ({
    name: c.partnerName || c.other_user?.full_name || c.other_user?.email || 'User',
    avatar: c.partnerAvatar || c.other_user?.avatar_url,
    initial: (c.partnerName || c.other_user?.email || 'U')[0].toUpperCase(),
    time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : '',
    preview: c.lastMessage || 'No messages yet'
  });

  return (
    <div className="conv-list-container">
      <div className="conv-header">
        <h2>Chats</h2>
        <button className="compose-btn-icon" onClick={onComposeNew} title="New Chat">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>

      <div className="search-wrapper">
        <input 
          type="text" 
          placeholder="Search..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="conv-items">
        {loading && <div className="loading-skeleton">Loading chats...</div>}
        
        {!loading && filtered.length === 0 && (
          <div className="empty-list">No conversations found</div>
        )}

        {filtered.map(conv => {
          const { name, avatar, initial, time, preview } = getDetails(conv);
          const active = selectedConversation?.id === conv.id;
          
          return (
            <div 
              key={conv.id} 
              className={`conv-item ${active ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className="avatar">
                {avatar ? <img src={avatar} alt={name} /> : <span>{initial}</span>}
              </div>
              <div className="conv-info">
                <div className="conv-top">
                  <span className="conv-name">{name}</span>
                  <span className="conv-time">{time}</span>
                </div>
                <div className="conv-preview">{preview}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;