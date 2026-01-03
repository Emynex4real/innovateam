import React from 'react';
import VoteButtons from './VoteButtons';
import './PostCard.css';

/**
 * PostCard Component
 * Displays a single forum post with voting and metadata
 */
const PostCard = ({
  post,
  isAnswer = false,
  canMarkAnswer = false,
  onVote,
  onMarkAnswer,
  onReply,
  depth = 0,
}) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className={`post-card depth-${Math.min(depth, 3)}`}>
      <div className="post-header">
        <div className="post-author">
          {post.author_avatar && (
            <img src={post.author_avatar} alt={post.author_name} className="author-avatar" />
          )}
          <div className="author-info">
            <div className="author-name">{post.author_name}</div>
            <div className="post-meta">
              <span className="post-date">{formatDate(post.created_at)}</span>
              {post.reputation && <span className="author-rep">• {post.reputation} rep</span>}
            </div>
          </div>
        </div>

        {isAnswer && <div className="answer-badge">✓ Answer</div>}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      <div className="post-footer">
        <VoteButtons
          postId={post.id}
          upvotes={post.upvotes || 0}
          downvotes={post.downvotes || 0}
          userVote={post.user_vote}
          onVote={onVote ? () => onVote(post.id) : null}
        />

        <div className="post-actions">
          {onReply && (
            <button className="action-btn" onClick={() => onReply(post.id)}>
              Reply
            </button>
          )}
          {canMarkAnswer && (
            <button
              className="action-btn mark-answer"
              onClick={() => onMarkAnswer(post.id)}
            >
              Mark as Answer
            </button>
          )}
        </div>
      </div>

      {post.replies && post.replies.length > 0 && (
        <div className="post-replies">
          {post.replies.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              isAnswer={reply.is_answer}
              canMarkAnswer={false}
              onVote={onVote}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;
