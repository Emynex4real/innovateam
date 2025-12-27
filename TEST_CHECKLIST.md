# TEST CHECKLIST - Verify Questions Appear for Students

## ✅ Pre-Test Setup
1. **Restart Backend Server** (CRITICAL - changes won't apply without restart)
   ```bash
   cd server
   npm start
   ```

2. **Verify Database Table**
   - Run `diagnose-test-questions.sql` query #1 in Supabase
   - Confirm `tc_question_set_questions` table exists and has data

## 🧪 Test Scenario 1: Create New Test

### As Tutor:
1. Login as tutor account
2. Navigate to Questions → Create at least 3 questions
3. Navigate to Tests → Create Test
4. Fill in test details:
   - Title: "Test Fix Verification"
   - Time: 30 minutes
   - Passing: 70%
   - Visibility: **PUBLIC** (for easy testing)
5. **Select 3 questions** (click checkboxes)
6. Click "Create Test"
7. ✅ Verify success message shows "Test created with 3 questions!"

### Verify in Database:
```sql
-- Replace TEST_ID with the actual test ID
SELECT COUNT(*) as question_count
FROM tc_question_set_questions
WHERE question_set_id = 'TEST_ID';
```
Expected: `question_count = 3`

## 🎓 Test Scenario 2: Student Attempts Test

### As Student (Different Account):
1. Logout from tutor account
2. Login/Register as student account
3. Navigate to Tests or Public Tests
4. Find "Test Fix Verification" test
5. Click "Take Test"
6. **✅ VERIFY: All 3 questions appear with options**
7. Answer questions and submit
8. ✅ Verify results page shows

## 🔒 Test Scenario 3: Private Test (Enrolled Students)

### As Tutor:
1. Create another test with visibility = **PRIVATE**
2. Note the access code for your tutorial center

### As Student:
1. Join the tutorial center using access code
2. Navigate to Tests
3. ✅ Verify private test appears
4. Take test
5. ✅ Verify questions appear

## 🚨 If Questions Still Don't Appear

### Debug Steps:
1. **Check Browser Console** (F12) for errors
2. **Check Network Tab** - Look at the response from `/tc-question-sets/{id}`
3. **Run Diagnostic SQL**:
   ```sql
   -- Check if questions are in junction table
   SELECT 
     qs.title,
     COUNT(qsq.id) as question_count
   FROM tc_question_sets qs
   LEFT JOIN tc_question_set_questions qsq ON qs.id = qsq.question_set_id
   WHERE qs.title = 'Test Fix Verification'
   GROUP BY qs.title;
   ```

4. **Check RLS Policies**:
   ```sql
   -- Verify student can see questions
   SELECT * FROM tc_question_set_questions
   WHERE question_set_id = 'TEST_ID';
   ```
   If this returns empty as student, RLS policy issue.

5. **Check Backend Logs** - Look for errors when fetching test

## 📊 Expected Results

### ✅ Success Indicators:
- Tutor sees "Test created with X questions!" message
- Database shows X rows in `tc_question_set_questions`
- Student sees all X questions when taking test
- Questions have options A, B, C, D
- Timer starts counting down
- Submit button works

### ❌ Failure Indicators:
- "0 questions" in test
- Empty test page for student
- "No questions available" message
- Questions array is empty in API response

## 🔧 Quick Fix if Still Broken

If questions still don't appear, the issue might be:
1. **Server not restarted** - Restart backend
2. **Old data** - Questions in wrong table from before fix
3. **RLS policy** - Student not authenticated properly
4. **API route** - Wrong controller being used

Check which controller is handling the request:
```javascript
// In server/routes/tcQuestionSets.routes.js
router.get('/:id', tcQuestionSetsController.getQuestionSet);
```

Should use the FIXED controller, not tutorialCenter.controller.
