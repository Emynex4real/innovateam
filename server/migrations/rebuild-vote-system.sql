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
