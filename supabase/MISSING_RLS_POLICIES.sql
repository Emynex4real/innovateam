-- CRITICAL: Missing RLS Policies for Tutorial Center Tables
-- Apply these immediately to prevent data leaks

-- Enable RLS on all tables
ALTER TABLE tutorial_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_student_attempts ENABLE ROW LEVEL SECURITY;

-- Tutorial Centers: Tutors can only access their own centers
CREATE POLICY "Tutors can view own center" ON tutorial_centers
FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update own center" ON tutorial_centers
FOR UPDATE USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete own center" ON tutorial_centers
FOR DELETE USING (auth.uid() = tutor_id);

-- Questions: Tutors can only access questions in their center
CREATE POLICY "Tutors can view own questions" ON tc_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutorial_centers 
    WHERE id = tc_questions.center_id 
    AND tutor_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage own questions" ON tc_questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tutorial_centers 
    WHERE id = tc_questions.center_id 
    AND tutor_id = auth.uid()
  )
);

-- Question Sets: Tutors can only access their own tests
CREATE POLICY "Tutors can view own tests" ON tc_question_sets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutorial_centers 
    WHERE id = tc_question_sets.center_id 
    AND tutor_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage own tests" ON tc_question_sets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tutorial_centers 
    WHERE id = tc_question_sets.center_id 
    AND tutor_id = auth.uid()
  )
);

-- Enrollments: Students can view their own, tutors can view their center's
CREATE POLICY "Students can view own enrollments" ON tc_enrollments
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view center enrollments" ON tc_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutorial_centers 
    WHERE id = tc_enrollments.center_id 
    AND tutor_id = auth.uid()
  )
);

-- Attempts: Students can view own, tutors can view their students'
CREATE POLICY "Students can view own attempts" ON tc_student_attempts
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view student attempts" ON tc_student_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tc_question_sets qs
    JOIN tutorial_centers tc ON qs.center_id = tc.id
    WHERE qs.id = tc_student_attempts.question_set_id
    AND tc.tutor_id = auth.uid()
  )
);
