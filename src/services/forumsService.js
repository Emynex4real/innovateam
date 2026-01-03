import { API_BASE_URL } from '../config/api';
import supabase from '../config/supabase';

class ForumsService {
  static async getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }

  static async getHeaders() {
    const token = await this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getCategories(centerId) {
    if (!centerId || centerId === 'undefined' || centerId === 'null') {
      return { success: false, data: [], error: 'Center ID not provided' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/categories/${centerId}`, {
        method: 'GET',
        headers: await this.getHeaders(),
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

  static async getThreads(categoryId, page = 1, limit = 20, sortBy = 'hot', filterBy = 'all') {
    if (!categoryId || categoryId === 'undefined') return { success: false, data: [] };

    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
        filter: filterBy
      });

      const response = await fetch(
        `${API_BASE_URL}/api/phase2/forums/categories/${categoryId}/threads?${query}`,
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
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/threads/${threadId}`, {
        method: 'GET',
        headers: await this.getHeaders(),
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

  static async createThread(categoryId, centerId, title, description, tags = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/threads`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          categoryId,
          centerId,
          title,
          description,
          tags,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || `HTTP error! status: ${response.status}` };
      }

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
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/threads/${threadId}/posts`, {
        method: 'POST',
        headers: await this.getHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/posts/${postId}/vote`, {
        method: 'POST',
        headers: await this.getHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/posts/${postId}/mark-answer`, {
        method: 'POST',
        headers: await this.getHeaders(),
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
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/search/${centerId}?${params}`, {
        method: 'GET',
        headers: await this.getHeaders(),
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

  static async followThread(threadId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/threads/${threadId}/follow`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error following thread:', error);
      return { success: false, error: error.message };
    }
  }

  static async unfollowThread(threadId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/threads/${threadId}/unfollow`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error unfollowing thread:', error);
      return { success: false, error: error.message };
    }
  }

  static async editPost(postId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/posts/${postId}`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error editing post:', error);
      return { success: false, error: error.message };
    }
  }

  static async deletePost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/posts/${postId}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteThread(threadId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/threads/${threadId}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error deleting thread:', error);
      return { success: false, error: error.message };
    }
  }

  static async bookmarkPost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error bookmarking post:', error);
      return { success: false, error: error.message };
    }
  }

  static async reportPost(postId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/phase2/forums/posts/${postId}/report`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error reporting post:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ForumsService;
