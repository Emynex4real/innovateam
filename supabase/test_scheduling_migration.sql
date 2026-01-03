-- ============================================
-- PHASE 3: TEST SCHEDULING MIGRATION
-- ============================================
-- Add scheduling fields to tc_question_sets table

-- Add scheduling columns
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_activate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_deactivate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_days JSONB, -- For weekly: [1,3,5] = Mon, Wed, Fri
ADD COLUMN IF NOT EXISTS last_activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_activation_at TIMESTAMPTZ;

-- Create index for scheduled tests
CREATE INDEX IF NOT EXISTS idx_tc_question_sets_scheduled ON tc_question_sets(scheduled_start, scheduled_end) 
WHERE auto_activate = TRUE OR auto_deactivate = TRUE;

CREATE INDEX IF NOT EXISTS idx_tc_question_sets_next_activation ON tc_question_sets(next_activation_at) 
WHERE is_recurring = TRUE;

-- ============================================
-- FUNCTION: Auto-activate scheduled tests
-- ============================================
CREATE OR REPLACE FUNCTION activate_scheduled_tests()
RETURNS void AS $$
BEGIN
  -- Activate tests that should start now
  UPDATE tc_question_sets
  SET 
    is_active = TRUE,
    last_activated_at = NOW()
  WHERE 
    auto_activate = TRUE
    AND scheduled_start <= NOW()
    AND (scheduled_end IS NULL OR scheduled_end > NOW())
    AND is_active = FALSE;
    
  -- Deactivate tests that should end now
  UPDATE tc_question_sets
  SET is_active = FALSE
  WHERE 
    auto_deactivate = TRUE
    AND scheduled_end <= NOW()
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Calculate next activation for recurring tests
-- ============================================
CREATE OR REPLACE FUNCTION calculate_next_activation(
  p_pattern TEXT,
  p_days JSONB,
  p_last_activation TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  next_date TIMESTAMPTZ;
  current_dow INTEGER;
  target_dow INTEGER;
  days_array INTEGER[];
BEGIN
  CASE p_pattern
    WHEN 'daily' THEN
      next_date := p_last_activation + INTERVAL '1 day';
      
    WHEN 'weekly' THEN
      -- Get current day of week (0=Sunday, 6=Saturday)
      current_dow := EXTRACT(DOW FROM p_last_activation);
      
      -- Convert JSONB array to INTEGER array
      SELECT ARRAY(SELECT jsonb_array_elements_text(p_days)::INTEGER) INTO days_array;
      
      -- Find next day in the array
      SELECT MIN(d) INTO target_dow
      FROM unnest(days_array) d
      WHERE d > current_dow;
      
      -- If no day found this week, get first day of next week
      IF target_dow IS NULL THEN
        target_dow := days_array[1];
        next_date := p_last_activation + INTERVAL '7 days' - (current_dow || ' days')::INTERVAL + (target_dow || ' days')::INTERVAL;
      ELSE
        next_date := p_last_activation + ((target_dow - current_dow) || ' days')::INTERVAL;
      END IF;
      
    WHEN 'monthly' THEN
      next_date := p_last_activation + INTERVAL '1 month';
      
    ELSE
      next_date := NULL;
  END CASE;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Update recurring test activations
-- ============================================
CREATE OR REPLACE FUNCTION update_recurring_tests()
RETURNS void AS $$
BEGIN
  -- Update next_activation_at for recurring tests
  UPDATE tc_question_sets
  SET next_activation_at = calculate_next_activation(
    recurrence_pattern,
    recurrence_days,
    COALESCE(last_activated_at, NOW())
  )
  WHERE 
    is_recurring = TRUE
    AND recurrence_pattern IS NOT NULL
    AND (next_activation_at IS NULL OR next_activation_at <= NOW());
    
  -- Activate recurring tests that are due
  UPDATE tc_question_sets
  SET 
    is_active = TRUE,
    last_activated_at = NOW()
  WHERE 
    is_recurring = TRUE
    AND next_activation_at <= NOW()
    AND is_active = FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-calculate next activation on insert/update
-- ============================================
CREATE OR REPLACE FUNCTION set_next_activation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_recurring = TRUE AND NEW.recurrence_pattern IS NOT NULL THEN
    NEW.next_activation_at := calculate_next_activation(
      NEW.recurrence_pattern,
      NEW.recurrence_days,
      COALESCE(NEW.last_activated_at, NOW())
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_next_activation_trigger ON tc_question_sets;
CREATE TRIGGER calculate_next_activation_trigger
BEFORE INSERT OR UPDATE ON tc_question_sets
FOR EACH ROW
WHEN (NEW.is_recurring = TRUE)
EXECUTE FUNCTION set_next_activation();

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================
-- To use:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Set up a cron job or scheduled function to call:
--    - activate_scheduled_tests() every minute
--    - update_recurring_tests() every hour
-- 3. Or use Supabase Edge Functions with cron
-- ============================================
