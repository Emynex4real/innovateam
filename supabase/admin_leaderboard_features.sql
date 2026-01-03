-- Admin Leaderboard Management Features

-- User Rewards Table
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'achievement'
  reward_title TEXT NOT NULL,
  reward_description TEXT,
  points_bonus INTEGER DEFAULT 0,
  badge_icon TEXT,
  awarded_by UUID REFERENCES auth.users(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start DATE,
  period_end DATE,
  rank_achieved INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard Snapshots (for historical tracking)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  snapshot_date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  points INTEGER NOT NULL,
  total_sessions INTEGER,
  unique_exams INTEGER,
  average_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_type ON user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_awarded_at ON user_rewards(awarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_type_date ON leaderboard_snapshots(snapshot_type, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_user ON leaderboard_snapshots(user_id, snapshot_date DESC);

-- RLS Policies
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage all rewards
CREATE POLICY "Admins can manage rewards"
  ON user_rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can view snapshots (for leaderboard history)
CREATE POLICY "Anyone can view snapshots"
  ON leaderboard_snapshots FOR SELECT
  USING (true);

-- Only admins can create snapshots
CREATE POLICY "Admins can create snapshots"
  ON leaderboard_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Daily Top Performers View
CREATE OR REPLACE VIEW leaderboard_daily AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  up.email,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id 
  AND DATE(ps.completed_at) = CURRENT_DATE
GROUP BY u.id, up.full_name, up.email
HAVING COUNT(ps.id) > 0
ORDER BY points DESC;

-- Yearly Leaderboard View
CREATE OR REPLACE VIEW leaderboard_yearly AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  up.email,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id 
  AND ps.completed_at >= DATE_TRUNC('year', NOW())
GROUP BY u.id, up.full_name, up.email;

-- Function to create leaderboard snapshot
CREATE OR REPLACE FUNCTION create_leaderboard_snapshot(p_snapshot_type TEXT)
RETURNS INTEGER AS $$
DECLARE
  snapshot_count INTEGER := 0;
  view_name TEXT;
BEGIN
  -- Determine which view to use
  view_name := 'leaderboard_' || p_snapshot_type;
  
  -- Insert snapshot data
  EXECUTE format('
    INSERT INTO leaderboard_snapshots (
      snapshot_type, snapshot_date, user_id, rank, points,
      total_sessions, unique_exams, average_score
    )
    SELECT 
      $1, CURRENT_DATE, user_id,
      ROW_NUMBER() OVER (ORDER BY points DESC),
      points, total_sessions, unique_exams_attempted, average_score
    FROM %I
    WHERE points > 0
  ', view_name) USING p_snapshot_type;
  
  GET DIAGNOSTICS snapshot_count = ROW_COUNT;
  RETURN snapshot_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award top performers
CREATE OR REPLACE FUNCTION award_top_performers(
  p_period_type TEXT,
  p_top_count INTEGER DEFAULT 3
)
RETURNS TABLE(user_id UUID, rank INTEGER, points INTEGER, reward_title TEXT) AS $$
BEGIN
  RETURN QUERY
  WITH top_users AS (
    SELECT 
      ls.user_id,
      ls.rank,
      ls.points,
      CASE ls.rank
        WHEN 1 THEN '🥇 ' || INITCAP(p_period_type) || ' Champion'
        WHEN 2 THEN '🥈 ' || INITCAP(p_period_type) || ' Runner-up'
        WHEN 3 THEN '🥉 ' || INITCAP(p_period_type) || ' Third Place'
        ELSE '🏆 Top ' || p_top_count || ' ' || INITCAP(p_period_type)
      END as reward_title
    FROM leaderboard_snapshots ls
    WHERE ls.snapshot_type = p_period_type
      AND ls.snapshot_date = CURRENT_DATE
      AND ls.rank <= p_top_count
  )
  INSERT INTO user_rewards (
    user_id, reward_type, reward_title, reward_description,
    points_bonus, rank_achieved, period_start, period_end
  )
  SELECT 
    tu.user_id,
    p_period_type,
    tu.reward_title,
    'Congratulations on achieving rank #' || tu.rank || ' with ' || tu.points || ' points!',
    CASE tu.rank WHEN 1 THEN 500 WHEN 2 THEN 300 WHEN 3 THEN 200 ELSE 100 END,
    tu.rank,
    CURRENT_DATE - INTERVAL '1 ' || p_period_type,
    CURRENT_DATE
  FROM top_users tu
  ON CONFLICT DO NOTHING
  RETURNING user_rewards.user_id, user_rewards.rank_achieved, 
            (SELECT points FROM top_users WHERE top_users.user_id = user_rewards.user_id),
            user_rewards.reward_title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Analytics View
CREATE OR REPLACE VIEW admin_leaderboard_analytics AS
SELECT 
  COUNT(DISTINCT ps.user_id) as total_active_users,
  COUNT(ps.id) as total_sessions_today,
  COUNT(DISTINCT ps.bank_id) as unique_exams_today,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as avg_score_today,
  COALESCE(SUM(ps.points_awarded), 0) as total_points_awarded_today,
  (SELECT COUNT(*) FROM user_rewards WHERE DATE(awarded_at) = CURRENT_DATE) as rewards_given_today,
  (SELECT COUNT(DISTINCT user_id) FROM practice_sessions WHERE DATE(completed_at) = CURRENT_DATE) as active_users_today,
  (SELECT COUNT(DISTINCT user_id) FROM practice_sessions WHERE completed_at >= NOW() - INTERVAL '7 days') as active_users_week,
  (SELECT COUNT(DISTINCT user_id) FROM practice_sessions WHERE completed_at >= NOW() - INTERVAL '30 days') as active_users_month
FROM practice_sessions ps
WHERE DATE(ps.completed_at) = CURRENT_DATE;

-- User Performance Summary for Admin
CREATE OR REPLACE VIEW admin_user_performance AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  up.email,
  up.wallet_balance,
  (SELECT COUNT(*) FROM practice_sessions WHERE user_id = u.id) as total_sessions,
  (SELECT COUNT(DISTINCT bank_id) FROM practice_sessions WHERE user_id = u.id) as unique_exams,
  (SELECT COALESCE(SUM(points_awarded), 0) FROM practice_sessions WHERE user_id = u.id) as total_points,
  (SELECT COALESCE(AVG(percentage), 0)::INTEGER FROM practice_sessions WHERE user_id = u.id) as avg_score,
  (SELECT COUNT(*) FROM user_rewards WHERE user_id = u.id) as total_rewards,
  (SELECT MAX(completed_at) FROM practice_sessions WHERE user_id = u.id) as last_activity,
  u.created_at as joined_date
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY total_points DESC;
