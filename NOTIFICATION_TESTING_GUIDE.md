# Notification System - Testing Guide

## 🧪 How to Test Notifications

### Test 1: Study Group Post Notification

**Steps:**
1. Login as User A
2. Create a study group "Test Group"
3. Login as User B (different browser/incognito)
4. Join "Test Group"
5. Login as User C (another browser/incognito)
6. Join "Test Group"
7. As User A, post "Hello everyone!" in the group
8. Check User B's notification bell → Should show "New post in Test Group"
9. Check User C's notification bell → Should show "New post in Test Group"
10. Check User A's notification bell → Should NOT have notification (author doesn't get notified)

**Expected Result:**
- User B sees: "📝 New post in Test Group - User A: Hello everyone..."
- User C sees: "📝 New post in Test Group - User A: Hello everyone..."
- Clicking notification navigates to the group

### Test 2: Group Join Notification

**Steps:**
1. Login as User A
2. Create a study group "Physics Group"
3. Login as User B
4. Join "Physics Group"
5. Check User A's notification bell

**Expected Result:**
- User A sees: "👥 New member joined your group - User B joined 'Physics Group'"
- Clicking notification navigates to the group
- User B does NOT receive a notification

### Test 3: Direct Message Notification

**Steps:**
1. Login as User A
2. Go to Messages
3. Start conversation with User B
4. Send message "Hey, how are you?"
5. Login as User B
6. Check notification bell

**Expected Result:**
- User B sees: "💬 New message from User A - Hey, how are you?"
- Clicking notification navigates to the conversation
- Unread count badge shows "1"

### Test 4: Badge Earned Notification

**Steps:**
1. Trigger badge award (e.g., complete 7-day study streak)
2. Check notification bell

**Expected Result:**
- User sees: "🏆 Badge Earned! - You earned the 'Study Streak' badge!"
- Clicking notification navigates to achievements page

### Test 5: Notification Bell Features

**Steps:**
1. Accumulate 5+ notifications
2. Click notification bell
3. Verify dropdown shows recent 10 notifications
4. Click "Mark all as read"
5. Verify unread count badge disappears
6. Click "View all notifications"
7. Verify navigates to full notification center

**Expected Result:**
- Dropdown shows max 10 notifications
- Unread notifications have blue dot
- Mark all as read works
- View all navigates to /notifications

### Test 6: Auto-refresh

**Steps:**
1. Open app in Browser A as User A
2. Open app in Browser B as User B
3. As User B, post in a shared group
4. Wait 30 seconds
5. Check User A's notification bell (don't click anything)

**Expected Result:**
- After 30 seconds, User A's notification bell updates automatically
- Unread count increases
- No page refresh needed

### Test 7: Notification Center Page

**Steps:**
1. Accumulate 10+ notifications
2. Click notification bell
3. Click "View all notifications"
4. Verify full list shows up to 50 notifications
5. Click a notification
6. Verify it marks as read and navigates

**Expected Result:**
- Full page shows all notifications
- Unread notifications have blue left border
- Clicking marks as read and navigates
- Empty state shows when no notifications

## 🐛 Common Issues & Solutions

### Issue: Notifications not appearing
**Solution:** 
- Check browser console for errors
- Verify backend is running
- Check database connection
- Verify user is authenticated

### Issue: Unread count not updating
**Solution:**
- Wait 30 seconds for auto-refresh
- Manually refresh page
- Check if notifications are being created in database

### Issue: Clicking notification doesn't navigate
**Solution:**
- Check if action_url is set correctly
- Verify route exists in frontend
- Check browser console for navigation errors

### Issue: Getting notifications for own actions
**Solution:**
- Verify author/sender is excluded in notification logic
- Check notificationHelper.notifyGroupPost excludes author

## ✅ Checklist

- [ ] Study group post notifications work
- [ ] Group join notifications work
- [ ] Direct message notifications work
- [ ] Badge earned notifications work
- [ ] Notification bell shows unread count
- [ ] Dropdown shows recent notifications
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Auto-refresh works (30s)
- [ ] Clicking notification navigates correctly
- [ ] Notification center page works
- [ ] Empty state displays correctly
- [ ] Time ago displays correctly
- [ ] Icons display correctly for each type

## 📊 Database Verification

Check notifications in database:
```sql
-- View all notifications for a user
SELECT * FROM notifications 
WHERE user_id = 'USER_ID_HERE' 
ORDER BY created_at DESC;

-- Count unread notifications
SELECT COUNT(*) FROM notifications 
WHERE user_id = 'USER_ID_HERE' AND is_read = FALSE;

-- View recent group post notifications
SELECT * FROM notifications 
WHERE type = 'group_post' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🎯 Success Criteria

✅ All notification types create successfully
✅ Users receive notifications for relevant actions
✅ Users DON'T receive notifications for their own actions
✅ Notification bell updates in real-time
✅ Clicking notifications marks as read
✅ Navigation works correctly
✅ No duplicate notifications
✅ Performance is acceptable (< 1s response time)
