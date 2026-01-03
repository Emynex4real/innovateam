-- Badges System
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Badge Types:
-- 'first_post' - Created first post
-- 'helpful_100' - Earned 100 XP
-- 'expert_500' - Earned 500 XP
-- 'master_1000' - Earned 1000 XP
-- 'answer_accepted' - Had answer marked as solution
-- 'popular_post' - Post with 10+ upvotes
-- 'contributor_50' - Made 50 posts

-- Daily XP Tracking (prevent abuse)
CREATE TABLE IF NOT EXISTS daily_xp_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_xp_user_date ON daily_xp_log(user_id, date);

-- XP Requirements Table
CREATE TABLE IF NOT EXISTS xp_requirements (
  action VARCHAR(50) PRIMARY KEY,
  min_xp_required INTEGER NOT NULL,
  description TEXT
);

INSERT INTO xp_requirements (action, min_xp_required, description) VALUES
('downvote', 50, 'Minimum XP required to downvote posts'),
('create_thread', 0, 'Minimum XP required to create threads'),
('edit_others_post', 500, 'Minimum XP required to edit others posts'),
('delete_others_post', 1000, 'Minimum XP required to delete others posts'),
('pin_thread', 500, 'Minimum XP required to pin threads');

-- Leaderboard View
CREATE OR REPLACE VIEW forum_leaderboard AS
SELECT 
  r.user_id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as user_name,
  r.total_xp,
  r.level,
  COUNT(DISTINCT b.id) as badge_count,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT t.id) as thread_count,
  COUNT(DISTINCT v.id) as upvotes_received
FROM user_reputation r
LEFT JOIN auth.users u ON r.user_id = u.id
LEFT JOIN user_badges b ON r.user_id = b.user_id
LEFT JOIN forum_posts p ON r.user_id = p.author_id
LEFT JOIN forum_threads t ON r.user_id = t.creator_id
LEFT JOIN forum_votes v ON p.id = v.post_id AND v.vote_type = 'upvote'
GROUP BY r.user_id, u.raw_user_meta_data, u.email, r.total_xp, r.level
ORDER BY r.total_xp DESC;

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all badges" ON user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "System manages badges" ON user_badges FOR ALL TO service_role USING (true);

CREATE POLICY "Users can view own daily XP" ON daily_xp_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System manages daily XP" ON daily_xp_log FOR ALL TO service_role USING (true);

CREATE POLICY "Everyone can view XP requirements" ON xp_requirements FOR SELECT TO authenticated USING (true);
