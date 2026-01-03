import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, XMarkIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import CollaborationService from '../services/collaborationService';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const [notifRes, countRes] = await Promise.all([
      CollaborationService.getNotifications(false, 10),
      CollaborationService.getUnreadNotificationCount()
    ]);
    if (notifRes.success) setNotifications(notifRes.data);
    if (countRes.success) setUnreadCount(countRes.data);
  };

  const handleMarkAsRead = async (notificationId, actionUrl) => {
    await CollaborationService.markNotificationAsRead(notificationId);
    fetchNotifications();
    if (actionUrl) {
      setIsOpen(false);
      navigate(actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    await CollaborationService.markAllNotificationsAsRead();
    await fetchNotifications();
    setLoading(false);
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    setDeletingId(notificationId);
    await CollaborationService.markNotificationAsRead(notificationId);
    await fetchNotifications();
    setDeletingId(null);
  };

  const getIcon = (type) => {
    const icons = {
      message: '💬',
      group_post: '📝',
      group_join: '👥',
      badge_earned: '🏆',
      system: '⚙️'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile: Full screen overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Notification Panel */}
          <div className="fixed inset-x-0 bottom-0 lg:absolute lg:right-0 lg:left-auto lg:bottom-auto lg:top-full lg:mt-2 w-full lg:w-96 bg-white rounded-t-2xl lg:rounded-lg shadow-2xl border-t lg:border border-gray-200 z-50 max-h-[85vh] lg:max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{loading ? 'Marking...' : 'All read'}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-3">🔔</div>
                  <p className="text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-gray-400 text-sm mt-1">We'll notify you when something arrives</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id, notif.action_url)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all group ${
                        !notif.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 break-words">
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 break-words line-clamp-2">{notif.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">{getTimeAgo(notif.created_at)}</p>
                            <button
                              onClick={(e) => handleDelete(e, notif.id)}
                              disabled={deletingId === notif.id}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all disabled:opacity-50"
                              title="Delete notification"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
