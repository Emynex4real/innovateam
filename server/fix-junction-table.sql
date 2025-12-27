-- Create junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS tc_question_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES tc_questions(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_set_id, question_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tc_question_set_items_set_id ON tc_question_set_items(question_set_id);
CREATE INDEX IF NOT EXISTS idx_tc_question_set_items_question_id ON tc_question_set_items(question_id);
