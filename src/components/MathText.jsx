import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

const MathText = ({ children, text, className = '' }) => {
  // Support both `text` prop (old API) and `children` prop (new API)
  const content = text || children;
  
  const renderMath = (textContent) => {
    if (!textContent) return '';
    
    // Auto-wrap common math patterns if not already in LaTeX
    let processedText = String(textContent);
    
    // Only auto-wrap if there are no existing LaTeX delimiters
    if (!processedText.includes('$') && !processedText.includes('\\(')) {
      // Wrap superscripts: x^2 -> $x^2$
      processedText = processedText.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '$$1^{$2}$');
      // Wrap subscripts: x_2 -> $x_2$
      processedText = processedText.replace(/([a-zA-Z0-9]+)_([a-zA-Z0-9]+)/g, '$$1_{$2}$');
      // Wrap fractions: a/b -> $\frac{a}{b}$ (only simple cases)
      processedText = processedText.replace(/\b([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\b/g, '$\\frac{$1}{$2}$');
      // Wrap square roots: sqrt(x) -> $\sqrt{x}$
      processedText = processedText.replace(/sqrt\(([^)]+)\)/g, '$\\sqrt{$1}$');
    }
    
    const parts = [];
    let lastIndex = 0;
    
    // Match inline math: $...$ or \(...\)
    const inlineRegex = /\$([^\$]+)\$|\\\(([^\)]+)\\\)/g;
    // Match display math: $$...$$ or \[...\]
    const displayRegex = /\$\$([^\$]+)\$\$|\\\[([^\]]+)\\\]/g;
    
    // First, handle display math
    let displayMatch;
    const displayMatches = [];
    while ((displayMatch = displayRegex.exec(processedText)) !== null) {
      displayMatches.push({
        start: displayMatch.index,
        end: displayMatch.index + displayMatch[0].length,
        latex: displayMatch[1] || displayMatch[2],
        display: true
      });
    }
    
    // Then handle inline math
    let inlineMatch;
    const inlineMatches = [];
    while ((inlineMatch = inlineRegex.exec(processedText)) !== null) {
      // Skip if this match is inside a display math block
      const isInDisplay = displayMatches.some(dm => 
        inlineMatch.index >= dm.start && inlineMatch.index < dm.end
      );
      if (!isInDisplay) {
        inlineMatches.push({
          start: inlineMatch.index,
          end: inlineMatch.index + inlineMatch[0].length,
          latex: inlineMatch[1] || inlineMatch[2],
          display: false
        });
      }
    }
    
    // Combine and sort all matches
    const allMatches = [...displayMatches, ...inlineMatches].sort((a, b) => a.start - b.start);
    
    // Build the result
    allMatches.forEach((match, index) => {
      // Add text before this match
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {processedText.substring(lastIndex, match.start)}
          </span>
        );
      }
      
      // Add the rendered math
      try {
        const html = katex.renderToString(match.latex, {
          displayMode: match.display,
          throwOnError: false,
          output: 'html'
        });
        parts.push(
          <span 
            key={`math-${index}`}
            dangerouslySetInnerHTML={{ __html: html }}
            className={match.display ? 'block my-4' : 'inline-block mx-1'}
          />
        );
      } catch (err) {
        // If KaTeX fails, show the original text
        parts.push(
          <span key={`error-${index}`} className="text-red-500">
            {processedText.substring(match.start, match.end)}
          </span>
        );
      }
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < processedText.length) {
      parts.push(
        <span key="text-end">
          {processedText.substring(lastIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? parts : processedText;
  };
  
  return (
    <span className={className}>
      {renderMath(content)}
    </span>
  );
};

export default MathText;
