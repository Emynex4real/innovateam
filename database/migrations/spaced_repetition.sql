-- Spaced Repetition System (SRS) - Run in Supabase SQL Editor
-- Note: Replace 'ai_questions' with your actual questions table name if different

CREATE TABLE IF NOT EXISTS student_question_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL, -- Remove FK constraint if table doesn't exist yet
  mastery_level INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  next_review_date TIMESTAMP,
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, question_id)
);

CREATE INDEX idx_mastery_next_review ON student_question_mastery(student_id, next_review_date);

CREATE OR REPLACE FUNCTION update_question_mastery(
  p_student_id UUID,
  p_question_id UUID,
  p_is_correct BOOLEAN,
  p_quality_score INTEGER
) RETURNS VOID AS $$
DECLARE
  v_mastery RECORD;
  v_new_ease DECIMAL;
  v_new_interval INTEGER;
BEGIN
  SELECT * INTO v_mastery FROM student_question_mastery 
  WHERE student_id = p_student_id AND question_id = p_question_id;
  
  IF NOT FOUND THEN
    INSERT INTO student_question_mastery (student_id, question_id, total_attempts, consecutive_correct, last_seen_at)
    VALUES (p_student_id, p_question_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, NOW());
    RETURN;
  END IF;
  
  v_new_ease := v_mastery.ease_factor + (0.1 - (5 - p_quality_score) * (0.08 + (5 - p_quality_score) * 0.02));
  v_new_ease := GREATEST(1.30, v_new_ease);
  
  IF p_is_correct THEN
    IF v_mastery.consecutive_correct = 0 THEN v_new_interval := 1;
    ELSIF v_mastery.consecutive_correct = 1 THEN v_new_interval := 6;
    ELSE v_new_interval := ROUND(v_mastery.interval_days * v_new_ease);
    END IF;
  ELSE
    v_new_interval := 1;
  END IF;
  
  UPDATE student_question_mastery SET
    total_attempts = total_attempts + 1,
    consecutive_correct = CASE WHEN p_is_correct THEN consecutive_correct + 1 ELSE 0 END,
    mastery_level = LEAST(5, CASE WHEN p_is_correct THEN mastery_level + 1 ELSE GREATEST(0, mastery_level - 1) END),
    ease_factor = v_new_ease,
    interval_days = v_new_interval,
    next_review_date = NOW() + (v_new_interval || ' days')::INTERVAL,
    last_seen_at = NOW()
  WHERE student_id = p_student_id AND question_id = p_question_id;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE student_question_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_mastery_policy ON student_question_mastery FOR ALL USING (student_id = auth.uid());
