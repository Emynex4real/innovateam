-- Add image_url to tc_questions and past_questions tables
ALTER TABLE tc_questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE past_questions ADD COLUMN IF NOT EXISTS image_url TEXT;
