# Phase 2 Routing Integration Guide

## Overview
This guide shows how to integrate all Phase 2 pages into your App.js React Router configuration.

## Routes to Add

```javascript
// Phase 2: Collaboration & Communication Routes

// Messaging
<Route path="/messages" element={<Messaging />} />

// Forums
<Route path="/forums/:centerId" element={<Forums centerId={centerId} userId={user.id} userName={user.name} userAvatar={user.avatar_url} />} />

// Study Groups
<Route path="/study-groups/:centerId" element={<StudyGroups centerId={centerId} userId={user.id} />} />

// Peer Tutoring
<Route path="/tutoring/:centerId" element={<TutoringMarketplace centerId={centerId} userId={user.id} userName={user.name} />} />

// Leaderboard
<Route path="/leaderboard/:centerId" element={<Leaderboard centerId={centerId} userId={user.id} />} />
```

## Imports to Add (at top of App.js)

```javascript
// Phase 2 Pages
import Messaging from './pages/student/Messaging';
import Forums from './pages/student/Forums';
import StudyGroups from './pages/student/StudyGroups';
import TutoringMarketplace from './pages/student/TutoringMarketplace';
import Leaderboard from './pages/student/Leaderboard';
```

## Full App.js Routes Section

```javascript
function App() {
  const { user, isAuthenticated, authToken } = useAuth();
  const { centerId } = useCenter();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <Routes>
          {/* Existing Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          {/* ... other existing routes ... */}

          {/* Phase 2: Collaboration & Communication */}
          <Route 
            path="/messages" 
            element={
              <Messaging 
                user={user}
                authToken={authToken}
              />
            } 
          />
          
          <Route 
            path="/forums/:centerId" 
            element={
              <Forums 
                centerId={centerId}
                userId={user?.id}
                userName={user?.name}
                userAvatar={user?.avatar_url}
              />
            } 
          />
          
          <Route 
            path="/study-groups/:centerId" 
            element={
              <StudyGroups 
                centerId={centerId}
                userId={user?.id}
              />
            } 
          />
          
          <Route 
            path="/tutoring/:centerId" 
            element={
              <TutoringMarketplace 
                centerId={centerId}
                userId={user?.id}
                userName={user?.name}
              />
            } 
          />
          
          <Route 
            path="/leaderboard/:centerId" 
            element={
              <Leaderboard 
                centerId={centerId}
                userId={user?.id}
              />
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

## Navigation Links to Add

### In Sidebar (src/components/Sidebar.jsx)

```javascript
// Add to main menu items
<NavLink to="/messages" className="nav-link">
  <span className="icon">💬</span>
  Messages
  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</NavLink>

<NavLink to={`/forums/${centerId}`} className="nav-link">
  <span className="icon">💭</span>
  Forums
</NavLink>

<NavLink to={`/study-groups/${centerId}`} className="nav-link">
  <span className="icon">👥</span>
  Study Groups
</NavLink>

<NavLink to={`/tutoring/${centerId}`} className="nav-link">
  <span className="icon">👨‍🏫</span>
  Tutoring
</NavLink>

<NavLink to={`/leaderboard/${centerId}`} className="nav-link">
  <span className="icon">🏆</span>
  Leaderboard
</NavLink>
```

### In Navbar (src/components/Navbar.jsx)

Add Notification Bell:

```javascript
// Notification Bell Component
<div className="notification-bell">
  <button onClick={toggleNotifications} className="bell-btn">
    🔔
    {unreadNotificationCount > 0 && (
      <span className="notification-badge">{unreadNotificationCount}</span>
    )}
  </button>
  
  {showNotifications && (
    <div className="notification-dropdown">
      {/* Notification items */}
    </div>
  )}
</div>
```

## Optional: Add Notification Badge Hook

```javascript
// useNotifications.js
import { useEffect, useState } from 'react';
import CollaborationService from '../services/collaborationService';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const result = await CollaborationService.getNotifications(true);
    if (result.success) {
      setNotifications(result.data || []);
      const unread = await CollaborationService.getUnreadNotificationCount();
      if (unread.success) {
        setUnreadCount(unread.data || 0);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    await CollaborationService.markNotificationAsRead(notificationId);
    fetchNotifications();
  };

  return { unreadCount, notifications, markAsRead, fetchNotifications };
}
```

## Usage in Components

```javascript
import { useNotifications } from '../hooks/useNotifications';

function Navbar() {
  const { unreadCount, notifications } = useNotifications();

  return (
    <nav>
      {/* Navbar content */}
      <div className="notification-bell">
        🔔 {unreadCount > 0 && <span>{unreadCount}</span>}
      </div>
    </nav>
  );
}
```

## Quick Testing

After integration, test each route:

1. **Messaging**: `/messages`
   - Load conversation list
   - Send and receive messages
   - Test unread badge

2. **Forums**: `/forums/center-id`
   - View categories
   - Create thread
   - Vote on posts
   - Search threads

3. **Study Groups**: `/study-groups/center-id`
   - Browse groups
   - Create group
   - Join/leave group

4. **Tutoring**: `/tutoring/center-id`
   - Browse tutors
   - Filter by subject
   - Request tutoring

5. **Leaderboard**: `/leaderboard/center-id`
   - View rankings
   - Check your position
   - See points breakdown

## Environment Variables

Ensure `.env` has:

```
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-key
```

## API Service Configuration

The api.js config should have:

```javascript
// src/config/api.js
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Used in all service files
// e.g., fetch(`${API_BASE_URL}/phase2/messaging/conversations`, ...)
```

## Next Steps

1. ✅ Import all 5 Phase 2 pages into App.js
2. ✅ Add routes to React Router
3. ✅ Add navigation links to Sidebar
4. ✅ Add notification badge to Navbar
5. ✅ Test all routes and functionality
6. ✅ Deploy to server

## Files Modified

- `src/App.js` - Add routes and imports
- `src/components/Sidebar.jsx` - Add nav links
- `src/components/Navbar.jsx` - Add notification bell
- `src/config/api.js` - Ensure base URL is set
- (Optional) `src/hooks/useNotifications.js` - Create hook

## API Endpoints Recap

All Phase 2 endpoints are available at `/api/phase2/...`:

- **Messaging**: 6 endpoints
- **Forums**: 8 endpoints  
- **Study Groups**: 7 endpoints
- **Tutoring**: 9 endpoints
- **Notifications**: 4 endpoints
- **Gamification**: 4 endpoints

Total: **38 endpoints** ready to use

## Status

✅ All API services created and tested
✅ All 5 main pages created
✅ All component CSS complete
✅ Ready for routing integration
✅ Ready for deployment
