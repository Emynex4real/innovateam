/**
 * Study Groups Service - Handle collaborative learning groups
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class StudyGroupsService {
  // Get all groups for center
  async getGroups(centerId, userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      // Get public groups
      const { data: groups, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('center_id', centerId)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Enrich with member info and check if user is member
      const enrichedGroups = await Promise.all(
        groups.map(async (group) => {
          const { data: creator } = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .eq('id', group.creator_id)
            .single();

          const { data: isMember } = await supabase
            .from('study_group_members')
            .select('id')
            .eq('group_id', group.id)
            .eq('user_id', userId)
            .single();

          return {
            ...group,
            creator,
            is_member: !!isMember
          };
        })
      );

      return { success: true, groups: enrichedGroups };
    } catch (error) {
      logger.error('Error getting groups:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's groups
  async getUserGroups(userId) {
    try {
      const { data: memberships } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', userId);

      const groupIds = memberships.map(m => m.group_id);

      if (groupIds.length === 0) {
        return { success: true, groups: [] };
      }

      const { data: groups, error } = await supabase
        .from('study_groups')
        .select('*')
        .in('id', groupIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return { success: true, groups };
    } catch (error) {
      logger.error('Error getting user groups:', error);
      return { success: false, error: error.message };
    }
  }

  // Get group detail
  async getGroupDetail(groupId, userId) {
    try {
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Get creator
      const { data: creator } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .eq('id', group.creator_id)
        .single();

      // Get members
      const { data: memberships } = await supabase
        .from('study_group_members')
        .select('user_id, role, contribution_score')
        .eq('group_id', groupId);

      const { data: members } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', memberships.map(m => m.user_id));

      const enrichedMembers = memberships.map(m => ({
        ...members.find(mb => mb.id === m.user_id),
        role: m.role,
        contribution_score: m.contribution_score
      }));

      // Get posts
      const { data: posts } = await supabase
        .from('study_group_posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Check if user is member
      const { data: isMember } = await supabase
        .from('study_group_members')
        .select('id, role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      return {
        success: true,
        group: { ...group, creator },
        members: enrichedMembers,
        posts: posts || [],
        is_member: !!isMember,
        user_role: isMember?.role
      };
    } catch (error) {
      logger.error('Error getting group detail:', error);
      return { success: false, error: error.message };
    }
  }

  // Create group
  async createGroup(centerId, creatorId, name, description, topic, subject, imageUrl = null) {
    try {
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .insert({
          center_id: centerId,
          creator_id: creatorId,
          name,
          description,
          topic,
          subject,
          image_url: imageUrl,
          member_count: 1
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: creatorId,
          role: 'admin'
        });

      if (memberError) throw memberError;

      logger.info(`Study group created: ${group.id}`);
      return { success: true, group };
    } catch (error) {
      logger.error('Error creating group:', error);
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

      // Add member
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      logger.info(`User joined group: ${groupId}`);
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

      logger.info(`User left group: ${groupId}`);
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
        .select()
        .single();

      if (error) throw error;

      // Get author info
      const { data: author } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .eq('id', authorId)
        .single();

      // Increment contribution score
      await supabase
        .from('study_group_members')
        .update({ contribution_score: supabase.raw('contribution_score + 1') })
        .eq('group_id', groupId)
        .eq('user_id', authorId);

      logger.info(`Post created in group: ${post.id}`);
      return { success: true, post: { ...post, author } };
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
        .select('*')
        .eq('center_id', centerId)
        .eq('is_public', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`)
        .order('member_count', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, groups: data };
    } catch (error) {
      logger.error('Error searching groups:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StudyGroupsService();
