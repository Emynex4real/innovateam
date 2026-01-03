/**
 * 🔍 FUZZY MATCHING UTILITY
 * Handles variations in subject/topic names (typos, abbreviations, etc.)
 */

// Subject aliases mapping
const SUBJECT_ALIASES = {
  'Literature in English': ['literature', 'lit', 'lit in eng', 'english lit', 'literature in eng'],
  'Use of English': ['english', 'use of eng', 'use of english', 'eng'],
  'Mathematics': ['math', 'maths', 'mathematics'],
  'Biology': ['bio', 'biology'],
  'Chemistry': ['chem', 'chemistry'],
  'Physics': ['phy', 'physics'],
  'Economics': ['econs', 'econ', 'economics'],
  'Commerce': ['commerce'],
  'Government': ['govt', 'government', 'civic'],
  'Geography': ['geo', 'geography'],
  'Christian Religious Studies': ['crs', 'christian', 'christian religious studies'],
  'Islamic Religious Studies': ['irs', 'islamic', 'islamic religious studies', 'islamic studies'],
  'Accounting': ['account', 'accounting', 'financial accounting'],
  'History': ['history']
};

/**
 * Normalize subject name to canonical form
 */
function normalizeSubject(input) {
  if (!input) return null;
  
  const normalized = input.toLowerCase().trim();
  
  // Check each canonical subject
  for (const [canonical, aliases] of Object.entries(SUBJECT_ALIASES)) {
    if (canonical.toLowerCase() === normalized) return canonical;
    if (aliases.some(alias => alias === normalized)) return canonical;
  }
  
  // Fuzzy match with Levenshtein distance
  let bestMatch = null;
  let bestScore = Infinity;
  
  for (const canonical of Object.keys(SUBJECT_ALIASES)) {
    const score = levenshteinDistance(normalized, canonical.toLowerCase());
    if (score < bestScore && score <= 3) { // Allow up to 3 character differences
      bestScore = score;
      bestMatch = canonical;
    }
  }
  
  return bestMatch || input; // Return original if no match
}

/**
 * Normalize topic name (handles typos and variations)
 */
function normalizeTopic(input) {
  if (!input) return null;
  
  // Basic normalization
  return input.trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Levenshtein distance (edit distance between two strings)
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Build fuzzy search query for Supabase
 */
function buildFuzzyQuery(subject, topic) {
  const normalizedSubject = normalizeSubject(subject);
  const normalizedTopic = normalizeTopic(topic);
  
  return {
    subject: normalizedSubject,
    topic: normalizedTopic,
    // Generate search patterns for topic
    topicPatterns: [
      normalizedTopic,
      `%${normalizedTopic}%`,
      normalizedTopic.replace(/\s+/g, '%')
    ]
  };
}

module.exports = {
  normalizeSubject,
  normalizeTopic,
  buildFuzzyQuery,
  levenshteinDistance
};
