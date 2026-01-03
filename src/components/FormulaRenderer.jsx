import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import 'katex/dist/contrib/mhchem.min.js'; // Chemistry extension

const FormulaRenderer = ({ formula, displayMode = false }) => {
  const htmlRef = React.useRef(null);

  React.useEffect(() => {
    if (htmlRef.current && formula) {
      try {
        katex.render(formula, htmlRef.current, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch (error) {
        console.error('KaTeX render error:', error);
        htmlRef.current.textContent = formula;
      }
    }
  }, [formula, displayMode]);

  return <span ref={htmlRef} />;
};

export default FormulaRenderer;

// Usage examples:
// Math: <FormulaRenderer formula="E = mc^2" />
// Physics: <FormulaRenderer formula="F = ma" />
// Chemistry: <FormulaRenderer formula="\ce{H2O}" />
// Chemistry reaction: <FormulaRenderer formula="\ce{2H2 + O2 -> 2H2O}" />
