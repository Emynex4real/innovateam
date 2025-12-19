# 🎓 Complete Tutorial Center System Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TUTORIAL CENTER SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐              ┌──────────────┐            │
│  │    TUTOR     │              │   STUDENT    │            │
│  │   (Role)     │              │   (Role)     │            │
│  └──────────────┘              └──────────────┘            │
│         │                              │                    │
│         │                              │                    │
│         ▼                              ▼                    │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   /tutor     │              │  /student    │            │
│  │  Dashboard   │              │  Dashboard   │            │
│  └──────────────┘              └──────────────┘            │
│         │                              │                    │
│         │                              │                    │
│    ┌────┴────┐                    ┌────┴────┐              │
│    ▼         ▼                    ▼         ▼              │
│ ┌─────┐  ┌─────┐            ┌─────┐   ┌─────┐            │
│ │Tests│  │Ques │            │Join │   │Public│            │
│ │     │  │tions│            │Ctr  │   │Tests │            │
│ └─────┘  └─────┘            └─────┘   └─────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete Data Flow

### **1. Tutor Creates Content**

```
Tutor Registers (role: tutor)
        ↓
Creates Tutorial Center
        ↓
Gets Access Code (e.g., ABC123)
        ↓
Creates Questions
        ↓
Creates Test (Private or Public)
        ↓
Shares Access Code with Students
```

### **2. Student Accesses Content**

#### **Path A: Private Test (Enrollment Required)**

```
Student Registers (role: student)
        ↓
Goes to /student/centers/join
        ↓
Enters Access Code (ABC123)
        ↓
Joins Tutorial Center
        ↓
Enrolled in Center
        ↓
Goes to /student/tests
        ↓
Sees Private Tests from Center
        ↓
Starts Test
        ↓
Completes Test
        ↓
Views Results & Leaderboard
```

#### **Path B: Public Test (No Enrollment)**

```
Student Registers (role: student)
        ↓
Goes to /student/tests/public
        ↓
Browses Public Tests
        ↓
Starts Test (No code needed)
        ↓
Completes Test
        ↓
Views Results & Leaderboard
```

---

## 🗺️ URL Structure

### **Tutor URLs:**
```
/tutor                          → Dashboard
/tutor/questions                → Question Bank
/tutor/questions/generate       → AI Question Generator
/tutor/tests                    → Tests List
/tutor/tests/create             → Create New Test
/tutor/students                 → Enrolled Students
/tutor/leaderboard/:testId      → Test Leaderboard
```

### **Student URLs:**
```
/student/centers                → My Centers (Main Hub)
/student/centers/join           → Join Center (Enter Code)
/student/tests/public           → Public Tests Browser
/student/tests                  → Tests from Enrolled Centers
/student/test/:testId           → Take Test
/student/results/:testId        → View Results
```

---

## 🔐 Access Control Rules

### **Tutor Can:**
- ✅ Create tutorial center
- ✅ Create questions
- ✅ Create tests (private/public)
- ✅ View enrolled students
- ✅ View test leaderboards
- ✅ Toggle answer visibility
- ✅ Activate/deactivate tests
- ❌ Cannot access student routes

### **Student Can:**
- ✅ Join centers (with access code)
- ✅ View enrolled centers
- ✅ Take private tests (from enrolled centers)
- ✅ Browse public tests
- ✅ Take public tests (no enrollment)
- ✅ View own results
- ✅ View leaderboards
- ❌ Cannot access tutor routes
- ❌ Cannot create tests
- ❌ Cannot see other centers' private tests

---

## 📦 Database Structure

```
tutorial_centers
├── id
├── tutor_id
├── name
├── description
└── access_code (6-char unique)

tc_questions
├── id
├── tutor_id
├── center_id
├── question_text
├── options (JSONB)
├── correct_answer
├── explanation
├── subject
├── topic
└── difficulty

tc_question_sets (Tests)
├── id
├── tutor_id
├── center_id
├── title
├── description
├── time_limit
├── passing_score
├── visibility (private/public) ← NEW
├── show_answers
└── is_active

tc_enrollments
├── id
├── student_id
├── center_id
└── enrolled_at

tc_student_attempts
├── id
├── student_id
├── question_set_id
├── answers (JSONB)
├── score
├── time_taken
└── is_first_attempt
```

---

## 🎯 Real-World Example

