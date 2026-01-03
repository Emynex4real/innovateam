-- User Reputation & XP System

CREATE TABLE IF NOT EXISTS user_reputation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_reputation_user ON user_reputation(user_id);
CREATE INDEX idx_user_reputation_level ON user_reputation(level DESC);
CREATE INDEX idx_user_reputation_xp ON user_reputation(total_xp DESC);

-- RLS Policies
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reputations"
ON user_reputation FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can manage reputations"
ON user_reputation FOR ALL
TO service_role
USING (true);

-- XP Point System:
-- +10 XP: Receive upvote on post
-- -5 XP: Receive downvote on post
-- +50 XP: Post marked as answer
-- +5 XP: Create helpful post
-- Level = floor(total_xp / 100) + 1
