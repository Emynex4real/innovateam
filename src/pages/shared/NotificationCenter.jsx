import React, { useState, useEffect } from 'react';
import CollaborationService from '../../services/collaborationService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pollIntervalRef = React.useRef(null);

  useEffect(() => {
    loadNotifications();
    
    // Add polling every 5 seconds to catch new notifications
    pollIntervalRef.current = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        CollaborationService.getNotifications(false, 50),
        CollaborationService.getUnreadNotificationCount()
      ]);
      if (notifRes.success) setNotifications(notifRes.data);
      if (countRes.success) setUnreadCount(countRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId, actionUrl) => {
    try {
      await CollaborationService.markNotificationAsRead(notificationId);
      loadNotifications();
      if (actionUrl) navigate(actionUrl);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await CollaborationService.markAllNotificationsAsRead();
      loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    const icons = {
      message: '💬',
      group_post: '📝',
      group_join: '👥',
      badge_earned: '🏆',
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
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
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-lg text-gray-600">
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id, notif.action_url)}
                className={`bg-white rounded-xl p-4 cursor-pointer transition hover:shadow-md ${
                  !notif.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {notif.content || notif.message}
                    </p>
                    <p className="text-xs mt-2 text-gray-400">
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
