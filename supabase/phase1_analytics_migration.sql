-- ============================================
-- PHASE 1: ADVANCED ANALYTICS & INSIGHTS
-- ============================================
-- Run this migration after tutorial_center_migration.sql

-- ============================================
-- 1. STUDENT PERFORMANCE ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS student_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Overall Statistics
  total_attempts INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  overall_accuracy DECIMAL(5,2) DEFAULT 0,
  
  -- Performance Metrics
  average_score DECIMAL(5,2) DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  lowest_score INTEGER DEFAULT 0,
  recent_score_trend DECIMAL(5,2) DEFAULT 0, -- 7-day trend (-100 to 100)
  
  -- Time Metrics
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  average_time_per_question INTEGER DEFAULT 0,
  study_consistency DECIMAL(5,2) DEFAULT 0, -- 0-100 score
  
  -- Engagement
  days_active INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Topic/Subject Performance
  strongest_subject TEXT,
  weakest_subject TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_spa_student ON student_performance_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_spa_center ON student_performance_analytics(center_id);
CREATE INDEX IF NOT EXISTS idx_spa_updated ON student_performance_analytics(updated_at);

-- ============================================
-- 2. STUDENT PERFORMANCE BY SUBJECT/TOPIC
-- ============================================
CREATE TABLE IF NOT EXISTS student_subject_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  
  -- Subject-specific stats
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  
  -- Trend
  score_trend DECIMAL(5,2) DEFAULT 0, -- Direction of improvement
  difficulty_level TEXT DEFAULT 'medium', -- easy, medium, hard
  mastery_level DECIMAL(5,2) DEFAULT 0, -- 0-100 mastery score
  
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id, subject)
);

CREATE INDEX IF NOT EXISTS idx_ssp_student ON student_subject_performance(student_id);
CREATE INDEX IF NOT EXISTS idx_ssp_center ON student_subject_performance(center_id);
CREATE INDEX IF NOT EXISTS idx_ssp_subject ON student_subject_performance(subject);

-- ============================================
-- 3. STUDENT PREDICTIONS (At-Risk Detection)
-- ============================================
CREATE TABLE IF NOT EXISTS student_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- At-Risk Scoring (0-100)
  at_risk_score DECIMAL(5,2) DEFAULT 0,
  at_risk_level TEXT DEFAULT 'low', -- low, medium, high, critical
  
  -- Prediction Factors
  score_declining BOOLEAN DEFAULT FALSE,
  low_engagement BOOLEAN DEFAULT FALSE,
  high_difficulty_struggle BOOLEAN DEFAULT FALSE,
  inconsistent_performance BOOLEAN DEFAULT FALSE,
  
  -- Predictions
  predicted_pass_rate DECIMAL(5,2) DEFAULT 0, -- % chance of passing
  recommended_action TEXT,
  
  -- Risk Indicators
  days_since_last_activity INTEGER DEFAULT 0,
  failed_attempts_recent INTEGER DEFAULT 0,
  average_recent_score DECIMAL(5,2) DEFAULT 0,
  
  -- Recommendations
  recommended_topics JSONB, -- Array of weak topics
  suggested_study_hours DECIMAL(4,2) DEFAULT 0,
  
  -- Tutor Notifications
  tutor_notified BOOLEAN DEFAULT FALSE,
  tutor_notified_at TIMESTAMPTZ,
  tutor_action_taken BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_sp_student ON student_predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_sp_center ON student_predictions(center_id);
CREATE INDEX IF NOT EXISTS idx_sp_risk_level ON student_predictions(at_risk_level);

-- ============================================
-- 4. STUDY SESSION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS study_session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id UUID REFERENCES tc_question_sets(id) ON DELETE SET NULL,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Session Details
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Activity
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  session_score DECIMAL(5,2),
  
  -- Engagement
  focus_quality TEXT DEFAULT 'normal', -- low, normal, high
  breaks_taken INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ssl_student ON study_session_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_ssl_center ON study_session_logs(center_id);
CREATE INDEX IF NOT EXISTS idx_ssl_session_start ON study_session_logs(session_start);

-- ============================================
-- 5. CENTER ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS center_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Overview Statistics
  total_students INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  total_tests_taken INTEGER DEFAULT 0,
  average_student_score DECIMAL(5,2) DEFAULT 0,
  
  -- Performance Metrics
  pass_rate DECIMAL(5,2) DEFAULT 0, -- % of students passing
  at_risk_students INTEGER DEFAULT 0,
  improving_students INTEGER DEFAULT 0,
  declining_students INTEGER DEFAULT 0,
  
  -- Engagement
  average_attempts_per_student DECIMAL(5,2) DEFAULT 0,
  average_time_per_student INTEGER DEFAULT 0,
  overall_engagement_score DECIMAL(5,2) DEFAULT 0,
  
  -- Content Performance
  most_difficult_subject TEXT,
  most_difficult_topic TEXT,
  most_missed_question_id UUID REFERENCES tc_questions(id) ON DELETE SET NULL,
  
  -- Trends
  weekly_improvement DECIMAL(5,2) DEFAULT 0,
  student_retention_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(center_id)
);

