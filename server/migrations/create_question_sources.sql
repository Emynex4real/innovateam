-- Knowledge Base for Question Generation
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  source_type VARCHAR(50) DEFAULT 'textbook', -- 'textbook', 'syllabus', 'past_questions', 'notes'
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}', -- For additional info (author, year, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_question_sources_subject ON question_sources(subject);
CREATE INDEX idx_question_sources_topic ON question_sources(topic);
CREATE INDEX idx_question_sources_subject_topic ON question_sources(subject, topic);
CREATE INDEX idx_question_sources_active ON question_sources(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE question_sources ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active sources
CREATE POLICY "Users can read active question sources"
  ON question_sources FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow authenticated users to create sources
CREATE POLICY "Users can create question sources"
  ON question_sources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own sources
CREATE POLICY "Users can update own question sources"
  ON question_sources FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_question_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER question_sources_updated_at
  BEFORE UPDATE ON question_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_question_sources_updated_at();

-- Insert sample JAMB content (optional)
INSERT INTO question_sources (subject, topic, content, source_type, difficulty) VALUES
('Mathematics', 'Algebra', 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In elementary algebra, those symbols represent quantities without fixed values, known as variables. Linear equations involve variables raised to the first power. A linear equation in one variable has the form ax + b = 0. Quadratic equations have the form ax² + bx + c = 0. The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. Factoring is the process of breaking down an expression into simpler components.', 'syllabus', 'medium'),
('Physics', 'Mechanics', 'Mechanics is the branch of physics dealing with motion and forces. Newton''s First Law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force. Newton''s Second Law: F = ma (Force equals mass times acceleration). Newton''s Third Law: For every action, there is an equal and opposite reaction. Work is defined as W = F × d (force times distance). Power is the rate of doing work: P = W/t. Kinetic energy is KE = ½mv². Potential energy is PE = mgh.', 'syllabus', 'medium');

COMMENT ON TABLE question_sources IS 'Knowledge base for AI question generation - stores curated content for each subject/topic';
