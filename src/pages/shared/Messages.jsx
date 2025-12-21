import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Messages = () => {
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        if (selectedPartner) loadMessages(selectedPartner);
        loadConversations();
      })
      .subscribe();
    return () => subscription.unsubscribe();
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await axios.get(`${API_BASE}/messages/conversations`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setConversations(data.conversations);
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (partnerId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await axios.get(`${API_BASE}/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setMessages(data.messages);
      setSelectedPartner(partnerId);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPartner) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(
        `${API_BASE}/messages/send`,
        { receiverId: selectedPartner, messageText },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      setMessageText('');
      loadMessages(selectedPartner);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-80 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.partnerId}
                onClick={() => loadMessages(conv.partnerId)}
                className={`p-4 cursor-pointer border-b transition ${
                  selectedPartner === conv.partnerId
                    ? isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User</p>
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedPartner ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.sender_id === supabase.auth.getUser()?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-2 rounded-2xl ${
                      isMine ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p>{msg.message_text}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className={`p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 rounded-full border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
