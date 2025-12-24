import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Bold, Italic, Image, Code, List, Eye, EyeOff, Sigma } from 'lucide-react';
import 'katex/dist/katex.min.css';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, minHeight = '150px', isDarkMode = false }) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertFormat = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selection + after + text.substring(end);
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selection.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  // Define Theme Variables
  const themeStyles = isDarkMode ? {
    '--editor-bg': '#111827',       /* gray-900 */
    '--editor-border': '#374151',   /* gray-700 */
    '--toolbar-bg': '#1f2937',      /* gray-800 - Fixes the white bar */
    '--text-main': '#f3f4f6',       /* gray-100 */
    '--text-color': '#d1d5db',      /* gray-300 */
    '--text-muted': '#9ca3af',      /* gray-400 */
    '--hover-bg': '#374151',        /* gray-700 */
  } : {
    '--editor-bg': '#ffffff',
    '--editor-border': '#e2e8f0',
    '--toolbar-bg': '#f8fafc',
    '--text-main': '#1e293b',
    '--text-color': '#64748b',
    '--text-muted': '#94a3b8',
    '--hover-bg': '#e2e8f0',
  };

  return (
    <div className="rich-text-editor" style={themeStyles}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button type="button" onClick={() => insertFormat('**', '**')} className="toolbar-btn" title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => insertFormat('*', '*')} className="toolbar-btn" title="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => insertFormat('`', '`')} className="toolbar-btn" title="Code"><Code size={16} /></button>
        
        <div className="toolbar-divider"></div>
        
        <button type="button" onClick={() => insertFormat('$', '$')} className="toolbar-btn" style={{ fontWeight: 'bold', color: isDarkMode ? '#60a5fa' : '#2563eb' }} title="Math"><Sigma size={16} /></button>
        <button type="button" onClick={() => insertFormat('\n- ')} className="toolbar-btn" title="List"><List size={16} /></button>
        <button type="button" onClick={() => insertFormat('![Alt](', ')')} className="toolbar-btn" title="Image"><Image size={16} /></button>
        
        <button 
          type="button" 
          onClick={() => setShowPreview(!showPreview)} 
          className="preview-toggle"
          style={{ 
            backgroundColor: showPreview ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : 'transparent',
            color: showPreview ? (isDarkMode ? '#93c5fd' : '#1d4ed8') : 'inherit'
          }}
        >
          {showPreview ? <><EyeOff size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
        </button>
      </div>
      
      {/* Editing Area */}
      <div className="editor-content-area" style={{ minHeight }}>
        {showPreview ? (
          <div className={`editor-preview prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`} style={{ height: minHeight }}>
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {value}
              </ReactMarkdown>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview...</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="editor-textarea"
            style={{ minHeight }}
          />
        )}
      </div>
      
      {/* Footer */}
      <div className="editor-footer">
        <span>{value.length} characters</span>
        <span>Markdown & LaTeX Supported</span>
      </div>
    </div>
  );
};

export default RichTextEditor;