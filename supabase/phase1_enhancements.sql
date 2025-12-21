-- ============================================
-- PHASE 1: QUICK WINS - DATABASE ENHANCEMENTS
-- ============================================

-- 1. Add analytics and gamification columns to existing tables
ALTER TABLE tc_questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE tc_questions ADD COLUMN IF NOT EXISTS times_answered INTEGER DEFAULT 0;
ALTER TABLE tc_questions ADD COLUMN IF NOT EXISTS times_correct INTEGER DEFAULT 0;
ALTER TABLE tc_questions ADD COLUMN IF NOT EXISTS avg_time_seconds INTEGER DEFAULT 0;

ALTER TABLE tc_question_sets ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'exam' CHECK (mode IN ('practice', 'exam'));
ALTER TABLE tc_question_sets ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0;
ALTER TABLE tc_question_sets ADD COLUMN IF NOT EXISTS avg_score DECIMAL(5,2) DEFAULT 0;

-- 2. Create student analytics table
CREATE TABLE IF NOT EXISTS student_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  total_tests_taken INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- seconds
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id)
);

CREATE INDEX idx_student_analytics_student ON student_analytics(student_id);
CREATE INDEX idx_student_analytics_center ON student_analytics(center_id);
CREATE INDEX idx_student_analytics_xp ON student_analytics(xp_points DESC);

-- 3. Create achievements/badges table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('tests_completed', 'score_achieved', 'streak', 'questions_answered', 'perfect_score')),
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, xp_reward, tier) VALUES
('First Steps', 'Complete your first test', '🎯', 'tests_completed', 1, 10, 'bronze'),
('Quick Learner', 'Complete 5 tests', '⚡', 'tests_completed', 5, 50, 'bronze'),
('Dedicated Student', 'Complete 10 tests', '📚', 'tests_completed', 10, 100, 'silver'),
('Test Master', 'Complete 25 tests', '🏆', 'tests_completed', 25, 250, 'gold'),
('Perfect Score', 'Score 100% on any test', '💯', 'perfect_score', 100, 100, 'silver'),
('High Achiever', 'Score above 90% on 5 tests', '⭐', 'score_achieved', 90, 150, 'gold'),
('Streak Starter', 'Maintain a 3-day streak', '🔥', 'streak', 3, 30, 'bronze'),
('Streak Master', 'Maintain a 7-day streak', '🔥🔥', 'streak', 7, 100, 'silver'),
('Question Crusher', 'Answer 100 questions', '💪', 'questions_answered', 100, 100, 'silver'),
('Knowledge Seeker', 'Answer 500 questions', '🧠', 'questions_answered', 500, 500, 'gold')
ON CONFLICT DO NOTHING;

-- 4. Create student achievements junction table
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, achievement_id)
);

CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);

-- 5. Create tutor analytics table
CREATE TABLE IF NOT EXISTS tutor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  total_students INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_tests INTEGER DEFAULT 0,
  total_test_attempts INTEGER DEFAULT 0,
  avg_student_score DECIMAL(5,2) DEFAULT 0,
  most_difficult_subject TEXT,
  most_popular_test_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tutor_id, center_id)
);

CREATE INDEX idx_tutor_analytics_tutor ON tutor_analytics(tutor_id);

-- 6. Function to update student analytics after test attempt
CREATE OR REPLACE FUNCTION update_student_analytics()
RETURNS TRIGGER AS $$
DECLARE
  v_center_id UUID;
  v_total_questions INTEGER;
  v_correct_answers INTEGER;
  v_xp_gained INTEGER;
  v_new_level INTEGER;
  v_current_date DATE := CURRENT_DATE;
  v_last_activity DATE;
  v_new_streak INTEGER;
