-- Weekly Leagues System - Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  tier INTEGER NOT NULL,
  min_xp INTEGER DEFAULT 0,
  max_xp INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO leagues (name, tier, min_xp, max_xp) VALUES
  ('Bronze', 1, 0, 999),
  ('Silver', 2, 1000, 2999),
  ('Gold', 3, 3000, 6999),
  ('Platinum', 4, 7000, 14999),
  ('Diamond', 5, 15000, NULL)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS league_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id),
  week_start DATE NOT NULL,
  weekly_xp INTEGER DEFAULT 0,
  rank_in_league INTEGER,
  promoted BOOLEAN DEFAULT FALSE,
  relegated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, week_start)
);

CREATE INDEX idx_league_week ON league_participants(week_start, league_id);
CREATE INDEX idx_league_rank ON league_participants(week_start, league_id, weekly_xp DESC);

CREATE OR REPLACE FUNCTION get_current_week_start() RETURNS DATE AS $$
BEGIN
  RETURN DATE_TRUNC('week', CURRENT_DATE)::DATE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assign_student_to_league(p_student_id UUID) RETURNS UUID AS $$
DECLARE
  v_total_xp INTEGER;
  v_league_id UUID;
  v_week_start DATE;
BEGIN
  v_week_start := get_current_week_start();
  
  SELECT COALESCE(SUM(xp_points), 0) INTO v_total_xp
  FROM user_profiles WHERE id = p_student_id;
  
  SELECT id INTO v_league_id FROM leagues
  WHERE v_total_xp >= min_xp AND (max_xp IS NULL OR v_total_xp <= max_xp)
  ORDER BY tier DESC LIMIT 1;
  
  INSERT INTO league_participants (student_id, league_id, week_start, weekly_xp)
  VALUES (p_student_id, v_league_id, v_week_start, 0)
  ON CONFLICT (student_id, week_start) DO NOTHING;
  
  RETURN v_league_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_weekly_xp(p_student_id UUID, p_xp_earned INTEGER) RETURNS VOID AS $$
DECLARE
  v_week_start DATE;
BEGIN
  v_week_start := get_current_week_start();
  
  UPDATE league_participants 
  SET weekly_xp = weekly_xp + p_xp_earned, updated_at = NOW()
  WHERE student_id = p_student_id AND week_start = v_week_start;
  
  IF NOT FOUND THEN
    PERFORM assign_student_to_league(p_student_id);
    UPDATE league_participants 
    SET weekly_xp = p_xp_earned, updated_at = NOW()
    WHERE student_id = p_student_id AND week_start = v_week_start;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_league_ranks() RETURNS VOID AS $$
DECLARE
  v_week_start DATE;
BEGIN
  v_week_start := get_current_week_start();
  
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY league_id ORDER BY weekly_xp DESC, updated_at ASC) as new_rank
    FROM league_participants
    WHERE week_start = v_week_start
  )
  UPDATE league_participants lp
  SET rank_in_league = ranked.new_rank
  FROM ranked
  WHERE lp.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE league_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY league_participants_policy ON league_participants FOR ALL USING (student_id = auth.uid());
