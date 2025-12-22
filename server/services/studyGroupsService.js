/**
 * Study Groups Service - Handle collaborative learning groups
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class StudyGroupsService {
  // Get study groups for center
  async getGroups(centerId, userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:user_profiles!creator_id(id, full_name, avatar_url),
          member_count:study_group_members(count)
        `)
        .eq('center_id', centerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error getting study groups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get user's study groups
  async getUserGroups(userId) {
    try {
      const { data, error } = await supabase
        .from('study_group_members')
        .select(`
          study_groups(
            *,
            creator:user_profiles!creator_id(id, full_name, avatar_url),
            member_count:study_group_members(count)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      const groups = data?.map(item => item.study_groups).filter(Boolean) || [];
      return { success: true, data: groups };
    } catch (error) {
      logger.error('Error getting user groups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get group detail with posts
  async getGroupDetail(groupId, userId) {
    try {
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:user_profiles!creator_id(id, full_name, avatar_url)
        `)
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get posts
      const { data: posts, error: postsError } = await supabase
        .from('study_group_posts')
        .select(`
          *,
          author:user_profiles!author_id(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      return { success: true, data: { ...group, posts: posts || [] } };
    } catch (error) {
      logger.error('Error getting group detail:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  // Create study group
  async createGroup(centerId, creatorId, name, description, topic, subject, imageUrl = null) {
    try {
      const { data: group, error } = await supabase
        .from('study_groups')
        .insert({
          center_id: centerId,
          creator_id: creatorId,
          name,
          description,
          topic,
          subject,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator
      await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: creatorId,
          role: 'admin'
        });

      logger.info(`Study group created: ${group.id}`);
      return { success: true, data: group };
    } catch (error) {
      logger.error('Error creating study group:', error);
      return { success: false, error: error.message };
    }
  }

  // Join group
  async joinGroup(groupId, userId) {
    try {
      // Check if already member
      const { data: existing } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return { success: false, error: 'Already a member of this group' };
      }

      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      logger.info(`User ${userId} joined group ${groupId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error joining group:', error);
      return { success: false, error: error.message };
    }
  }

  // Leave group
  async leaveGroup(groupId, userId) {
    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      logger.info(`User ${userId} left group ${groupId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error leaving group:', error);
      return { success: false, error: error.message };
    }
  }

  // Post in group
  async postInGroup(groupId, authorId, content, attachmentUrl = null, resourceType = 'discussion') {
    try {
      const { data: post, error } = await supabase
        .from('study_group_posts')
        .insert({
          group_id: groupId,
          author_id: authorId,
          content,
          attachment_url: attachmentUrl,
          resource_type: resourceType
        })
        .select(`
          *,
          author:user_profiles!author_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      logger.info(`Post created in group ${groupId}: ${post.id}`);
      return { success: true, data: post };
    } catch (error) {
      logger.error('Error posting in group:', error);
      return { success: false, error: error.message };
    }
  }

  // Search groups
  async searchGroups(centerId, query, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:user_profiles!creator_id(id, full_name, avatar_url),
          member_count:study_group_members(count)
        `)
        .eq('center_id', centerId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error searching groups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

module.exports = new StudyGroupsService();