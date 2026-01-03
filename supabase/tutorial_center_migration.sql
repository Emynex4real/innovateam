-- ============================================
-- TUTORIAL CENTER SYSTEM - DATABASE MIGRATION
-- ============================================
-- Run this in your Supabase SQL Editor
-- This creates all tables, triggers, and security policies

-- ============================================
-- 1. TUTORIAL CENTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tutorial_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  access_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_center_per_tutor UNIQUE(tutor_id)
);

CREATE INDEX IF NOT EXISTS idx_tutorial_centers_tutor ON tutorial_centers(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_code ON tutorial_centers(access_code);

-- ============================================
-- 2. QUESTIONS TABLE (Tutorial Center Question Bank)
-- ============================================
CREATE TABLE IF NOT EXISTS tc_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_questions_center ON tc_questions(center_id);
CREATE INDEX IF NOT EXISTS idx_tc_questions_tutor ON tc_questions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tc_questions_subject ON tc_questions(subject);

-- ============================================
-- 3. QUESTION SETS TABLE (Tests/Exams)
-- ============================================
CREATE TABLE IF NOT EXISTS tc_question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER NOT NULL,
  passing_score INTEGER NOT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
  show_answers BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_question_sets_center ON tc_question_sets(center_id);
CREATE INDEX IF NOT EXISTS idx_tc_question_sets_tutor ON tc_question_sets(tutor_id);

-- ============================================
-- 4. QUESTION SET ITEMS TABLE (Links questions to sets)
-- ============================================
CREATE TABLE IF NOT EXISTS tc_question_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES tc_questions(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(question_set_id, question_id),
  UNIQUE(question_set_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_tc_qsi_set ON tc_question_set_items(question_set_id);
CREATE INDEX IF NOT EXISTS idx_tc_qsi_question ON tc_question_set_items(question_id);

-- ============================================
-- 5. ENROLLMENTS TABLE (Students join centers)
-- ============================================
CREATE TABLE IF NOT EXISTS tc_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_tc_enrollments_student ON tc_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_tc_enrollments_center ON tc_enrollments(center_id);

-- ============================================
-- 6. STUDENT ATTEMPTS TABLE (Test results)
-- ============================================
CREATE TABLE IF NOT EXISTS tc_student_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  is_first_attempt BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_attempts_student ON tc_student_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_tc_attempts_set ON tc_student_attempts(question_set_id);
CREATE INDEX IF NOT EXISTS idx_tc_attempts_first ON tc_student_attempts(is_first_attempt) WHERE is_first_attempt = TRUE;

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate unique 6-character access code
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM tutorial_centers WHERE access_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate access code
CREATE OR REPLACE FUNCTION set_access_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NULL OR NEW.access_code = '' THEN
    NEW.access_code := generate_access_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_center_access_code ON tutorial_centers;
CREATE TRIGGER generate_center_access_code
BEFORE INSERT ON tutorial_centers
FOR EACH ROW
EXECUTE FUNCTION set_access_code();

-- Function to mark first attempt
CREATE OR REPLACE FUNCTION mark_first_attempt()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tc_student_attempts 
    WHERE student_id = NEW.student_id 
    AND question_set_id = NEW.question_set_id 
    AND id != NEW.id
  ) THEN
    NEW.is_first_attempt := TRUE;
  ELSE
    NEW.is_first_attempt := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_first_attempt ON tc_student_attempts;
CREATE TRIGGER set_first_attempt
BEFORE INSERT ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION mark_first_attempt();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tutorial_centers_updated_at ON tutorial_centers;
CREATE TRIGGER update_tutorial_centers_updated_at
BEFORE UPDATE ON tutorial_centers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tc_questions_updated_at ON tc_questions;
CREATE TRIGGER update_tc_questions_updated_at
BEFORE UPDATE ON tc_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_tc_question_sets_updated_at ON tc_question_sets;
CREATE TRIGGER update_tc_question_sets_updated_at
BEFORE UPDATE ON tc_question_sets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tutorial_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_question_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_student_attempts ENABLE ROW LEVEL SECURITY;

-- TUTORIAL CENTERS POLICIES
DROP POLICY IF EXISTS "Tutors can create their own center" ON tutorial_centers;
CREATE POLICY "Tutors can create their own center"
  ON tutorial_centers FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Tutors can view their own center" ON tutorial_centers;
CREATE POLICY "Tutors can view their own center"
  ON tutorial_centers FOR SELECT
  USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Tutors can update their own center" ON tutorial_centers;
CREATE POLICY "Tutors can update their own center"
  ON tutorial_centers FOR UPDATE
  USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Students can view enrolled centers" ON tutorial_centers;
CREATE POLICY "Students can view enrolled centers"
  ON tutorial_centers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tutorial_centers.id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- QUESTIONS POLICIES
DROP POLICY IF EXISTS "Tutors can manage their questions" ON tc_questions;
CREATE POLICY "Tutors can manage their questions"
  ON tc_questions FOR ALL
  USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Students can view questions from enrolled centers" ON tc_questions;
CREATE POLICY "Students can view questions from enrolled centers"
  ON tc_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tc_questions.center_id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- QUESTION SETS POLICIES
DROP POLICY IF EXISTS "Tutors can manage their question sets" ON tc_question_sets;
CREATE POLICY "Tutors can manage their question sets"
  ON tc_question_sets FOR ALL
  USING (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Students can view active sets from enrolled centers" ON tc_question_sets;
CREATE POLICY "Students can view active sets from enrolled centers"
  ON tc_question_sets FOR SELECT
  USING (
    is_active = TRUE AND
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tc_question_sets.center_id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- QUESTION SET ITEMS POLICIES
DROP POLICY IF EXISTS "Tutors can manage question set items" ON tc_question_set_items;
CREATE POLICY "Tutors can manage question set items"
  ON tc_question_set_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets 
      WHERE tc_question_sets.id = tc_question_set_items.question_set_id 
      AND tc_question_sets.tutor_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view items from enrolled centers" ON tc_question_set_items;
CREATE POLICY "Students can view items from enrolled centers"
  ON tc_question_set_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets qs
      JOIN tc_enrollments e ON e.center_id = qs.center_id
      WHERE qs.id = tc_question_set_items.question_set_id 
      AND e.student_id = auth.uid()
      AND qs.is_active = TRUE
    )
  );

-- ENROLLMENTS POLICIES
DROP POLICY IF EXISTS "Students can enroll themselves" ON tc_enrollments;
CREATE POLICY "Students can enroll themselves"
  ON tc_enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their enrollments" ON tc_enrollments;
CREATE POLICY "Students can view their enrollments"
  ON tc_enrollments FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Tutors can view their center enrollments" ON tc_enrollments;
CREATE POLICY "Tutors can view their center enrollments"
  ON tc_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutorial_centers 
      WHERE tutorial_centers.id = tc_enrollments.center_id 
      AND tutorial_centers.tutor_id = auth.uid()
    )
  );

