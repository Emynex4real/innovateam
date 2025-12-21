/**
 * Peer Tutoring Service - Handle tutoring marketplace
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class PeerTutoringService {
  // Get available tutors
  async getTutors(centerId, subject = null, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('tutor_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1);

      if (subject) {
        query = query.contains('subjects', [subject]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with user info
      const enrichedTutors = await Promise.all(
        data.map(async (tutor) => {
          const { data: user } = await supabase
            .from('user_profiles')
            .select('id, name, email, avatar_url')
            .eq('id', tutor.tutor_id)
            .single();

          return { ...tutor, user };
        })
      );

      return { success: true, tutors: enrichedTutors };
    } catch (error) {
      logger.error('Error getting tutors:', error);
      return { success: false, error: error.message };
    }
  }

  // Get tutor profile
  async getTutorProfile(tutorId) {
    try {
      const { data: profile, error } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('tutor_id', tutorId)
        .single();

      if (error) throw error;

      // Get user info
      const { data: user } = await supabase
        .from('user_profiles')
        .select('id, name, email, avatar_url')
        .eq('id', tutorId)
        .single();

      // Get reviews
      const { data: reviews } = await supabase
        .from('tutor_reviews')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        success: true,
        profile: { ...profile, user },
        reviews
      };
    } catch (error) {
      logger.error('Error getting tutor profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Create tutor profile
  async createTutorProfile(tutorId, centerId, bio, hourlyRate, subjects, experienceYears, certificationUrl) {
    try {
      const { data: profile, error } = await supabase
        .from('tutor_profiles')
        .insert({
          tutor_id: tutorId,
          center_id: centerId,
          bio,
          hourly_rate: hourlyRate,
          subjects,
          experience_years: experienceYears,
          certification_url: certificationUrl
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Tutor profile created: ${profile.id}`);
      return { success: true, profile };
    } catch (error) {
      logger.error('Error creating tutor profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Request tutoring session
  async requestTutoring(studentId, tutorId, centerId, subject, topic, description, preferredStartDate, preferredTimeSlots, estimatedHours) {
    try {
      // Get tutor rate
      const { data: tutorProfile } = await supabase
        .from('tutor_profiles')
        .select('hourly_rate')
        .eq('tutor_id', tutorId)
        .single();

      const { data: request, error } = await supabase
        .from('tutoring_requests')
        .insert({
          student_id: studentId,
          tutor_id: tutorId,
          center_id: centerId,
          subject,
          topic,
          description,
          preferred_start_date: preferredStartDate,
          preferred_time_slots: preferredTimeSlots,
          estimated_hours: estimatedHours,
          hourly_rate: tutorProfile?.hourly_rate || 0
        })
        .select()
        .single();

      if (error) throw error;

      // Notify tutor
      const { data: student } = await supabase
        .from('user_profiles')
        .select('name')
        .eq('id', studentId)
        .single();

      await this.createNotification(
        tutorId,
        'tutoring',
        'New Tutoring Request',
        `${student.name} requested tutoring for ${subject}`,
        request.id,
        `/tutoring/requests/${request.id}`
      );

      logger.info(`Tutoring request created: ${request.id}`);
      return { success: true, request };
    } catch (error) {
      logger.error('Error requesting tutoring:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept tutoring request
  async acceptTutoringRequest(requestId, tutorId) {
    try {
      // Verify authorization
      const { data: request } = await supabase
        .from('tutoring_requests')
        .select('tutor_id')
        .eq('id', requestId)
        .single();

      if (request.tutor_id !== tutorId) {
        return { success: false, error: 'Not authorized' };
      }

      // Update request
      const { error } = await supabase
        .from('tutoring_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      logger.info(`Tutoring request accepted: ${requestId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error accepting request:', error);
      return { success: false, error: error.message };
    }
  }

  // Decline tutoring request
  async declineTutoringRequest(requestId, tutorId) {
    try {
      // Verify authorization
      const { data: request } = await supabase
        .from('tutoring_requests')
        .select('tutor_id')
        .eq('id', requestId)
        .single();

      if (request.tutor_id !== tutorId) {
        return { success: false, error: 'Not authorized' };
      }

      // Update request
      const { error } = await supabase
        .from('tutoring_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      logger.info(`Tutoring request declined: ${requestId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error declining request:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule session from request
  async scheduleSession(requestId, scheduledAt, meetingLink) {
    try {
      const { data: request } = await supabase
        .from('tutoring_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      const { data: session, error } = await supabase
        .from('tutoring_sessions')
        .insert({
          request_id: requestId,
          tutor_id: request.tutor_id,
          student_id: request.student_id,
          center_id: request.center_id,
          scheduled_at: scheduledAt,
          meeting_link: meetingLink
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Tutoring session scheduled: ${session.id}`);
      return { success: true, session };
    } catch (error) {
      logger.error('Error scheduling session:', error);
      return { success: false, error: error.message };
    }
  }

  // Complete session
  async completeSession(sessionId, studentId, rating, feedback) {
    try {
      // Update session
      const { error: sessionError } = await supabase
        .from('tutoring_sessions')
        .update({
          status: 'completed',
          completed_at: new Date(),
          student_rating: rating,
          student_feedback: feedback
        })
        .eq('id', sessionId)
        .eq('student_id', studentId);

      if (sessionError) throw sessionError;

      // Get session for review creation
      const { data: session } = await supabase
        .from('tutoring_sessions')
        .select('tutor_id, request_id')
        .eq('id', sessionId)
        .single();

      // Create review
      if (rating) {
        await supabase
          .from('tutor_reviews')
          .insert({
            tutor_id: session.tutor_id,
            session_id: sessionId,
            reviewer_id: studentId,
            rating: Math.round(rating),
            review_text: feedback
          });
      }

      logger.info(`Session completed: ${sessionId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error completing session:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student's tutoring sessions
  async getStudentSessions(studentId) {
    try {
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Enrich with tutor info
      const enrichedSessions = await Promise.all(
        data.map(async (session) => {
          const { data: tutor } = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .eq('id', session.tutor_id)
            .single();

          return { ...session, tutor };
        })
      );

      return { success: true, sessions: enrichedSessions };
    } catch (error) {
      logger.error('Error getting student sessions:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper: Create notification
  async createNotification(userId, type, title, description, relatedId, actionUrl) {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          description,
          related_id: relatedId,
          action_url: actionUrl
        });
    } catch (error) {
      logger.error('Error creating notification:', error);
    }
  }
}

module.exports = new PeerTutoringService();
