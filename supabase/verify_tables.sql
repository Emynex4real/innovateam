-- Run this to verify all tables were created successfully

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'tc_%' OR table_name = 'tutorial_centers')
ORDER BY table_name;
