# Notification Debugging Guide

## Step 1: Test Notification Creation

### Using Browser Console:
```javascript
// Open browser console (F12) and run:
const token = JSON.parse(localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token')).access_token;

fetch('http://localhost:5000/api/phase2/test-notification', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
```

### Expected Response:
```json
{
  "success": true,
  "message": "Test notification created"
}
```

## Step 2: Check Backend Logs

Look for these console logs in your backend terminal:
```
🧪 Creating test notification for user: [USER_ID]
🔔 NotificationHelper.create called: { userId: '...', type: 'system', title: 'Test Notification' }
✅ Notification created successfully for user [USER_ID]
✅ Test notification created successfully
```

## Step 3: Verify in Database

```sql
SELECT * FROM notifications 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 5;
```

## Step 4: Check Frontend

1. Refresh the page
2. Look at the notification bell
3. Should show unread count
4. Click bell to see dropdown

## Common Issues:

### Issue 1: "notifications table does not exist"
**Solution**: Run the SQL schema to create the table

### Issue 2: No notifications showing in UI
**Check**:
- Browser console for API errors
- Network tab for failed requests
- Backend logs for errors

### Issue 3: 401 Unauthorized
**Check**:
- Token is valid in localStorage
- User is logged in
- Backend authenticate middleware is working

## Step 5: Test Real Notifications

### Test Study Group Post:
1. Create a group
2. Have another user join
3. Post a message
4. Check if other user gets notification

### Test Group Join:
1. Create a group as User A
2. Join as User B
3. Check if User A gets notification

## Debug Checklist:

- [ ] Backend server is running
- [ ] Database connection works
- [ ] notifications table exists
- [ ] User is authenticated
- [ ] Test endpoint returns success
- [ ] Notification appears in database
- [ ] Frontend API calls succeed
- [ ] Notification bell shows count
- [ ] Dropdown shows notifications
