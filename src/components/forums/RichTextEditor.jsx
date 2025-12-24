import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Bold, Italic, Image, Code, Eye, EyeOff, Sigma } from 'lucide-react';
import 'katex/dist/katex.min.css'; // You must import the CSS
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, minHeight = '150px' }) => {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selected = previousText.substring(start, end);
    
    const newText = previousText.substring(0, start) + before + selected + after + previousText.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  return (
    <div className="rich-editor-container border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
        <button onClick={() => insertText('**', '**')} className="p-1 hover:bg-gray-200 rounded" title="Bold"><Bold size={18}/></button>
        <button onClick={() => insertText('*', '*')} className="p-1 hover:bg-gray-200 rounded" title="Italic"><Italic size={18}/></button>
        <button onClick={() => insertText('`', '`')} className="p-1 hover:bg-gray-200 rounded" title="Code"><Code size={18}/></button>
        {/* Math Button for JAMB Students */}
        <button onClick={() => insertText('$', '$')} className="p-1 hover:bg-gray-200 rounded text-blue-600 font-bold" title="Insert Math Equation"><Sigma size={18}/></button>
        <button onClick={() => insertText('![Alt text](', ')')} className="p-1 hover:bg-gray-200 rounded" title="Image"><Image size={18}/></button>
        
        <div className="flex-grow"></div>
        <button 
          onClick={() => setPreview(!preview)} 
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${preview ? 'bg-blue-100 text-blue-700' : 'bg-gray-200'}`}
        >
          {preview ? <><EyeOff size={14}/> Edit</> : <><Eye size={14}/> Preview</>}
        </button>
      </div>

      {/* Editor / Preview Area */}
      <div className="relative" style={{ minHeight }}>
        {preview ? (
          <div className="p-4 prose max-w-none overflow-y-auto" style={{ height: minHeight }}>
            <ReactMarkdown 
              remarkPlugins={[remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {value || '*Nothing to preview*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 resize-y focus:outline-none"
            style={{ minHeight }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Type here... Use $ for math equations (e.g. $x^2 + y^2 = z^2$)"}
          />
        )}
      </div>
      <div className="text-xs text-gray-400 p-2 bg-gray-50 text-right">
        Supports Markdown & LaTeX Math
      </div>
    </div>
  );
};

export default RichTextEditor;