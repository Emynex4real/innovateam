# FIX: Unknown User & Vote Counts at 0

## Problem
- Posts show "Unknown User" as author
- Vote counts stuck at 0
- Votes don't persist

## Root Cause
Database migration not run yet - missing vote count columns and triggers

## Solution (2 Steps)

### Step 1: Run Database Migration

Open Supabase SQL Editor and paste this:

```sql
-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS forum_votes_update_counts ON forum_votes;
DROP FUNCTION IF EXISTS update_post_vote_counts();

-- Ensure vote count columns exist
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvote_count INTEGER DEFAULT 0;

-- Create optimized trigger function
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts 
    SET upvote_count = upvote_count + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE 0 END,
        downvote_count = downvote_count + CASE WHEN NEW.vote_type = 'downvote' THEN 1 ELSE 0 END
    WHERE id = NEW.post_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type != NEW.vote_type THEN
      UPDATE forum_posts 
      SET upvote_count = upvote_count + CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END,
          downvote_count = downvote_count + CASE WHEN NEW.vote_type = 'downvote' THEN 1 ELSE -1 END
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts 
    SET upvote_count = upvote_count - CASE WHEN OLD.vote_type = 'upvote' THEN 1 ELSE 0 END,
        downvote_count = downvote_count - CASE WHEN OLD.vote_type = 'downvote' THEN 1 ELSE 0 END
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER forum_votes_update_counts
AFTER INSERT OR UPDATE OR DELETE ON forum_votes
FOR EACH ROW EXECUTE FUNCTION update_post_vote_counts();

-- Recalculate all counts
UPDATE forum_posts p
SET 
  upvote_count = COALESCE((SELECT COUNT(*) FROM forum_votes WHERE post_id = p.id AND vote_type = 'upvote'), 0),
  downvote_count = COALESCE((SELECT COUNT(*) FROM forum_votes WHERE post_id = p.id AND vote_type = 'downvote'), 0);
```

### Step 2: Restart Backend Server

```bash
cd server
npm start
```

## Test It Works

1. Open a forum thread
2. Click upvote - should show 1
3. Click again - should show 0 (toggle off)
4. Refresh page - count should persist
5. Author names should now show correctly

## Still Seeing "Unknown User"?

This means user_profiles table is empty. Run this to check:

```sql
SELECT id, full_name, email FROM user_profiles LIMIT 5;
```

If empty, users need to complete their profiles or you need to seed the table.

## Verify Migration Worked

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'forum_posts' 
AND column_name IN ('upvote_count', 'downvote_count');

-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'forum_votes_update_counts';

-- Check sample data
SELECT id, content, upvote_count, downvote_count 
FROM forum_posts 
LIMIT 5;
```

## Done! ✅

Your vote system should now work perfectly with:
- ✅ Persistent vote counts
- ✅ Proper author names
- ✅ Instant UI updates
- ✅ Database-maintained counts
