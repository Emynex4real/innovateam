const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

const collaborationService = {
  // ==========================================
  // STUDY GROUPS
  // ==========================================

  // 1. Create Study Group
  async createStudyGroup(userId, data) {
    try {
      if (!data.name || !data.subject) {
        throw new Error("Name and Subject are required");
      }

      const insertData = {
        created_by: userId,
        name: data.name,
        description: data.description,
        subject: data.subject,
        center_id: data.centerId || null, 
        ...(data.topic && { topic: data.topic }),
        ...(data.imageUrl && { image_url: data.imageUrl }) 
      };

      const { data: group, error } = await supabase
        .from('study_groups')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase.from('study_group_members').insert({
        group_id: group.id,
        user_id: userId,
        role: 'admin'
      });

      return { success: true, group };
    } catch (error) {
      logger.error('Error creating study group:', error);
      return { success: false, error: error.message };
    }
  },

  // 2. Get Study Groups (Explore)
  async getStudyGroups(centerId, filters = {}) {
    try {
      let query = supabase
        .from('study_groups')
        .select(`
          *,
          members:study_group_members(count),
          creator:user_profiles!created_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (centerId && centerId !== 'undefined') {
        query = query.eq('center_id', centerId);
      }

      if (filters.q) {
        query = query.ilike('name', `%${filters.q}%`);
      }

      const { data: groups, error } = await query;

      if (error) throw error;

      return { success: true, data: groups };
    } catch (error) {
      logger.error('Get study groups error:', error);
      return { success: false, error: error.message };
    }
  },

  // 3. Get User's Joined Groups (My Groups) - ✅ ADDED THIS
  async getUserStudyGroups(userId) {
    try {
      // 1. Get IDs of groups the user is in
      const { data: memberships, error: memberError } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        return { success: true, data: [] };
      }

      const groupIds = memberships.map(m => m.group_id);

      // 2. Fetch the actual group details
      const { data: groups, error: groupError } = await supabase
        .from('study_groups')
        .select(`
          *,
          members:study_group_members(count),
          creator:user_profiles!created_by(full_name)
        `)
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      if (groupError) throw groupError;

      return { success: true, data: groups };
    } catch (error) {
      logger.error('Get user study groups error:', error);
      return { success: false, error: error.message };
    }
  },

  // 4. Join Group
  async joinGroup(userId, groupId) {
    try {
      const { data: existing } = await supabase
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (existing) return { success: false, error: 'Already a member' };

      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      logger.error('Join group error:', error);
      return { success: false, error: error.message };
    }
  },

  // 5. Get Group Details
  async getGroupDetail(groupId) {
    try {
      const { data: group, error } = await supabase
        .from('study_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;

      const { data: posts } = await supabase
        .from('study_group_posts')
        .select(`*, author:user_profiles(full_name, avatar_url)`)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      const { count } = await supabase
        .from('study_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      return { success: true, group: { ...group, posts: posts || [], memberCount: count } };
    } catch (error) {
      logger.error('Get group detail error:', error);
      return { success: false, error: error.message };
    }
  },

  // 6. Create Group Post
  async createGroupPost(userId, groupId, content) {
    try {
      const { data, error } = await supabase
        .from('study_group_posts')
        .insert({
          group_id: groupId,
          user_id: userId,
          content
        })
        .select(`*, author:user_profiles(full_name, avatar_url)`)
        .single();

      if (error) throw error;
      return { success: true, post: data };
    } catch (error) {
      logger.error('Create group post error:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = collaborationService;