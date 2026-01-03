-- ============================================
-- MARKET LEADER FEATURES - DATABASE MIGRATION
-- ============================================
-- Run this AFTER tutorial_center_migration.sql
-- Adds: Adaptive Learning, Anti-Cheat, White Label

-- ============================================
-- 1. ADAPTIVE LEARNING PATHS
-- ============================================

-- Add prerequisite and mastery tracking to question sets
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS prerequisite_set_id UUID REFERENCES tc_question_sets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS mastery_threshold INTEGER DEFAULT 70 CHECK (mastery_threshold >= 0 AND mastery_threshold <= 100),
ADD COLUMN IF NOT EXISTS is_remedial BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_set_id UUID REFERENCES tc_question_sets(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tc_qsets_prerequisite ON tc_question_sets(prerequisite_set_id);
CREATE INDEX IF NOT EXISTS idx_tc_qsets_parent ON tc_question_sets(parent_set_id);

-- Track student mastery per topic
CREATE TABLE IF NOT EXISTS tc_student_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  mastery_level INTEGER NOT NULL CHECK (mastery_level >= 0 AND mastery_level <= 100),
  attempts_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  is_unlocked BOOLEAN DEFAULT TRUE,
  
  UNIQUE(student_id, question_set_id)
);

CREATE INDEX IF NOT EXISTS idx_tc_mastery_student ON tc_student_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_tc_mastery_unlocked ON tc_student_mastery(is_unlocked);

-- ============================================
-- 2. ANTI-CHEAT & FORENSICS
-- ============================================

-- Add forensic tracking to attempts
ALTER TABLE tc_student_attempts 
ADD COLUMN IF NOT EXISTS suspicious_events JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS copy_paste_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS integrity_score INTEGER DEFAULT 100 CHECK (integrity_score >= 0 AND integrity_score <= 100);

CREATE INDEX IF NOT EXISTS idx_tc_attempts_integrity ON tc_student_attempts(integrity_score) WHERE integrity_score < 80;
CREATE INDEX IF NOT EXISTS idx_tc_attempts_device ON tc_student_attempts(device_fingerprint);

-- ============================================
-- 3. WHITE LABEL & THEMING
-- ============================================

-- Add theme configuration to centers
ALTER TABLE tutorial_centers 
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{"primary_color": "#10b981", "logo_url": null, "custom_domain": null}',
ADD COLUMN IF NOT EXISTS is_white_label BOOLEAN DEFAULT FALSE;

-- ============================================
-- 4. GAMIFICATION 2.0 - LEAGUES & STREAKS
-- ============================================

-- Student activity streaks
CREATE TABLE IF NOT EXISTS tc_student_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  streak_freezes_available INTEGER DEFAULT 0,
  
  UNIQUE(student_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_tc_streaks_student ON tc_student_streaks(student_id);

-- League system
CREATE TABLE IF NOT EXISTS tc_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_tier TEXT NOT NULL CHECK (league_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  weekly_points INTEGER DEFAULT 0,
  week_start_date DATE DEFAULT CURRENT_DATE,
  
  UNIQUE(student_id, center_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_tc_leagues_tier ON tc_leagues(league_tier, weekly_points DESC);

-- ============================================
-- 5. AI TUTOR SESSIONS (SOCRATIC FEEDBACK)
-- ============================================

CREATE TABLE IF NOT EXISTS tc_ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES tc_student_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES tc_questions(id) ON DELETE CASCADE,
  chat_history JSONB NOT NULL DEFAULT '[]',
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_ai_sessions_student ON tc_ai_tutor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_tc_ai_sessions_attempt ON tc_ai_tutor_sessions(attempt_id);

-- ============================================
-- 6. PARENT/SPONSOR DIGESTS
-- ============================================

CREATE TABLE IF NOT EXISTS tc_digest_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, recipient_email)
);

CREATE INDEX IF NOT EXISTS idx_tc_digests_active ON tc_digest_subscriptions(is_active, frequency);

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update mastery level after attempt
CREATE OR REPLACE FUNCTION update_student_mastery()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tc_student_mastery (student_id, question_set_id, mastery_level, attempts_count)
  VALUES (NEW.student_id, NEW.question_set_id, NEW.score, 1)
  ON CONFLICT (student_id, question_set_id) 
  DO UPDATE SET 
    mastery_level = GREATEST(tc_student_mastery.mastery_level, NEW.score),
    attempts_count = tc_student_mastery.attempts_count + 1,
    last_attempt_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mastery ON tc_student_attempts;
CREATE TRIGGER trigger_update_mastery
AFTER INSERT ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION update_student_mastery();

-- Update streak on activity
CREATE OR REPLACE FUNCTION update_student_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  center UUID;
BEGIN
  -- Get center_id from question_set
  SELECT center_id INTO center FROM tc_question_sets WHERE id = NEW.question_set_id;
  
  -- Get last activity date
  SELECT last_activity_date INTO last_date 
  FROM tc_student_streaks 
  WHERE student_id = NEW.student_id AND center_id = center;
  
  IF last_date IS NULL THEN
    -- First activity
    INSERT INTO tc_student_streaks (student_id, center_id, current_streak, longest_streak)
    VALUES (NEW.student_id, center, 1, 1);
  ELSIF last_date = CURRENT_DATE THEN
    -- Same day, no change
    RETURN NEW;
  ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE tc_student_streaks 
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE
    WHERE student_id = NEW.student_id AND center_id = center;
  ELSE
    -- Streak broken
    UPDATE tc_student_streaks 
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE
    WHERE student_id = NEW.student_id AND center_id = center;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_streak ON tc_student_attempts;
CREATE TRIGGER trigger_update_streak
AFTER INSERT ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION update_student_streak();

-- Calculate integrity score based on suspicious events
CREATE OR REPLACE FUNCTION calculate_integrity_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 100;
  event JSONB;
BEGIN
  -- Deduct points for each suspicious event
  FOR event IN SELECT * FROM jsonb_array_elements(NEW.suspicious_events)
  LOOP
    CASE event->>'type'
      WHEN 'tab_switch' THEN score := score - 5;
      WHEN 'copy_paste' THEN score := score - 10;
      WHEN 'rapid_answer' THEN score := score - 3;
      WHEN 'device_change' THEN score := score - 20;
      ELSE score := score - 2;
    END CASE;
  END LOOP;
  
  NEW.integrity_score := GREATEST(0, score);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_integrity_score ON tc_student_attempts;
CREATE TRIGGER trigger_integrity_score
BEFORE INSERT OR UPDATE ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION calculate_integrity_score();

-- ============================================
-- 8. RLS POLICIES FOR NEW TABLES
-- ============================================

ALTER TABLE tc_student_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_digest_subscriptions ENABLE ROW LEVEL SECURITY;

-- Mastery policies
CREATE POLICY "Students view own mastery" ON tc_student_mastery FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Tutors view center mastery" ON tc_student_mastery FOR SELECT USING (
  EXISTS (SELECT 1 FROM tc_question_sets qs WHERE qs.id = question_set_id AND qs.tutor_id = auth.uid())
);

