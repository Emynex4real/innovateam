# Phase 2 Testing Guide 🧪

## Quick Start Testing

### 1. Pre-Test Verification
Before testing, ensure:
- ✅ Backend server is running on `http://localhost:5000`
- ✅ Frontend is running on `http://localhost:3000`
- ✅ Database migrations are applied to Supabase
- ✅ User is logged in with a 'student' role account

### 2. Navigate to Phase 2 Features

#### Access Messaging
```
URL: http://localhost:3000/student/messaging
Expected: Page loads with conversation list and chat interface
```

**Test Steps:**
1. Open browser to `/student/messaging`
2. See "Messaging" page with two columns
3. Left: List of conversations
4. Right: Chat interface with message area
5. Try sending a test message to verify endpoint connectivity

#### Access Forums
```
URL: http://localhost:3000/student/forums
Expected: Page loads with forum categories and thread list
```

**Test Steps:**
1. Open browser to `/student/forums`
2. See forum categories displayed
3. Click a category to view threads
4. Click a thread to view details and posts
5. Try creating a new thread or posting a reply

#### Access Study Groups
```
URL: http://localhost:3000/student/study-groups
Expected: Page loads with study group listing and tabs
```

**Test Steps:**
1. Open browser to `/student/study-groups`
2. See "Browse" and "My Groups" tabs
3. Browse tab shows all public groups
4. Try creating a new study group
5. Try joining an existing group

#### Access Tutoring
```
URL: http://localhost:3000/student/tutoring
Expected: Page loads with tutor marketplace
```

**Test Steps:**
1. Open browser to `/student/tutoring`
2. See list of available tutors with ratings
3. Click a tutor profile to view details
4. Try requesting a tutoring session
5. Check "My Sessions" tab

### 3. Test Navigation Links

#### Sidebar Integration
1. ✅ Sidebar shows "Collaboration" menu group (should be collapsed initially)
2. ✅ Click "Collaboration" to expand sub-menu
3. ✅ See 4 items: Messages, Forums, Study Groups, Tutoring
4. ✅ Click each item and verify correct page loads
5. ✅ Active item should be highlighted in green
6. ✅ On mobile, hamburger menu should work

#### Desktop View (1920px+)
- [ ] Sidebar visible on left
- [ ] Collaboration menu fully visible
- [ ] All links clickable
- [ ] Pages load without sidebar closing

#### Mobile View (360px-768px)
- [ ] Hamburger menu visible
- [ ] Sidebar slides in from left when opened
- [ ] Overlay appears behind sidebar
- [ ] Clicking sidebar item closes menu
- [ ] Clicking overlay closes menu

### 4. Test Unread Badge

#### Notification Badge Display
1. ✅ Open Messaging page
2. ✅ Should see unread badge next to conversation (if messages exist)
3. ✅ Badge shows number of unread messages
4. ✅ Click "Messages" in sidebar - unread badge should update
5. ✅ Wait 10 seconds - badge should auto-refresh

#### Badge Logic
- Badge appears when `unread_count > 0`
- Badge updates every 10 seconds
- Badge disappears when all messages read
- Badge shows at `/student/messaging` link

### 5. Test API Integration

#### Backend Endpoint Verification

**Test Messaging Endpoints:**
```bash
# Get conversations (requires auth)
curl -X GET http://localhost:5000/api/phase2/messaging/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return: { success: true, data: [...] }
```

**Test Forums Endpoints:**
```bash
# Get forum categories
curl -X GET http://localhost:5000/api/phase2/forums/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return: { success: true, data: [...] }
```

**Test Study Groups Endpoints:**
```bash
# Get study groups
curl -X GET http://localhost:5000/api/phase2/study-groups/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return: { success: true, data: [...] }
```

**Test Tutoring Endpoints:**
```bash
# Get tutor profiles
curl -X GET http://localhost:5000/api/phase2/tutoring/tutors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Should return: { success: true, data: [...] }
```

### 6. Test Authentication & Authorization

#### Protected Routes (Student Only)
1. ✅ Log out completely
2. ✅ Try to access `/student/messaging` → should redirect to login
3. ✅ Log in with student account → should access messaging
4. ✅ Log out and log in with tutor account → should NOT access messaging
5. ✅ Log in with admin account → should NOT access messaging

#### JWT Token Handling
1. ✅ Open browser DevTools (F12)
2. ✅ Go to Application tab → LocalStorage
3. ✅ Should see `token` key with JWT value
4. ✅ Refresh page → token persists
5. ✅ Log out → token removed

### 7. Test Error Handling

#### Network Error Scenarios
1. **API Error - Connection Failed**
   - Turn off backend server
   - Try to load messaging → should show "Failed to load conversations"
   - Turn backend back on
   - Refresh → should work again

