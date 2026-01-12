# 🔍 DEBUG: Remedial Test Visibility Issue

## Problem Statement
When a student practices weak areas after a test, a remedial test is created. This remedial test is showing up on the test dashboard for **everyone** in the tutorial center, but it should only show on the dashboard of the **student who created it**.

## Current Flow Analysis

### 1. Remedial Test Creation
**File**: `server/services/adaptiveLearning.service.js` (Line ~100)

```javascript
const { data: remedialTest, error } = await supabase
  .from('tc_question_sets')
  .insert([{
    tutor_id: attempt.question_set.tutor_id,  // ❌ ISSUE: Uses tutor's ID
    center_id: attempt.question_set.center_id,
    title: `Remedial: ${attempt.question_set.title}`,
    is_remedial: true,
    parent_set_id: attempt.question_set_id
  }])
```

**Problem**: The remedial test is created with `tutor_id`, making it look like a regular tutor-created test.

### 2. Test Fetching (Tutor Dashboard)
**File**: `server/controllers/tutorialCenter.controller.js` (getQuestionSets)

```javascript
const { data, error, count } = await supabase
  .from('tc_question_sets')
  .select('*', { count: 'exact' })
  .eq('center_id', center.id)  // ❌ Gets ALL tests in center
  .order('created_at', { ascending: false })
```

**Problem**: Query fetches ALL tests in the center without filtering out student-specific remedial tests.

### 3. Test Fetching (Student Dashboard)
**File**: Need to check student test fetching logic

## Root Cause
The `tc_question_sets` table doesn't have a `student_id` column to mark tests as student-specific. Remedial tests are created with `tutor_id`, making them indistinguishable from regular tutor-created tests.

## Solution Options

### Option 1: Add student_id Column (Recommended)
- Add `student_id` column to `tc_question_sets` table
- Set `student_id` when creating remedial tests
- Filter out tests where `student_id IS NOT NULL` in tutor dashboard
- Filter to `student_id = current_user` in student dashboard

### Option 2: Use is_remedial Flag
- Already have `is_remedial` flag
- Filter out `is_remedial = true` tests in tutor dashboard
- Show only student's own remedial tests in student dashboard

### Option 3: Separate Table
- Create `tc_student_remedial_tests` table
- Keep remedial tests separate from regular tests
- More complex but cleaner separation

## Recommended Fix: Option 1 + Option 2 Combined

### Step 1: Add student_id to remedial test creation
```javascript
// In adaptiveLearning.service.js
const { data: remedialTest, error } = await supabase
  .from('tc_question_sets')
  .insert([{
    tutor_id: attempt.question_set.tutor_id,
    center_id: attempt.question_set.center_id,
    student_id: studentId,  // ✅ ADD THIS
    title: `Remedial: ${attempt.question_set.title}`,
    is_remedial: true,
    parent_set_id: attempt.question_set_id
  }])
```

### Step 2: Filter in tutor dashboard
```javascript
// In tutorialCenter.controller.js (getQuestionSets)
const { data, error, count } = await supabase
  .from('tc_question_sets')
  .select('*', { count: 'exact' })
  .eq('center_id', center.id)
  .is('student_id', null)  // ✅ Only show tutor-created tests
  .order('created_at', { ascending: false })
```

### Step 3: Filter in student dashboard
```javascript
// In student test fetching
const { data, error } = await supabase
  .from('tc_question_sets')
  .select('*')
  .eq('center_id', center.id)
  .or(`student_id.is.null,student_id.eq.${studentId}`)  // ✅ Show public + own remedial
```

## Debug Logs to Add

### In adaptiveLearning.service.js
```javascript
console.log('🎯 [REMEDIAL-VISIBILITY] Creating remedial test', {
  tutorId: attempt.question_set.tutor_id,
  centerId: attempt.question_set.center_id,
  studentId: studentId,  // Track who it's for
  isRemedial: true
});
```

### In tutorialCenter.controller.js (getQuestionSets)
```javascript
console.log('📊 [TEST-FETCH] Fetching tests for tutor', {
  tutorId,
  centerId: center.id,
  filteringStudentTests: true
});

console.log('✅ [TEST-FETCH] Found tests', {
  total: data?.length,
  remedialCount: data?.filter(t => t.is_remedial).length,
  studentSpecificCount: data?.filter(t => t.student_id).length
});
```

## Testing Steps

1. **Before Fix**: 
   - Student takes test, scores < 70%
   - Student clicks "Practice Weak Areas"
   - Check tutor dashboard → Remedial test appears ❌

2. **After Fix**:
   - Student takes test, scores < 70%
   - Student clicks "Practice Weak Areas"
   - Check tutor dashboard → Remedial test does NOT appear ✅
   - Check student dashboard → Remedial test appears ✅

