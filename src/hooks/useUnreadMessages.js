import { useState, useEffect } from "react";
import { useAuth } from "../App";
import messagingService from "../services/messagingService";

/**
 * Hook to fetch unread message count
 * Updates every 30 seconds for real-time feel using lightweight cached endpoint
 */
export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await messagingService.getUnreadCount();
        if (
          response &&
          response.success &&
          typeof response.unreadCount !== "undefined"
        ) {
          if (isMounted) setUnreadCount(response.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  return { unreadCount, loading };
};
