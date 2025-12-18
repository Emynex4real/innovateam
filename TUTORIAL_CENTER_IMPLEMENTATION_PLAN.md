# 📚 TUTORIAL CENTER IMPLEMENTATION PLAN
## Based on Existing Codebase Analysis

---

## 🔍 CODEBASE ANALYSIS SUMMARY

### **Current Architecture:**
- **Backend:** Node.js + Express + Supabase (PostgreSQL)
- **Frontend:** React + React Router
- **Auth:** Supabase Auth (already implemented)
- **Database:** Supabase PostgreSQL
- **AI Service:** Google Gemini (gemini.service.js)
- **Existing Features:**
  - ✅ User authentication (Supabase)
  - ✅ Wallet system
  - ✅ Admin dashboard
  - ✅ AI Examiner
  - ✅ Course Advisor
  - ✅ Question Generator (AI-powered)
  - ✅ Practice Questions (basic)
  - ✅ Leaderboard (basic)

### **Key Files Identified:**
```
Backend:
- server/server.js (main server)
- server/supabaseClient.js (Supabase connection)
- server/routes/auth.routes.js (auth endpoints)
- server/services/gemini.service.js (AI question generation)
- server/controllers/auth.controller.js

Frontend:
- src/App.js (routing)
- src/contexts/AuthContext.jsx (auth state)
- src/pages/student/PracticeQuestions.jsx (existing)
- src/pages/student/Leaderboard.jsx (existing)
```

---

## 🎯 IMPLEMENTATION STRATEGY

### **Phase 1: Database Schema (Supabase)**
We'll extend the existing Supabase setup with new tables for tutorial centers.

### **Phase 2: Backend API**
Add new routes and controllers to existing Express server.

### **Phase 3: Frontend Components**
Create new pages and components, integrate with existing routing.

### **Phase 4: Integration**
Connect everything together and test.

---

## 📊 DATABASE SCHEMA (Supabase SQL)

### **New Tables to Create:**

```sql
-- 1. PROFILES (extend existing users table)
-- Add role column to existing auth.users metadata
-- We'll use user_metadata for role storage

-- 2. TUTORIAL CENTERS
CREATE TABLE tutorial_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  access_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT one_center_per_tutor UNIQUE(tutor_id)
);

CREATE INDEX idx_tutorial_centers_tutor ON tutorial_centers(tutor_id);
CREATE INDEX idx_tutorial_centers_code ON tutorial_centers(access_code);

-- 3. QUESTIONS (Tutorial Center Question Bank)
CREATE TABLE tc_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tc_questions_center ON tc_questions(center_id);
CREATE INDEX idx_tc_questions_tutor ON tc_questions(tutor_id);
CREATE INDEX idx_tc_questions_subject ON tc_questions(subject);

-- 4. QUESTION SETS (Tests/Exams)
CREATE TABLE tc_question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER NOT NULL, -- minutes
  passing_score INTEGER NOT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
  show_answers BOOLEAN DEFAULT FALSE, -- tutor controls answer reveal
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tc_question_sets_center ON tc_question_sets(center_id);
CREATE INDEX idx_tc_question_sets_tutor ON tc_question_sets(tutor_id);

-- 5. QUESTION SET ITEMS (Links questions to sets)
CREATE TABLE tc_question_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES tc_questions(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(question_set_id, question_id),
  UNIQUE(question_set_id, order_number)
);

CREATE INDEX idx_tc_qsi_set ON tc_question_set_items(question_set_id);
CREATE INDEX idx_tc_qsi_question ON tc_question_set_items(question_id);

-- 6. ENROLLMENTS (Students join centers)
CREATE TABLE tc_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES tutorial_centers(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, center_id)
);

CREATE INDEX idx_tc_enrollments_student ON tc_enrollments(student_id);
CREATE INDEX idx_tc_enrollments_center ON tc_enrollments(center_id);

-- 7. STUDENT ATTEMPTS (Test results)
CREATE TABLE tc_student_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_set_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- [{question_id: "uuid", selected_answer: "A"}]
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL, -- seconds
  is_first_attempt BOOLEAN DEFAULT FALSE, -- for leaderboard
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tc_attempts_student ON tc_student_attempts(student_id);
CREATE INDEX idx_tc_attempts_set ON tc_student_attempts(question_set_id);
CREATE INDEX idx_tc_attempts_first ON tc_student_attempts(is_first_attempt) WHERE is_first_attempt = TRUE;

-- Function to mark first attempt
CREATE OR REPLACE FUNCTION mark_first_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first attempt for this student and question set
  IF NOT EXISTS (
    SELECT 1 FROM tc_student_attempts 
    WHERE student_id = NEW.student_id 
    AND question_set_id = NEW.question_set_id 
    AND id != NEW.id
  ) THEN
    NEW.is_first_attempt := TRUE;
  ELSE
    NEW.is_first_attempt := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_first_attempt
BEFORE INSERT ON tc_student_attempts
FOR EACH ROW
EXECUTE FUNCTION mark_first_attempt();

-- Function to generate unique access code
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM tutorial_centers WHERE access_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate access code
CREATE OR REPLACE FUNCTION set_access_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NULL OR NEW.access_code = '' THEN
    NEW.access_code := generate_access_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_center_access_code
BEFORE INSERT ON tutorial_centers
FOR EACH ROW
EXECUTE FUNCTION set_access_code();
```