-- STUDENT ATTEMPTS POLICIES
DROP POLICY IF EXISTS "Students can create their attempts" ON tc_student_attempts;
CREATE POLICY "Students can create their attempts"
  ON tc_student_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their attempts" ON tc_student_attempts;
CREATE POLICY "Students can view their attempts"
  ON tc_student_attempts FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Tutors can view attempts for their question sets" ON tc_student_attempts;
CREATE POLICY "Tutors can view attempts for their question sets"
  ON tc_student_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets 
      WHERE tc_question_sets.id = tc_student_attempts.question_set_id 
      AND tc_question_sets.tutor_id = auth.uid()
    )
  );

-- ============================================
-- 9. HELPER VIEWS (Optional but useful)
-- ============================================

-- View for leaderboard (first attempts only)
CREATE OR REPLACE VIEW tc_leaderboard AS
SELECT 
  sa.question_set_id,
  sa.student_id,
  u.raw_user_meta_data->>'name' as student_name,
  sa.score,
  sa.total_questions,
  sa.time_taken,
  sa.completed_at,
  RANK() OVER (PARTITION BY sa.question_set_id ORDER BY sa.score DESC, sa.time_taken ASC) as rank
FROM tc_student_attempts sa
JOIN auth.users u ON u.id = sa.student_id
WHERE sa.is_first_attempt = TRUE;

-- View for center statistics
CREATE OR REPLACE VIEW tc_center_stats AS
SELECT 
  tc.id as center_id,
  tc.name as center_name,
  tc.tutor_id,
  COUNT(DISTINCT e.student_id) as student_count,
  COUNT(DISTINCT q.id) as question_count,
  COUNT(DISTINCT qs.id) as question_set_count,
  COUNT(DISTINCT sa.id) as total_attempts
FROM tutorial_centers tc
LEFT JOIN tc_enrollments e ON e.center_id = tc.id
LEFT JOIN tc_questions q ON q.center_id = tc.id
LEFT JOIN tc_question_sets qs ON qs.center_id = tc.id
LEFT JOIN tc_student_attempts sa ON sa.question_set_id = qs.id
GROUP BY tc.id, tc.name, tc.tutor_id;

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Verify tables are created
-- 3. Test with sample data
-- ============================================