BEGIN
  -- Get center_id from question_set
  SELECT center_id INTO v_center_id
  FROM tc_question_sets
  WHERE id = NEW.question_set_id;
  
  -- Calculate correct answers
  v_correct_answers := (NEW.score * NEW.total_questions / 100)::INTEGER;
  
  -- Calculate XP (base 10 per question + bonus for high scores)
  v_xp_gained := NEW.total_questions * 10;
  IF NEW.score >= 90 THEN
    v_xp_gained := v_xp_gained + 50;
  ELSIF NEW.score >= 80 THEN
    v_xp_gained := v_xp_gained + 30;
  ELSIF NEW.score >= 70 THEN
    v_xp_gained := v_xp_gained + 20;
  END IF;
  
  -- Insert or update student analytics
  INSERT INTO student_analytics (
    student_id, center_id, total_tests_taken, total_questions_answered,
    total_correct_answers, total_time_spent, xp_points, last_activity_date
  ) VALUES (
    NEW.student_id, v_center_id, 1, NEW.total_questions,
    v_correct_answers, NEW.time_taken, v_xp_gained, v_current_date
  )
  ON CONFLICT (student_id, center_id) DO UPDATE SET
    total_tests_taken = student_analytics.total_tests_taken + 1,
    total_questions_answered = student_analytics.total_questions_answered + NEW.total_questions,
    total_correct_answers = student_analytics.total_correct_answers + v_correct_answers,
    total_time_spent = student_analytics.total_time_spent + NEW.time_taken,
    xp_points = student_analytics.xp_points + v_xp_gained,
    last_activity_date = v_current_date,
    updated_at = NOW();
  
  -- Update streak
  SELECT last_activity_date INTO v_last_activity
  FROM student_analytics
  WHERE student_id = NEW.student_id AND center_id = v_center_id;
  
  IF v_last_activity IS NULL OR v_last_activity = v_current_date THEN
    v_new_streak := COALESCE((SELECT current_streak FROM student_analytics WHERE student_id = NEW.student_id AND center_id = v_center_id), 0);
  ELSIF v_last_activity = v_current_date - INTERVAL '1 day' THEN
    v_new_streak := COALESCE((SELECT current_streak FROM student_analytics WHERE student_id = NEW.student_id AND center_id = v_center_id), 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;
  
  UPDATE student_analytics SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak)
  WHERE student_id = NEW.student_id AND center_id = v_center_id;
  
  -- Calculate level (every 100 XP = 1 level)
  SELECT (xp_points / 100) + 1 INTO v_new_level
  FROM student_analytics
  WHERE student_id = NEW.student_id AND center_id = v_center_id;
  
  -- Calculate tier based on XP
  UPDATE student_analytics SET
    level = v_new_level,
    tier = CASE
      WHEN xp_points >= 5000 THEN 'diamond'
      WHEN xp_points >= 2500 THEN 'platinum'
      WHEN xp_points >= 1000 THEN 'gold'
      WHEN xp_points >= 500 THEN 'silver'
      ELSE 'bronze'
    END,
    avg_score = (total_correct_answers::DECIMAL / NULLIF(total_questions_answered, 0) * 100)
  WHERE student_id = NEW.student_id AND center_id = v_center_id;
  
  -- Update question set stats
  UPDATE tc_question_sets SET
    total_attempts = total_attempts + 1,
    avg_score = (
      SELECT AVG(score)
      FROM tc_student_attempts
      WHERE question_set_id = NEW.question_set_id
    )
  WHERE id = NEW.question_set_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_student_analytics ON tc_student_attempts;
CREATE TRIGGER trigger_update_student_analytics
AFTER INSERT ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION update_student_analytics();

-- 7. Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_achievement RECORD;
  v_student_value INTEGER;
BEGIN
  -- Check each achievement
  FOR v_achievement IN SELECT * FROM achievements LOOP
    -- Skip if already earned
    IF EXISTS (
      SELECT 1 FROM student_achievements
      WHERE student_id = NEW.student_id AND achievement_id = v_achievement.id
    ) THEN
      CONTINUE;
    END IF;
    
    -- Check requirement
    CASE v_achievement.requirement_type
      WHEN 'tests_completed' THEN
        v_student_value := NEW.total_tests_taken;
      WHEN 'questions_answered' THEN
        v_student_value := NEW.total_questions_answered;
      WHEN 'streak' THEN
        v_student_value := NEW.current_streak;
      WHEN 'score_achieved' THEN
        v_student_value := NEW.avg_score::INTEGER;
      ELSE
        CONTINUE;
    END CASE;
    
    -- Award achievement if requirement met
    IF v_student_value >= v_achievement.requirement_value THEN
      INSERT INTO student_achievements (student_id, achievement_id)
      VALUES (NEW.student_id, v_achievement.id)
      ON CONFLICT DO NOTHING;
      
      -- Add XP reward
      UPDATE student_analytics
      SET xp_points = xp_points + v_achievement.xp_reward
      WHERE student_id = NEW.student_id AND center_id = NEW.center_id;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_check_achievements ON student_analytics;
