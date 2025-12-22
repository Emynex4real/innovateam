import { API_BASE_URL } from '../config/api';

/**
 * Messaging Service
 * Handles all 1:1 messaging operations including conversations, messages, and read status
 */

class MessagingService {
  
  // ✅ HELPER: Robustly retrieve token from various possible storage keys
  static getToken() {
    // Check the most common keys used in your app
    const token = 
      localStorage.getItem('authToken') || 
      localStorage.getItem('auth_token') || 
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');

    // If using Supabase directly, sometimes token is inside a JSON object
    if (!token) {
      const sbSession = localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token');
      if (sbSession) {
        try {
          const parsed = JSON.parse(sbSession);
          return parsed.access_token;
        } catch (e) {
          console.error('Error parsing Supabase session:', e);
        }
      }
    }

    return token;
  }

  // ✅ HELPER: Standardized headers
  static getHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getConversations() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No auth token found, returning empty conversations');
        return { success: false, data: [] };
      }

      const response = await fetch(`${API_BASE_URL}/phase2/messaging/conversations`, {
        method: 'GET',
        headers: this.getHeaders(),
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
      const token = this.getToken();
      if (!token) return { success: false, error: 'No token found' };

      const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/conversations/${conversationId}?${query}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
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
      const token = this.getToken();
      if (!token) throw new Error('Authentication required');

      // ✅ FIXED: Changed endpoint from '/messages' to '/send' to match your backend router
      const response = await fetch(`${API_BASE_URL}/phase2/messaging/send`, {
        method: 'POST',
        headers: this.getHeaders(),
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
          headers: this.getHeaders(),
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
          headers: this.getHeaders(),
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
      const token = this.getToken();
      
      if (!token) {
        console.error('StartConversation: No auth token found');
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/phase2/messaging/conversations`, {
        method: 'POST',
        headers: this.getHeaders(),
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