2. **Validation Error - Missing Required Fields**
   - Try to send empty message → should show error
   - Try to create study group without name → should show error

3. **Permission Error - Unauthorized**
   - Try API call without JWT token → should get 401 Unauthorized
   - Try to access admin endpoint as student → should get 403 Forbidden

### 8. Test Loading States

#### Spinner/Loading Indicators
1. ✅ Load messaging page → should show spinner briefly
2. ✅ Switch between conversations → loading indicator appears
3. ✅ Send message → sending indicator appears
4. ✅ Create forum thread → loading state shown
5. ✅ All loading states have 2-5 second timeout max

#### Skeleton Loading (if implemented)
1. ✅ List skeleton appears before data loads
2. ✅ Skeleton fades out when real data arrives
3. ✅ No "flash" of empty state before data

### 9. Test Responsive Design

#### Breakpoints to Test
- [ ] 320px (iPhone SE)
- [ ] 480px (Small phone)
- [ ] 768px (Tablet portrait)
- [ ] 1024px (Tablet landscape)
- [ ] 1366px (Desktop)
- [ ] 1920px (Large desktop)

**Check Points:**
- [ ] Text readable at all sizes
- [ ] Buttons/inputs large enough to tap (44px minimum)
- [ ] Images scale properly
- [ ] Sidebar hamburger menu works on mobile
- [ ] Forms stack vertically on mobile
- [ ] Lists single-column on mobile, multi-column on desktop

### 10. Test Performance

#### Load Time Benchmarks
- [ ] Messaging page loads in < 2 seconds
- [ ] Forums page loads in < 2 seconds
- [ ] Study groups page loads in < 2 seconds
- [ ] Tutoring page loads in < 2 seconds
- [ ] Send message completes in < 1 second
- [ ] Create post completes in < 2 seconds

#### Network Performance
1. Open DevTools → Network tab
2. Load each page
3. Check Total Load Time
4. Check Largest Content Ful Paint (LCP)
5. Check Cumulative Layout Shift (CLS)

**Acceptable Metrics:**
- Total Page Load: < 3 seconds
- LCP: < 2.5 seconds
- CLS: < 0.1
- API Response: < 500ms

### 11. Test Browser Compatibility

#### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### 12. Test Dark Mode

1. ✅ Toggle dark mode button in navbar
2. ✅ All Phase 2 pages should adapt to dark mode
3. ✅ Text should be readable in both modes
4. ✅ Colors should have sufficient contrast
5. ✅ Dark mode setting persists after page refresh

### 13. Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Can navigate sidebar with keyboard
- [ ] Can focus and interact with buttons
- [ ] Can submit forms with keyboard

#### Screen Reader Testing (NVDA/JAWS)
- [ ] All page titles announced
- [ ] Button purposes are clear
- [ ] Form labels associated with inputs
- [ ] Link destinations announced
- [ ] Error messages announced

#### Color Contrast
- [ ] Text contrast >= 4.5:1 for normal text
- [ ] Text contrast >= 3:1 for large text
- [ ] Active states are distinct (not color-only)

## Bug Report Template

If you find issues, use this template:

```
**Title**: [Feature] [Brief Issue Description]

**Severity**: Critical | High | Medium | Low

**Steps to Reproduce**:
1. Navigate to [URL/page]
2. Click on [element]
3. [Expected behavior] but [actual behavior]

**Expected Result**: 
[What should happen]

**Actual Result**: 
[What actually happened]

**Browser/Device**: 
[Chrome on Windows 10 / iPhone 12 on iOS 15 / etc]

**Screenshots**: 
[Attach screenshot if possible]

**Console Errors**: 
[Any JavaScript errors in DevTools console]

**Additional Context**: 
[Any other relevant information]
```

## Test Results Summary

| Feature | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Messaging | [ ] | [ ] | [ ] Pass [ ] Fail |
| Forums | [ ] | [ ] | [ ] Pass [ ] Fail |
| Study Groups | [ ] | [ ] | [ ] Pass [ ] Fail |
| Tutoring | [ ] | [ ] | [ ] Pass [ ] Fail |
| Navigation | [ ] | [ ] | [ ] Pass [ ] Fail |
| Unread Badge | [ ] | [ ] | [ ] Pass [ ] Fail |
| Dark Mode | [ ] | [ ] | [ ] Pass [ ] Fail |
| Performance | [ ] | [ ] | [ ] Pass [ ] Fail |

## Sign-Off

**Tester Name**: _______________
**Test Date**: _______________
**Overall Status**: [ ] PASS [ ] FAIL [ ] PASS with Issues
**Issues Found**: 0 | 1-3 | 4-10 | 10+

**Comments**: 
___________________________________________________
___________________________________________________

---

**For Questions**: Refer to PHASE2_INTEGRATION_COMPLETE.md for architecture details
