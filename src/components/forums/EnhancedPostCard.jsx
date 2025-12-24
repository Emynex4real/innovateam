import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MoreVertical, Edit2, Trash2, Flag, Bookmark, Reply, Award, Share2 } from 'lucide-react';
import VoteButtons from './VoteButtons';
import RichTextEditor from './RichTextEditor';
import 'katex/dist/katex.min.css';
import './EnhancedPostCard.css';

const EnhancedPostCard = ({
  post,
  isAnswer = false,
  canMarkAnswer = false,
  canEdit = false,
  onVote,
  onMarkAnswer,
  onReply,
  onEdit,
  onDelete,
  onReport,
  onBookmark,
  depth = 0,
  currentUserId
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };



  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    await onEdit?.(post.id, editContent);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    await onReply?.(post.id, replyContent);
    setReplyContent('');
    setShowReplyBox(false);
    setIsSubmitting(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '#post-' + post.id);
    alert('Link copied to clipboard!');
  };

  return (
    <div className={`enhanced-post-card depth-${Math.min(depth, 3)} ${isAnswer ? 'is-answer' : ''}`} id={`post-${post.id}`}>
      <div className="post-sidebar">
        <VoteButtons
          postId={post.id}
          upvotes={post.upvotes || 0}
          downvotes={post.downvotes || 0}
          userVote={post.user_vote}
          onVote={onVote}
        />
        {post.is_bookmarked && <Bookmark size={16} className="bookmark-icon active" />}
      </div>

      <div className="post-main">
        <div className="post-header">
          <div className="post-author">
            <div className="author-avatar">
              {post.author_avatar ? (
                <img src={post.author_avatar} alt={post.author_name} />
              ) : (
                <div className="avatar-placeholder">{post.author_name?.charAt(0) || '?'}</div>
              )}
            </div>
            <div className="author-info">
              <div className="author-name-row">
                <span className="author-name">{post.author_name || 'Unknown'}</span>
                {post.author_badges?.map(badge => (
                  <span key={badge} className="author-badge">{badge}</span>
                ))}
              </div>
              <div className="post-meta">
                <span className="post-date">{formatDate(post.created_at)}</span>
                {post.reputation > 0 && <span className="author-rep">• {post.reputation} rep</span>}
                {post.is_edited && <span className="edited-tag">• edited</span>}
              </div>
            </div>
          </div>

          <div className="post-actions-menu">
            {isAnswer && <div className="answer-badge">✓ Accepted Answer</div>}
            <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                {canEdit && (
                  <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                {canEdit && (
                  <button onClick={() => { onDelete?.(post.id); setShowMenu(false); }} className="danger">
                    <Trash2 size={14} /> Delete
                  </button>
                )}
                <button onClick={() => { onBookmark?.(post.id); setShowMenu(false); }}>
                  <Bookmark size={14} /> {post.is_bookmarked ? 'Unbookmark' : 'Bookmark'}
                </button>
                <button onClick={() => { handleShare(); setShowMenu(false); }}>
                  <Share2 size={14} /> Share
                </button>
                {!canEdit && (
                  <button onClick={() => { onReport?.(post.id); setShowMenu(false); }} className="danger">
                    <Flag size={14} /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          {isEditing ? (
            <div className="edit-form">
              <RichTextEditor value={editContent} onChange={setEditContent} minHeight="100px" />
              <div className="edit-actions">
                <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleEdit} disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {post.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="post-footer">
          <button className="action-btn" onClick={() => setShowReplyBox(!showReplyBox)}>
            <Reply size={14} /> Reply
          </button>
          {canMarkAnswer && !isAnswer && (
            <button className="action-btn mark-answer" onClick={() => onMarkAnswer?.(post.id)}>
              <Award size={14} /> Mark as Answer
            </button>
          )}
          <button className="action-btn" onClick={handleShare}>
            <Share2 size={14} /> Share
          </button>
        </div>

        {showReplyBox && (
          <div className="reply-form">
            <RichTextEditor 
              value={replyContent} 
              onChange={setReplyContent} 
              placeholder="Write your reply..."
              minHeight="100px"
            />
            <div className="reply-actions">
              <button onClick={() => setShowReplyBox(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleReply} disabled={isSubmitting || !replyContent.trim()} className="btn-primary">
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        )}

        {post.replies && post.replies.length > 0 && (
          <div className="post-replies">
            {post.replies.map((reply) => (
              <EnhancedPostCard
                key={reply.id}
                post={reply}
                isAnswer={reply.is_answer}
                canEdit={reply.author_id === currentUserId}
                onVote={onVote}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
                onBookmark={onBookmark}
                depth={depth + 1}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPostCard;
