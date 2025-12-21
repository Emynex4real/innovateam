import { API_BASE_URL } from '../config/api';

/**
 * Messaging Service
 * Handles all 1:1 messaging operations including conversations, messages, and read status
 */

class MessagingService {
  /**
   * Get all conversations for the current user
   * @returns {Promise} Object with success boolean and conversations array
   */
  static async getConversations() {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/messaging/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

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

  /**
   * Get messages for a specific conversation
   * @param {string} conversationId - The conversation ID
   * @param {number} limit - Number of messages to fetch (default: 50)
   * @param {number} offset - Pagination offset (default: 0)
   * @returns {Promise} Object with success boolean and messages array
   */
  static async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const query = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/conversations/${conversationId}?${query}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
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

  /**
   * Send a new message
   * @param {string} conversationId - The conversation ID
   * @param {string} messageText - The message content
   * @param {string} mediaUrl - Optional media URL
   * @param {string} mediaType - Optional media type (image, video, document)
   * @returns {Promise} Object with success boolean and new message data
   */
  static async sendMessage(conversationId, messageText, mediaUrl = null, mediaType = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/messaging/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
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

  /**
   * Mark all messages in a conversation as read
   * @param {string} conversationId - The conversation ID
   * @returns {Promise} Object with success boolean
   */
  static async markMessagesAsRead(conversationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/messages/read/${conversationId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
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

  /**
   * Delete a message
   * @param {string} messageId - The message ID to delete
   * @returns {Promise} Object with success boolean
   */
  static async deleteMessage(messageId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/phase2/messaging/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
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

  /**
   * Start a new conversation with a user
   * @param {string} otherUserId - The other user's ID
   * @param {string} centerId - The center ID
   * @returns {Promise} Object with success boolean and conversation data
   */
  static async startConversation(otherUserId, centerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/messaging/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otherUserId,
          centerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
