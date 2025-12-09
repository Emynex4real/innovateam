-- Practice History Table for Leaderboard
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id TEXT,
  bank_name TEXT NOT NULL,
  subject TEXT,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  is_first_attempt BOOLEAN DEFAULT true,
  points_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completed_at ON practice_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_completed ON practice_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_bank ON practice_sessions(user_id, bank_id);

-- RLS Policies
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- Users can read all sessions (for leaderboard)
CREATE POLICY "Anyone can view practice sessions"
  ON practice_sessions FOR SELECT
  USING (true);

-- Users can only insert their own sessions
CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own sessions
CREATE POLICY "Users can update own practice sessions"
  ON practice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Leaderboard View for optimized queries (ONLY first attempts count)
CREATE OR REPLACE VIEW leaderboard_stats AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.time_spent), 0) as total_time_spent,
  -- Points: ONLY from first attempts
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points,
  -- Level calculation: total_questions / 50 + 1
  (COALESCE(SUM(ps.total_questions), 0) / 50 + 1)::INTEGER as level,
  MAX(ps.completed_at) as last_practice_date
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id
GROUP BY u.id, up.full_name, u.email;

-- Weekly leaderboard view (ONLY first attempts count)
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id 
  AND ps.completed_at >= NOW() - INTERVAL '7 days'
GROUP BY u.id, up.full_name, u.email;

-- Monthly leaderboard view (ONLY first attempts count)
CREATE OR REPLACE VIEW leaderboard_monthly AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id 
  AND ps.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, up.full_name, u.email;

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_session BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM practice_sessions 
      WHERE user_id = p_user_id 
      AND DATE(completed_at) = check_date
    ) INTO has_session;
    
    IF NOT has_session THEN
      EXIT;
    END IF;
    
    streak := streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql;