CREATE INDEX IF NOT EXISTS idx_ca_center ON center_analytics(center_id);
CREATE INDEX IF NOT EXISTS idx_ca_updated ON center_analytics(updated_at);

-- ============================================
-- 6. QUESTION PERFORMANCE ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS question_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES tc_questions(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Question Stats
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0,
  average_time_to_answer INTEGER DEFAULT 0, -- seconds
  
  -- Difficulty Classification
  calculated_difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  discrimination_index DECIMAL(5,2) DEFAULT 0, -- How well it distinguishes
  
  -- Student Performance
  student_count_solved INTEGER DEFAULT 0,
  student_count_missed INTEGER DEFAULT 0,
  
  -- Feedback
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT, -- ambiguous, too easy, too hard, unclear
  tutor_review_needed BOOLEAN DEFAULT FALSE,
  
  -- Stats Update
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(question_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_qpa_question ON question_performance_analytics(question_id);
CREATE INDEX IF NOT EXISTS idx_qpa_center ON question_performance_analytics(center_id);
CREATE INDEX IF NOT EXISTS idx_qpa_difficulty ON question_performance_analytics(calculated_difficulty);

-- ============================================
-- 7. TUTOR INSIGHTS & METRICS
-- ============================================
CREATE TABLE IF NOT EXISTS tutor_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Center Health
  center_health_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  health_status TEXT DEFAULT 'good', -- critical, poor, fair, good, excellent
  
  -- Content Quality
  question_quality_score DECIMAL(5,2) DEFAULT 0,
  test_quality_score DECIMAL(5,2) DEFAULT 0,
  content_coverage_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Teaching Effectiveness
  student_satisfaction_score DECIMAL(5,2) DEFAULT 0,
  average_student_improvement DECIMAL(5,2) DEFAULT 0,
  problem_areas JSONB, -- Topics with low performance
  
  -- Alerts & Recommendations
  urgent_alerts JSONB, -- Array of issues needing attention
  improvement_suggestions JSONB, -- Recommended actions
  
  -- Content Gaps
  untested_topics JSONB, -- Topics without questions
  duplicate_content BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tutor_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_ti_tutor ON tutor_insights(tutor_id);
CREATE INDEX IF NOT EXISTS idx_ti_center ON tutor_insights(center_id);
CREATE INDEX IF NOT EXISTS idx_ti_health ON tutor_insights(health_status);

-- ============================================
-- 8. PERFORMANCE HISTORY (Time-Series Data)
-- ============================================
CREATE TABLE IF NOT EXISTS performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  
  -- Snapshot Data (daily aggregation)
  snapshot_date DATE NOT NULL,
  daily_average_score DECIMAL(5,2),
  daily_attempts INTEGER DEFAULT 0,
  daily_accuracy DECIMAL(5,2),
  daily_study_time INTEGER DEFAULT 0,
  
  -- Weekly aggregation
  week_average_score DECIMAL(5,2),
  week_attempts INTEGER DEFAULT 0,
  week_accuracy DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_ph_student ON performance_history(student_id);
CREATE INDEX IF NOT EXISTS idx_ph_date ON performance_history(snapshot_date);

-- ============================================
-- 9. FUNCTIONS & TRIGGERS FOR ANALYTICS
-- ============================================

-- Function to calculate at-risk score
CREATE OR REPLACE FUNCTION calculate_at_risk_score(
  p_average_recent_score DECIMAL,
  p_days_since_activity INTEGER,
  p_score_declining BOOLEAN,
  p_low_engagement BOOLEAN
)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL := 0;
BEGIN
  -- Low score contribution
  IF p_average_recent_score < 50 THEN
    v_score := v_score + (50 - p_average_recent_score);
  END IF;
  
  -- Inactivity contribution
  IF p_days_since_activity > 7 THEN
    v_score := v_score + (p_days_since_activity * 2);
  END IF;
  
  -- Declining trend
  IF p_score_declining THEN
    v_score := v_score + 20;
  END IF;
  
  -- Low engagement
  IF p_low_engagement THEN
    v_score := v_score + 15;
  END IF;
  
  -- Cap at 100
  RETURN LEAST(v_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update student analytics after attempt
CREATE OR REPLACE FUNCTION update_student_analytics_after_attempt()
RETURNS TRIGGER AS $$
DECLARE
  v_total_attempts INTEGER;
  v_total_correct INTEGER;
  v_avg_score DECIMAL;
  v_analytics_id UUID;
BEGIN
  -- Get question set details
  SELECT center_id INTO v_analytics_id FROM tc_question_sets WHERE id = NEW.question_set_id;
  
  -- Calculate totals
  SELECT 
    COUNT(*)::INTEGER,
    SUM(CASE WHEN score >= (SELECT passing_score FROM tc_question_sets WHERE id = NEW.question_set_id) THEN 1 ELSE 0 END)::INTEGER,
    AVG(score)::DECIMAL
  INTO v_total_attempts, v_total_correct, v_avg_score
  FROM tc_student_attempts
  WHERE student_id = NEW.student_id 
    AND question_set_id IN (SELECT id FROM tc_question_sets WHERE center_id = v_analytics_id);
  
  -- Insert or update analytics
  INSERT INTO student_performance_analytics (student_id, center_id, total_attempts, average_score, updated_at)
  VALUES (NEW.student_id, v_analytics_id, v_total_attempts, v_avg_score, NOW())
  ON CONFLICT (student_id, center_id) 
  DO UPDATE SET 
    total_attempts = EXCLUDED.total_attempts,
    average_score = EXCLUDED.average_score,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics
DROP TRIGGER IF EXISTS trigger_update_analytics ON tc_student_attempts;
CREATE TRIGGER trigger_update_analytics
AFTER INSERT ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION update_student_analytics_after_attempt();

-- Function to detect at-risk students
CREATE OR REPLACE FUNCTION update_at_risk_status(p_center_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update all at-risk predictions for the center
  UPDATE student_predictions sp
  SET 
    at_risk_score = calculate_at_risk_score(
      COALESCE(spa.average_score, 0),
      COALESCE(EXTRACT(EPOCH FROM (NOW() - spa.last_activity)) / 86400, 99)::INTEGER,
      COALESCE((spa.recent_score_trend < -10), FALSE),
      COALESCE((spa.study_consistency < 40), FALSE)
    ),
    at_risk_level = CASE 
      WHEN calculate_at_risk_score(
        COALESCE(spa.average_score, 0),
        COALESCE(EXTRACT(EPOCH FROM (NOW() - spa.last_activity)) / 86400, 99)::INTEGER,
        COALESCE((spa.recent_score_trend < -10), FALSE),
        COALESCE((spa.study_consistency < 40), FALSE)
      ) >= 75 THEN 'critical'
      WHEN calculate_at_risk_score(
        COALESCE(spa.average_score, 0),
        COALESCE(EXTRACT(EPOCH FROM (NOW() - spa.last_activity)) / 86400, 99)::INTEGER,
        COALESCE((spa.recent_score_trend < -10), FALSE),
        COALESCE((spa.study_consistency < 40), FALSE)
      ) >= 50 THEN 'high'
      WHEN calculate_at_risk_score(
        COALESCE(spa.average_score, 0),
        COALESCE(EXTRACT(EPOCH FROM (NOW() - spa.last_activity)) / 86400, 99)::INTEGER,
        COALESCE((spa.recent_score_trend < -10), FALSE),
        COALESCE((spa.study_consistency < 40), FALSE)
      ) >= 25 THEN 'medium'
      ELSE 'low'
    END,
    updated_at = NOW()
  FROM student_performance_analytics spa
  WHERE sp.student_id = spa.student_id 
    AND sp.center_id = spa.center_id
    AND spa.center_id = p_center_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. RLS POLICIES FOR ANALYTICS
-- ============================================

-- Enable RLS on analytics tables
ALTER TABLE student_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subject_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE center_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_history ENABLE ROW LEVEL SECURITY;

-- Student can view their own analytics
CREATE POLICY "Students view own analytics" ON student_performance_analytics
  FOR SELECT USING (student_id = auth.uid());

-- Tutor can view their center's student analytics
CREATE POLICY "Tutors view center student analytics" ON student_performance_analytics
  FOR SELECT USING (
    center_id IN (
      SELECT id FROM tutorial_centers WHERE tutor_id = auth.uid()
    )
  );

-- Tutor can view center analytics
CREATE POLICY "Tutors view center analytics" ON center_analytics
  FOR SELECT USING (
    center_id IN (
      SELECT id FROM tutorial_centers WHERE tutor_id = auth.uid()
    )
  );

-- Similar policies for other tables...
CREATE POLICY "Tutors view question analytics" ON question_performance_analytics
  FOR SELECT USING (
    center_id IN (
      SELECT id FROM tutorial_centers WHERE tutor_id = auth.uid()
    )
  );

CREATE POLICY "Students view predictions" ON student_predictions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Tutors view student predictions" ON student_predictions
  FOR SELECT USING (
    center_id IN (
      SELECT id FROM tutorial_centers WHERE tutor_id = auth.uid()
    )
  );
