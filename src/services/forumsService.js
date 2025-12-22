import { API_BASE_URL } from '../config/api';

/**
 * Forums Service
 * Handles all discussion forum operations including threads, posts, voting, and search
 */

class ForumsService {
  static async getCategories(centerId) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined' || centerId === 'null') {
      return { success: false, data: [], error: 'Center ID not provided' };
    }

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

  static async getThreads(categoryId, page = 1, limit = 20) {
    // ✅ FIX: Guard clause
    if (!categoryId || categoryId === 'undefined') return { success: false, data: [] };

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

  static async getThread(threadId) {
    if (!threadId || threadId === 'undefined') return { success: false, data: null };

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

  static async searchThreads(centerId, query, page = 1, limit = 20) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

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