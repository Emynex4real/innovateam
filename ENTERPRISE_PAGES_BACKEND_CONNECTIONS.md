# Enterprise Pages - Backend Connections

## ✅ All Enterprise Pages Are Connected to Backend

### 1. **EnterpriseLogin** (`/login`)
- **Backend Service**: `useAuth()` from App.js
- **API Calls**: `signIn(email, password)`
- **Features**: 
  - Supabase authentication
  - Auto-redirect on success
  - Error handling with toast notifications

### 2. **EnterpriseRegister** (`/register`)
- **Backend Service**: `useAuth()` from App.js
- **API Calls**: `signUp(email, password, userData)`
- **Features**:
  - 3-step wizard (Info → Password → Role)
  - Role selection (Student/Tutor)
  - Email confirmation flow

### 3. **EnterpriseDashboard - Student** (`/student/dashboard`)
- **Backend Services**: 
  - `studentTCService.getMyCenters()`
  - `studentTCService.getMyAttempts()`
- **Features**:
  - Stats cards (tests taken, avg score, rank)
  - Quick actions navigation
  - League card integration
  - Streak badge integration
  - Center info display

### 4. **EnterpriseDashboard - Tutor** (`/tutor/dashboard`)
- **Backend Services**:
  - `tutorialCenterService.getMyCenter()`
  - `tutorialCenterService.getStudents()`
  - `tutorialCenterService.getQuestionSets()`
  - `tutorialCenterService.getQuestions()`
- **Features**:
  - Stats cards (students, tests, questions, avg score)
  - Quick actions navigation
  - Center info with access code
  - Theme customization link

### 5. **EnterpriseTestList** (`/student/tests`)
- **Backend Services**:
  - `studentTCService.getAvailableTests()`
  - `studentTCService.getMyAttempts()`
  - `tutorialCenterService.getMyMastery()`
- **Features**:
  - Test filtering (All/Pending/Completed)
  - Mastery level display
  - Best score tracking
  - Status badges

### 6. **EnterpriseTakeTest** (`/student/test/:testId`)
- **Backend Services**:
  - `studentTCService.getTest(testId)`
  - `studentTCService.submitAttempt()`
- **Features**:
  - Anti-cheat tracking (tab switches, copy-paste, rapid answers)
  - Device fingerprinting
  - Timer with auto-submit
  - Question navigator
  - Progress tracking
  - Answer selection with visual feedback

### 7. **EnterpriseResults** (`/student/results/:testId`)
- **Backend Services**:
  - `studentTCService.getMyAttempts(testId)`
  - `studentTCService.getTest(testId)`
  - `tutorialCenterService.generateRemedialTest(attemptId)`
- **Features**:
  - Attempt history display
  - Score visualization (3-column layout)
  - Integrity score warnings
  - Review answers button
  - Remedial test generation for failed attempts (<50%)

## How to See the New Design

1. **Stop your development server** (Ctrl+C in terminal)
2. **Restart the server**:
   ```bash
   npm start
   ```
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Visit these URLs**:
   - Login: `http://localhost:3000/login`
   - Register: `http://localhost:3000/register`
   - Student Dashboard: `http://localhost:3000/student/dashboard` (after login as student)
   - Tutor Dashboard: `http://localhost:3000/tutor/dashboard` (after login as tutor)
   - Tests: `http://localhost:3000/student/tests`

## Backend Services Used

### studentTC.service.js
- `getMyCenters()` - Get enrolled tutorial centers
- `getMyAttempts(testId?)` - Get test attempts
- `getAvailableTests()` - Get available tests
- `getTest(testId)` - Get test details with questions
- `submitAttempt(data)` - Submit test attempt with anti-cheat data

### tutorialCenter.service.js
- `getMyCenter()` - Get tutor's center
- `getStudents()` - Get enrolled students
- `getQuestionSets()` - Get all tests
- `getQuestions()` - Get question bank
- `getMyMastery()` - Get student mastery levels
- `generateRemedialTest(attemptId)` - Generate practice test from failed questions

### Auth Service (from App.js)
- `signIn(email, password)` - Login
- `signUp(email, password, userData)` - Register
- `signOut()` - Logout

## Design System

All pages use the centralized design system from `src/styles/designSystem.js`:
- **Colors**: Green primary (#16a34a), consistent shadows
- **Components**: Buttons, cards, inputs, badges with variants
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design with Tailwind CSS

## Anti-Cheat Integration

The `EnterpriseTakeTest` page includes full anti-cheat tracking:
- Tab switches
- Copy-paste attempts
- Rapid answer detection
- Device fingerprinting
- All data sent to backend on submission

## Adaptive Learning Integration

The `EnterpriseResults` page includes:
- Mastery level display
- Remedial test generation for scores < 50%
- Integrity score warnings
- Review answers functionality
