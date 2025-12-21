const supabase = require('../supabaseClient');

const forumService = {
  // Create topic
  async createTopic(userId, centerId, title, description, testId = null) {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        center_id: centerId,
        test_id: testId,
        created_by: userId,
        title,
        description
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, topic: data };
  },

  // Get topics
  async getTopics(centerId, testId = null) {
    let query = supabase
      .from('forum_topics')
      .select('*')
      .eq('center_id', centerId)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false });

    if (testId) {
      query = query.eq('test_id', testId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, topics: data };
  },

  // Get topic with posts
  async getTopic(topicId) {
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (topicError) throw topicError;

    // Increment views
    await supabase
      .from('forum_topics')
      .update({ views_count: topic.views_count + 1 })
      .eq('id', topicId);

    const { data: posts, error: postsError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('topic_id', topicId)
      .is('parent_post_id', null)
      .order('created_at', { ascending: true });

    if (postsError) throw postsError;

    return { success: true, topic, posts };
  },

  // Create post
  async createPost(userId, topicId, content, parentPostId = null) {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        topic_id: topicId,
        user_id: userId,
        content,
        parent_post_id: parentPostId
      })
      .select()
      .single();

    if (error) throw error;

    // Update topic
    await supabase
      .from('forum_topics')
      .update({
        posts_count: supabase.raw('posts_count + 1'),
        last_activity_at: new Date()
      })
      .eq('id', topicId);

    return { success: true, post: data };
  },

  // Like post
  async likePost(userId, postId) {
    const { error } = await supabase
      .from('forum_post_likes')
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      if (error.code === '23505') { // Already liked
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        
        await supabase.rpc('decrement_likes', { post_id: postId });
        return { success: true, liked: false };
      }
      throw error;
    }

    await supabase.rpc('increment_likes', { post_id: postId });
    return { success: true, liked: true };
  },

  // Mark as solution
  async markAsSolution(postId, topicId) {
    // Unmark other solutions
    await supabase
      .from('forum_posts')
      .update({ is_solution: false })
      .eq('topic_id', topicId);

    // Mark this as solution
    const { error } = await supabase
      .from('forum_posts')
      .update({ is_solution: true })
      .eq('id', postId);

    if (error) throw error;
    return { success: true };
  }
};

module.exports = forumService;
