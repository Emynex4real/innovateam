-- ============================================
-- FORUM ENHANCEMENTS - Missing Tables & Functions
-- ============================================

-- 1. Post Bookmarks Table
CREATE TABLE IF NOT EXISTS forum_post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON forum_post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_post ON forum_post_bookmarks(post_id);

-- 2. Post Reports Table
CREATE TABLE IF NOT EXISTS forum_post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES user_profiles(id),
  moderator_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_forum_reports_status ON forum_post_reports(status);
CREATE INDEX IF NOT EXISTS idx_forum_reports_post ON forum_post_reports(post_id);

-- 3. Add missing columns to forum_posts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_posts' AND column_name='edited_at') THEN
    ALTER TABLE forum_posts ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 4. Hot Score Function for Sorting
CREATE OR REPLACE FUNCTION calculate_hot_score(
  upvotes INTEGER,
  replies INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  age_hours NUMERIC;
  score NUMERIC;
BEGIN
  age_hours := EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600.0;
  score := (upvotes * 2 + replies) / POWER(age_hours + 2, 1.5);
  RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Update thread hot score (run periodically)
CREATE OR REPLACE FUNCTION update_thread_hot_scores()
RETURNS void AS $$
BEGIN
  UPDATE forum_threads
  SET upvote_count = (
    SELECT COALESCE(SUM(upvote_count), 0)
    FROM forum_posts
    WHERE thread_id = forum_threads.id AND is_deleted = false
  );
END;
$$ LANGUAGE plpgsql;

-- 6. Notification trigger for thread followers (fixed column names)
CREATE OR REPLACE FUNCTION notify_thread_followers()
RETURNS TRIGGER AS $$
DECLARE
  thread_title TEXT;
BEGIN
  -- Get thread title
  SELECT title INTO thread_title FROM forum_threads WHERE id = NEW.thread_id;
  
  -- Insert notifications with correct column names
  INSERT INTO notifications (user_id, type, title, message, created_at)
  SELECT 
    f.user_id,
    'info',
    'New reply in thread',
    'Someone replied to: ' || thread_title,
    NOW()
  FROM forum_thread_followers f
  WHERE f.thread_id = NEW.thread_id 
    AND f.user_id != NEW.author_id
    AND f.notify_on_reply = true;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail to not block post creation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_thread_followers ON forum_posts;
CREATE TRIGGER trigger_notify_thread_followers
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION notify_thread_followers();

COMMENT ON TABLE forum_post_bookmarks IS 'User bookmarks for forum posts';
COMMENT ON TABLE forum_post_reports IS 'User reports for inappropriate content';
