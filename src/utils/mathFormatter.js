// Convert plain text math notation to LaTeX format
export const formatMathText = (text) => {
  if (!text) return text;
  
  // Don't process if already has $ delimiters
  if (text.includes('$')) return text;
  
  let formatted = text;
  
  // Convert exponents: x^2 -> x^{2}
  formatted = formatted.replace(/([a-zA-Z0-9])\^(\d+)/g, '$1^{$2}');
  
  // Convert multiplication: * -> ×
  formatted = formatted.replace(/\*/g, '×');
  
  // Convert division: / -> ÷
  formatted = formatted.replace(/\s*\/\s*/g, ' ÷ ');
  
  return formatted;
};
