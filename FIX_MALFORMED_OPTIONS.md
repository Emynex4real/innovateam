# Fix: Malformed LaTeX Options in AI Examiner

## Problem
The AI Examiner was generating questions with malformed mathematical expressions in the options:
- Options were split across multiple lines
- LaTeX expressions were broken and mixed with option labels (A, B, C, D)
- Example of bad output:
  ```
  A
  T_{r+1} = \binom{n}{r} a^{n-r} 1 
  r
  ```

## Root Cause
The Gemini AI was generating JSON responses where option strings contained newline characters (`\n`), causing the options to render across multiple lines in the UI.

## Solution Applied

### 1. Enhanced AI Prompts (gemini.service.js)
Added explicit formatting instructions to prevent the AI from generating multi-line options:

```javascript
6. CRITICAL: Each option MUST be a single, complete line of text
7. For math expressions, use proper LaTeX: wrap in $ for inline math (e.g., $x^2$, $\frac{a}{b}$)
8. DO NOT split formulas across multiple lines or mix with option labels
9. Each option should be: "Complete answer text with $math$ if needed"
```

### 2. Enhanced Option Cleaning in Service (gemini.service.js)
Updated the `cleanQuestion()` function to aggressively clean malformed options:

```javascript
// Remove option labels and clean up
let cleanOpt = opt
  .replace(/^[A-D][\s.:)\-]+/i, '') // Remove leading A. B) C: D- etc
  .replace(/\r?\n/g, ' ')  // Remove ALL newlines
  .replace(/\s{2,}/g, ' ')  // Collapse multiple spaces
  .trim();
```

### 3. Additional Cleaning in Controller (aiExaminer.controller.js)
Added a second layer of cleaning when processing questions:

```javascript
const cleanedOptions = (q.options || []).map(opt => {
  if (typeof opt !== 'string') return String(opt || '');
  return opt
    .replace(/\r?\n/g, ' ')  // Remove all newlines
    .replace(/\s{2,}/g, ' ')  // Collapse multiple spaces
    .trim();
}).filter(opt => opt.length > 0);
```

### 4. Added Logging for Debugging
Enhanced the `_generateWithFallback()` function to log raw AI responses:

```javascript
logger.info('Raw AI response sample', { 
  sample: rawResponse.substring(0, 500),
  length: rawResponse.length 
});
```

## Files Modified
1. `server/services/gemini.service.js`
   - Updated prompts in `generateQuestionsFast()` and `generateQuestionsFromContent()`
   - Enhanced `cleanQuestion()` function
   - Added logging in `_generateWithFallback()`

2. `server/controllers/aiExaminer.controller.js`
   - Added option cleaning in `generateQuestions()` method

## Testing

### Manual Test
Run the test script to verify cleaning logic:
```bash
cd server
node test-option-cleaning.js
```

### Integration Test
1. Restart the backend server:
   ```bash
   cd server
   npm start
   ```

2. Generate new questions from any document
3. Check the server logs for "Raw AI response sample" to see what the AI is returning
4. Verify that all options appear as single, complete lines in the UI
5. Confirm LaTeX math expressions render correctly

## Expected Result
Options should now appear as clean, single-line text:
```
A: $T_{r+1} = \binom{n}{r} a^{n-r} b^r$
B: $T_r = \binom{n}{r} a^{n-r} b^{r-1}$
C: $T_{r+1} = \binom{n}{r+1} a^{n-r-1} b^r$
D: $T_r = \binom{n}{r} a^r b^{n-r}$
```

## Troubleshooting

If options are still malformed:

1. **Check Server Logs**: Look for "Raw AI response sample" to see what Gemini is returning
2. **Verify Cleaning**: The logs should show "First question structure" with cleaned options
3. **Test Cleaning Logic**: Run `node test-option-cleaning.js` to verify the regex patterns work
4. **Check Frontend**: Ensure MathText component is rendering LaTeX correctly

## Additional Notes
- The fix uses a **defense-in-depth** approach with multiple layers of cleaning
- The MathText component (src/components/MathText.jsx) handles LaTeX rendering
- The cleaning is non-destructive - it only removes newlines and normalizes whitespace
- Option labels (A, B, C, D) are removed if they appear at the start of options

## Restart Required
Yes - restart the backend server to apply changes:
```bash
cd server
npm start
```
