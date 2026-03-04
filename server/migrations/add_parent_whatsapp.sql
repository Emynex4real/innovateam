-- Migration: Add parent_whatsapp to tc_enrollments
-- This stores the parent's WhatsApp number per student per center
-- Tutor can set this from the student management page

ALTER TABLE tc_enrollments 
ADD COLUMN IF NOT EXISTS parent_whatsapp TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tc_enrollments.parent_whatsapp IS 'Parent WhatsApp number in international format, e.g. 2347012345678';
