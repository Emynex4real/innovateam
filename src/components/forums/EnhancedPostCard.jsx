import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MoreVertical, Edit2, Trash2, Flag, Bookmark, Award, Check } from 'lucide-react';
import VoteButtons from './VoteButtons';
import 'katex/dist/katex.min.css';
import './EnhancedPostCard.css';

const EnhancedPostCard = ({
  post,
  currentUserId,
  isAnswer,
  canMarkAnswer,
  canEdit,
  onVote,
  onMarkAnswer,
  onDelete,
  isDarkMode = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // THIS IS THE MISSING PIECE: 
  // We define the color variables here based on Dark Mode
  const themeStyles = isDarkMode ? {
    '--card-bg': '#1f2937',        // Dark Gray
    '--card-border': '#374151',    // Gray Border
    '--card-border-hover': '#3b82f6', 
    '--text-main': '#f3f4f6',      // White text
    '--text-body': '#d1d5db',      // Light gray text
    '--text-muted': '#9ca3af',     
    '--hover-bg': '#374151',       
    '--code-bg': '#111827',        
    '--answer-bg': 'rgba(6, 78, 59, 0.4)', 
    '--answer-border': '#065f46',  
    '--btn-secondary-bg': '#374151', 
    '--border-light': '#374151',   
  } : {
    '--card-bg': '#ffffff',
    '--card-border': '#e2e8f0',
    '--text-main': '#1e293b',
    '--text-body': '#334155',
    '--text-muted': '#64748b',
    '--hover-bg': '#f1f5f9',
    '--code-bg': '#f1f5f9',
    '--answer-bg': '#f0fdf4',
    '--answer-border': '#86efac',
    '--btn-secondary-bg': '#f1f5f9',
    '--border-light': '#f1f5f9',
  };

  return (
    <div 
      className={`enhanced-post-card ${isAnswer ? 'is-answer' : ''}`} 
      style={themeStyles}
    >
      
      {/* Left Column: Voting */}
      <div className="post-sidebar">
        <VoteButtons 
          postId={post.id}
          upvotes={post.upvote_count} 
          downvotes={post.downvote_count}
          userVote={post.user_vote}
          onVote={onVote}
          isDarkMode={isDarkMode}
        />
        {isAnswer && <div className="hidden sm:block" style={{ color: '#10b981', marginTop: '8px' }} title="Accepted Answer"><Check size={20} strokeWidth={3} /></div>}
      </div>

      {/* Right Column: Content */}
      <div className="post-main">
        <div className="post-header">
          <div className="post-author">
            <div className="author-avatar">
              {post.author?.name?.[0] ? (
                <div className="avatar-placeholder">{post.author.name[0]}</div>
              ) : (
                <div className="avatar-placeholder">?</div>
              )}
            </div>
            <div className="author-info">
              <span className="author-name">{post.author?.name || 'Unknown User'}</span>
              <span className="post-meta">{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
            </div>
          </div>

          <div className="post-actions-menu">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="menu-btn"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="dropdown-menu">
                {canEdit && (
                  <button onClick={() => {}}>
                    <Edit2 size={14}/> Edit
                  </button>
                )}
                {canEdit && (
                  <button className="danger" onClick={() => {
                    if (window.confirm('Are you sure you want to delete this post?')) {
                      onDelete(post.id);
                      setShowMenu(false);
                    }
                  }}>
                    <Trash2 size={14}/> Delete
                  </button>
                )}
                <button>
                   <Bookmark size={14}/> Bookmark
                </button>
                <button className="danger">
                   <Flag size={14}/> Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Body - Markdown Render */}
        <div className={`post-content ${isDarkMode ? 'prose-invert' : ''}`}>
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
            disallowedElements={['script', 'iframe', 'object', 'embed']}
            unwrapDisallowed={true}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Footer Actions */}
        <div className="post-footer">
           {canMarkAnswer && !isAnswer && (
             <button 
               onClick={() => onMarkAnswer(post.id)}
               className="action-btn mark-answer"
             >
               <Award className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Mark as Solution</span>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPostCard;