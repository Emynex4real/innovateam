import React from 'react';
import katex from 'katex';
import { formatMathText } from '../utils/mathFormatter';

const MathText = ({ text, className = '' }) => {
  const renderMath = (text) => {
    if (!text) return [];
    
    const parts = [];
    let lastIndex = 0;
    
    // Match $...$ for inline math and $$...$$ for display math
    const regex = /\$\$([^\$]+)\$\$|\$([^\$]+)\$/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      
      const mathContent = match[1] || match[2];
      const isDisplay = !!match[1];
      
      try {
        const html = katex.renderToString(mathContent, {
          displayMode: isDisplay,
          throwOnError: false
        });
        parts.push({ type: 'math', content: html });
      } catch (e) {
        parts.push({ type: 'text', content: match[0] });
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }
    
    return parts;
  };

  // Apply formatting first
  const formattedText = formatMathText(text || '');
  
  // Convert superscripts to HTML
  const htmlText = formattedText.replace(/([a-zA-Z0-9])\^\{(\d+)\}/g, '$1<sup>$2</sup>');
  
  const parts = renderMath(htmlText);
  
  if (parts.length === 0) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: htmlText }} />;
  }
  
  if (parts.length === 1 && parts[0].type === 'text') {
    return <span className={className} dangerouslySetInnerHTML={{ __html: parts[0].content }} />;
  }
  
  if (parts.length === 1 && parts[0].type === 'math') {
    return <span className={className} dangerouslySetInnerHTML={{ __html: parts[0].content }} />;
  }
  
  return (
    <span className={className}>
      {parts.map((part, idx) => 
        <span key={idx} dangerouslySetInnerHTML={{ __html: part.content }} />
      )}
    </span>
  );
};

export default MathText;
