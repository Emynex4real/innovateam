-- Add missing index for tutorial_centers
-- Run this in Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_tutorial_centers_tutor_id 
ON tutorial_centers(tutor_id) 
WHERE deleted_at IS NULL;

-- Verify it was created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'tutorial_centers' 
AND indexname = 'idx_tutorial_centers_tutor_id';
