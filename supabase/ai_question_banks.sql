-- AI Question Banks Schema
-- This stores AI-generated questions for admin management

-- Question Banks Table (Categories/Collections)
CREATE TABLE IF NOT EXISTS question_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES question_banks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('multiple-choice', 'true-false', 'fill-in-blank', 'flashcard')),
  question TEXT NOT NULL,
  options JSONB, -- Array of options for multiple-choice/true-false
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[], -- Array of tags for categorization
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Usage Tracking
CREATE TABLE IF NOT EXISTS question_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_correct BOOLEAN,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_banks_created_by ON question_banks(created_by);
CREATE INDEX IF NOT EXISTS idx_question_banks_subject ON question_banks(subject);
CREATE INDEX IF NOT EXISTS idx_questions_bank_id ON questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_usage_question_id ON question_usage(question_id);
CREATE INDEX IF NOT EXISTS idx_question_usage_user_id ON question_usage(user_id);

-- RLS Policies
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage question banks" ON question_banks;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Users can view active questions" ON questions;
DROP POLICY IF EXISTS "Users can view active question banks" ON question_banks;
DROP POLICY IF EXISTS "Users can track their question usage" ON question_usage;
DROP POLICY IF EXISTS "Users can view their usage" ON question_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON question_usage;

-- Admin can do everything
CREATE POLICY "Admins can manage question banks" ON question_banks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Users can view active questions
CREATE POLICY "Users can view active questions" ON questions
  FOR SELECT USING (is_active = true);

-- Users can view active question banks
CREATE POLICY "Users can view active question banks" ON question_banks
  FOR SELECT USING (is_active = true);

-- Users can insert their own usage records
CREATE POLICY "Users can track their question usage" ON question_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view their usage" ON question_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all usage" ON question_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_question_banks_updated_at ON question_banks;
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_banks_updated_at BEFORE UPDATE ON question_banks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
