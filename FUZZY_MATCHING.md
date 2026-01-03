# Fuzzy Matching Feature

## Overview
The question generator now supports **fuzzy matching** for subject and topic names. This means you don't need to type exact names - the system will understand variations, abbreviations, and even typos!

## How It Works

### Subject Name Variations
The system automatically recognizes common variations and abbreviations:

| You Type | System Understands |
|----------|-------------------|
| `Literature`, `Lit`, `Lit in Eng`, `English Lit` | Literature in English |
| `Math`, `Maths` | Mathematics |
| `Bio` | Biology |
| `Chem` | Chemistry |
| `Phy` | Physics |
| `Econs`, `Econ` | Economics |
| `Govt` | Government |
| `Geo` | Geography |
| `CRS`, `Christian` | Christian Religious Studies |
| `IRS`, `Islamic` | Islamic Religious Studies |
| `Account` | Accounting |
| `English`, `Use of Eng` | Use of English |

### Topic Name Flexibility
Topics are matched using:
- **Case-insensitive matching**: `ecology` = `Ecology` = `ECOLOGY`
- **Extra spaces ignored**: `atomic  structure` = `atomic structure`
- **Partial matching**: `Algebra` matches `II. Algebra: Matrices and Determinants`

### Typo Tolerance
The system can handle minor spelling mistakes:
- `Biologgy` → Biology ✅
- `Chemestry` → Chemistry ✅
- Up to 3 character differences are tolerated

## Examples

### ✅ All These Work:
```javascript
// Literature variations
{ subject: 'Literature', topic: 'Poetry' }
{ subject: 'Lit in Eng', topic: 'Drama' }
{ subject: 'English Lit', topic: 'Prose' }

// Math variations
{ subject: 'Math', topic: 'Algebra' }
{ subject: 'Maths', topic: 'geometry' }
{ subject: 'Mathematics', topic: 'CALCULUS' }

// Science abbreviations
{ subject: 'Bio', topic: 'Ecology' }
{ subject: 'Chem', topic: 'Atomic Structure' }
{ subject: 'Phy', topic: 'Mechanics' }

// Typos
{ subject: 'Biologgy', topic: 'Ecology' }
{ subject: 'Chemestry', topic: 'Acids' }
```

## API Usage

### Frontend Example
```javascript
// User can type any variation
const response = await fetch('/api/questions/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Lit',  // Will match "Literature in English"
    topic: 'poetry', // Case insensitive
    difficulty: 'medium',
    totalQuestions: 10
  })
});
```

### Backend Example
```javascript
const GeminiService = require('./services/gemini.service');

// All these work the same way
await GeminiService.generateQuestions({
  subject: 'Math',      // Normalized to "Mathematics"
  topic: 'algebra',     // Normalized to lowercase
  difficulty: 'medium',
  totalQuestions: 5
});
```

## Benefits

1. **User-Friendly**: Students don't need to remember exact subject names
2. **Typo-Tolerant**: Minor spelling mistakes won't break the system
3. **Flexible**: Supports common abbreviations and variations
4. **Automatic**: No configuration needed - works out of the box

## Technical Details

### Normalization Process
1. Input is converted to lowercase and trimmed
2. Checked against alias mappings
3. If no exact match, Levenshtein distance is calculated
4. Best match within 3 character differences is selected
5. Original input returned if no match found

### Database Query
```javascript
// Before fuzzy matching
.eq('subject', 'Lit')  // ❌ No match

// After fuzzy matching
.eq('subject', 'Literature in English')  // ✅ Match found
.or(`topic.ilike.poetry,topic.ilike.%poetry%`)
```

## Testing

Run the fuzzy matching test:
```bash
cd server
node scripts/test-fuzzy-matching.js
```

Expected output: All 15 test cases should pass ✅

## Fallback Behavior

If no match is found in the database:
- System generates generic questions based on the topic
- Warning logged: "No knowledge base content found"
- Questions still generated successfully

## Future Enhancements

Potential improvements:
- Add more subject aliases
- Support for regional name variations
- Machine learning-based matching
- User feedback to improve matching accuracy
