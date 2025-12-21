import React, { useState } from 'react';
import './VoteButtons.css';

/**
 * VoteButtons Component
 * Displays upvote/downvote buttons for forum posts
 */
const VoteButtons = ({ postId, upvotes = 0, downvotes = 0, userVote = null, onVote }) => {
  const [voting, setVoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [localUserVote, setLocalUserVote] = useState(userVote);

  const handleVote = async (voteType) => {
    if (voting) return;

    setVoting(true);

    // Optimistic update
    if (localUserVote === voteType) {
      // Toggle off
      if (voteType === 'upvote') {
        setLocalUpvotes(localUpvotes - 1);
      } else {
        setLocalDownvotes(localDownvotes - 1);
      }
      setLocalUserVote(null);
    } else {
      // Switch or new vote
      if (localUserVote === 'upvote' && voteType === 'downvote') {
        setLocalUpvotes(localUpvotes - 1);
        setLocalDownvotes(localDownvotes + 1);
      } else if (localUserVote === 'downvote' && voteType === 'upvote') {
        setLocalDownvotes(localDownvotes - 1);
        setLocalUpvotes(localUpvotes + 1);
      } else if (!localUserVote) {
        if (voteType === 'upvote') {
          setLocalUpvotes(localUpvotes + 1);
        } else {
          setLocalDownvotes(localDownvotes + 1);
        }
      }
      setLocalUserVote(voteType);
    }

    // Call the callback
    if (onVote) {
      const result = await onVote(voteType);
      if (!result.success) {
        // Revert on error
        setLocalUpvotes(upvotes);
        setLocalDownvotes(downvotes);
        setLocalUserVote(userVote);
      }
    }

    setVoting(false);
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn upvote ${localUserVote === 'upvote' ? 'active' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={voting}
        title="Upvote this post"
      >
        <span className="vote-icon">👍</span>
        <span className="vote-count">{localUpvotes}</span>
      </button>
      <button
        className={`vote-btn downvote ${localUserVote === 'downvote' ? 'active' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={voting}
        title="Downvote this post"
      >
        <span className="vote-icon">👎</span>
        <span className="vote-count">{localDownvotes}</span>
      </button>
    </div>
  );
};

export default VoteButtons;
