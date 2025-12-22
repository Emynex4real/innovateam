# Notification System - Troubleshooting Steps

## Quick Test (Do This First!)

### 1. Open Browser Console (F12)
### 2. Run this command:

```javascript
// Get your auth token
const token = JSON.parse(localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token')).access_token;
console.log('Token:', token ? 'Found ✅' : 'Missing ❌');

// Test notification endpoint
fetch('http://localhost:5000/api/phase2/test-notification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Test Result:', data);
  if (data.success) {
    console.log('✅ Notification created! Refresh page to see it.');
  } else {
    console.error('❌ Error:', data.error);
  }
})
.catch(err => console.error('❌ Request failed:', err));
```

### 3. Check Backend Terminal

You should see:
```
🧪 Creating test notification for user: [YOUR_USER_ID]
🔔 NotificationHelper.create called: ...
✅ Notification created successfully
```

### 4. Refresh Page

- Look at notification bell (top right)
- Should show a number badge
- Click it to see the test notification

---

## If Test Fails, Check These:

### A. Backend Not Running
```bash
# Start backend
cd server
npm start
```

### B. Database Connection Issue
Check `server/.env`:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

### C. Notifications Table Missing

Run this SQL in Supabase:
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC);
```

### D. Authentication Issue

Test if you're logged in:
```javascript
const session = localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token');
console.log('Logged in:', session ? 'Yes ✅' : 'No ❌');
```

---

## Testing Real Notifications

### Test 1: Study Group Post

**Steps:**
1. Open app in 2 browsers (or incognito)
2. Browser A: Login as User A, create group
3. Browser B: Login as User B, join group
4. Browser A: Post "Hello!" in group
5. Browser B: Check notification bell

**Expected:** User B sees "📝 New post in [Group Name]"

### Test 2: Group Join

**Steps:**
1. Browser A: Login as User A, create group
2. Browser B: Login as User B, join group
3. Browser A: Check notification bell

**Expected:** User A sees "👥 New member joined your group"

---

## Debugging API Calls

### Check Network Tab (F12 → Network)

1. Filter by "notifications"
2. Look for these requests:
   - `GET /api/phase2/notifications/count`
   - `GET /api/phase2/notifications`

3. Click on request → Preview tab
4. Should see:
```json
{
  "success": true,
  "data": [...]
}
```

### Common API Errors:

**401 Unauthorized:**
- Token expired → Logout and login again
- Token missing → Check localStorage

**404 Not Found:**
- Wrong API URL → Check `src/config/api.js`
- Backend not running → Start server

**500 Server Error:**
- Check backend logs
- Database connection issue
- Table doesn't exist

---

## Check Database Directly

### In Supabase Dashboard:

1. Go to Table Editor
2. Select `notifications` table
3. Should see your test notification
4. Check `user_id` matches your user ID

### SQL Query:
```sql
-- Get your user ID
SELECT id, email FROM auth.users LIMIT 5;

-- Check notifications for your user
SELECT * FROM notifications 
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC;
```

---

## Still Not Working?

### 1. Check Console Errors

Browser Console (F12):
- Look for red errors
- Check if API calls are failing

Backend Terminal:
- Look for error messages
- Check if routes are registered

### 2. Verify File Changes

Make sure these files were updated:
- ✅ `server/services/notificationHelper.js` (created)
- ✅ `server/services/studyGroupsService.js` (modified)
- ✅ `server/services/messagingService.js` (modified)
- ✅ `server/routes/phase2Routes.js` (test route added)
- ✅ `src/components/NotificationBell.jsx` (created)
- ✅ `src/components/UserLayout.jsx` (modified)

### 3. Restart Everything

```bash
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Start backend
cd server
npm start

# Start frontend (new terminal)
cd client
npm start
```

### 4. Clear Browser Cache

- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear cache in browser settings

---

## Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database connected
- [ ] notifications table exists
- [ ] User logged in
- [ ] Test notification created successfully
- [ ] Notification appears in database
- [ ] Notification bell shows count
- [ ] Clicking bell shows dropdown
- [ ] Real notifications work (group post/join)

---

## Get Help

If still not working, provide:
1. Browser console errors (screenshot)
2. Backend terminal logs (copy/paste)
3. Network tab showing failed requests
4. Database query results
