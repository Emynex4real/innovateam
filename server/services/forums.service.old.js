const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const cache = require('../utils/cache');

class ForumService {
  
  async getCategories(centerId) {
    try {
      if (!centerId) throw new Error('Center ID is required');
      const { data, error } = await supabase
        .from('forum_category_stats')
        .select('*')
        .eq('center_id', centerId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return { success: true, data: data || [], count: data?.length || 0 };
    } catch (error) {
      logger.error('Error getting categories:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getUserCenter(userId) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('center_id')
        .eq('id', userId)
        .single();
      if (profile && profile.center_id) {
        const { data: center } = await supabase
          .from('tutorial_centers')
          .select('id, name')
          .eq('id', profile.center_id)
          .single();
        return { success: true, data: center };
      }
      const { data: center } = await supabase
        .from('tutorial_centers')
        .select('id, name')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      return { success: true, data: center };
    } catch (error) {
      logger.error('Get user center error:', error);
      return { success: false, error: error.message };
    }
  }

  async getThreads(categoryId, page = 1, limit = 20) {
    try {
      if (!categoryId) throw new Error('Category ID is required');
      const offset = (page - 1) * limit;
      const { data, error } = await supabase
        .from('forum_threads_with_author')
        .select('*')
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data: data || [], pagination: { page, limit, hasMore: data?.length === limit } };
    } catch (error) {
      logger.error('Error getting threads:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getThread(threadId, userId) {
    try {
      if (!threadId) throw new Error('Thread ID is required');
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads_with_author')
        .select('*')
        .eq('id', threadId)
        .single();
      if (threadError) throw threadError;
      if (!thread) throw new Error('Thread not found');
      this.recordThreadView(threadId, userId).catch(() => {});
      const { data: allPosts, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('thread_id', threadId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      if (postsError) throw postsError;
      const authorIds = [...new Set(allPosts?.map(p => p.author_id) || [])];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', authorIds);
      const authorsMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = {
          id: profile.id,
          name: profile.full_name || profile.email?.split('@')[0] || 'Anonymous',
          email: profile.email,
          avatar_url: profile.avatar_url
        };
        return acc;
      }, {});
      let votesMap = {};
      if (userId) {
        const postIds = allPosts?.map(p => p.id) || [];
        const { data: votes } = await supabase
          .from('forum_votes')
          .select('post_id, vote_type')
          .in('post_id', postIds)
          .eq('user_id', userId);
        votesMap = (votes || []).reduce((acc, vote) => {
          acc[vote.post_id] = vote.vote_type;
          return acc;
        }, {});
      }
      const postsMap = {};
      const rootPosts = [];
      allPosts?.forEach(post => {
        const enrichedPost = {
          ...post,
          author: authorsMap[post.author_id] || {},
          user_vote: votesMap[post.id] || null,
          replies: []
        };
        postsMap[post.id] = enrichedPost;
        if (!post.parent_post_id) rootPosts.push(enrichedPost);
      });
      allPosts?.forEach(post => {
        if (post.parent_post_id && postsMap[post.parent_post_id]) {
          postsMap[post.parent_post_id].replies.push(postsMap[post.id]);
        }
      });
      rootPosts.sort((a, b) => {
        if (a.is_marked_answer !== b.is_marked_answer) return b.is_marked_answer ? 1 : -1;
        if (a.upvote_count !== b.upvote_count) return b.upvote_count - a.upvote_count;
        return new Date(a.created_at) - new Date(b.created_at);
      });
      let isFollowing = false;
      if (userId) {
        const { data: follow } = await supabase
          .from('forum_thread_followers')
          .select('id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .maybeSingle();
        isFollowing = !!follow;
      }
      return { success: true, data: { ...thread, posts: rootPosts, is_following: isFollowing } };
    } catch (error) {
      logger.error('Error getting thread:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  async createThread(categoryId, centerId, creatorId, title, description, tags = []) {
    try {
      if (!categoryId || !centerId || !creatorId) throw new Error('Missing required fields');
      const cleanTitle = (title || '').trim();
      const cleanDesc = (description || '').trim();
      if (cleanTitle.length < 10) throw new Error('Title must be at least 10 characters');
      if (cleanDesc.length < 20) throw new Error('Description must be at least 20 characters');
      
      const slug = this.generateSlug(cleanTitle);
      const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: categoryId,
          center_id: centerId,
          creator_id: creatorId,
          title: cleanTitle,
          description: cleanDesc,
          slug,
          tags: tags || []
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!thread) throw new Error('Failed to create thread');
      
      this.followThread(thread.id, creatorId).catch(() => {});
      this.updateReputation(creatorId, centerId, 'thread_created').catch(() => {});
      
      return { success: true, data: thread };
    } catch (error) {
      logger.error('Error creating thread:', error);
      return { success: false, error: error.message };
    }
  }

  async searchThreads(centerId, query, page = 1, limit = 20) {
    try {
      if (!centerId || !query?.trim()) throw new Error('Center ID and search query are required');
      const offset = (page - 1) * limit;
      const searchTerm = query.trim();
      const { data, error } = await supabase
        .from('forum_threads_with_author')
        .select('*')
        .eq('center_id', centerId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('last_activity_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return { success: true, data: data || [], query: searchTerm, pagination: { page, limit, hasMore: data?.length === limit } };
    } catch (error) {
      logger.error('Error searching threads:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async createPost(threadId, authorId, content, parentPostId = null) {
    try {
      if (!threadId || !authorId) throw new Error('Missing required fields');
      if (!content?.trim() || content.length < 5) throw new Error('Post must be at least 5 characters');
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('is_locked, center_id')
        .eq('id', threadId)
        .single();
      if (thread?.is_locked) throw new Error('This thread is locked');
      const result = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          author_id: authorId,
          content: content.trim(),
          parent_post_id: parentPostId
        })
        .select()
        .single();
      if (result?.error) throw result.error;
      if (!result?.data) throw new Error('Failed to create post');
      
      logger.info('Fetching profile for author:', authorId);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('full_name, email, avatar_url')
        .eq('id', authorId);
      
      const profile = profiles?.[0];
      logger.info('Profile result:', { profile });
      
      const enrichedPost = {
        ...result.data,
        author: {
          id: authorId,
          name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown User',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url
        },
        upvote_count: 0,
        downvote_count: 0,
        is_marked_answer: false,
        replies: []
      };
      cache.delete(`thread:${threadId}`);
      return { success: true, data: enrichedPost };
    } catch (error) {
      logger.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  }

  async votePost(postId, userId, voteType) {
    try {
      if (!postId || !userId) throw new Error('Missing required fields');
      if (!['upvote', 'downvote'].includes(voteType)) throw new Error('Invalid vote type');
      if (voteType === 'downvote') {
        const canDownvote = await this.checkXPRequirement(userId, 'downvote');
        if (!canDownvote) return { success: false, error: 'You need 50 XP to downvote posts' };
      }
      const withinLimit = await this.checkDailyLimit(userId);
      if (!withinLimit) return { success: false, error: 'Daily XP limit reached. Try again tomorrow.' };
      const { data: post } = await supabase
        .from('forum_posts')
        .select('author_id, thread_id')
        .eq('id', postId)
        .single();
      if (!post) throw new Error('Post not found');
      if (post.author_id === userId) return { success: false, error: 'Cannot vote on your own post' };
      const { data: existing } = await supabase
        .from('forum_votes')
        .select('id, vote_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      let action = null;
      let reputationChange = 0;
      if (existing) {
        if (existing.vote_type === voteType) {
          await supabase.from('forum_votes').delete().eq('id', existing.id);
          action = 'vote_removed';
          reputationChange = voteType === 'upvote' ? -10 : 5;
        } else {
          await supabase.from('forum_votes').update({ vote_type: voteType }).eq('id', existing.id);
          action = 'vote_changed';
          reputationChange = voteType === 'upvote' ? 20 : -20;
        }
      } else {
        await supabase.from('forum_votes').insert({ post_id: postId, user_id: userId, vote_type: voteType });
        action = 'vote_added';
        reputationChange = voteType === 'upvote' ? 10 : -5;
      }
      if (reputationChange !== 0) {
        await this.updateUserReputation(post.author_id, reputationChange);
        await this.logDailyXP(userId, Math.abs(reputationChange));
        await this.checkAndAwardBadges(post.author_id);
      }
      cache.delete(`thread:${post.thread_id}`);
      
      const { data: updatedRep } = await supabase
        .from('user_reputation')
        .select('total_xp, level')
        .eq('user_id', post.author_id)
        .single();
      
      return { 
        success: true, 
        action, 
        vote: action === 'vote_removed' ? null : voteType,
        xpGained: reputationChange > 0 ? reputationChange : 0,
        newXP: updatedRep?.total_xp || 0,
        newLevel: updatedRep?.level || 1
      };
    } catch (error) {
      logger.error('Error voting on post:', error);
      return { success: false, error: error.message };
    }
  }

  async markAsAnswer(postId, threadId, userId) {
    try {
      if (!postId || !threadId || !userId) throw new Error('Missing required fields');
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('creator_id, center_id')
        .eq('id', threadId)
        .single();
      if (!thread) throw new Error('Thread not found');
      if (thread.creator_id !== userId) throw new Error('Only thread creator can mark answers');
      
      const { data: post } = await supabase
        .from('forum_posts')
        .select('author_id')
        .eq('id', postId)
        .single();
      
      await supabase.from('forum_posts').update({ is_marked_answer: false }).eq('thread_id', threadId);
      const { error } = await supabase.from('forum_posts').update({ is_marked_answer: true }).eq('id', postId);
      if (error) throw error;
      await supabase.from('forum_threads').update({ is_solved: true }).eq('id', threadId);
      
      await this.updateUserReputation(post.author_id, 50);
      await this.checkAndAwardBadges(post.author_id);
      
      return { success: true, xpAwarded: 50 };
    } catch (error) {
      logger.error('Error marking answer:', error);
      return { success: false, error: error.message };
    }
  }

  async followThread(threadId, userId) {
    try {
      const { error } = await supabase
        .from('forum_thread_followers')
        .insert({ thread_id: threadId, user_id: userId });
      if (error && error.code !== '23505') throw error;
      return { success: true };
    } catch (error) {
      logger.error('Error following thread:', error);
      return { success: false, error: error.message };
    }
  }

  async unfollowThread(threadId, userId) {
    try {
      await supabase.from('forum_thread_followers').delete().eq('thread_id', threadId).eq('user_id', userId);
      return { success: true };
    } catch (error) {
      logger.error('Error unfollowing thread:', error);
      return { success: false, error: error.message };
    }
  }

  generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 100) + '-' + Date.now().toString(36);
  }

  async recordThreadView(threadId, userId) {
    try {
      await supabase.from('forum_thread_views').insert({ thread_id: threadId, user_id: userId });
      await supabase.rpc('increment', { table_name: 'forum_threads', row_id: threadId, column_name: 'view_count' });
    } catch (error) {
      logger.debug('View recording failed:', error.message);
    }
  }

  async updateReputation(userId, centerId, action) {
    const points = { thread_created: 10, post_created: 5, answer_marked: 50, upvote_received: 2 };
    try {
      await supabase.rpc('increment', { table_name: 'forum_user_reputation', row_id: userId, column_name: 'reputation_points', amount: points[action] || 0 });
    } catch (error) {
      logger.debug('Reputation update failed:', error.message);
    }
  }

  async updateUserReputation(userId, points) {
    try {
      const { data: existing } = await supabase.from('user_reputation').select('total_xp, level').eq('user_id', userId).single();
      const newXP = (existing?.total_xp || 0) + points;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (existing) {
        await supabase.from('user_reputation').update({ total_xp: newXP, level: newLevel, updated_at: new Date().toISOString() }).eq('user_id', userId);
      } else {
        await supabase.from('user_reputation').insert({ user_id: userId, total_xp: Math.max(0, newXP), level: newLevel });
      }
    } catch (error) {
      logger.error('Error updating reputation:', error);
    }
  }

  async checkXPRequirement(userId, action) {
    try {
      const { data: requirement } = await supabase.from('xp_requirements').select('min_xp_required').eq('action', action).single();
      if (!requirement) return true;
      const { data: reputation } = await supabase.from('user_reputation').select('total_xp').eq('user_id', userId).single();
      return (reputation?.total_xp || 0) >= requirement.min_xp_required;
    } catch {
      return true;
    }
  }

  async checkDailyLimit(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('daily_xp_log').select('xp_earned, actions_count').eq('user_id', userId).eq('date', today).single();
      return !data || (data.xp_earned < 200 && data.actions_count < 50);
    } catch {
      return true;
    }
  }

  async logDailyXP(userId, xp) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase.from('daily_xp_log').select('xp_earned, actions_count').eq('user_id', userId).eq('date', today).single();
      if (existing) {
        await supabase.from('daily_xp_log').update({ xp_earned: existing.xp_earned + xp, actions_count: existing.actions_count + 1 }).eq('user_id', userId).eq('date', today);
      } else {
        await supabase.from('daily_xp_log').insert({ user_id: userId, date: today, xp_earned: xp, actions_count: 1 });
      }
    } catch (error) {
      logger.error('Error logging daily XP:', error);
    }
  }

  async checkAndAwardBadges(userId) {
    try {
      const { data: reputation } = await supabase.from('user_reputation').select('total_xp').eq('user_id', userId).single();
      const xp = reputation?.total_xp || 0;
      const badges = [];
      if (xp >= 100) badges.push('helpful_100');
      if (xp >= 500) badges.push('expert_500');
      if (xp >= 1000) badges.push('master_1000');
      for (const badge of badges) {
        await supabase.from('user_badges').insert({ user_id: userId, badge_type: badge }).onConflict('user_id,badge_type').ignore();
      }
    } catch (error) {
      logger.debug('Badge check failed:', error.message);
    }
  }

  async getLeaderboard(limit = 20) {
    try {
      const { data, error } = await supabase.from('forum_leaderboard').select('*').limit(limit);
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getUserStats(userId) {
    try {
      const { data: rep } = await supabase
        .from('user_reputation')
        .select('total_xp, level')
        .eq('user_id', userId)
        .single();
      
      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);
      
      const { count: acceptedCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .eq('is_marked_answer', true);
      
      const { data: badges } = await supabase
        .from('user_badges')
        .select('badge_type')
        .eq('user_id', userId);
      
      const nextLevelXP = (rep?.level || 1) * 100;
      const progress = ((rep?.total_xp || 0) % 100) / 100;
      
      return {
        success: true,
        data: {
          xp: rep?.total_xp || 0,
          level: rep?.level || 1,
          nextLevelXP,
          progress,
          postsCount: postsCount || 0,
          acceptedAnswers: acceptedCount || 0,
          badges: badges || [],
          rank: await this.getUserRank(userId)
        }
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getUserRank(userId) {
    try {
      const { data: allUsers } = await supabase
        .from('user_reputation')
        .select('user_id, total_xp')
        .order('total_xp', { ascending: false });
      const rank = allUsers?.findIndex(u => u.user_id === userId) + 1;
      return rank || null;
    } catch {
      return null;
    }
  }

  async getUserBadges(userId) {
    try {
      const { data, error } = await supabase.from('user_badges').select('badge_type, earned_at').eq('user_id', userId).order('earned_at', { ascending: false });
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error getting badges:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
}

module.exports = new ForumService();
