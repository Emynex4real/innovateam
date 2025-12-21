/**
 * Forums Service - Handle discussion threads and posts
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class ForumsService {
  // Get forum categories for center
  async getCategories(centerId) {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('center_id', centerId)
        .eq('is_archived', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, categories: data };
    } catch (error) {
      logger.error('Error getting categories:', error);
      return { success: false, error: error.message };
    }
  }

  // Get threads in category
  async getThreads(categoryId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_locked', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get creator info
      const enrichedThreads = await Promise.all(
        data.map(async (thread) => {
          const { data: creator } = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .eq('id', thread.creator_id)
            .single();

          return { ...thread, creator };
        })
      );

      return { success: true, threads: enrichedThreads };
    } catch (error) {
      logger.error('Error getting threads:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single thread with posts
  async getThread(threadId, userId) {
    try {
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      // Increment view count
      await supabase
        .from('forum_threads')
        .update({ view_count: thread.view_count + 1 })
        .eq('id', threadId);

      // Get creator
      const { data: creator } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .eq('id', thread.creator_id)
        .single();

      // Get posts (only top-level for pagination)
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('thread_id', threadId)
        .is('parent_post_id', null)
        .order('is_marked_answer', { ascending: false })
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: true });

      if (postsError) throw postsError;

      // Enrich posts with author and replies
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const { data: author } = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .eq('id', post.author_id)
            .single();

          // Get replies
          const { data: replies } = await supabase
            .from('forum_posts')
            .select('*')
            .eq('parent_post_id', post.id)
            .order('upvote_count', { ascending: false })
            .order('created_at', { ascending: true });

          // Check if user voted
          const { data: userVote } = await supabase
            .from('forum_votes')
            .select('vote_type')
            .eq('post_id', post.id)
            .eq('user_id', userId)
            .single();

          return {
            ...post,
            author,
            user_vote: userVote?.vote_type || null,
            replies: replies || []
          };
        })
      );

      return { success: true, thread: { ...thread, creator }, posts: enrichedPosts };
    } catch (error) {
      logger.error('Error getting thread:', error);
      return { success: false, error: error.message };
    }
  }

  // Create thread
  async createThread(categoryId, centerId, creatorId, title, description) {
    try {
      const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: categoryId,
          center_id: centerId,
          creator_id: creatorId,
          title,
          description
        })
        .select()
        .single();

      if (error) throw error;

      // Update category post count
      await supabase.rpc('increment_category_threads', { cat_id: categoryId });

      logger.info(`Thread created: ${thread.id}`);
      return { success: true, thread };
    } catch (error) {
      logger.error('Error creating thread:', error);
      return { success: false, error: error.message };
    }
  }

  // Create post
  async createPost(threadId, authorId, content, parentPostId = null) {
    try {
      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          author_id: authorId,
          content,
          parent_post_id: parentPostId
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

      logger.info(`Post created: ${post.id}`);
      return { success: true, post: { ...post, author } };
    } catch (error) {
      logger.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  }

  // Vote on post
  async votePost(postId, userId, voteType) {
    try {
      // Check existing vote
      const { data: existing } = await supabase
        .from('forum_votes')
        .select('id, vote_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Remove old vote
        if (existing.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('forum_votes')
            .delete()
            .eq('id', existing.id);

          const field = existing.vote_type === 'upvote' ? 'upvote_count' : 'downvote_count';
          await supabase
            .from('forum_posts')
            .update({ [field]: supabase.raw(`GREATEST(0, ${field} - 1)`) })
            .eq('id', postId);

          return { success: true, action: 'vote_removed' };
        } else {
          // Change vote
          await supabase
            .from('forum_votes')
            .update({ vote_type: voteType })
            .eq('id', existing.id);

          const oldField = existing.vote_type === 'upvote' ? 'upvote_count' : 'downvote_count';
          const newField = voteType === 'upvote' ? 'upvote_count' : 'downvote_count';

          await supabase
            .from('forum_posts')
            .update({
              [oldField]: supabase.raw(`GREATEST(0, ${oldField} - 1)`),
              [newField]: supabase.raw(`${newField} + 1`)
            })
            .eq('id', postId);

          return { success: true, action: 'vote_changed' };
        }
      } else {
        // Add new vote
        await supabase
          .from('forum_votes')
          .insert({
            post_id: postId,
            user_id: userId,
            vote_type: voteType
          });

        const field = voteType === 'upvote' ? 'upvote_count' : 'downvote_count';
        await supabase
          .from('forum_posts')
          .update({ [field]: supabase.raw(`${field} + 1`) })
          .eq('id', postId);

        return { success: true, action: 'vote_added' };
      }
    } catch (error) {
      logger.error('Error voting on post:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark post as answer
  async markAsAnswer(postId, threadId, userId) {
    try {
      // Check authorization
      const { data: post } = await supabase
        .from('forum_posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      const { data: thread } = await supabase
        .from('forum_threads')
        .select('creator_id')
        .eq('id', threadId)
        .single();

      if (thread.creator_id !== userId) {
        return { success: false, error: 'Only thread creator can mark answers' };
      }

      // Update post
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

      logger.info(`Post marked as answer: ${postId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error marking answer:', error);
      return { success: false, error: error.message };
    }
  }

  // Search threads
  async searchThreads(centerId, query, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('center_id', centerId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, threads: data };
    } catch (error) {
      logger.error('Error searching threads:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ForumsService();
