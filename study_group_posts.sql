-- Add missing study group posts table
CREATE TABLE IF NOT EXISTS study_group_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  resource_type VARCHAR(50) DEFAULT 'discussion',
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_study_group_posts_group ON study_group_posts(group_id, created_at DESC);