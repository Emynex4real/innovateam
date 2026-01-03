/**
 * Study Groups Service - Handle collaborative learning groups
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const notificationHelper = require('./notificationHelper');

class StudyGroupsService {
  
  // 1. Get study groups for center (Explore Tab)
  async getGroups(centerId, userId, page = 1, limit = 20) {
    try {
      console.log('🔍 getGroups called with:', { centerId, userId, page, limit });
      const offset = (page - 1) * limit;

      let query = supabase
        .from('study_groups')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Only filter by center_id if it's provided and not null
      if (centerId && centerId !== 'null' && centerId !== 'undefined') {
        console.log('🔍 Filtering by center_id:', centerId);
        query = query.eq('center_id', centerId);
      } else {
        console.log('🔍 No center_id filter - fetching all groups');
      }

      const { data, error, count } = await query;

      if (error) {
        console.log('❌ Query error:', error);
        throw error;
      }

      console.log('🔍 Query returned', data?.length, 'groups');

      // Manually fetch creator info and member counts
      const enrichedGroups = await Promise.all(
        (data || []).map(async (group) => {
          const { data: creator } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', group.creator_id)
            .single();

          const { count: memberCount } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            creator,
            members: [{ count: memberCount }]
          };
        })
      );

      console.log('✅ Returning', enrichedGroups.length, 'enriched groups');

      return { 
        success: true, 
        data: enrichedGroups,
        meta: { total: count, page, limit }
      };
    } catch (error) {
      console.log('❌ Error in getGroups:', error);
      logger.error('Error getting study groups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // 2. Get user's study groups (My Groups Tab)
  async getUserGroups(userId) {
    try {
      console.log('🔍 getUserGroups called for userId:', userId);
      
      // Step A: Get IDs of groups the user has joined
      const { data: memberships, error: memberError } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (memberError) {
        console.log('❌ Error fetching memberships:', memberError);
        throw memberError;
      }

      console.log('🔍 Memberships found:', memberships);

      if (!memberships || memberships.length === 0) {
        console.log('⚠️ No memberships found');
        return { success: true, data: [] };
      }

      const groupIds = memberships.map(m => m.group_id);
      console.log('🔍 Group IDs:', groupIds);

      // Step B: Fetch the full group details for those IDs
      const { data: groups, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      if (groupError) {
        console.log('❌ Error fetching groups:', groupError);
        throw groupError;
      }

      console.log('🔍 Groups fetched:', groups);

      // Step C: Manually fetch creator info and member counts
      const enrichedGroups = await Promise.all(
        (groups || []).map(async (group) => {
          const { data: creator } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', group.creator_id)
            .single();

          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            creator,
            members: [{ count }]
          };
        })
      );

      console.log('✅ Enriched groups:', enrichedGroups);

      return { success: true, data: enrichedGroups };
    } catch (error) {
      console.log('❌ Error in getUserGroups:', error);
      logger.error('Error getting user groups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // 3. Get group detail with posts
  async getGroupDetail(groupId, userId) {
    try {
      // Fetch Group Data
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (groupError) throw groupError;
      if (!group) return { success: false, error: 'Group not found', data: null };

      // Fetch creator info
      const { data: creator } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .eq('id', group.creator_id)
        .maybeSingle();

      // Fetch Posts with author info
      const { data: posts, error: postsError } = await supabase
        .from('study_group_posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Enrich posts with author info
      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: author } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', post.author_id)
            .maybeSingle();
          return { ...post, author };
        })
      );

      // Check Membership Status
      const { data: membership } = await supabase
        .from('study_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();

      // Get Member Count and List
      const { data: membersList } = await supabase
        .from('study_group_members')
        .select('user_id, role, joined_at')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })
        .limit(10);

      // Fetch member profiles
      const members = await Promise.all(
        (membersList || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', member.user_id)
            .maybeSingle();
          return { ...member, profile };
        })
      );

      const { count } = await supabase
        .from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      return { 
        success: true, 
        data: { 
          ...group,
          creator,
          posts: enrichedPosts,
          members,
          memberCount: count || 0,
          isJoined: !!membership,
          userRole: membership?.role || null
        } 
      };
    } catch (error) {
      logger.error('Error getting group detail:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  // 4. Create study group
  async createGroup(centerId, creatorId, name, description, topic, subject, imageUrl = null) {
    try {
      console.log('🔵 StudyGroupsService.createGroup called with:', {
        centerId, creatorId, name, description, topic, subject, imageUrl
      });
      
      // Insert Group
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
          // removed is_active to rely on DB default or null
        })
        .select()
        .single();

      if (error) {
        console.log('❌ Error inserting group:', error);
        throw error;
      }

      console.log('✅ Group created:', group);

      // Auto-join creator as admin
      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: creatorId,
          role: 'admin'
        });

      if (memberError) {
        console.log('⚠️ Group created but creator auto-join failed:', memberError);
        logger.warn('Group created but creator auto-join failed:', memberError);
      } else {
        console.log('✅ Creator auto-joined as admin');
      }

      logger.info(`Study group created: ${group.id}`);
      return { success: true, data: group };
    } catch (error) {
      console.log('❌ Error in createGroup:', error);
      logger.error('Error creating study group:', error);
      return { success: false, error: error.message };
    }
  }

  // 5. Join group
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
        return { success: false, error: 'Already a member' };
      }

      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      // Get group name for notification
      const { data: group } = await supabase
        .from('study_groups')
        .select('name')
        .eq('id', groupId)
        .single();

      // Notify group creator
      await notificationHelper.notifyGroupJoin(groupId, userId, group?.name || 'Study Group');

      logger.info(`User ${userId} joined group ${groupId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error joining group:', error);
      return { success: false, error: error.message };
    }
  }

  // 6. Leave group
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

  // 7. Post in group
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
        .select('*')
        .single();

      if (error) throw error;

      // Fetch author info separately
      const { data: author } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .eq('id', authorId)
        .single();

      // Get group name for notification
      const { data: group } = await supabase
        .from('study_groups')
        .select('name')
        .eq('id', groupId)
        .single();

      // Notify all group members about new post
      await notificationHelper.notifyGroupPost(groupId, authorId, group?.name || 'Study Group', content);

      logger.info(`Post created in group ${groupId}: ${post.id}`);
      return { success: true, data: { ...post, author } };
    } catch (error) {
      logger.error('Error posting in group:', error);
      return { success: false, error: error.message };
    }
  }

  // 8. Search groups
  async searchGroups(centerId, query, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('center_id', centerId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,subject.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Manually fetch creator info and member counts
      const enrichedGroups = await Promise.all(
        (data || []).map(async (group) => {
          const { data: creator } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('id', group.creator_id)
            .single();

          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            creator,
            members: [{ count }]
          };
        })
      );

      return { success: true, data: enrichedGroups };
    } catch (error) {
      logger.error('Error searching groups:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // 9. Delete group
  async deleteGroup(groupId, userId) {
    try {
      // Check if user is the creator
      const { data: group, error: fetchError } = await supabase
        .from('study_groups')
        .select('creator_id')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      if (group.creator_id !== userId) {
        return { success: false, error: 'Only the creator can delete this group' };
      }

      // Delete group (cascade will handle members and posts)
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      logger.info(`Group ${groupId} deleted by user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting group:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StudyGroupsService();