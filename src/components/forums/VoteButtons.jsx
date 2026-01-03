import React, { useState, useEffect } from 'react';
import './VoteButtons.css';

const VoteButtons = ({ postId, upvotes, downvotes, userVote, onVote, isDarkMode }) => {
  const [counts, setCounts] = useState({ up: upvotes, down: downvotes });
  const [vote, setVote] = useState(userVote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCounts({ up: upvotes, down: downvotes });
    setVote(userVote);
  }, [postId, upvotes, downvotes, userVote]);

  const handleVote = async (type) => {
    if (loading) return;
    
    const prev = { up: counts.up, down: counts.down, vote };
    
    // Optimistic update
    if (vote === type) {
      setCounts(c => ({ ...c, [type === 'upvote' ? 'up' : 'down']: c[type === 'upvote' ? 'up' : 'down'] - 1 }));
      setVote(null);
    } else {
      if (vote) {
        setCounts(c => ({ 
          up: c.up + (type === 'upvote' ? 1 : -1), 
          down: c.down + (type === 'downvote' ? 1 : -1) 
        }));
      } else {
        setCounts(c => ({ ...c, [type === 'upvote' ? 'up' : 'down']: c[type === 'upvote' ? 'up' : 'down'] + 1 }));
      }
      setVote(type);
    }

    setLoading(true);
    const result = await onVote(postId, type);
    setLoading(false);

    if (!result?.success) {
      setCounts({ up: prev.up, down: prev.down });
      setVote(prev.vote);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn upvote ${vote === 'upvote' ? 'active' : ''} ${isDarkMode ? 'dark' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={loading}
      >
        <span className="vote-icon">👍</span>
        <span className="vote-count">{counts.up}</span>
      </button>
      <button
        className={`vote-btn downvote ${vote === 'downvote' ? 'active' : ''} ${isDarkMode ? 'dark' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={loading}
      >
        <span className="vote-icon">👎</span>
        <span className="vote-count">{counts.down}</span>
      </button>
    </div>
  );
};

export default VoteButtons;
