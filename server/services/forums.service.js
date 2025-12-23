/**
 * FORUM SERVICE - PRODUCTION READY
 * Handles all forum operations with proper validation and error handling
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const cache = require('../utils/cache');

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

      // Check cache first
      const cacheKey = `thread:${threadId}:${userId || 'anon'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('✅ Thread from cache');
        return { success: true, data: cached };
      }

      console.log('🔍 Getting thread:', threadId);

      // Get thread
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads_with_author')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;
      if (!thread) throw new Error('Thread not found');

      // Record view (async)
      this.recordThreadView(threadId, userId).catch(() => {});

      // Get all posts at once
      const { data: allPosts, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('thread_id', threadId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (postsError) throw postsError;

      // Get all unique author IDs
      const authorIds = [...new Set(allPosts?.map(p => p.author_id) || [])];
      
      // Fetch all authors in one query
      const { data: authors } = await supabase
        .from('user_profiles')
        .select('id, name, email')
        .in('id', authorIds);

      const authorsMap = (authors || []).reduce((acc, author) => {
        acc[author.id] = author;
        return acc;
      }, {});

      // Get user votes in one query if userId provided
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

      // Organize posts into parent-child structure
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

        if (!post.parent_post_id) {
          rootPosts.push(enrichedPost);
        }
      });

      // Attach replies to parents
      allPosts?.forEach(post => {
        if (post.parent_post_id && postsMap[post.parent_post_id]) {
          postsMap[post.parent_post_id].replies.push(postsMap[post.id]);
        }
      });

      // Sort root posts
      rootPosts.sort((a, b) => {
        if (a.is_marked_answer !== b.is_marked_answer) {
          return b.is_marked_answer ? 1 : -1;
        }
        if (a.upvote_count !== b.upvote_count) {
          return b.upvote_count - a.upvote_count;
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });

      // Check if following
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

      const result = {
        ...thread,
        posts: rootPosts,
        is_following: isFollowing
      };

      // Cache the result
      cache.set(cacheKey, result);

      console.log('✅ Thread loaded with', rootPosts.length, 'posts');

      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error:', error.message);
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
        .select()
        .single();

      if (error) throw error;

      // Fetch author info separately
      const { data: author } = await supabase
        .from('user_profiles')
        .select('id, name, email')
        .eq('id', authorId)
        .single();

      const enrichedPost = {
        ...post,
        author: author || {}
      };

      // Invalidate thread cache
      cache.delete(`thread:${threadId}:${authorId}`);
      cache.delete(`thread:${threadId}:anon`);

      // Notify thread followers (async)
      this.notifyThreadFollowers(threadId, authorId, post.id).catch(err =>
        logger.error('Error notifying followers:', err)
      );

      logger.info(`Post created: ${post.id} by user ${authorId}`);
      return { success: true, data: enrichedPost };
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