-- Streak policies
CREATE POLICY "Students view own streaks" ON tc_student_streaks FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students update own streaks" ON tc_student_streaks FOR UPDATE USING (auth.uid() = student_id);

-- League policies
CREATE POLICY "Students view own league" ON tc_leagues FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Tutors view center leagues" ON tc_leagues FOR SELECT USING (
  EXISTS (SELECT 1 FROM tutorial_centers WHERE id = center_id AND tutor_id = auth.uid())
);

-- AI tutor policies
CREATE POLICY "Students manage own sessions" ON tc_ai_tutor_sessions FOR ALL USING (auth.uid() = student_id);

-- Digest policies
CREATE POLICY "Students manage own digests" ON tc_digest_subscriptions FOR ALL USING (auth.uid() = student_id);

-- ============================================
-- 9. HELPER VIEWS
-- ============================================

-- View for unlocked tests per student
CREATE OR REPLACE VIEW tc_student_unlocked_tests AS
SELECT 
  s.student_id,
  qs.id as question_set_id,
  qs.title,
  qs.prerequisite_set_id,
  COALESCE(m.mastery_level, 0) as current_mastery,
  CASE 
    WHEN qs.prerequisite_set_id IS NULL THEN TRUE
    WHEN pm.mastery_level >= qs.mastery_threshold THEN TRUE
    ELSE FALSE
  END as is_unlocked
FROM tc_enrollments e
JOIN tc_question_sets qs ON qs.center_id = e.center_id
CROSS JOIN LATERAL (SELECT e.student_id) s
LEFT JOIN tc_student_mastery m ON m.student_id = s.student_id AND m.question_set_id = qs.id
LEFT JOIN tc_student_mastery pm ON pm.student_id = s.student_id AND pm.question_set_id = qs.prerequisite_set_id
WHERE qs.is_active = TRUE;

-- View for league rankings
CREATE OR REPLACE VIEW tc_league_rankings AS
SELECT 
  l.*,
  RANK() OVER (PARTITION BY l.center_id, l.league_tier, l.week_start_date ORDER BY l.weekly_points DESC) as rank_in_league
FROM tc_leagues l;

-- ============================================
-- MIGRATION COMPLETE! 🚀
-- ============================================
-- New Features Added:
-- ✅ Adaptive Learning Paths with Prerequisites
-- ✅ Anti-Cheat Forensics & Integrity Scoring
-- ✅ White Label Theming
-- ✅ Gamification (Streaks & Leagues)
-- ✅ AI Tutor Sessions
-- ✅ Parent/Sponsor Digests
-- ============================================
