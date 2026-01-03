-- ============================================
-- FORUM SYSTEM - PRODUCTION-READY SCHEMA
-- ============================================

-- 1. FORUM CATEGORIES
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '📚',
  color VARCHAR(7) DEFAULT '#3B82F6',
  display_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(center_id, slug)
);

-- 2. FORUM THREADS
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  
  -- Status & Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  
  -- SEO & Discovery
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(category_id, slug)
);

-- 3. FORUM POSTS (Replies)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  content_html TEXT, -- Sanitized HTML version
  
  -- Status
  is_marked_answer BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Engagement
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  
  -- Timestamps
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FORUM VOTES
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. THREAD FOLLOWERS (New Feature)
CREATE TABLE IF NOT EXISTS forum_thread_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notify_on_reply BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- 6. USER REPUTATION (Gamification)
CREATE TABLE IF NOT EXISTS forum_user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  reputation_points INTEGER DEFAULT 0,
  helpful_answers_count INTEGER DEFAULT 0,
  best_answers_count INTEGER DEFAULT 0,
  total_posts_count INTEGER DEFAULT 0,
  total_threads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, center_id)
);

-- 7. THREAD VIEWS TRACKING (Analytics)
CREATE TABLE IF NOT EXISTS forum_thread_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Categories
CREATE INDEX IF NOT EXISTS idx_forum_categories_center ON forum_categories(center_id);
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_categories_active ON forum_categories(center_id, is_archived) WHERE is_archived = false;

