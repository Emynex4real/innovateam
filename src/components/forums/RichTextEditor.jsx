import React, { useState, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, Image, Code, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, minHeight = '150px' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => insertMarkdown('**', '**')} title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('*', '*')} title="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('[', '](url)')} title="Link"><LinkIcon size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('![alt](', ')')} title="Image"><Image size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('`', '`')} title="Code"><Code size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('\n- ')} title="List"><List size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('\n1. ')} title="Numbered List"><ListOrdered size={16} /></button>
        <button type="button" onClick={() => insertMarkdown('\n> ')} title="Quote"><Quote size={16} /></button>
        <div className="toolbar-divider" />
        <button type="button" onClick={() => setShowPreview(!showPreview)} className={showPreview ? 'active' : ''}>
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>
      
      {showPreview ? (
        <div className="editor-preview" style={{ minHeight }} dangerouslySetInnerHTML={{ __html: formatMarkdown(value) }} />
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
      
      <div className="editor-footer">
        <span className="char-count">{value.length} characters</span>
        <span className="markdown-hint">Markdown supported</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
