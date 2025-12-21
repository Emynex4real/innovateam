# Navigation Setup for Gamification Features

## Add to Your Router Configuration

### Student Routes
Add these routes to your student router section:

```jsx
import Badges from './pages/student/Badges';
import Challenges from './pages/student/Challenges';
import StudyPlan from './pages/student/StudyPlan';

// In your Routes component:
<Route path="/student/badges" element={<Badges />} />
<Route path="/student/challenges" element={<Challenges />} />
<Route path="/student/study-plan" element={<StudyPlan />} />
```

### Tutor Routes
Add this route to your tutor router section:

```jsx
import ManageChallenges from './pages/tutor/ManageChallenges';

// In your Routes component:
<Route path="/tutor/manage-challenges" element={<ManageChallenges />} />
```

---

## Add to Navigation Menu

### Student Sidebar/Menu
```jsx
const studentMenuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/student/dashboard' },
  { icon: '📝', label: 'Tests', path: '/student/tests' },
  { icon: '🏆', label: 'Badges', path: '/student/badges' },        // NEW
  { icon: '🎯', label: 'Challenges', path: '/student/challenges' }, // NEW
  { icon: '📚', label: 'Study Plan', path: '/student/study-plan' }, // NEW
  { icon: '📊', label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: '💬', label: 'Messages', path: '/student/messages' },
];
```

### Tutor Sidebar/Menu
```jsx
const tutorMenuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/tutor/dashboard' },
  { icon: '📝', label: 'Tests', path: '/tutor/tests' },
  { icon: '❓', label: 'Questions', path: '/tutor/questions' },
  { icon: '🎯', label: 'Challenges', path: '/tutor/manage-challenges' }, // NEW
  { icon: '📊', label: 'Analytics', path: '/tutor/analytics' },
  { icon: '💳', label: 'Subscription', path: '/tutor/subscription' },
];
```

---

## Quick Access Buttons

### Add to Student Dashboard
```jsx
<div className="grid grid-cols-3 gap-4">
  <button onClick={() => navigate('/student/badges')} className="...">
    🏆 My Badges
  </button>
  <button onClick={() => navigate('/student/challenges')} className="...">
    🎯 Challenges
  </button>
  <button onClick={() => navigate('/student/study-plan')} className="...">
    📚 Study Plan
  </button>
</div>
```

### Add to Tutor Dashboard
```jsx
<button onClick={() => navigate('/tutor/manage-challenges')} className="...">
  🎯 Create Challenge
</button>
```

---

## Badge Notification Component (Optional)

Create a badge notification that appears when students unlock badges:

```jsx
// components/BadgeNotification.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BadgeNotification = () => {
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    // Check for new badges after test completion
    const checkBadges = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/gamification/badges/check`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.newBadges?.length > 0) {
        setNewBadge(res.data.newBadges[0]);
        setTimeout(() => setNewBadge(null), 5000);
      }
    };

    // Listen for test completion event
    window.addEventListener('testCompleted', checkBadges);
    return () => window.removeEventListener('testCompleted', checkBadges);
  }, []);

  if (!newBadge) return null;

  return (
    <div className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-2xl animate-bounce z-50">
      <div className="text-center">
        <div className="text-6xl mb-2">{newBadge.badges.icon}</div>
        <h3 className="text-xl font-bold">Badge Unlocked!</h3>
        <p className="text-sm">{newBadge.badges.name}</p>
        <p className="text-xs mt-1">+{newBadge.badges.xp_reward} XP</p>
      </div>
    </div>
  );
};

export default BadgeNotification;
```

---

## Trigger Badge Check

Add to your test submission handler:

```jsx
const submitTest = async () => {
  // ... existing test submission code
  
  // Trigger badge check
  window.dispatchEvent(new Event('testCompleted'));
};
```

---

## Complete Example Router

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Badges from './pages/student/Badges';
import Challenges from './pages/student/Challenges';
import StudyPlan from './pages/student/StudyPlan';

// Tutor Pages
import TutorDashboard from './pages/tutor/Dashboard';
import ManageChallenges from './pages/tutor/ManageChallenges';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/badges" element={<Badges />} />
        <Route path="/student/challenges" element={<Challenges />} />
        <Route path="/student/study-plan" element={<StudyPlan />} />
        
        {/* Tutor Routes */}
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/manage-challenges" element={<ManageChallenges />} />
        
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Testing Navigation

1. **Student Flow:**
   - Login as student
   - Navigate to Badges → See badge collection
   - Navigate to Challenges → Join a challenge
   - Navigate to Study Plan → Generate plan

2. **Tutor Flow:**
   - Login as tutor
   - Navigate to Manage Challenges
   - Create a new challenge
   - View participants

---

## Mobile Navigation

For mobile responsive menu:

```jsx
const MobileMenu = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2">
      <NavLink to="/student/dashboard">🏠</NavLink>
      <NavLink to="/student/badges">🏆</NavLink>
      <NavLink to="/student/challenges">🎯</NavLink>
      <NavLink to="/student/study-plan">📚</NavLink>
    </div>
  );
};
```

---

## Done! ✅

Your gamification features are now fully integrated into the navigation system.