### **Scenario: Ade's Tutorial Center**

**Day 1 - Setup:**
```
1. Ade registers as tutor
2. Creates "Ade's Tutorial Center"
3. Gets access code: ABC123
4. Creates 50 math questions
5. Creates test: "JAMB Math Practice"
   - Visibility: Private
   - Time: 60 minutes
   - Passing: 70%
```

**Day 2 - Students Join:**
```
1. Ade shares ABC123 via WhatsApp
2. Student 1 (Tunde) joins using ABC123
3. Student 2 (Amina) joins using ABC123
4. Student 3 (Chidi) joins using ABC123
5. All 3 now enrolled in Ade's center
```

**Day 3 - Students Take Test:**
```
1. Tunde: /student/centers → View Tests → Start Test
   - Completes in 45 mins
   - Scores 85%
   - Passes ✅

2. Amina: /student/centers → View Tests → Start Test
   - Completes in 50 mins
   - Scores 92%
   - Passes ✅

3. Chidi: /student/centers → View Tests → Start Test
   - Completes in 55 mins
   - Scores 68%
   - Fails ❌ (can retake)
```

**Day 4 - Ade Creates Public Test:**
```
1. Ade creates "Free JAMB Sample"
   - Visibility: Public
   - 20 questions
   - 30 minutes

2. Any student can now access:
   - /student/tests/public
   - See "Free JAMB Sample"
   - Take test without joining center
```

---

## 🔄 Test Lifecycle

```
┌─────────────────────────────────────────┐
│ 1. Tutor Creates Test                  │
│    - Adds questions                     │
│    - Sets visibility (private/public)  │
│    - Sets time limit & passing score   │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 2. Test is Active                       │
│    - Visible to authorized students     │
│    - Can be taken multiple times        │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 3. Students Take Test                   │
│    - Timer starts                       │
│    - Answer questions                   │
│    - Submit                             │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 4. Results Generated                    │
│    - Score calculated                   │
│    - Pass/Fail determined               │
│    - Leaderboard updated                │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 5. Student Views Results                │
│    - See score                          │
│    - See correct answers (if enabled)   │
│    - See leaderboard position           │
└─────────────────────────────────────────┘
```

---

## 🎨 UI Screenshots (Text Version)

### **Tutor Dashboard:**
```
╔════════════════════════════════════════╗
║  Ade's Tutorial Center                 ║
║  Access Code: ABC123                   ║
╠════════════════════════════════════════╣
║  📊 Stats:                             ║
║  Students: 15                          ║
║  Questions: 120                        ║
║  Tests: 5                              ║
╠════════════════════════════════════════╣
║  Quick Actions:                        ║
║  [Add Questions] [AI Generate]         ║
║  [Create Test]   [View Students]       ║
╚════════════════════════════════════════╝
```

### **Student Dashboard:**
```
╔════════════════════════════════════════╗
║  📚 Practice Tests                     ║
╠════════════════════════════════════════╣
║  [🌍 Public Tests] [Join Center]      ║
╠════════════════════════════════════════╣
║  🔒 My Private Centers (2)            ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ Ade's Tutorial Center            │ ║
║  │ 5 tests available                │ ║
║  │ [View Tests]                     │ ║
║  └──────────────────────────────────┘ ║
║                                        ║
║  ┌──────────────────────────────────┐ ║
║  │ Excellence Academy               │ ║
║  │ 3 tests available                │ ║
║  │ [View Tests]                     │ ║
║  └──────────────────────────────────┘ ║
╚════════════════════════════════════════╝
```

---

## ✅ System Status

**✅ Implemented:**
- Role-based access control
- Tutorial center creation
- Question bank management
- Test creation (private/public)
- Student enrollment
- Test taking
- Results & leaderboards
- Public test discovery

**🔄 Working:**
- Tutor can create centers ✅
- Tutor can create tests ✅
- Students can join centers ✅
- Students can take private tests ✅
- Students can take public tests ✅
- Access control enforced ✅

**📈 Ready for Production!**

---

## 🎉 Summary

The system provides a **complete tutorial center platform** where:

1. **Tutors** create centers, questions, and tests
2. **Students** join centers and take tests
3. **Private tests** require enrollment (access code)
4. **Public tests** are open to everyone
5. **Role-based access** ensures security
6. **Leaderboards** track performance

Everything is **fully functional** and ready to use! 🚀
