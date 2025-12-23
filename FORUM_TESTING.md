# 🧪 FORUM TESTING CHECKLIST

## Pre-Testing Setup

### 1. Verify Database
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'forum_%' 
ORDER BY table_name;

-- Check categories exist
SELECT center_id, name, slug FROM forum_categories ORDER BY center_id, display_order;

-- Should show 16 categories (8 per center)
```

### 2. Start Servers
```bash
# Terminal 1: Backend
cd server
npm start
# Should see: 🔒 InnovaTeam SECURE Server Started

# Terminal 2: Frontend
cd client
npm start
# Should open http://localhost:3000
```

---

## 🧪 TEST SCENARIOS

### **Test 1: View Categories** ✅
**Steps:**
1. Login as student
2. Navigate to Forums page
3. Verify 8 categories display
4. Check icons and colors show correctly
5. Verify thread/post counts show (should be 0)

**Expected Result:**
- Categories grid displays
- All 8 categories visible
- Icons render correctly
- No errors in console

**Status:** [ ] Pass [ ] Fail

---

### **Test 2: Create Thread** ✅
**Steps:**
1. Click any category (e.g., "Mathematics")
2. Click "New Thread" button
3. Try submitting empty form
4. Enter title: "Test" (too short)
5. Enter title: "How to solve quadratic equations?"
6. Enter description: "Short" (too short)
7. Enter description: "I'm struggling with quadratic equations. Can someone explain the formula and when to use it?"
8. Click "Create Thread"

**Expected Result:**
- Validation errors show for short inputs
- Thread creates successfully with valid input
- Redirects to threads list
- New thread appears in list

**Status:** [ ] Pass [ ] Fail

---

### **Test 3: View Thread Detail** ✅
**Steps:**
1. Click the thread you just created
2. Verify thread title and description display
3. Check creator name shows
4. Verify "Follow" button appears
5. Check reply form is visible

**Expected Result:**
- Thread detail loads
- All content displays correctly
- No errors in console
- Follow button functional

**Status:** [ ] Pass [ ] Fail

---

### **Test 4: Reply to Thread** ✅
**Steps:**
1. In thread detail, scroll to reply form
2. Try submitting empty reply
3. Enter reply: "Hi" (too short)
4. Enter reply: "The quadratic formula is: x = (-b ± √(b²-4ac)) / 2a. Use it when you can't factor easily."
5. Click "Post Reply"

**Expected Result:**
- Validation errors show for short input
- Reply posts successfully
- Reply appears in thread
- Reply count updates

**Status:** [ ] Pass [ ] Fail

---

### **Test 5: Vote on Post** ✅
**Steps:**
1. Find the reply you just posted
2. Click upvote button
3. Verify count increases
4. Click upvote again (toggle off)
5. Verify count decreases
6. Click downvote
7. Verify downvote count increases

**Expected Result:**
- Vote counts update immediately
- Toggle works correctly
- Can switch between upvote/downvote
- No errors

**Status:** [ ] Pass [ ] Fail

---

### **Test 6: Mark Best Answer** ✅
**Steps:**
1. As thread creator, view your thread
2. Find a helpful reply
3. Click "Mark as Answer" button
4. Verify ✓ badge appears
5. Verify thread shows "Solved" badge
6. Verify answer moves to top

**Expected Result:**
- Only thread creator sees "Mark as Answer"
- Answer marked successfully
- Thread marked as solved
- Answer appears first

**Status:** [ ] Pass [ ] Fail

---

### **Test 7: Follow Thread** ✅
**Steps:**
1. In thread detail, click "Follow" button
2. Verify button changes to "Following"
3. Click "Following" to unfollow
4. Verify button changes back to "Follow"

**Expected Result:**
- Follow status toggles correctly
- Button text updates
- No errors

**Status:** [ ] Pass [ ] Fail

---

### **Test 8: Search Threads** ✅
**Steps:**
1. Go back to categories view
2. Enter "quadratic" in search box
3. Press Enter or click search
4. Verify your thread appears in results
5. Search for "xyz123" (no results)
6. Verify empty state shows

**Expected Result:**
- Search returns relevant results
- Empty search shows appropriate message
- Can click result to view thread

**Status:** [ ] Pass [ ] Fail

---

### **Test 9: Reputation System** ✅
**Steps:**
1. Check database for reputation:
```sql
SELECT u.name, r.reputation_points, r.total_posts_count, r.best_answers_count
FROM forum_user_reputation r
JOIN user_profiles u ON r.user_id = u.id
ORDER BY r.reputation_points DESC;
```

**Expected Result:**
- Thread creator has +10 points (thread created)
- Reply author has +5 points (post created)
- Best answer author has +55 points (post + best answer)

**Status:** [ ] Pass [ ] Fail

---

### **Test 10: Multiple Users** ✅
**Steps:**
1. Logout
2. Login as different user
3. Navigate to same thread
4. Verify can reply
5. Verify cannot mark answer (not thread creator)
6. Verify can vote on posts

**Expected Result:**
- Different users can interact
- Authorization works correctly
- No "Mark as Answer" for non-creators

**Status:** [ ] Pass [ ] Fail

---

### **Test 11: Mobile Responsive** ✅
**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Test on iPhone SE (375px)
4. Test on iPad (768px)
5. Navigate through all views

**Expected Result:**
- Layout adapts to screen size
- All buttons accessible
- Text readable
- No horizontal scroll

**Status:** [ ] Pass [ ] Fail

---

### **Test 12: Error Handling** ✅
**Steps:**
1. Stop backend server
2. Try to load categories
3. Verify error message shows
4. Restart backend
5. Refresh page
6. Verify loads correctly

**Expected Result:**
- User-friendly error messages
- No app crash
- Recovers when backend returns

**Status:** [ ] Pass [ ] Fail

---

## 🐛 COMMON ISSUES & FIXES

### Issue: "Center ID not provided"
**Fix:** Ensure Forums component receives `centerId` prop
```javascript
<Forums centerId={userCenterId} userId={userId} />
```

### Issue: Categories not loading
**Fix:** Check API endpoint and authentication
```javascript
// In browser console:
console.log('Token:', localStorage.getItem('authToken'));
console.log('Center ID:', centerId);
```

### Issue: "Failed to fetch"
**Fix:** Verify backend is running on port 5000
```bash
curl http://localhost:5000/health
```

### Issue: Votes not updating
**Fix:** Check database triggers
```sql
SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trigger_update%';
```

---

## 📊 PERFORMANCE CHECKS

### Load Time Test
```javascript
// In browser console:
performance.mark('start');
// Navigate to forums
performance.mark('end');
performance.measure('forum-load', 'start', 'end');
console.log(performance.getEntriesByName('forum-load')[0].duration);
// Should be < 2000ms
```

### Database Query Performance
```sql
EXPLAIN ANALYZE 
SELECT * FROM forum_category_stats 
WHERE center_id = '0bdb1d02-5e95-4f92-a5d2-bd10f38db148';
-- Should use index scan, not seq scan
```

---

## ✅ FINAL CHECKLIST

Before marking complete:
- [ ] All 12 tests pass
- [ ] No console errors
- [ ] No database errors
- [ ] Mobile responsive works
- [ ] Performance acceptable (< 2s load)
- [ ] Error handling works
- [ ] Multiple users tested
- [ ] Reputation system working
- [ ] All features functional

---

## 🎉 SUCCESS CRITERIA

Forum is ready for production when:
- ✅ All tests pass
- ✅ No critical bugs
- ✅ Performance meets targets
- ✅ User experience smooth
- ✅ Documentation complete

---

**Tester Name:** _________________
**Date:** _________________
**Overall Status:** [ ] PASS [ ] FAIL
**Notes:** _________________________________
