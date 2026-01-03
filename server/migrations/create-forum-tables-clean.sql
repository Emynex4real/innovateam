-- ============================================
-- FORUM SYSTEM - CLEAN MIGRATION
-- Drop existing tables and recreate
-- ============================================

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS forum_thread_views CASCADE;
DROP TABLE IF EXISTS forum_user_reputation CASCADE;
DROP TABLE IF EXISTS forum_thread_followers CASCADE;
DROP TABLE IF EXISTS forum_votes CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_threads CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS forum_category_stats CASCADE;
DROP VIEW IF EXISTS forum_threads_with_author CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_thread_reply_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_vote_count() CASCADE;
DROP FUNCTION IF EXISTS update_user_reputation() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_thread_views() CASCADE;
DROP FUNCTION IF EXISTS recalculate_thread_stats(UUID) CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- 1. FORUM CATEGORIES
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL,
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
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  center_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 3. FORUM POSTS
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_html TEXT,
  is_marked_answer BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FORUM VOTES
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. THREAD FOLLOWERS
CREATE TABLE forum_thread_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notify_on_reply BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- 6. USER REPUTATION
CREATE TABLE forum_user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  center_id UUID NOT NULL,
  reputation_points INTEGER DEFAULT 0,
  helpful_answers_count INTEGER DEFAULT 0,
  best_answers_count INTEGER DEFAULT 0,
  total_posts_count INTEGER DEFAULT 0,
  total_threads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, center_id)
);

-- 7. THREAD VIEWS
CREATE TABLE forum_thread_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_forum_categories_center ON forum_categories(center_id);
CREATE INDEX idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_center ON forum_threads(center_id);
CREATE INDEX idx_forum_threads_creator ON forum_threads(creator_id);
CREATE INDEX idx_forum_threads_activity ON forum_threads(last_activity_at DESC);
CREATE INDEX idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_votes_post ON forum_votes(post_id);
CREATE INDEX idx_forum_votes_user ON forum_votes(user_id);
CREATE INDEX idx_forum_followers_thread ON forum_thread_followers(thread_id);
CREATE INDEX idx_forum_followers_user ON forum_thread_followers(user_id);
CREATE INDEX idx_forum_reputation_user ON forum_user_reputation(user_id);
CREATE INDEX idx_forum_views_thread ON forum_thread_views(thread_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET reply_count = reply_count + 1, last_activity_at = NOW()
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
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

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
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_vote_count
AFTER INSERT OR DELETE ON forum_votes
FOR EACH ROW EXECUTE FUNCTION update_post_vote_count();

CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO forum_user_reputation (user_id, center_id, reputation_points, total_posts_count)
    SELECT NEW.author_id, t.center_id, 5, 1
    FROM forum_threads t WHERE t.id = NEW.thread_id
    ON CONFLICT (user_id, center_id) 
    DO UPDATE SET 
      reputation_points = forum_user_reputation.reputation_points + 5,
      total_posts_count = forum_user_reputation.total_posts_count + 1;
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.is_marked_answer = true AND OLD.is_marked_answer = false THEN
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
FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_forum_categories_updated_at
BEFORE UPDATE ON forum_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_forum_threads_updated_at
BEFORE UPDATE ON forum_threads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_forum_posts_updated_at
BEFORE UPDATE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW forum_category_stats AS
SELECT 
  c.id,
  c.center_id,
  c.name,
  c.description,
  c.slug,
  c.icon,
  c.color,
  c.display_order,
  COUNT(DISTINCT t.id) as thread_count,
  COUNT(DISTINCT p.id) as post_count,
  MAX(t.last_activity_at) as last_activity_at
FROM forum_categories c
LEFT JOIN forum_threads t ON c.id = t.category_id
LEFT JOIN forum_posts p ON t.id = p.thread_id AND p.is_deleted = false
WHERE c.is_archived = false
GROUP BY c.id, c.center_id, c.name, c.description, c.slug, c.icon, c.color, c.display_order;

CREATE VIEW forum_threads_with_author AS
SELECT 
  t.*,
  COALESCE(r.reputation_points, 0) as creator_reputation
FROM forum_threads t
LEFT JOIN forum_user_reputation r ON t.creator_id = r.user_id AND t.center_id = r.center_id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Forum tables created successfully!';
  RAISE NOTICE '📊 Created 7 tables, 14 indexes, 4 triggers, 2 views';
  RAISE NOTICE '🚀 Next step: Run setupForumCategories.js to seed categories';
END $$;
