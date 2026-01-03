-- Add vote count columns if they don't exist
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvote_count INTEGER DEFAULT 0;

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE forum_posts SET upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE forum_posts SET downvote_count = downvote_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
      UPDATE forum_posts SET upvote_count = upvote_count - 1, downvote_count = downvote_count + 1 WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
      UPDATE forum_posts SET downvote_count = downvote_count - 1, upvote_count = upvote_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE forum_posts SET upvote_count = upvote_count - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE forum_posts SET downvote_count = downvote_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS forum_votes_update_counts ON forum_votes;
CREATE TRIGGER forum_votes_update_counts
AFTER INSERT OR UPDATE OR DELETE ON forum_votes
FOR EACH ROW EXECUTE FUNCTION update_post_vote_counts();

-- Initialize existing counts
UPDATE forum_posts p
SET 
  upvote_count = (SELECT COUNT(*) FROM forum_votes WHERE post_id = p.id AND vote_type = 'upvote'),
  downvote_count = (SELECT COUNT(*) FROM forum_votes WHERE post_id = p.id AND vote_type = 'downvote');
