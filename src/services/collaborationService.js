import { API_BASE_URL } from '../config/api';

/**
 * Collaboration Service
 * Handles study groups, peer tutoring, notifications, and gamification operations
 */

class CollaborationService {
  
  // ✅ HELPER: Robustly retrieve token from various possible storage keys
  static getToken() {
    // Check standard keys
    const token = 
      localStorage.getItem('authToken') || 
      localStorage.getItem('auth_token') || 
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');

    // If not found, check Supabase specific session key (common cause of 401s)
    if (!token) {
      // Adjust this key if your project uses a different specific Supabase ID
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

  // ✅ HELPER: Standardized headers with Auth
  static getHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // ==================== STUDY GROUPS ====================

  static async getStudyGroups(centerId, page = 1, limit = 20) {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Use dedicated 'all/explore' endpoint if no centerId
      let url;
      if (!centerId || centerId === 'undefined' || centerId === 'null') {
        url = `${API_BASE_URL}/phase2/study-groups/all/explore?${query}`;
      } else {
        url = `${API_BASE_URL}/phase2/study-groups/${centerId}?${query}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
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
        headers: this.getHeaders(), // ✅ Fixed: Use centralized headers
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
        headers: this.getHeaders(), // ✅ Fixed
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

  static async createStudyGroup(groupData) {
    try {
      // Expecting groupData to contain { name, description, subject, topic, centerId, imageUrl }
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups`, {
        method: 'POST',
        headers: this.getHeaders(), // ✅ Fixed: This ensures token is sent
        body: JSON.stringify(groupData),
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
        headers: this.getHeaders(), // ✅ Fixed
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        // If already a member, return specific error message but treat as partly successful flow logic in UI
        if (errData.error === 'Already a member') {
             return { success: false, error: 'Already a member' };
        }
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

    try {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/search/${centerId}?${params}`, {
        method: 'GET',
        headers: this.getHeaders(), // ✅ Fixed
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
          headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
          headers: this.getHeaders(), // ✅ Fixed
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
        headers: this.getHeaders(), // ✅ Fixed
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
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

    try {
      const response = await fetch(`${API_BASE_URL}/phase2/gamification/badges/${centerId}`, {
        method: 'GET',
        headers: this.getHeaders(), // ✅ Fixed
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
          headers: this.getHeaders(), // ✅ Fixed
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
    if (!centerId || centerId === 'undefined') return { success: false, data: null };

    try {
      const query = new URLSearchParams({ period });

      const response = await fetch(
        `${API_BASE_URL}/phase2/gamification/rank/${centerId}?${query}`,
        {
          method: 'GET',
          headers: this.getHeaders(), // ✅ Fixed
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
    if (!centerId || centerId === 'undefined') return { success: false, data: null };

    try {
      const response = await fetch(`${API_BASE_URL}/phase2/gamification/achievements/${centerId}`, {
        method: 'GET',
        headers: this.getHeaders(), // ✅ Fixed
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