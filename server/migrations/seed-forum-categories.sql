-- ============================================
-- SEED DEFAULT FORUM CATEGORIES
-- Run this after creating forum tables
-- ============================================

-- Function to create default categories for a center
CREATE OR REPLACE FUNCTION create_default_forum_categories(p_center_id UUID)
RETURNS void AS $$
BEGIN
  -- Only create if no categories exist for this center
  IF NOT EXISTS (SELECT 1 FROM forum_categories WHERE center_id = p_center_id) THEN
    
    INSERT INTO forum_categories (center_id, name, description, slug, icon, color, display_order) VALUES
    (p_center_id, 'General Discussion', 'General topics and announcements', 'general-discussion', '💬', '#3B82F6', 1),
    (p_center_id, 'Mathematics', 'Math problems, formulas, and solutions', 'mathematics', '🔢', '#10B981', 2),
    (p_center_id, 'English Language', 'Grammar, comprehension, and writing', 'english-language', '📚', '#8B5CF6', 3),
    (p_center_id, 'Sciences', 'Physics, Chemistry, Biology discussions', 'sciences', '🔬', '#EF4444', 4),
    (p_center_id, 'Study Tips', 'Study techniques and productivity', 'study-tips', '💡', '#F59E0B', 5),
    (p_center_id, 'Exam Preparation', 'JAMB, WAEC, NECO exam strategies', 'exam-preparation', '📝', '#EC4899', 6),
    (p_center_id, 'Career Guidance', 'University choices and career paths', 'career-guidance', '🎯', '#06B6D4', 7),
    (p_center_id, 'Help & Support', 'Technical issues and questions', 'help-support', '🆘', '#6366F1', 8);
    
    RAISE NOTICE 'Created default forum categories for center: %', p_center_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create categories for all existing tutorial centers
DO $$
DECLARE
  center_record RECORD;
  categories_created INTEGER := 0;
BEGIN
  FOR center_record IN SELECT id, name FROM tutorial_centers LOOP
    PERFORM create_default_forum_categories(center_record.id);
    categories_created := categories_created + 1;
    RAISE NOTICE 'Processed center: % (ID: %)', center_record.name, center_record.id;
  END LOOP;
  
  RAISE NOTICE 'Completed! Processed % tutorial centers', categories_created;
END $$;

-- Trigger to auto-create categories when new center is created
CREATE OR REPLACE FUNCTION trigger_create_forum_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_forum_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_create_forum_categories ON tutorial_centers;
CREATE TRIGGER auto_create_forum_categories
AFTER INSERT ON tutorial_centers
FOR EACH ROW
EXECUTE FUNCTION trigger_create_forum_categories();

-- Create view for category stats
CREATE OR REPLACE VIEW forum_category_stats AS
SELECT 
  fc.id,
  fc.center_id,
  fc.name,
  fc.description,
  fc.slug,
  fc.icon,
  fc.color,
  fc.display_order,
  fc.is_archived,
  fc.created_at,
  fc.updated_at,
  COUNT(DISTINCT ft.id) as thread_count,
  COUNT(DISTINCT fp.id) as post_count,
  MAX(ft.last_activity_at) as last_activity_at
FROM forum_categories fc
LEFT JOIN forum_threads ft ON ft.category_id = fc.id
LEFT JOIN forum_posts fp ON fp.thread_id = ft.id
WHERE fc.is_archived = false
GROUP BY fc.id
ORDER BY fc.display_order;

-- Create view for threads with author info
CREATE OR REPLACE VIEW forum_threads_with_author AS
SELECT 
  ft.*,
  up.name as creator_name,
  up.email as creator_email,
  COALESCE(fur.reputation_points, 0) as creator_reputation
FROM forum_threads ft
LEFT JOIN user_profiles up ON up.id = ft.creator_id
LEFT JOIN forum_user_reputation fur ON fur.user_id = ft.creator_id AND fur.center_id = ft.center_id;

COMMENT ON FUNCTION create_default_forum_categories IS 'Creates 8 default forum categories for a tutorial center';
COMMENT ON VIEW forum_category_stats IS 'Category statistics with thread and post counts';
COMMENT ON VIEW forum_threads_with_author IS 'Threads with creator information and reputation';

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_default_forum_categories TO authenticated;
GRANT SELECT ON forum_category_stats TO authenticated;
GRANT SELECT ON forum_threads_with_author TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Forum categories seeded successfully!';
  RAISE NOTICE '✅ Auto-creation trigger installed for new centers';
  RAISE NOTICE '✅ Helper views created';
END $$;