---

## 🔐 ROW LEVEL SECURITY (RLS) POLICIES

```sql
-- Enable RLS on all tables
ALTER TABLE tutorial_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_question_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_student_attempts ENABLE ROW LEVEL SECURITY;

-- TUTORIAL CENTERS POLICIES
CREATE POLICY "Tutors can create their own center"
  ON tutorial_centers FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can view their own center"
  ON tutorial_centers FOR SELECT
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own center"
  ON tutorial_centers FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "Students can view enrolled centers"
  ON tutorial_centers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tutorial_centers.id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- QUESTIONS POLICIES
CREATE POLICY "Tutors can manage their questions"
  ON tc_questions FOR ALL
  USING (auth.uid() = tutor_id);

CREATE POLICY "Students can view questions from enrolled centers"
  ON tc_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tc_questions.center_id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- QUESTION SETS POLICIES
CREATE POLICY "Tutors can manage their question sets"
  ON tc_question_sets FOR ALL
  USING (auth.uid() = tutor_id);

CREATE POLICY "Students can view active sets from enrolled centers"
  ON tc_question_sets FOR SELECT
  USING (
    is_active = TRUE AND
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tc_question_sets.center_id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- QUESTION SET ITEMS POLICIES
CREATE POLICY "Tutors can manage question set items"
  ON tc_question_set_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets 
      WHERE tc_question_sets.id = tc_question_set_items.question_set_id 
      AND tc_question_sets.tutor_id = auth.uid()
    )
  );

CREATE POLICY "Students can view items from enrolled centers"
  ON tc_question_set_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets qs
      JOIN tc_enrollments e ON e.center_id = qs.center_id
      WHERE qs.id = tc_question_set_items.question_set_id 
      AND e.student_id = auth.uid()
      AND qs.is_active = TRUE
    )
  );

-- ENROLLMENTS POLICIES
CREATE POLICY "Students can enroll themselves"
  ON tc_enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their enrollments"
  ON tc_enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view their center enrollments"
  ON tc_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tutorial_centers 
      WHERE tutorial_centers.id = tc_enrollments.center_id 
      AND tutorial_centers.tutor_id = auth.uid()
    )
  );

-- STUDENT ATTEMPTS POLICIES
CREATE POLICY "Students can create their attempts"
  ON tc_student_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their attempts"
  ON tc_student_attempts FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view attempts for their question sets"
  ON tc_student_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets 
      WHERE tc_question_sets.id = tc_student_attempts.question_set_id 
      AND tc_question_sets.tutor_id = auth.uid()
    )
  );
```

---

## 🔌 BACKEND API STRUCTURE

### **New Routes to Add:**

```javascript
// server/routes/tutorialCenter.routes.js
// server/routes/tcQuestions.routes.js
// server/routes/tcQuestionSets.routes.js
// server/routes/tcEnrollments.routes.js
// server/routes/tcAttempts.routes.js
```

### **New Controllers:**

