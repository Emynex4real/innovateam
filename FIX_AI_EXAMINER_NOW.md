# 🔧 Fix AI Examiner - Step by Step

## The Problem
Your AI Examiner is stuck at step 0 (upload/paste) and not progressing to step 1 (configure exam). The console shows the request is being sent but no response is received.

## Root Cause
The RLS (Row Level Security) policies on `ai_documents` table are blocking the backend from inserting data because the service role isn't explicitly allowed.

## ✅ SOLUTION (Choose ONE method)

---

### Method 1: Fix RLS Policies (RECOMMENDED)

**Step 1:** Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your project
- Click "SQL Editor" in the left sidebar

**Step 2:** Run this SQL:
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can create own documents" ON public.ai_documents;

-- Create new policy that allows service role
CREATE POLICY "Users can create own documents" ON public.ai_documents 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );
```

**Step 3:** Verify it worked:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'ai_documents';
```

**Step 4:** Restart your backend and try again!

---

### Method 2: Temporarily Disable RLS (QUICK TEST ONLY)

⚠️ **WARNING:** Only use this for testing! Re-enable RLS after confirming it works.

```sql
-- Disable RLS temporarily
ALTER TABLE public.ai_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exams DISABLE ROW LEVEL SECURITY;
```

Test your app. If it works, the issue is confirmed to be RLS.

Then re-enable and use Method 1:
```sql
-- Re-enable RLS
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exams ENABLE ROW LEVEL SECURITY;
```

---

### Method 3: Check User Authentication

**In Browser Console (F12):**
```javascript
// Check if you're logged in
const user = JSON.parse(localStorage.getItem('confirmedUser'));
console.log('User:', user);

// Check auth token
const token = localStorage.getItem('auth_token');
console.log('Token:', token ? 'Present' : 'Missing');

// If token is missing, try getting it from Supabase session
const supabaseSession = localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token');
if (supabaseSession) {
  const session = JSON.parse(supabaseSession);
  console.log('Supabase Token:', session.access_token);
}
```

If token is missing, **log out and log back in**.

---

## 🧪 Testing After Fix

**Step 1:** Clear browser cache
```javascript
// In browser console
localStorage.clear();
location.reload();
```

**Step 2:** Log in again

**Step 3:** Go to AI Examiner

**Step 4:** Paste this test text:
```
Photosynthesis is the process by which plants convert light energy into chemical energy. 
This process occurs in the chloroplasts of plant cells and requires sunlight, water, and 
carbon dioxide. The products of photosynthesis are glucose and oxygen.
```

**Step 5:** Click "Analyze Text"

**Step 6:** Check console (F12) - You should see:
```
📝 Submitting text: Study Notes
📝 Text length: 250
✅ Text submit response: {success: true, data: {...}}
✅ Response success: true
✅ Response data: {documentId: "...", filename: "..."}
```

**Step 7:** You should see:
- ✅ Toast notification: "Text ready!"
- ✅ Page transitions to Configure Exam screen
- ✅ You see difficulty options and question types

---

## 🔍 Still Not Working? Debug Steps

### Check Backend Logs

In your server terminal, you should see:
```
📝 submitText called
👤 User ID: [your-user-id]
📄 Title: Study Notes
📏 Text length: 250
🆔 Generated document ID: [uuid]
💾 Inserting into database...
✅ Document inserted: [...]
```

If you see `❌ Database error:`, that's the RLS issue. Use Method 1 above.

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try submitting text again
4. Click on the `submit-text` request
5. Check:
   - **Status:** Should be 200
   - **Response:** Should show `{"success": true, "data": {...}}`
   - **Headers:** Should have `Authorization: Bearer ...`

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Not logged in | Log out and log back in |
| `new row violates row-level security policy` | RLS blocking insert | Use Method 1 above |
| `Failed to fetch` | Backend not running | Run `npm start` in server folder |
| `CORS error` | Wrong origin | Check server/server.js allowedOrigins |
| `Text too short` | Less than 5 chars | Paste more text |

---

## 🎯 Quick Verification Script

Save this as `verify-fix.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head><title>AI Examiner Fix Verification</title></head>
<body>
  <h1>AI Examiner Fix Verification</h1>
  <button onclick="verify()">🧪 Test Now</button>
  <pre id="output"></pre>
  
  <script>
    async function verify() {
      const output = document.getElementById('output');
      output.textContent = 'Testing...\n\n';
      
      // Check 1: Auth Token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        output.textContent += '❌ No auth token found\n';
        output.textContent += '   Solution: Log in to the app first\n\n';
        return;
      }
      output.textContent += '✅ Auth token found\n\n';
      
      // Check 2: Backend Health
      try {
        const health = await fetch('http://localhost:5000/health');
        if (health.ok) {
          output.textContent += '✅ Backend is running\n\n';
        }
      } catch (e) {
        output.textContent += '❌ Backend not responding\n';
        output.textContent += '   Solution: Run "npm start" in server folder\n\n';
        return;
      }
      
      // Check 3: Submit Text
      try {
        const response = await fetch('http://localhost:5000/api/ai-examiner/submit-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: 'Test document about biology and science.',
            title: 'Test'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          output.textContent += '✅ AI Examiner is working!\n';
          output.textContent += `   Document ID: ${data.data.documentId}\n\n`;
          output.textContent += '🎉 You can now use the AI Examiner!\n';
        } else {
          output.textContent += '❌ Request failed\n';
          output.textContent += `   Error: ${data.message}\n\n`;
          
          if (data.message.includes('row-level security')) {
            output.textContent += '   Solution: Run the RLS fix SQL (Method 1)\n';
          }
        }
      } catch (e) {
        output.textContent += '❌ Request error\n';
        output.textContent += `   ${e.message}\n`;
      }
    }
  </script>
</body>
</html>
```

---

## 📞 Need More Help?

If none of these work, provide:
1. Screenshot of browser console
2. Screenshot of Network tab (showing the request/response)
3. Backend terminal logs (the part with 📝 submitText)
4. Output from the verification script above

---

## ✅ Success Checklist

- [ ] RLS policies updated (Method 1)
- [ ] Backend restarted
- [ ] Logged out and back in
- [ ] Browser cache cleared
- [ ] Test text submitted
- [ ] Console shows success response
- [ ] Page transitions to Configure Exam
- [ ] Can see difficulty and question type options

If all checked, you're good to go! 🎉
