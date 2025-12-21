import { API_BASE_URL } from '../config/api';

/**
 * Collaboration Service
 * Handles study groups, peer tutoring, notifications, and gamification operations
 */

class CollaborationService {
  // ==================== STUDY GROUPS ====================

  /**
   * Get public study groups for a center
   * @param {string} centerId - The center ID
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Object with success boolean and groups array
   */
  static async getStudyGroups(centerId, page = 1, limit = 20) {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/${centerId}?${query}`, {
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
      console.error('Error fetching study groups:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get groups the current user has joined
   * @returns {Promise} Object with success boolean and user's groups array
   */
  static async getUserStudyGroups() {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/user/my-groups`, {
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
      console.error('Error fetching user study groups:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get detailed information about a study group
   * @param {string} groupId - The group ID
   * @returns {Promise} Object with success boolean and group detail data
   */
  static async getStudyGroupDetail(groupId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/${groupId}/detail`, {
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
      console.error('Error fetching group detail:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Create a new study group
   * @param {string} name - Group name
   * @param {string} description - Group description
   * @param {string} topic - Group topic/subject
   * @param {string} subject - Group subject
   * @param {string} imageUrl - Optional group image URL
   * @returns {Promise} Object with success boolean and new group data
   */
  static async createStudyGroup(name, description, topic, subject, imageUrl = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          topic,
          subject,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating study group:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Join a study group
   * @param {string} groupId - The group ID to join
   * @returns {Promise} Object with success boolean
   */
  static async joinStudyGroup(groupId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/${groupId}/join`, {
        method: 'POST',
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
      console.error('Error joining group:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Leave a study group
   * @param {string} groupId - The group ID to leave
   * @returns {Promise} Object with success boolean
   */
  static async leaveStudyGroup(groupId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/${groupId}/leave`, {
        method: 'POST',
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
      console.error('Error leaving group:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Post content in a study group
   * @param {string} groupId - The group ID
   * @param {string} content - Post content
   * @param {string} resourceType - Type of resource (note, question, resource, discussion)
   * @param {string} attachmentUrl - Optional attachment URL
   * @returns {Promise} Object with success boolean and new post data
   */
  static async postInStudyGroup(groupId, content, resourceType = 'discussion', attachmentUrl = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/${groupId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          resourceType,
          attachmentUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error posting in group:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search study groups
   * @param {string} centerId - The center ID
   * @param {string} query - Search query
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Object with success boolean and search results array
   */
  static async searchStudyGroups(centerId, query, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/search/${centerId}?${params}`, {
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
      console.error('Error searching study groups:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // ==================== PEER TUTORING ====================

  /**
   * Get available tutors for a center
   * @param {string} centerId - The center ID
   * @param {string} subject - Optional filter by subject
   * @param {number} page - Page number for pagination (default: 1)
   * @param {number} limit - Results per page (default: 20)
   * @returns {Promise} Object with success boolean and tutors array
   */
  static async getTutors(centerId, subject = null, page = 1, limit = 20) {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (subject) {
        query.append('subject', subject);
      }

      const response = await fetch(
        `${API_BASE_URL}/phase2/tutoring/tutors/${centerId}?${query}`,
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
      console.error('Error fetching tutors:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get detailed information about a tutor
   * @param {string} tutorId - The tutor ID
   * @returns {Promise} Object with success boolean and tutor profile data
   */
  static async getTutorProfile(tutorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/tutors/${tutorId}/profile`, {
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
      console.error('Error fetching tutor profile:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Create a tutor profile for the current user
   * @param {string} bio - Tutor bio/description
   * @param {number} hourlyRate - Hourly rate in cents
   * @param {array} subjects - Array of subject specializations
   * @param {number} experienceYears - Years of tutoring experience
   * @param {string} certificationUrl - Optional certification document URL
   * @returns {Promise} Object with success boolean and new profile data
   */
  static async createTutorProfile(
    bio,
    hourlyRate,
    subjects,
    experienceYears,
    certificationUrl = null
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio,
          hourlyRate,
          subjects,
          experienceYears,
          certificationUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating tutor profile:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Request tutoring from a tutor
   * @param {string} tutorId - The tutor ID
   * @param {string} subject - Subject to learn
   * @param {string} topic - Specific topic
   * @param {string} description - Detailed description of needs
   * @param {string} preferredStartDate - Preferred start date
   * @param {array} preferredTimeSlots - Array of preferred times
   * @param {number} estimatedHours - Estimated hours needed
   * @returns {Promise} Object with success boolean and request data
   */
  static async requestTutoring(
    tutorId,
    subject,
    topic,
    description,
    preferredStartDate,
    preferredTimeSlots,
    estimatedHours
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tutorId,
          subject,
          topic,
          description,
          preferredStartDate,
          preferredTimeSlots,
          estimatedHours,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error requesting tutoring:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Accept a tutoring request (tutor action)
   * @param {string} requestId - The tutoring request ID
   * @returns {Promise} Object with success boolean
   */
  static async acceptTutoringRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/requests/${requestId}/accept`, {
        method: 'POST',
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
      console.error('Error accepting tutoring request:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Decline a tutoring request (tutor action)
   * @param {string} requestId - The tutoring request ID
   * @returns {Promise} Object with success boolean
   */
  static async declineTutoringRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/requests/${requestId}/decline`, {
        method: 'POST',
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
      console.error('Error declining tutoring request:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Schedule a tutoring session
   * @param {string} requestId - The tutoring request ID
   * @param {string} scheduledAt - ISO date/time for the session
   * @param {string} meetingLink - Optional meeting URL
   * @returns {Promise} Object with success boolean and session data
   */
  static async scheduleTutoringSession(requestId, scheduledAt, meetingLink = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          scheduledAt,
          meetingLink,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scheduling session:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Complete a tutoring session and leave feedback
   * @param {string} sessionId - The session ID
   * @param {number} rating - Rating from 1-5
   * @param {string} feedback - Written feedback
   * @returns {Promise} Object with success boolean and review data
   */
  static async completeTutoringSession(sessionId, rating, feedback) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error completing session:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get student's tutoring sessions
   * @returns {Promise} Object with success boolean and sessions array
   */
  static async getStudentTutoringSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/tutoring/sessions`, {
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
      console.error('Error fetching student sessions:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get user's notifications
   * @param {boolean} unreadOnly - Only fetch unread notifications (default: false)
   * @param {number} limit - Number of notifications to fetch (default: 50)
   * @returns {Promise} Object with success boolean and notifications array
   */
  static async getNotifications(unreadOnly = false, limit = 50) {
    try {
      const query = new URLSearchParams({
        unreadOnly: unreadOnly.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/phase2/notifications?${query}`, {
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
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise} Object with success boolean and unread count
   */
  static async getUnreadNotificationCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/notifications/count`, {
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
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: error.message,
        data: 0,
      };
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - The notification ID
   * @returns {Promise} Object with success boolean
   */
  static async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/phase2/notifications/${notificationId}/read`,
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
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise} Object with success boolean
   */
  static async markAllNotificationsAsRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/notifications/mark-all-read`, {
        method: 'POST',
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
      console.error('Error marking all as read:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== GAMIFICATION ====================

  /**
   * Get user's badges for a center
   * @param {string} centerId - The center ID
   * @returns {Promise} Object with success boolean and badges array
   */
  static async getUserBadges(centerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/gamification/badges/${centerId}`, {
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
      console.error('Error fetching badges:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get leaderboard for a center
   * @param {string} centerId - The center ID
   * @param {string} period - Leaderboard period (daily, weekly, monthly, global) - default: global
   * @param {number} limit - Number of top results (default: 100)
   * @returns {Promise} Object with success boolean and leaderboard array
   */
  static async getLeaderboard(centerId, period = 'global', limit = 100) {
    try {
      const query = new URLSearchParams({
        period,
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/phase2/gamification/leaderboard/${centerId}?${query}`,
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
      console.error('Error fetching leaderboard:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }

  /**
   * Get user's rank in the leaderboard
   * @param {string} centerId - The center ID
   * @param {string} period - Rank period (daily, weekly, monthly, global) - default: global
   * @returns {Promise} Object with success boolean and rank data
   */
  static async getUserRank(centerId, period = 'global') {
    try {
      const query = new URLSearchParams({ period });

      const response = await fetch(
        `${API_BASE_URL}/phase2/gamification/rank/${centerId}?${query}`,
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
      console.error('Error fetching user rank:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  /**
   * Get user's achievements summary
   * @param {string} centerId - The center ID
   * @returns {Promise} Object with success boolean and achievements summary
   */
  static async getAchievementsSummary(centerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/phase2/gamification/achievements/${centerId}`, {
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
      console.error('Error fetching achievements:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }
}

export default CollaborationService;
