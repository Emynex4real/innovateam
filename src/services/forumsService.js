import { API_BASE_URL } from '../config/api';

/**
 * Forums Service
 * Handles all discussion forum operations including threads, posts, voting, and search
 */

class ForumsService {
  /**
   * Get all forum categories for a center
   * @param {string} centerId - The center ID
   * @returns {Promise} Object with success boolean and categories array
   */
  static async getCategories(centerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/forums/categories/${centerId}`, {
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
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get threads in a specific category
   * @param {string} categoryId - The category ID
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Object with success boolean and threads array
   */
  static async getThreads(categoryId, page = 1, limit = 20) {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/phase2/forums/categories/${categoryId}/threads?${query}`,
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
      console.error('Error fetching threads:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get a specific thread with all its posts
   * @param {string} threadId - The thread ID
   * @returns {Promise} Object with success boolean and thread data with posts
   */
  static async getThread(threadId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/forums/threads/${threadId}`, {
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
      console.error('Error fetching thread:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Create a new discussion thread
   * @param {string} categoryId - The category ID
   * @param {string} title - Thread title
   * @param {string} description - Thread description
   * @returns {Promise} Object with success boolean and new thread data
   */
  static async createThread(categoryId, title, description) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/forums/threads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new post in a thread
   * @param {string} threadId - The thread ID
   * @param {string} content - Post content
   * @param {string} parentPostId - Optional parent post ID (for replies)
   * @returns {Promise} Object with success boolean and new post data
   */
  static async createPost(threadId, content, parentPostId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/forums/threads/${threadId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parentPostId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Vote on a post (upvote/downvote)
   * @param {string} postId - The post ID
   * @param {string} voteType - Vote type: 'upvote' or 'downvote'
   * @returns {Promise} Object with success boolean and updated vote data
   */
  static async votePost(postId, voteType) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/forums/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error voting on post:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark a post as the solution to a thread
   * @param {string} postId - The post ID
   * @param {string} threadId - The thread ID
   * @returns {Promise} Object with success boolean
   */
  static async markAsAnswer(postId, threadId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/forums/posts/${postId}/mark-answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking answer:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search forum threads
   * @param {string} centerId - The center ID
   * @param {string} query - Search query
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Object with success boolean and search results array
   */
  static async searchThreads(centerId, query, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/phase2/forums/search/${centerId}?${params}`, {
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
      console.error('Error searching threads:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }
}

export default ForumsService;
