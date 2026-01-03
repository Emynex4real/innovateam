-- CRITICAL FIX: Prevent Race Conditions
-- Run this NOW to prevent duplicate first attempts

BEGIN;

-- Add unique constraint (prevents duplicates at database level)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_first_attempt 
ON practice_sessions (user_id, bank_id) 
WHERE is_first_attempt = true;

-- Add validation constraints (PostgreSQL doesn't support IF NOT EXISTS for constraints)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_percentage') THEN
    ALTER TABLE practice_sessions ADD CONSTRAINT check_valid_percentage 
    CHECK (percentage >= 0 AND percentage <= 100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_valid_time') THEN
    ALTER TABLE practice_sessions ADD CONSTRAINT check_valid_time 
    CHECK (time_spent >= 0);
  END IF;
END $$;

COMMIT;

-- Verify
SELECT 'Critical constraints added!' as status;
