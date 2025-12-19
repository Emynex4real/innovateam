# Public/Private Test System - Implementation Guide

## ✅ What Was Implemented

### **1. Database Changes**
- Added `visibility` column to `tc_question_sets` (private/public)
- Updated RLS policies to allow public test access
- Added performance indexes

### **2. Backend Updates**
- Updated test creation to support visibility
- Added `/api/tc-question-sets/public/all` endpoint
- Modified access control logic

### **3. Frontend Features**

#### **For Tutors:**
- ✅ Visibility selector in test creation (Private/Public)
- ✅ Visibility indicator on tests list
- ✅ Can toggle test visibility

#### **For Students:**
- ✅ Public Tests browser page
- ✅ Access tests without joining centers
- ✅ Quick navigation between public and private tests

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```sql
-- File: supabase/add_public_tests.sql
-- Copy and paste the entire file content
```

Or run this quick version:

```sql
-- Add visibility column
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'public'));

-- Update RLS policy
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

### Step 2: Restart Backend Server

```bash
cd server
npm start
```

### Step 3: Test the Features

---

## 📖 How to Use

### **As a Tutor:**

1. **Create a Public Test:**
   - Go to `/tutor/tests/create`
   - Fill in test details
   - Select **"🌍 Public (Anyone can access)"** from Visibility dropdown
   - Create test

2. **Make Existing Test Public:**
   - Go to `/tutor/tests`
   - Edit test settings
   - Change visibility to Public
   - Save

3. **View Test Visibility:**
   - Tests list shows 🌍 Public or 🔒 Private badge
   - Public tests are accessible to all students

### **As a Student:**

1. **Browse Public Tests:**
   - Go to `/student/centers`
   - Click **"🌍 Public Tests"** button
   - Or navigate to `/student/tests/public`

2. **Take Public Test:**
   - Browse available public tests
   - Click "Start Test"
   - Complete test (no enrollment needed)

3. **Access Private Tests:**
   - Join a center using access code
   - View tests from enrolled centers
   - Take private tests

---

## 🎯 User Flows

### **Public Test Flow:**
```
Student → Public Tests Page → Browse Tests → Start Test → Complete → View Results
```

### **Private Test Flow:**
```
Student → Join Center (Access Code) → My Centers → View Tests → Start Test → Complete → View Results
```

---

## 🔍 Testing Checklist

### **Tutor Tests:**
- [ ] Create a private test
- [ ] Create a public test
- [ ] Verify visibility badge shows correctly
- [ ] Toggle test between private/public
- [ ] Check test appears in correct list

### **Student Tests:**
- [ ] Access public tests page
- [ ] See all public tests (no enrollment needed)
- [ ] Start and complete a public test
- [ ] Join a private center
- [ ] Access private tests from enrolled center
- [ ] Verify cannot access private tests without enrollment

### **Access Control:**
- [ ] Student cannot access private test without enrollment
- [ ] Student can access any public test
- [ ] Tutor can see all their tests (public + private)
- [ ] Public test shows in public list
- [ ] Private test does NOT show in public list

---

## 📊 Database Schema

```sql
tc_question_sets:
  - id (UUID)
  - title (TEXT)
  - description (TEXT)
  - visibility (TEXT) -- 'private' or 'public' ✨ NEW
  - is_active (BOOLEAN)
  - time_limit (INTEGER)
  - passing_score (INTEGER)
  - show_answers (BOOLEAN)
  - tutor_id (UUID)
  - center_id (UUID)
```

---

## 🎨 UI Components

### **Test Builder (Tutor)**
```
Visibility: [Dropdown]
  🔒 Private (Center members only)
  🌍 Public (Anyone can access)
```

### **Tests List (Tutor)**
```
Test Card:
  - Title
  - 🌍 Public / 🔒 Private badge
  - Stats (questions, time, passing score)
  - Actions (Edit, Delete, Toggle)
```

### **Public Tests Browser (Student)**
```
Grid of Test Cards:
  - Title
  - Description
  - 🌍 Public badge
  - Stats
  - "Start Test" button
  - Tutor/Center name
```

---

## 🔐 Security & Access Control

### **RLS Policies:**

1. **Students can view:**
   - All public tests (visibility = 'public')
   - Private tests from enrolled centers

2. **Tutors can:**
   - Create tests (private or public)
   - Manage all their tests
   - Toggle visibility

3. **Questions Access:**
   - Students can view questions from public tests
   - Students can view questions from enrolled centers
   - Correct answers hidden based on `show_answers` setting

---

## 🚀 Future Enhancements

### **Phase 2 (Optional):**
- [ ] Search & filter public tests
- [ ] Categories/tags system
- [ ] Test ratings & reviews
- [ ] Test preview (first 3 questions)
- [ ] Trending/popular tests

### **Phase 3 (Optional):**
- [ ] Separate leaderboards (public vs private)
- [ ] Test analytics (views, attempts, completion rate)
- [ ] Share test links
- [ ] Embed tests on external sites

---

## 🐛 Troubleshooting

### **Issue: Public tests not showing**

**Check:**
1. Test visibility is set to 'public'
2. Test is active (`is_active = true`)
3. Database migration ran successfully
4. RLS policies updated

**Fix:**
```sql
-- Check test visibility
SELECT id, title, visibility, is_active FROM tc_question_sets;

-- Make test public
UPDATE tc_question_sets SET visibility = 'public' WHERE id = 'test-id';
```

### **Issue: Student can't access public test**

**Check:**
1. RLS policies are correct
2. Student is authenticated
3. Test is active and public

**Fix:**
```sql
-- Verify RLS policy exists
SELECT * FROM pg_policies WHERE tablename = 'tc_question_sets';

-- Re-run migration if needed
```

### **Issue: Visibility dropdown not showing**

**Check:**
1. Frontend code updated
2. Browser cache cleared
3. React app restarted

**Fix:**
```bash
# Clear cache and restart
Ctrl + Shift + Delete (clear cache)
npm start
```

---

## 📝 API Endpoints

### **Get Public Tests**
```
GET /api/tc-question-sets/public/all
Headers: Authorization: Bearer <token>
Response: { success: true, tests: [...] }
```

### **Create Test with Visibility**
```
POST /api/tc-question-sets
Body: {
  title: "Test Title",
  visibility: "public", // or "private"
  ...
}
```

### **Update Test Visibility**
```
PUT /api/tc-question-sets/:id
Body: {
  visibility: "public"
}
```

---

## ✅ Success Criteria

- [x] Tutors can create public tests
- [x] Tutors can create private tests
- [x] Students can browse public tests
- [x] Students can take public tests without enrollment
- [x] Students can access private tests after enrollment
- [x] Visibility badge shows correctly
- [x] Access control enforced by RLS

---

## 🎉 Summary

**What Students Get:**
- Access to public practice tests (no code needed)
- Access to private center tests (with enrollment)
- Clear separation between public and private content

**What Tutors Get:**
- Control over test visibility
- Ability to share tests publicly
- Private tests for enrolled students only

**System Benefits:**
- Increased engagement (public tests)
- Better discovery mechanism
- Flexible access control
- Scalable architecture

---

**Status:** ✅ Ready for Testing
**Priority:** High
**Impact:** Major feature enhancement
