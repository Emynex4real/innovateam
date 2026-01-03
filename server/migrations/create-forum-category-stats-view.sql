-- Drop and recreate forum_category_stats view
DROP VIEW IF EXISTS forum_category_stats CASCADE;

CREATE VIEW forum_category_stats AS
SELECT 
  c.*,
  COUNT(DISTINCT t.id) as thread_count,
  COUNT(DISTINCT p.id) as post_count
FROM forum_categories c
LEFT JOIN forum_threads t ON c.id = t.category_id
LEFT JOIN forum_posts p ON t.id = p.thread_id
GROUP BY c.id, c.center_id, c.name, c.description, c.slug, c.icon, c.color, c.display_order, c.created_at, c.updated_at;
