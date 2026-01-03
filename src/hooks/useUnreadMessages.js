import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import messagingService from '../services/messagingService';

/**
 * Hook to fetch unread message count
 * Updates every 10 seconds for real-time feel
 */
export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await messagingService.getConversations();
        if (response.success && response.data) {
          const count = response.data.reduce((total, conv) => total + (conv.unread_count || 0), 0);
          setUnreadCount(count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Refresh every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [user]);

  return { unreadCount, loading };
};
