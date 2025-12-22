import { API_BASE_URL } from '../config/api';

/**
 * Collaboration Service
 * Handles study groups, peer tutoring, notifications, and gamification operations
 */

class CollaborationService {
  // ==================== STUDY GROUPS ====================

  static async getStudyGroups(centerId, page = 1, limit = 20) {
    // ✅ FIX: Guard clause for missing centerId
    if (!centerId || centerId === 'undefined' || centerId === 'null') {
      return { success: false, data: [], error: 'Center ID not provided' };
    }

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

  static async getStudyGroupDetail(groupId) {
    if (!groupId || groupId === 'undefined') return { success: false, data: null };

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

  static async joinStudyGroup(groupId) {
    if (!groupId || groupId === 'undefined') return { success: false, error: 'Invalid Group ID' };

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

  static async leaveStudyGroup(groupId) {
    if (!groupId || groupId === 'undefined') return { success: false, error: 'Invalid Group ID' };
    
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

  static async postInStudyGroup(groupId, content, resourceType = 'discussion', attachmentUrl = null) {
    if (!groupId || groupId === 'undefined') return { success: false, error: 'Invalid Group ID' };

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

  static async searchStudyGroups(centerId, query, page = 1, limit = 20) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

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

  static async getTutors(centerId, subject = null, page = 1, limit = 20) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined' || centerId === 'null') {
      return { success: false, data: [], error: 'Center ID not provided' };
    }

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

  static async getTutorProfile(tutorId) {
    if (!tutorId || tutorId === 'undefined') return { success: false, data: null };

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

  static async getUserBadges(centerId) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

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

  static async getLeaderboard(centerId, period = 'global', limit = 100) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

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

  static async getUserRank(centerId, period = 'global') {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined') return { success: false, data: null };

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

  static async getAchievementsSummary(centerId) {
    // ✅ FIX: Guard clause
    if (!centerId || centerId === 'undefined') return { success: false, data: null };

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