-- ============================================
-- SEED FORUM CATEGORIES - SIMPLE VERSION
-- Run this in Supabase SQL Editor
-- ============================================

-- Just insert categories for all existing centers
DO $$
DECLARE
  center_record RECORD;
BEGIN
  FOR center_record IN SELECT id, name FROM tutorial_centers LOOP
    -- Only insert if no categories exist for this center
    IF NOT EXISTS (SELECT 1 FROM forum_categories WHERE center_id = center_record.id) THEN
      
      INSERT INTO forum_categories (center_id, name, description, slug, icon, color, display_order) VALUES
      (center_record.id, 'General Discussion', 'General topics and announcements', 'general-discussion', '💬', '#3B82F6', 1),
      (center_record.id, 'Mathematics', 'Math problems, formulas, and solutions', 'mathematics', '🔢', '#10B981', 2),
      (center_record.id, 'English Language', 'Grammar, comprehension, and writing', 'english-language', '📚', '#8B5CF6', 3),
      (center_record.id, 'Sciences', 'Physics, Chemistry, Biology discussions', 'sciences', '🔬', '#EF4444', 4),
      (center_record.id, 'Study Tips', 'Study techniques and productivity', 'study-tips', '💡', '#F59E0B', 5),
      (center_record.id, 'Exam Preparation', 'JAMB, WAEC, NECO exam strategies', 'exam-preparation', '📝', '#EC4899', 6),
      (center_record.id, 'Career Guidance', 'University choices and career paths', 'career-guidance', '🎯', '#06B6D4', 7),
      (center_record.id, 'Help & Support', 'Technical issues and questions', 'help-support', '🆘', '#6366F1', 8);
      
      RAISE NOTICE '✅ Created 8 categories for: %', center_record.name;
    ELSE
      RAISE NOTICE '⏭️  Categories already exist for: %', center_record.name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🎉 Done! Check your categories.';
END $$;

-- Verify categories were created
SELECT 
  tc.name as center_name,
  COUNT(fc.id) as category_count
FROM tutorial_centers tc
LEFT JOIN forum_categories fc ON fc.center_id = tc.id
GROUP BY tc.id, tc.name
ORDER BY tc.name;
