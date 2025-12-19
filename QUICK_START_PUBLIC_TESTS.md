# Quick Start: Public/Private Tests

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration (1 minute)

Open Supabase SQL Editor and paste:

```sql
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'public'));

DROP POLICY IF EXISTS "Students can view active sets from enrolled centers" ON tc_question_sets;

CREATE POLICY "Students can view public or enrolled tests" 
ON tc_question_sets FOR SELECT
USING (
  is_active = TRUE AND (
    visibility = 'public' OR
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tc_question_sets.center_id 
      AND tc_enrollments.student_id = auth.uid()
    )
  )
);
```

Click **RUN** ✅

### Step 2: Restart Backend (30 seconds)

```bash
cd server
npm start
```

### Step 3: Test It! (2 minutes)

#### **As Tutor:**
1. Login as tutor
2. Go to `/tutor/tests/create`
3. Create a test
4. Select **"🌍 Public"** from Visibility dropdown
5. Save test

#### **As Student:**
1. Login as student
2. Go to `/student/centers`
3. Click **"🌍 Public Tests"** button
4. See your public test!
5. Click "Start Test"

---

## 🎯 What You Get

### **Before:**
- ❌ Students need access code for every test
- ❌ No way to share tests publicly
- ❌ Limited test discovery

### **After:**
- ✅ Public tests (no code needed)
- ✅ Private tests (access code required)
- ✅ Easy test discovery
- ✅ Flexible access control

---

## 📍 Key URLs

**Tutor:**
- Create Test: `/tutor/tests/create`
- Manage Tests: `/tutor/tests`

**Student:**
- Public Tests: `/student/tests/public`
- My Centers: `/student/centers`
- Join Center: `/student/centers/join`

---

## 🔍 Quick Test

### Create Public Test:
```
1. Login as tutor
2. /tutor/tests/create
3. Title: "JAMB Math Practice"
4. Visibility: Public
5. Add questions
6. Save
```

### Access Public Test:
```
1. Login as student (different account)
2. /student/tests/public
3. See "JAMB Math Practice"
4. Click "Start Test"
5. Complete test ✅
```

---

## ✅ Verification

Run these checks:

```sql
-- Check if visibility column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tc_question_sets' 
AND column_name = 'visibility';

-- Check if you have public tests
SELECT id, title, visibility, is_active 
FROM tc_question_sets 
WHERE visibility = 'public';

-- Make a test public (if needed)
UPDATE tc_question_sets 
SET visibility = 'public' 
WHERE id = 'your-test-id';
```

---

## 🐛 Troubleshooting

### "Column visibility does not exist"
**Fix:** Run Step 1 migration again

### "Public tests not showing"
**Fix:** 
```sql
UPDATE tc_question_sets 
SET visibility = 'public', is_active = true 
WHERE id = 'test-id';
```

### "Access denied"
**Fix:** Re-run RLS policy from Step 1

---

## 🎉 Done!

You now have:
- ✅ Public test system
- ✅ Private test system
- ✅ Role-based access control
- ✅ Test discovery for students

**Next:** Create some public tests and share with students!