## Files to Modify

1. ✅ `server/services/adaptiveLearning.service.js` - Add student_id to remedial test
2. ✅ `server/controllers/tutorialCenter.controller.js` - Filter student tests from tutor view
3. ⚠️ Check student test fetching logic - Ensure students see their remedial tests
4. ⚠️ Database migration - Add student_id column if doesn't exist

## Next Steps

1. ✅ Check if `student_id` column exists in `tc_question_sets` table
2. ✅ Add debug logs to track test creation and fetching
3. ✅ Implement filtering logic
4. ⏳ Test the fix
5. ⏳ Remove debug logs (comment out)

## FIXES APPLIED

### Fix 1: Add student_id to Remedial Test Creation
**File**: `server/services/adaptiveLearning.service.js`
**Line**: ~100

```javascript
const { data: remedialTest, error } = await supabase
  .from('tc_question_sets')
  .insert([{
    tutor_id: attempt.question_set.tutor_id,
    center_id: attempt.question_set.center_id,
    student_id: studentId,  // ✅ ADDED: Mark as student-specific
    title: `Remedial: ${attempt.question_set.title}`,
    is_remedial: true,
    parent_set_id: attempt.question_set_id
  }])
```

### Fix 2: Filter Student Tests from Tutor Dashboard
**File**: `server/controllers/tutorialCenter.controller.js` (getQuestionSets)
**Line**: ~680

```javascript
const { data, error, count } = await supabase
  .from('tc_question_sets')
  .select('*', { count: 'exact' })
  .eq('center_id', center.id)
  .is('student_id', null)  // ✅ ADDED: Only show tutor-created tests
  .order('created_at', { ascending: false })
```

### Fix 3: Allow Students to See Their Own Remedial Tests
**File**: `server/controllers/tcQuestionSets.controller.js` (getQuestionSets)
**Line**: ~80

```javascript
if (center) {
  // Tutor view
  query = query
    .eq('center_id', center.id)
    .is('student_id', null);  // ✅ ADDED: Filter out student tests
} else {
  // Student view
  query = query
    .eq('is_active', true)
    .or(`student_id.is.null,student_id.eq.${userId}`);  // ✅ ADDED: Show public + own
}
```

### Debug Logs Added

All debug logs are active by default for testing. They include:

1. **Remedial Test Creation** (`adaptiveLearning.service.js`):
   - 🎯 Creation start with student ID
   - ✅ Creation success with visibility note

2. **Tutor Test Fetching** (`tutorialCenter.controller.js`):
   - 📊 Query start with filter info
   - ✅ Results with counts (should show 0 student-specific)

3. **Student Test Fetching** (`tcQuestionSets.controller.js`):
   - 👨‍🏫/🎓 User type detection
   - 📊 Query parameters
   - ✅ Results with breakdown

## Testing Instructions

### Test 1: Create Remedial Test
1. Restart backend server
2. Student takes a test and scores < 70%
3. Student clicks "Practice Weak Areas"
4. Check backend logs for:
   ```
   🎯 [REMEDIAL-VISIBILITY] Creating remedial test
   ✅ [REMEDIAL-VISIBILITY] Remedial test created
   ```
5. Verify `student_id` is set in the log

### Test 2: Tutor Dashboard
1. Login as tutor
2. Navigate to Tests page
3. Check backend logs for:
   ```
   📊 [TEST-FETCH-TUTOR] Fetching tests for tutor
   ✅ [TEST-FETCH-TUTOR] Query results { studentSpecificCount: 0 }
   ```
4. Verify remedial test does NOT appear ✅

### Test 3: Student Dashboard
1. Login as the student who created remedial test
2. Navigate to Tests page
3. Check backend logs for:
   ```
   🎓 [TEST-FETCH-STUDENT] User is STUDENT
   ✅ [TEST-FETCH-STUDENT] Query results
   ```
4. Verify remedial test DOES appear ✅

### Test 4: Other Students
1. Login as a different student in same center
2. Navigate to Tests page
3. Verify they do NOT see the first student's remedial test ✅

## Expected Behavior After Fix

| User Type | Regular Tests | Own Remedial Tests | Others' Remedial Tests |
|-----------|---------------|--------------------|-----------------------|
| Tutor     | ✅ See all    | ❌ Don't see       | ❌ Don't see          |
| Student A | ✅ See public | ✅ See own         | ❌ Don't see          |
| Student B | ✅ See public | ✅ See own         | ❌ Don't see          |

## Database Schema Note

The `tc_question_sets` table should have a `student_id` column (nullable):
- `NULL` = Regular tutor-created test (visible to all)
- `<student_id>` = Student-specific remedial test (visible only to that student)

If the column doesn't exist, you'll get a database error. Check Supabase schema.
