import React, { useState, useEffect } from 'react';
import axios from 'axios';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NotificationCenter = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        loadNotifications();
      })
      .subscribe();
    return () => subscription.unsubscribe();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data } = await axios.get(`${API_BASE}/messages/notifications`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId, actionUrl) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.put(
        `${API_BASE}/messages/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      loadNotifications();
      if (actionUrl) navigate(actionUrl);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.put(
        `${API_BASE}/messages/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    const icons = {
      message: '💬',
      announcement: '📢',
      achievement: '🏆',
      test_result: '📝',
      streak_reminder: '🔥',
      challenge: '🎯',
      payment: '💰',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-12 text-center shadow-lg`}>
              <div className="text-6xl mb-4">🔔</div>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id, notif.action_url)}
                className={`${
                  isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
                } rounded-xl p-4 cursor-pointer transition hover:scale-102 ${
                  !notif.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {notif.content}
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
