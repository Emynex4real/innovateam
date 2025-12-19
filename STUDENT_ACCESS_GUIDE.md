# 📚 Student Access Guide - How to Access Tutor's Tests

## 🎯 Two Ways Students Access Tests

### **Method 1: Private Tests (Access Code Required)** 🔒

#### **Step-by-Step:**

1. **Tutor Creates Center & Test:**
   - Tutor creates tutorial center
   - Gets unique access code (e.g., `ABC123`)
   - Creates private test
   - Shares access code with students

2. **Student Joins Center:**
   ```
   Student Login → /student/centers → Click "Join Center" 
   → Enter Access Code (ABC123) → Join
   ```

3. **Student Accesses Tests:**
   ```
   /student/centers → See enrolled centers 
   → Click "View Tests" → See all private tests from that center
   → Click "Start Test" → Take test
   ```

#### **URLs:**
- Join Center: `/student/centers/join`
- My Centers: `/student/centers`
- View Tests: `/student/tests`
- Take Test: `/student/test/:testId`

---

### **Method 2: Public Tests (No Code Needed)** 🌍

#### **Step-by-Step:**

1. **Tutor Creates Public Test:**
   - Tutor creates test
   - Sets visibility to "Public"
   - Test is now visible to ALL students

2. **Student Browses Public Tests:**
   ```
   Student Login → /student/centers → Click "🌍 Public Tests"
   → Browse all public tests → Click "Start Test"
   ```

#### **URLs:**
- Public Tests: `/student/tests/public`
- Take Test: `/student/test/:testId`

---

## 🗺️ Complete Student Journey

### **Scenario 1: Student Joins Private Center**

```
┌─────────────────────────────────────────┐
│ 1. Tutor shares access code: ABC123    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Student goes to /student/centers    │
│    Clicks "Join Center"                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Enters code: ABC123                  │
│    Clicks "Join Center"                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 4. Now enrolled in center               │
│    Can see center in "My Centers"       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 5. Clicks "View Tests"                  │
│    Sees all private tests from center   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 6. Clicks "Start Test"                  │
│    Takes test → Submits → Views results │
└─────────────────────────────────────────┘
```

### **Scenario 2: Student Takes Public Test**

```
┌─────────────────────────────────────────┐
│ 1. Student goes to /student/centers    │
│    Clicks "🌍 Public Tests"             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Browses public tests                 │
│    No enrollment needed                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Clicks "Start Test"                  │
│    Takes test → Submits → Views results │
└─────────────────────────────────────────┘
```

---

## 🎨 Student Dashboard Layout

### **Main Student Page: `/student/centers`**

```
┌──────────────────────────────────────────────┐
│  📚 Practice Tests                           │
├──────────────────────────────────────────────┤
│                                              │
│  [🌍 Public Tests]  [Join Center]           │
│                                              │
│  🔒 My Private Centers (2)                  │
│  ┌────────────────────────────────────┐    │
│  │ Ade's Tutorial Center              │    │
│  │ Access Code: ABC123                │    │
│  │ [View Tests]                       │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │ Excellence Academy                 │    │
│  │ Access Code: XYZ789                │    │
│  │ [View Tests]                       │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │ Looking for more practice?         │    │
│  │ [Browse Public Tests 🌍]           │    │
│  └────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### **Public Tests Page: `/student/tests/public`**

```
┌──────────────────────────────────────────────┐
│  🌍 Public Tests                             │
│  Practice tests available to everyone        │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────┐  ┌────────────────┐    │
│  │ JAMB Math 2024│  │ English Mock   │    │
│  │ 🌍 Public     │  │ 🌍 Public      │    │
│  │ 40 questions  │  │ 60 questions   │    │
│  │ [Start Test]  │  │ [Start Test]   │    │
│  └────────────────┘  └────────────────┘    │
│                                              │
│  ┌────────────────┐  ┌────────────────┐    │
│  │ Physics Quiz  │  │ Chemistry Test │    │
│  │ 🌍 Public     │  │ 🌍 Public      │    │
│  │ 30 questions  │  │ 45 questions   │    │
│  │ [Start Test]  │  │ [Start Test]   │    │
│  └────────────────┘  └────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 🔐 Access Control Matrix

