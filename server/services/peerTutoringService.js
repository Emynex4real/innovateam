/**
 * Peer Tutoring Service - Handle tutoring marketplace and sessions
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
        .select(`
          *,
          tutor:user_profiles!user_id(id, full_name, avatar_url),
          subjects:tutor_subjects(subject),
          rating:tutor_reviews(rating),
          review_count:tutor_reviews(count)
        `)
        .eq('center_id', centerId)
        .eq('is_active', true);

      if (subject) {
        query = query.contains('subjects', [subject]);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Format data
      const tutors = data?.map(tutor => ({
        id: tutor.user_id,
        name: tutor.tutor?.full_name || 'Unknown',
        avatar: tutor.tutor?.avatar_url,
        bio: tutor.bio,
        hourly_rate: tutor.hourly_rate,
        experience_years: tutor.experience_years,
        subjects: tutor.subjects?.map(s => s.subject) || [],
        rating: tutor.rating?.[0]?.rating || 0,
        review_count: tutor.review_count?.[0]?.count || 0
      })) || [];

      return { success: true, data: tutors };
    } catch (error) {
      logger.error('Error getting tutors:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get tutor profile
  async getTutorProfile(tutorId) {
    try {
      const { data: profile, error } = await supabase
        .from('tutor_profiles')
        .select(`
          *,
          tutor:user_profiles!user_id(id, full_name, avatar_url),
          subjects:tutor_subjects(subject),
          reviews:tutor_reviews(
            id, rating, feedback, created_at,
            student:user_profiles!student_id(full_name)
          )
        `)
        .eq('user_id', tutorId)
        .single();

      if (error) throw error;

      const formattedProfile = {
        ...profile,
        name: profile.tutor?.full_name,
        avatar: profile.tutor?.avatar_url,
        subjects: profile.subjects?.map(s => s.subject) || [],
        reviews: profile.reviews || []
      };

      return { success: true, data: formattedProfile };
    } catch (error) {
      logger.error('Error getting tutor profile:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  // Create tutor profile
  async createTutorProfile(userId, centerId, bio, hourlyRate, subjects, experienceYears, certificationUrl = null) {
    try {
      const { data: profile, error } = await supabase
        .from('tutor_profiles')
        .insert({
          user_id: userId,
          center_id: centerId,
          bio,
          hourly_rate: hourlyRate,
          experience_years: experienceYears,
          certification_url: certificationUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Add subjects
      if (subjects && subjects.length > 0) {
        const subjectInserts = subjects.map(subject => ({
          tutor_id: userId,
          subject
        }));

        await supabase
          .from('tutor_subjects')
          .insert(subjectInserts);
      }

      logger.info(`Tutor profile created: ${userId}`);
      return { success: true, data: profile };
    } catch (error) {
      logger.error('Error creating tutor profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Request tutoring
  async requestTutoring(studentId, tutorId, centerId, subject, topic, description, preferredStartDate, preferredTimeSlots, estimatedHours) {
    try {
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
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for tutor
      await supabase
        .from('notifications')
        .insert({
          user_id: tutorId,
          type: 'tutoring_request',
          title: 'New Tutoring Request',
          content: `You have a new tutoring request for ${subject}`,
          action_url: `/tutoring/requests/${request.id}`
        });

      logger.info(`Tutoring request created: ${request.id}`);
      return { success: true, data: request };
    } catch (error) {
      logger.error('Error requesting tutoring:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept tutoring request
  async acceptTutoringRequest(requestId, tutorId) {
    try {
      const { data: request, error } = await supabase
        .from('tutoring_requests')
        .update({ 
          status: 'accepted',
          accepted_at: new Date()
        })
        .eq('id', requestId)
        .eq('tutor_id', tutorId)
        .select()
        .single();

      if (error) throw error;

      // Notify student
      await supabase
        .from('notifications')
        .insert({
          user_id: request.student_id,
          type: 'tutoring_accepted',
          title: 'Tutoring Request Accepted',
          content: 'Your tutoring request has been accepted!',
          action_url: `/tutoring/sessions`
        });

      logger.info(`Tutoring request accepted: ${requestId}`);
      return { success: true, data: request };
    } catch (error) {
      logger.error('Error accepting request:', error);
      return { success: false, error: error.message };
    }
  }

  // Decline tutoring request
  async declineTutoringRequest(requestId, tutorId) {
    try {
      const { data: request, error } = await supabase
        .from('tutoring_requests')
        .update({ 
          status: 'declined',
          declined_at: new Date()
        })
        .eq('id', requestId)
        .eq('tutor_id', tutorId)
        .select()
        .single();

      if (error) throw error;

      // Notify student
      await supabase
        .from('notifications')
        .insert({
          user_id: request.student_id,
          type: 'tutoring_declined',
          title: 'Tutoring Request Declined',
          content: 'Your tutoring request was declined.',
          action_url: `/tutoring/marketplace`
        });

      logger.info(`Tutoring request declined: ${requestId}`);
      return { success: true, data: request };
    } catch (error) {
      logger.error('Error declining request:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule session
  async scheduleSession(requestId, scheduledAt, meetingLink = null) {
    try {
      const { data: session, error } = await supabase
        .from('tutoring_sessions')
        .insert({
          request_id: requestId,
          scheduled_at: scheduledAt,
          meeting_link: meetingLink,
          status: 'scheduled'
        })
        .select(`
          *,
          request:tutoring_requests(student_id, tutor_id, subject)
        `)
        .single();

      if (error) throw error;

      // Notify both parties
      const notifications = [
        {
          user_id: session.request.student_id,
          type: 'session_scheduled',
          title: 'Session Scheduled',
          content: `Your ${session.request.subject} session is scheduled`,
          action_url: `/tutoring/sessions/${session.id}`
        },
        {
          user_id: session.request.tutor_id,
          type: 'session_scheduled',
          title: 'Session Scheduled',
          content: `Your tutoring session is scheduled`,
          action_url: `/tutoring/sessions/${session.id}`
        }
      ];

      await supabase
        .from('notifications')
        .insert(notifications);

      logger.info(`Session scheduled: ${session.id}`);
      return { success: true, data: session };
    } catch (error) {
      logger.error('Error scheduling session:', error);
      return { success: false, error: error.message };
    }
  }

  // Complete session
  async completeSession(sessionId, userId, rating, feedback) {
    try {
      const { data: session, error } = await supabase
        .from('tutoring_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date()
        })
        .eq('id', sessionId)
        .select(`
          *,
          request:tutoring_requests(student_id, tutor_id)
        `)
        .single();

      if (error) throw error;

      // Add review if provided
      if (rating && feedback) {
        await supabase
          .from('tutor_reviews')
          .insert({
            tutor_id: session.request.tutor_id,
            student_id: session.request.student_id,
            session_id: sessionId,
            rating,
            feedback
          });
      }

      logger.info(`Session completed: ${sessionId}`);
      return { success: true, data: session };
    } catch (error) {
      logger.error('Error completing session:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student sessions
  async getStudentSessions(studentId) {
    try {
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .select(`
          *,
          request:tutoring_requests(
            subject, topic, description,
            tutor:user_profiles!tutor_id(full_name, avatar_url)
          )
        `)
        .eq('request.student_id', studentId)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error getting student sessions:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

module.exports = new PeerTutoringService();