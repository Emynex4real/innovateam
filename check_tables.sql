-- Check what tables and columns actually exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('forum_posts', 'forum_threads', 'conversations', 'messages')
ORDER BY table_name, ordinal_position;