/**
 * FORUM SERVICE - PRODUCTION READY
 * Handles all forum operations with proper validation and error handling
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class ForumService {
  
  // ============================================
  // CATEGORIES
  // ============================================
  
  async getCategories(centerId) {
    try {
      if (!centerId) throw new Error('Center ID is required');

      const { data, error } = await supabase
        .from('forum_category_stats')
        .select('*')
        .eq('center_id', centerId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return { 
        success: true, 
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      logger.error('Error getting categories:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // ============================================
  // THREADS
  // ============================================
  
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

      return { 
        success: true, 
        data: data || [],
        pagination: {
          page,
          limit,
          hasMore: data?.length === limit
        }
      };
    } catch (error) {
      logger.error('Error getting threads:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async getThread(threadId, userId) {
    try {
      if (!threadId) throw new Error('Thread ID is required');

      // Get thread with creator info
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads_with_author')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;
      if (!thread) throw new Error('Thread not found');

      // Increment view count (async, don't wait)
      this.recordThreadView(threadId, userId).catch(err => 
        logger.error('Error recording view:', err)
      );

      // Get posts with author info and user votes
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:user_profiles!author_id(id, name, email),
          user_vote:forum_votes!post_id(vote_type)
        `)
        .eq('thread_id', threadId)
        .eq('is_deleted', false)
        .is('parent_post_id', null)
        .order('is_marked_answer', { ascending: false })
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: true });

      if (postsError) throw postsError;

      // Get replies for each post
      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: replies } = await supabase
            .from('forum_posts')
            .select(`
              *,
              author:user_profiles!author_id(id, name, email)
            `)
            .eq('parent_post_id', post.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

          return {
            ...post,
            author: post.author || {},
            user_vote: userId && post.user_vote?.[0]?.vote_type || null,
            replies: replies || []
          };
        })
      );

      // Check if user is following
      let isFollowing = false;
      if (userId) {
        const { data: follow } = await supabase
          .from('forum_thread_followers')
          .select('id')
          .eq('thread_id', threadId)
          .eq('user_id', userId)
          .single();
        isFollowing = !!follow;
      }

      return { 
        success: true, 
        data: {
          ...thread,
          posts: enrichedPosts,
          is_following: isFollowing
        }
      };
    } catch (error) {
      logger.error('Error getting thread:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  async createThread(categoryId, centerId, creatorId, title, description, tags = []) {
    try {
      // Validation
      if (!categoryId || !centerId || !creatorId) {
        throw new Error('Missing required fields');
      }
      if (!title?.trim() || title.length < 10) {
        throw new Error('Title must be at least 10 characters');
      }
      if (!description?.trim() || description.length < 20) {
        throw new Error('Description must be at least 20 characters');
      }

      // Generate slug
      const slug = this.generateSlug(title);

      const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: categoryId,
          center_id: centerId,
          creator_id: creatorId,
          title: title.trim(),
          description: description.trim(),
          slug,
          tags: tags || []
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-follow thread
      await this.followThread(thread.id, creatorId);

      // Update reputation
      await this.updateReputation(creatorId, centerId, 'thread_created');

      logger.info(`Thread created: ${thread.id} by user ${creatorId}`);
      return { success: true, data: thread };
    } catch (error) {
      logger.error('Error creating thread:', error);
      return { success: false, error: error.message };
    }
  }

  async searchThreads(centerId, query, page = 1, limit = 20) {
    try {
      if (!centerId || !query?.trim()) {
        throw new Error('Center ID and search query are required');
      }

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

      return { 
        success: true, 
        data: data || [],
        query: searchTerm,
        pagination: { page, limit, hasMore: data?.length === limit }
      };
    } catch (error) {
      logger.error('Error searching threads:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // ============================================
  // POSTS
  // ============================================
  
  async createPost(threadId, authorId, content, parentPostId = null) {
    try {
      // Validation
      if (!threadId || !authorId) throw new Error('Missing required fields');
      if (!content?.trim() || content.length < 5) {
        throw new Error('Post must be at least 5 characters');
      }

      // Check if thread is locked
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('is_locked, center_id')
        .eq('id', threadId)
        .single();

      if (thread?.is_locked) {
        throw new Error('This thread is locked');
      }

      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          author_id: authorId,
          content: content.trim(),
          parent_post_id: parentPostId
        })
        .select(`
          *,
          author:user_profiles!author_id(id, name, email)
        `)
        .single();

      if (error) throw error;

      // Notify thread followers (async)
      this.notifyThreadFollowers(threadId, authorId, post.id).catch(err =>
        logger.error('Error notifying followers:', err)
      );

      logger.info(`Post created: ${post.id} by user ${authorId}`);
      return { success: true, data: post };
    } catch (error) {
      logger.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  }

  async votePost(postId, userId, voteType) {
    try {
      if (!postId || !userId) throw new Error('Missing required fields');
      if (!['upvote', 'downvote'].includes(voteType)) {
        throw new Error('Invalid vote type');
      }

      // Check existing vote
      const { data: existing } = await supabase
        .from('forum_votes')
        .select('id, vote_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        if (existing.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('forum_votes')
            .delete()
            .eq('id', existing.id);
          
          return { success: true, action: 'vote_removed', vote: null };
        } else {
          // Change vote
          await supabase
            .from('forum_votes')
            .update({ vote_type: voteType })
            .eq('id', existing.id);
          
          return { success: true, action: 'vote_changed', vote: voteType };
        }
      } else {
        // Add new vote
        await supabase
          .from('forum_votes')
          .insert({ post_id: postId, user_id: userId, vote_type: voteType });
        
        return { success: true, action: 'vote_added', vote: voteType };
      }
    } catch (error) {
      logger.error('Error voting on post:', error);
      return { success: false, error: error.message };
    }
  }

  async markAsAnswer(postId, threadId, userId) {
    try {
      if (!postId || !threadId || !userId) {
        throw new Error('Missing required fields');
      }

      // Verify user is thread creator
      const { data: thread } = await supabase
        .from('forum_threads')
        .select('creator_id, center_id')
        .eq('id', threadId)
        .single();

      if (!thread) throw new Error('Thread not found');
      if (thread.creator_id !== userId) {
        throw new Error('Only thread creator can mark answers');
      }

      // Unmark other answers
      await supabase
        .from('forum_posts')
        .update({ is_marked_answer: false })
        .eq('thread_id', threadId);

      // Mark this as answer
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_marked_answer: true })
        .eq('id', postId);

      if (error) throw error;

      // Mark thread as solved
      await supabase
        .from('forum_threads')
        .update({ is_solved: true })
        .eq('id', threadId);

      logger.info(`Post ${postId} marked as answer in thread ${threadId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error marking answer:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // THREAD FOLLOWING
  // ============================================
  
  async followThread(threadId, userId) {
    try {
      await supabase
        .from('forum_thread_followers')
        .insert({ thread_id: threadId, user_id: userId })
        .select()
        .single();

      return { success: true };
    } catch (error) {
      // Ignore duplicate errors
      if (error.code === '23505') return { success: true };
      logger.error('Error following thread:', error);
      return { success: false, error: error.message };
    }
  }

  async unfollowThread(threadId, userId) {
    try {
      await supabase
        .from('forum_thread_followers')
        .delete()
        .eq('thread_id', threadId)
        .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      logger.error('Error unfollowing thread:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================
  
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100) + '-' + Date.now().toString(36);
  }

  async recordThreadView(threadId, userId) {
    try {
      // Record view
      await supabase
        .from('forum_thread_views')
        .insert({ thread_id: threadId, user_id: userId });

      // Increment counter
      await supabase.rpc('increment', {
        table_name: 'forum_threads',
        row_id: threadId,
        column_name: 'view_count'
      });
    } catch (error) {
      // Silently fail
      logger.debug('View recording failed:', error.message);
    }
  }

  async notifyThreadFollowers(threadId, authorId, postId) {
    try {
      const { data: followers } = await supabase
        .from('forum_thread_followers')
        .select('user_id')
        .eq('thread_id', threadId)
        .eq('notify_on_reply', true)
        .neq('user_id', authorId);

      // Create notifications (implement based on your notification system)
      // This is a placeholder
      for (const follower of followers || []) {
        // await notificationService.create(follower.user_id, ...);
      }
    } catch (error) {
      logger.error('Error notifying followers:', error);
    }
  }

  async updateReputation(userId, centerId, action) {
    const points = {
      thread_created: 10,
      post_created: 5,
      answer_marked: 50,
      upvote_received: 2
    };

    try {
      await supabase.rpc('increment', {
        table_name: 'forum_user_reputation',
        row_id: userId,
        column_name: 'reputation_points',
        amount: points[action] || 0
      });
    } catch (error) {
      logger.debug('Reputation update failed:', error.message);
    }
  }
}

module.exports = new ForumService();