-- Threads
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_center ON forum_threads(center_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_creator ON forum_threads(creator_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_pinned ON forum_threads(is_pinned, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_tags ON forum_threads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_forum_threads_search ON forum_threads USING GIN(to_tsvector('english', title || ' ' || description));

-- Posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent ON forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_answer ON forum_posts(thread_id, is_marked_answer) WHERE is_marked_answer = true;
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);

-- Votes
CREATE INDEX IF NOT EXISTS idx_forum_votes_post ON forum_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user ON forum_votes(user_id);

-- Followers
CREATE INDEX IF NOT EXISTS idx_forum_followers_thread ON forum_thread_followers(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_followers_user ON forum_thread_followers(user_id);

-- Reputation
CREATE INDEX IF NOT EXISTS idx_forum_reputation_user ON forum_user_reputation(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_reputation_center ON forum_user_reputation(center_id, reputation_points DESC);

-- Views
CREATE INDEX IF NOT EXISTS idx_forum_views_thread ON forum_thread_views(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_views_date ON forum_thread_views(viewed_at DESC);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Update thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET reply_count = reply_count + 1,
        last_activity_at = NOW()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads 
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_reply_count
AFTER INSERT OR DELETE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_reply_count();

-- Update post vote counts
CREATE OR REPLACE FUNCTION update_post_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE forum_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE forum_posts SET downvote_count = downvote_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE forum_posts SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.post_id;
    ELSE
      UPDATE forum_posts SET downvote_count = GREATEST(0, downvote_count - 1) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE forum_posts SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.post_id;
    ELSE
      UPDATE forum_posts SET downvote_count = GREATEST(0, downvote_count - 1) WHERE id = OLD.post_id;
    END IF;
    IF NEW.vote_type = 'upvote' THEN
      UPDATE forum_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE forum_posts SET downvote_count = downvote_count + 1 WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_vote_count
AFTER INSERT OR UPDATE OR DELETE ON forum_votes
FOR EACH ROW
EXECUTE FUNCTION update_post_vote_count();

-- Update user reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New post: +5 points
    INSERT INTO forum_user_reputation (user_id, center_id, reputation_points, total_posts_count)
    SELECT NEW.author_id, t.center_id, 5, 1
    FROM forum_threads t WHERE t.id = NEW.thread_id
    ON CONFLICT (user_id, center_id) 
    DO UPDATE SET 
      reputation_points = forum_user_reputation.reputation_points + 5,
      total_posts_count = forum_user_reputation.total_posts_count + 1;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.is_marked_answer = true AND OLD.is_marked_answer = false THEN
    -- Marked as answer: +50 points
    INSERT INTO forum_user_reputation (user_id, center_id, reputation_points, best_answers_count)
    SELECT NEW.author_id, t.center_id, 50, 1
    FROM forum_threads t WHERE t.id = NEW.thread_id
    ON CONFLICT (user_id, center_id) 
    DO UPDATE SET 
      reputation_points = forum_user_reputation.reputation_points + 50,
      best_answers_count = forum_user_reputation.best_answers_count + 1;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_reputation
AFTER INSERT OR UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_user_reputation();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_forum_categories_updated_at
BEFORE UPDATE ON forum_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_forum_threads_updated_at
BEFORE UPDATE ON forum_threads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_forum_posts_updated_at
BEFORE UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Category stats view
CREATE OR REPLACE VIEW forum_category_stats AS
SELECT 
  c.id,
  c.center_id,
  c.name,
  c.description,
  c.slug,
  c.icon,
  c.color,
  COUNT(DISTINCT t.id) as thread_count,
  COUNT(DISTINCT p.id) as post_count,
  MAX(t.last_activity_at) as last_activity_at
FROM forum_categories c
LEFT JOIN forum_threads t ON c.id = t.category_id AND t.is_locked = false
LEFT JOIN forum_posts p ON t.id = p.thread_id AND p.is_deleted = false
WHERE c.is_archived = false
GROUP BY c.id;

-- Thread with author view
CREATE OR REPLACE VIEW forum_threads_with_author AS
SELECT 
  t.*,
  u.name as creator_name,
  u.email as creator_email,
  r.reputation_points as creator_reputation
FROM forum_threads t
JOIN user_profiles u ON t.creator_id = u.id
LEFT JOIN forum_user_reputation r ON u.id = r.user_id AND t.center_id = r.center_id;

-- ============================================
-- ROW LEVEL SECURITY (RLS) - OPTIONAL
-- ============================================

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Policies (everyone can read, authenticated can write)
CREATE POLICY forum_categories_read ON forum_categories FOR SELECT USING (true);
CREATE POLICY forum_threads_read ON forum_threads FOR SELECT USING (true);
CREATE POLICY forum_posts_read ON forum_posts FOR SELECT USING (is_deleted = false);

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert default categories (uncomment to use)
-- INSERT INTO forum_categories (center_id, name, description, slug, icon, color, display_order)
-- VALUES 
--   ('your-center-id', 'General Discussion', 'General topics and announcements', 'general', '💬', '#3B82F6', 1),
--   ('your-center-id', 'Mathematics', 'Math questions and solutions', 'mathematics', '🔢', '#10B981', 2),
--   ('your-center-id', 'English', 'English language discussions', 'english', '📖', '#F59E0B', 3),
--   ('your-center-id', 'Physics', 'Physics concepts and problems', 'physics', '⚛️', '#8B5CF6', 4),
--   ('your-center-id', 'Chemistry', 'Chemistry topics', 'chemistry', '🧪', '#EF4444', 5);

-- ============================================
-- MAINTENANCE FUNCTIONS
-- ============================================

-- Clean old thread views (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_thread_views()
RETURNS void AS $$
BEGIN
  DELETE FROM forum_thread_views 
  WHERE viewed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Recalculate thread stats
CREATE OR REPLACE FUNCTION recalculate_thread_stats(thread_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_threads
  SET reply_count = (
    SELECT COUNT(*) FROM forum_posts 
    WHERE thread_id = thread_uuid AND is_deleted = false
  )
  WHERE id = thread_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE forum_categories IS 'Forum categories for organizing discussions';
COMMENT ON TABLE forum_threads IS 'Discussion threads within categories';
COMMENT ON TABLE forum_posts IS 'Posts/replies within threads';
COMMENT ON TABLE forum_votes IS 'User votes on posts';
COMMENT ON TABLE forum_thread_followers IS 'Users following threads for notifications';
COMMENT ON TABLE forum_user_reputation IS 'User reputation scores per center';
COMMENT ON TABLE forum_thread_views IS 'Analytics for thread views';
