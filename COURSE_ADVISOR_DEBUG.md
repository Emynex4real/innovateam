# Course Advisor Button Not Working - Debug Guide

## Issue
The "Get My Course Recommendations" button appears to do nothing when clicked.

## Root Cause
The form has strict validation requirements that must be met before processing. If any validation fails, the form stops silently (now with toast notifications).

## Requirements Checklist

Before clicking the button, ensure you have:

### 1. JAMB Score ✓
- Must be a number between 0 and 400
- Example: 270

### 2. UTME Subjects ✓
- Must select **exactly 4 subjects**
- English Language is pre-selected (mandatory)
- You need to select **3 more subjects**
- Available subjects: Mathematics, Physics, Chemistry, Biology, Economics, Geography, Agricultural Science, Fine Art, Government, Literature in English

### 3. O-Level Results ✓
- Must select grades for **at least 5 subjects**
- Each subject needs a grade (A1, B2, B3, C4, C5, or C6)
- Available subjects: English Language, Mathematics, Physics, Chemistry, Biology, Economics, Geography, Agricultural Science, Further Mathematics, Government, Literature in English, Fine Art, Technical Drawing, Commerce, Accounting, Computer Studies, Civic Education, CRS, IRS

### 4. Interests ✓
- Must select **at least 1 interest** (up to 3)
- Available interests:
  - Technology & Innovation
  - Engineering & Design
  - Environmental Sciences
  - Business & Management
  - Health Sciences
  - Agriculture & Food Security

## Testing Steps

1. Open the browser console (F12 or Right-click → Inspect → Console)
2. Fill in all required fields following the checklist above
3. Click "Get My Course Recommendations"
4. Check the console for these messages:
   - "Form submitted!"
   - "Selected O-Level subjects: X" (should be ≥ 5)
   - "JAMB Score: X" (should be valid number)
   - "UTME Subjects: [...]" (should have 4 items)
   - "Selected interests count: X" (should be ≥ 1)
   - "Starting recommendation process..."
   - "Checking eligibility for X courses"
   - "Found X eligible courses"

## Common Issues

### Issue 1: Not enough O-Level subjects
**Error:** "Please select grades for at least 5 O-Level subjects"
**Solution:** Select grades for at least 5 different subjects

### Issue 2: Wrong number of UTME subjects
**Error:** "Please select exactly 4 UTME subjects including English Language"
**Solution:** Select exactly 3 more subjects (English is already selected)

### Issue 3: No interests selected
**Error:** "Please select at least one interest"
**Solution:** Check at least one interest checkbox

### Issue 4: Invalid JAMB score
**Error:** "JAMB score must be between 0 and 400"
**Solution:** Enter a valid number between 0 and 400

## Example Valid Input

```
JAMB Score: 270

UTME Subjects (4 selected):
✓ English Language (mandatory)
✓ Mathematics
✓ Physics
✓ Chemistry

O-Level Results (5+ selected):
- English Language: B2
- Mathematics: B3
- Physics: C4
- Chemistry: B3
- Biology: C4

Interests (1-3 selected):
✓ Technology & Innovation
✓ Engineering & Design
```

## Changes Made

I've added console logging to help debug the issue:
- Form submission is now logged
- Each validation step is logged
- The processing steps are logged
- You can see exactly where the form stops

## Next Steps

1. Open browser console
2. Try submitting the form
3. Check which validation is failing
4. Fill in the missing requirements
5. Try again

The button IS working - it's just that the validation requirements are strict and the form was failing silently before. Now you'll see toast error messages telling you what's missing.
