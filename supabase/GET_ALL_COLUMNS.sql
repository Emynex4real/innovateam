-- Get ALL columns with details
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;
