# Critical Files to Check - Quick Reference

## 🔴 CHECK THESE 6 FILES

### 1️⃣ server/controllers/aiExaminer.controller.js
**Lines to check: 12, 64, 96, 238, 256**

```javascript
// ✅ CORRECT (should be this):
const userId = req.user?.id;

// ❌ WRONG (if you see this, fix it):
const userId = req.user?.sub || req.user?.id;
```

---

### 2️⃣ server/routes/aiExaminer.routes.js
**Check if this route exists:**

```javascript
router.post('/submit-text', (req, res) => aiExaminerController.submitText(req, res));
```

---

### 3️⃣ server/server.js
**Check around line 290:**

```javascript
app.use('/api/ai-examiner', require('./routes/aiExaminer.routes'));
```

---

### 4️⃣ src/services/aiExaminer.service.js
**Check submitText function:**

```javascript
submitText: async (text, title) => {
  try {
    const response = await api.post('/api/ai-examiner/submit-text', { text, title });
    return response;  // ✅ Should return response, not response.data
  } catch (error) {
    // error handling
  }
}
```

---

### 5️⃣ src/services/api.service.js
**Check request method - should NOT have AbortController:**

```javascript
async request(endpoint, options = {}) {
  // ... headers setup ...
  
  try {
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body
      // ❌ Should NOT have: signal: controller.signal
    });

    if (!response.ok) {
      // error handling
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

---

### 6️⃣ server/middleware/authenticate.js
**Check what req.user is set to:**

```javascript
req.user = {
  id: data.user.id,        // ✅ This is what we use
  email: data.user.email,
  role: data.user.user_metadata?.role || 'user',
  isAdmin: data.user.user_metadata?.role === 'admin',
  metadata: data.user.user_metadata
};
// ❌ Should NOT have: sub: data.user.sub
```

---

## 🗄️ DATABASE CHECK

Run in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('ai_documents', 'ai_exams');

-- Should return 2 rows:
-- ai_documents
-- ai_exams
```

If no rows returned → **Run the SQL migration!**

---

## 🧪 QUICK TEST

### Test 1: Backend Health
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"ok",...}`

### Test 2: Backend Endpoint (replace YOUR_TOKEN)
```bash
curl -X POST http://localhost:5000/api/ai-examiner/submit-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text":"Test document","title":"Test"}'
```

**Expected:**
```json
{"success":true,"data":{"documentId":"...","filename":"Test"},"message":"Text submitted successfully"}
```

**If 401:** Token invalid or not authenticated
**If 404:** Route not found
**If 500:** Check backend terminal for error

---

## 🔍 WHAT TO LOOK FOR IN BACKEND TERMINAL

When you paste text and click "Analyze Text", you should see:

```
🌐 [abc123] POST /api/ai-examiner/submit-text from ::1
✅ [abc123] POST /api/ai-examiner/submit-text - 200 (123ms)
```

**If you see nothing:** Request not reaching backend
**If you see error:** Read the error message

---

## 🌐 WHAT TO LOOK FOR IN BROWSER

### Console (F12 → Console)
**Should see:**
```
Uploading file: ... OR Analyzing text...
```

**Should NOT see:**
```
❌ API request failed: ...
❌ AbortError: signal is aborted
❌ 401 Unauthorized
```

### Network Tab (F12 → Network)
**Look for:** `submit-text` request
**Status should be:** `200 OK`
**Response should have:** `{"success":true,...}`

---

## ⚡ MOST LIKELY ISSUES

### Issue 1: Tables Don't Exist (90% of cases)
**Symptom:** Loading forever, no error
**Fix:** Run SQL migration in Supabase

### Issue 2: User ID Bug (if I didn't fix it)
**Symptom:** 401 or undefined userId
**Fix:** Change `req.user?.sub || req.user?.id` to `req.user?.id`

### Issue 3: Backend Not Running
**Symptom:** Network error, connection refused
**Fix:** Start backend: `cd server && npm start`

### Issue 4: Not Authenticated
**Symptom:** 401 Unauthorized
**Fix:** Log in again

### Issue 5: Wrong API URL
**Symptom:** 404 Not Found
**Fix:** Check `REACT_APP_API_URL` in `.env`

---

## 📋 CHECKLIST

Before asking for more help, verify:

- [ ] Backend is running (`curl http://localhost:5000/health` works)
- [ ] Tables exist (SQL query returns 2 rows)
- [ ] User ID bug is fixed (all 5 locations use `req.user?.id`)
- [ ] Route exists in `aiExaminer.routes.js`
- [ ] Route is registered in `server.js`
- [ ] You are logged in (check localStorage for token)
- [ ] No AbortController in `api.service.js`
- [ ] Backend terminal shows the POST request when you click button

---

## 🎯 FASTEST DEBUG METHOD

1. **Open 3 windows:**
   - Backend terminal
   - Browser with F12 → Network tab
   - Browser with F12 → Console tab

2. **Paste text and click "Analyze Text"**

3. **Watch all 3 windows:**
   - Backend: Should show POST request
   - Network: Should show request with 200 status
   - Console: Should show "Analyzing text..."

4. **If any of these don't happen, that's where the problem is!**

---

## 📞 SHARE THIS IF STUCK

1. Screenshot of backend terminal (when you click button)
2. Screenshot of Network tab (the submit-text request)
3. Screenshot of Console tab (any errors)
4. Result of: `SELECT COUNT(*) FROM ai_documents;` in Supabase
