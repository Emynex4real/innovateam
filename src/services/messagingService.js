import { API_BASE_URL } from '../config/api';

/**
 * Messaging Service
 * Handles all 1:1 messaging operations including conversations, messages, and read status
 */

class MessagingService {
  
  static async getToken() {
    try {
      // First try Supabase session (most reliable)
      const { default: supabase } = await import('../config/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return session.access_token;
    } catch (e) {
      console.error('Error getting Supabase token:', e);
    }

    // Fallback to localStorage
    return localStorage.getItem('authToken') || 
           localStorage.getItem('auth_token') || 
           localStorage.getItem('token') ||
           localStorage.getItem('access_token') || null;
  }

  // ✅ HELPER: Standardized headers
  static async getHeaders() {
    const token = await this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getConversations() {
    try {
      const token = await this.getToken();
      if (!token) {
        console.warn('No auth token found, returning empty conversations');
        return { success: false, data: [] };
      }

      const response = await fetch(`${API_BASE_URL}/phase2/messaging/conversations`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (response.status === 401) {
        // Handle token expiration gracefully
        console.error('Session expired (401)');
        return { success: false, error: 'Session expired', data: [] };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  static async getMessages(conversationId, limit = 50, offset = 0) {
    if (!conversationId || conversationId === 'undefined') return { success: false, data: [] };

    try {
      const token = await this.getToken();
      if (!token) return { success: false, error: 'No token found' };

      const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/conversations/${conversationId}?${query}`,
        {
          method: 'GET',
          headers: await this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  static async sendMessage(conversationId, messageText, mediaUrl = null, mediaType = null) {
    if (!conversationId) return { success: false, error: 'Missing Conversation ID' };

    try {
      const token = await this.getToken();
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${API_BASE_URL}/phase2/messaging/send`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          conversationId,
          messageText,
          mediaUrl,
          mediaType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async markMessagesAsRead(conversationId) {
    if (!conversationId) return { success: false };

    try {
      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/messages/read/${conversationId}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
        }
      );

      if (!response.ok) {
        // Silently handle 404s for read status as non-critical
        if (response.status === 404) return { success: false };
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async deleteMessage(messageId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: await this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async startConversation(otherUserId, centerId) {
    try {
      const token = await this.getToken();
      
      if (!token) {
        console.error('StartConversation: No auth token found');
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/phase2/messaging/conversations`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          otherUserId,
          centerId,
        }),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default MessagingService;