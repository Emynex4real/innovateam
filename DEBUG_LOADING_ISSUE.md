# Debug: Loading Forever Issue

## 🔍 WHAT TO CHECK

### 1. Check Backend Terminal
Look for these messages when you paste text:

**GOOD:**
```
🌐 [abc123] POST /api/ai-examiner/submit-text from ::1
✅ [abc123] POST /api/ai-examiner/submit-text - 200 (123ms)
```

**BAD (means backend not receiving request):**
```
(nothing appears)
```

**BAD (means error):**
```
❌ [abc123] Error 500: ...
```

---

### 2. Check Browser Network Tab
1. Press F12 → Network tab
2. Paste text and click "Analyze Text"
3. Look for request to `/api/ai-examiner/submit-text`

**What to check:**
- Status: Should be `200 OK` (not 401, 404, 500)
- Response time: Should complete in < 5 seconds
- Response body: Should have `{"success": true, "data": {...}}`

**If Status is 401:** Authentication problem
**If Status is 404:** Backend route not found
**If Status is 500:** Backend error (check terminal)
**If Pending forever:** Backend not responding

---

### 3. Verify Backend is Running
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/health
```

Should return: `{"status":"ok",...}`

---

### 4. Check Database Tables Exist
Run in Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM ai_documents;
SELECT COUNT(*) FROM ai_exams;
```

**If error "relation does not exist":** Tables not created yet

---

## 📁 KEY FILES TO CHECK

### File 1: Backend Controller
**Path:** `server/controllers/aiExaminer.controller.js`

**Line 64-66 should be:**
```javascript
const userId = req.user?.id;  // NOT req.user?.sub
```

**Check line 12, 64, 96, 238, 256** - all should use `req.user?.id`

---

### File 2: Backend Routes
**Path:** `server/routes/aiExaminer.routes.js`

**Should have:**
```javascript
router.post('/submit-text', (req, res) => aiExaminerController.submitText(req, res));
```

---

### File 3: Backend Server
**Path:** `server/server.js`

**Should have (around line 290):**
```javascript
app.use('/api/ai-examiner', require('./routes/aiExaminer.routes'));
```

---

### File 4: Frontend Service
**Path:** `src/services/aiExaminer.service.js`

**Line 28-30 should be:**
```javascript
submitText: async (text, title) => {
  const response = await api.post('/api/ai-examiner/submit-text', { text, title });
  return response;
```

---

### File 5: Frontend API Service
**Path:** `src/services/api.service.js`

**Should NOT have AbortController timeout** (I just fixed this)

---

### File 6: Authentication Middleware
**Path:** `server/middleware/authenticate.js`

**Line 38-44 should set:**
```javascript
req.user = {
  id: data.user.id,  // This is what we use
  email: data.user.email,
  role: data.user.user_metadata?.role || 'user',
  ...
};
```

---

## 🧪 MANUAL TEST

### Test Backend Directly (Skip Frontend)

1. **Get your auth token:**
   - Open browser DevTools → Application → Local Storage
   - Find `sb-jdedscbvbkjvqmmdabig-auth-token`
   - Copy the `access_token` value

2. **Test with curl:**
```bash
curl -X POST http://localhost:5000/api/ai-examiner/submit-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"text":"This is a test document about photosynthesis. Plants use sunlight to make food.","title":"Test"}'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "documentId": "some-uuid",
    "filename": "Test"
  },
  "message": "Text submitted successfully"
}
```

**If you get this response:** Backend works! Problem is in frontend.
**If you get error:** Backend has issues.

---

## 🔴 COMMON ISSUES & FIXES

### Issue 1: Backend Not Receiving Request
**Symptom:** Nothing in backend terminal when you click button
**Cause:** Frontend not sending request OR wrong URL
**Fix:** Check `REACT_APP_API_URL` in frontend `.env`

### Issue 2: 401 Unauthorized
**Symptom:** Request fails with 401
**Cause:** Token not being sent or invalid
**Fix:** 
1. Check if logged in
2. Check token in localStorage
3. Verify token is being added to headers

### Issue 3: 500 Server Error
**Symptom:** Backend returns 500
**Cause:** Database error or code error
**Fix:** Check backend terminal for full error

### Issue 4: Tables Don't Exist
**Symptom:** Error about "relation ai_documents does not exist"
**Cause:** SQL migration not run
**Fix:** Run the SQL in Supabase Dashboard

### Issue 5: RLS Policy Blocking Insert
**Symptom:** Insert fails silently
**Cause:** `auth.uid()` doesn't match `user_id`
**Fix:** Check if user is properly authenticated

---

## 🎯 STEP-BY-STEP DEBUG

### Step 1: Verify Backend is Running
```bash
curl http://localhost:5000/health
```
✅ Works → Go to Step 2
❌ Fails → Start backend: `cd server && npm start`

### Step 2: Verify Tables Exist
```sql
SELECT * FROM ai_documents LIMIT 1;
```
✅ Works → Go to Step 3
❌ Fails → Run SQL migration

### Step 3: Test Backend Endpoint
Use curl command above with your token
✅ Works → Problem is in frontend
❌ Fails → Check backend logs

### Step 4: Check Frontend Request
F12 → Network → Look for `/api/ai-examiner/submit-text`
✅ Sent → Check response
❌ Not sent → Check frontend code

### Step 5: Check Authentication
```javascript
// In browser console:
localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token')
```
✅ Has token → Go to Step 6
❌ No token → Log in again

### Step 6: Check Response
Look at response in Network tab
✅ 200 OK → Should work!
❌ Error → Check error message

---

## 📊 WHAT BACKEND LOGS SHOULD SHOW

When you paste text, you should see:

```
🌐 [abc123] POST /api/ai-examiner/submit-text from ::1
   📝 Headers: {...}
✅ [abc123] POST /api/ai-examiner/submit-text - 200 (234ms)
```

**If you see:**
- Nothing → Request not reaching backend
- 401 error → Authentication failed
- 500 error → Backend code error
- Database error → Tables don't exist or RLS blocking

---

## 🚨 EMERGENCY FIX

If nothing works, try this:

1. **Stop everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)

2. **Clear everything:**
   ```bash
   # Backend
   cd server
   rm -rf node_modules package-lock.json
   npm install
   
   # Frontend
   cd ../
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify SQL tables:**
   - Go to Supabase Dashboard
   - Run the SQL migration again

4. **Restart:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   npm start
   ```

5. **Test again**

---

## 📞 WHAT TO SHARE IF STILL STUCK

1. **Backend terminal output** (last 50 lines)
2. **Browser console errors** (F12 → Console)
3. **Network tab screenshot** (F12 → Network → the failed request)
4. **Result of this SQL:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('ai_documents', 'ai_exams');
   ```
5. **Result of:**
   ```bash
   curl http://localhost:5000/health
   ```

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:

1. ✅ Backend logs show the POST request
2. ✅ Network tab shows 200 OK response
3. ✅ Frontend shows "Analyzing text..." then proceeds to config
4. ✅ No errors in console
5. ✅ Can see data in Supabase:
   ```sql
   SELECT * FROM ai_documents ORDER BY created_at DESC LIMIT 1;
   ```