```javascript
// server/controllers/tutorialCenter.controller.js
// server/controllers/tcQuestions.controller.js
// server/controllers/tcQuestionSets.controller.js
// server/controllers/tcEnrollments.controller.js
// server/controllers/tcAttempts.controller.js
```

---

## 🎨 FRONTEND STRUCTURE

### **New Pages:**

```
Tutor Pages:
- src/pages/tutor/Dashboard.jsx
- src/pages/tutor/Center.jsx
- src/pages/tutor/Questions.jsx
- src/pages/tutor/QuestionForm.jsx
- src/pages/tutor/AIQuestionGenerator.jsx
- src/pages/tutor/QuestionSets.jsx
- src/pages/tutor/QuestionSetForm.jsx
- src/pages/tutor/Students.jsx
- src/pages/tutor/Leaderboard.jsx

Student Pages (enhance existing):
- src/pages/student/Centers.jsx (new)
- src/pages/student/JoinCenter.jsx (new)
- src/pages/student/Tests.jsx (new)
- src/pages/student/TakeTest.jsx (new)
- src/pages/student/Results.jsx (enhance existing)
- src/pages/student/PracticeQuestions.jsx (enhance existing)
```

### **New Components:**

```
- src/components/tutor/QuestionCard.jsx
- src/components/tutor/QuestionSetBuilder.jsx
- src/components/student/TestCard.jsx
- src/components/student/TestTimer.jsx
- src/components/student/QuestionDisplay.jsx
- src/components/common/AccessCodeInput.jsx
```

---

## 📝 IMPLEMENTATION CHECKLIST

### **Phase 1: Database Setup** ✅
- [ ] Run SQL migrations in Supabase
- [ ] Test RLS policies
- [ ] Verify triggers work
- [ ] Create test data

### **Phase 2: Backend API** 🔄
- [ ] Create tutorial center routes
- [ ] Create questions routes
- [ ] Create question sets routes
- [ ] Create enrollments routes
- [ ] Create attempts routes
- [ ] Integrate with existing gemini.service.js for AI generation
- [ ] Add to server.js

### **Phase 3: Frontend - Tutor** 🔄
- [ ] Create tutor dashboard
- [ ] Create center management
- [ ] Create question CRUD
- [ ] Integrate AI question generator
- [ ] Create question set builder
- [ ] Create student management
- [ ] Create leaderboard view

### **Phase 4: Frontend - Student** 🔄
- [ ] Create center enrollment
- [ ] Create test listing
- [ ] Create test taking interface
- [ ] Add timer functionality
- [ ] Create results view
- [ ] Enhance existing practice questions

### **Phase 5: Integration & Testing** ⏳
- [ ] End-to-end testing
- [ ] Role-based access testing
- [ ] Performance testing
- [ ] Mobile responsiveness
- [ ] Error handling

---

## 🚀 NEXT STEPS

1. **Review this plan** - Confirm everything looks good
2. **Start with Phase 1** - Database setup
3. **Then Phase 2** - Backend API
4. **Then Phase 3 & 4** - Frontend
5. **Finally Phase 5** - Testing

---

## 💡 KEY INTEGRATION POINTS

### **Reuse Existing:**
1. ✅ Supabase auth (already working)
2. ✅ gemini.service.js (for AI question generation)
3. ✅ Existing routing structure
4. ✅ Existing auth context
5. ✅ Existing UI components

### **Extend:**
1. 🔄 Add role to user_metadata (tutor/student)
2. 🔄 Enhance existing PracticeQuestions page
3. 🔄 Enhance existing Leaderboard page
4. 🔄 Add new routes to App.js

---

## ⚠️ IMPORTANT NOTES

1. **User Roles:** Store in Supabase user_metadata as `role: 'tutor' | 'student'`
2. **Access Codes:** Auto-generated 6-character alphanumeric
3. **First Attempt:** Automatically tracked via database trigger
4. **Answer Reveal:** Controlled by tutor via `show_answers` boolean
5. **AI Integration:** Reuse existing gemini.service.js
6. **Course Advisor:** Leave untouched (separate feature)

---

**Ready to proceed?** Let me know and I'll start with Phase 1 (Database Setup)! 🚀