| Test Type | Enrollment Required | Access Method | Visibility |
|-----------|-------------------|---------------|------------|
| **Private** | ✅ Yes | Access code | Center members only |
| **Public** | ❌ No | Direct access | All students |

---

## 📋 Student Navigation Routes

### **Main Routes:**
```
/student/centers          → My Centers (main hub)
/student/centers/join     → Join new center
/student/tests/public     → Browse public tests
/student/tests            → Tests from enrolled centers
/student/test/:testId     → Take specific test
/student/results/:testId  → View test results
```

### **Navigation Flow:**
```
Login (as student)
    ↓
/dashboard (student dashboard)
    ↓
Click "Tutorial Center" or navigate to /student/centers
    ↓
Options:
    → Join Center (enter access code)
    → View My Centers (enrolled centers)
    → Browse Public Tests (no enrollment)
```

---

## 🎯 Example Walkthrough

### **Example 1: Student Joins Tutor's Center**

**Tutor Side:**
1. Tutor creates center: "Ade's Tutorial Center"
2. Gets access code: `ABC123`
3. Creates private test: "Mathematics Quiz"
4. Shares code with students via WhatsApp/Email

**Student Side:**
1. Student logs in
2. Goes to `/student/centers`
3. Clicks "Join Center"
4. Enters `ABC123`
5. Clicks "Join Center"
6. Success! Now enrolled
7. Clicks "View Tests"
8. Sees "Mathematics Quiz"
9. Clicks "Start Test"
10. Completes test
11. Views results

### **Example 2: Student Takes Public Test**

**Tutor Side:**
1. Tutor creates test: "JAMB Practice 2024"
2. Sets visibility: "Public"
3. Test is now visible to everyone

**Student Side:**
1. Student logs in
2. Goes to `/student/centers`
3. Clicks "🌍 Public Tests"
4. Sees "JAMB Practice 2024"
5. Clicks "Start Test"
6. Completes test
7. Views results

---

## 🔍 How to Test This

### **Test Private Access:**

1. **Create Tutor Account:**
   - Register as tutor
   - Create tutorial center
   - Note the access code
   - Create a private test

2. **Create Student Account:**
   - Register as student
   - Go to `/student/centers/join`
   - Enter tutor's access code
   - Join center

3. **Verify Access:**
   - Student should see center in "My Centers"
   - Click "View Tests"
   - Should see tutor's private test
   - Can start and complete test

### **Test Public Access:**

1. **As Tutor:**
   - Create a test
   - Set visibility to "Public"

2. **As Student (any student):**
   - Go to `/student/tests/public`
   - Should see the public test
   - Can start without enrollment

---

## 🐛 Troubleshooting

### **Issue: Student can't see tests**

**Check:**
1. Is student enrolled in center?
   ```sql
   SELECT * FROM tc_enrollments WHERE student_id = 'student-id';
   ```

2. Are tests active?
   ```sql
   SELECT id, title, is_active FROM tc_question_sets WHERE center_id = 'center-id';
   ```

3. Is test visibility correct?
   ```sql
   SELECT id, title, visibility FROM tc_question_sets;
   ```

### **Issue: Student can't join center**

**Check:**
1. Is access code correct?
2. Does center exist?
   ```sql
   SELECT id, name, access_code FROM tutorial_centers;
   ```

### **Issue: Public tests not showing**

**Check:**
1. Is test visibility set to 'public'?
2. Is test active?
   ```sql
   SELECT id, title, visibility, is_active 
   FROM tc_question_sets 
   WHERE visibility = 'public';
   ```

---

## ✅ Summary

**Students access tutor's content in 2 ways:**

1. **Private Tests:**
   - Get access code from tutor
   - Join center using code
   - Access all private tests from that center

2. **Public Tests:**
   - No code needed
   - Browse public tests
   - Take any public test

**Key URLs for Students:**
- Main hub: `/student/centers`
- Join center: `/student/centers/join`
- Public tests: `/student/tests/public`
- Take test: `/student/test/:testId`

The system is **fully functional** and students can access both private (with enrollment) and public (without enrollment) tests!
