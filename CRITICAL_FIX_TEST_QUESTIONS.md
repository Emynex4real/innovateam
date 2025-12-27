# CRITICAL FIX: Test Questions Not Showing for Students

## Problem Identified
Students attempting tests were seeing NO QUESTIONS even though tutors had selected questions when creating the test.

## Root Cause
**Table Name Mismatch** - A critical inconsistency in table naming across the codebase:

### What Was Happening:
1. **TestBuilder.jsx** → Calls `addQuestionsToTest()` → Saves to `tc_question_set_questions` ✅
2. **tcQuestionSets.controller.js** → `getQuestionSet()` → Reads from `tc_question_set_items` ❌

### The Issue:
- Questions were being **WRITTEN** to `tc_question_set_questions` table
- Questions were being **READ** from `tc_question_set_items` table (which doesn't exist or is empty)
- Result: Students see empty tests with no questions

## Files Fixed

### `server/controllers/tcQuestionSets.controller.js`

#### Changes Made:
1. **getQuestionSet()** - Fixed query to use correct table name
   - Changed: `tc_question_set_items` → `tc_question_set_questions`
   - Changed: `order_number` → `order_index`
   - Added: `points` field to query

2. **getQuestionSets()** - Fixed count query
   - Changed: `tc_question_set_items(count)` → `tc_question_set_questions(count)`

3. **createQuestionSet()** - Fixed insert table name
   - Changed: `tc_question_set_items` → `tc_question_set_questions`
   - Changed: `order_number` → `order_index`

4. **getPublicTests()** - Fixed count query
   - Changed: `tc_question_set_items(count)` → `tc_question_set_questions(count)`

## Correct Schema (from create-question-test-junction.sql)

```sql
CREATE TABLE public.tc_question_set_questions (
  id UUID PRIMARY KEY,
  question_set_id UUID REFERENCES tc_question_sets(id),
  question_id UUID REFERENCES tc_questions(id),
  order_index INTEGER NOT NULL DEFAULT 0,  -- NOT order_number
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing Required

### 1. Create New Test
- Login as tutor
- Create a new test with selected questions
- Verify questions are saved

### 2. View Test as Student
- Login as student (different account)
- Navigate to available tests
- Attempt the test
- **VERIFY: Questions now appear correctly**

### 3. Existing Tests
- Tests created before this fix may still have issues
- Questions may be in the wrong table
- Consider data migration if needed

## Prevention
- Use consistent naming conventions across all files
- Reference the SQL schema as the source of truth
- Add integration tests for create → read flows

## Status
✅ **FIXED** - All table references now use `tc_question_set_questions` with `order_index`