CREATE TRIGGER trigger_check_achievements
AFTER INSERT OR UPDATE ON student_analytics
FOR EACH ROW
EXECUTE FUNCTION check_achievements();

-- 8. RLS Policies for new tables
ALTER TABLE student_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_analytics ENABLE ROW LEVEL SECURITY;

-- Student analytics policies
CREATE POLICY "Students can view their own analytics"
  ON student_analytics FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view their center analytics"
  ON student_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutorial_centers
      WHERE tutorial_centers.id = student_analytics.center_id
      AND tutorial_centers.tutor_id = auth.uid()
    )
  );

-- Achievements policies
CREATE POLICY "Everyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

-- Student achievements policies
CREATE POLICY "Students can view their achievements"
  ON student_achievements FOR SELECT
  USING (auth.uid() = student_id);

-- Tutor analytics policies
CREATE POLICY "Tutors can view their analytics"
  ON tutor_analytics FOR SELECT
  USING (auth.uid() = tutor_id);

-- 9. Create views for leaderboards
CREATE OR REPLACE VIEW leaderboard_by_center AS
SELECT 
  sa.center_id,
  sa.student_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as student_name,
  sa.xp_points,
  sa.level,
  sa.tier,
  sa.total_tests_taken,
  sa.avg_score,
  sa.current_streak,
  sa.longest_streak,
  RANK() OVER (PARTITION BY sa.center_id ORDER BY sa.xp_points DESC) as rank
FROM student_analytics sa
JOIN auth.users u ON u.id = sa.student_id
ORDER BY sa.center_id, sa.xp_points DESC;

CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
  sa.student_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as student_name,
  SUM(sa.xp_points) as total_xp,
  MAX(sa.level) as max_level,
  MAX(sa.tier) as highest_tier,
  SUM(sa.total_tests_taken) as total_tests,
  AVG(sa.avg_score) as overall_avg_score,
  MAX(sa.longest_streak) as best_streak,
  RANK() OVER (ORDER BY SUM(sa.xp_points) DESC) as global_rank
FROM student_analytics sa
JOIN auth.users u ON u.id = sa.student_id
GROUP BY sa.student_id, u.email, u.raw_user_meta_data->>'full_name'
ORDER BY total_xp DESC;

-- 10. Helper functions for analytics
CREATE OR REPLACE FUNCTION get_student_performance_trend(p_student_id UUID, p_center_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(date DATE, avg_score DECIMAL, tests_taken INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(completed_at) as date,
    AVG(score)::DECIMAL(5,2) as avg_score,
    COUNT(*)::INTEGER as tests_taken
  FROM tc_student_attempts tsa
  JOIN tc_question_sets tqs ON tqs.id = tsa.question_set_id
  WHERE tsa.student_id = p_student_id
    AND tqs.center_id = p_center_id
    AND completed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(completed_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_question_difficulty_stats(p_center_id UUID)
RETURNS TABLE(question_id UUID, difficulty_rating DECIMAL, times_answered INTEGER, success_rate DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    CASE 
      WHEN q.times_answered = 0 THEN 0
      ELSE (1 - (q.times_correct::DECIMAL / q.times_answered)) * 100
    END as difficulty_rating,
    q.times_answered,
    CASE 
      WHEN q.times_answered = 0 THEN 0
      ELSE (q.times_correct::DECIMAL / q.times_answered * 100)
    END as success_rate
  FROM tc_questions q
  WHERE q.center_id = p_center_id
  ORDER BY difficulty_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 database enhancements completed successfully!';
  RAISE NOTICE '📊 New tables: student_analytics, achievements, student_achievements, tutor_analytics';
  RAISE NOTICE '🎮 Gamification: XP, levels, tiers, streaks, badges';
  RAISE NOTICE '📈 Analytics: Performance tracking, leaderboards, trends';
END $$;
