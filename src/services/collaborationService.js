import { API_BASE_URL } from '../config/api';
import supabase from '../config/supabase';

/**
 * Collaboration Service
 * Handles study groups, peer tutoring, notifications, and gamification operations
 */

class CollaborationService {
  
  // ✅ HELPER: Robustly retrieve token from Supabase
  static async getToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  }

  // ✅ HELPER: Standardized headers with Auth
  static async getHeaders() {
    const token = await this.getToken();
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

      let url;
      if (!centerId || centerId === 'undefined' || centerId === 'null') {
        url = `${API_BASE_URL}/phase2/study-groups/all/explore?${query}`;
      } else {
        url = `${API_BASE_URL}/phase2/study-groups/${centerId}?${query}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups`, {
        method: 'POST',
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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

  static async deleteStudyGroup(groupId) {
    if (!groupId || groupId === 'undefined') return { success: false, error: 'Invalid Group ID' };

    try {
      const response = await fetch(`${API_BASE_URL}/phase2/study-groups/${groupId}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting group:', error);
      return {
        success: false,
        error: error.message,
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
          headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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

  // ==================== NOTIFICATIONS (FIXED SCHEMA) ====================

  static async getNotifications(unreadOnly = false, limit = 50) {
    // ✅ Updated: Uses "read" (from your DB image) instead of "is_read"
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq('read', false); // ✅ Matched DB Column
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getUnreadNotificationCount() {
    // ✅ Updated: Uses "read" instead of "is_read"
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: true, data: 0 };

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false); // ✅ Matched DB Column

      if (error) throw error;
      return { success: true, data: count || 0 };

    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, error: error.message, data: 0 };
    }
  }

  static async markNotificationAsRead(notificationId) {
    // ✅ Updated: Updates "read" column
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true }) // ✅ Matched DB Column
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };

    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  static async markAllNotificationsAsRead() {
    // ✅ Updated: Updates "read" column
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true }) // ✅ Matched DB Column
        .eq('user_id', user.id)
        .eq('read', false);     // ✅ Matched DB Column

      if (error) throw error;
      return { success: true };

    } catch (error) {
      console.error('Error marking all as read:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== GAMIFICATION ====================

  static async getUserBadges(centerId) {
    if (!centerId || centerId === 'undefined') return { success: false, data: [] };

    try {
      const response = await fetch(`${API_BASE_URL}/phase2/gamification/badges/${centerId}`, {
        method: 'GET',
        headers: await this.getHeaders(),
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
          headers: await this.getHeaders(),
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
          headers: await this.getHeaders(),
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
        headers: await this.getHeaders(),
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