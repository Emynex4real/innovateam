# AI Examiner Debug Guide

## Issue: Not progressing to next page after upload/paste

### Quick Fix Steps:

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Try uploading a file or pasting text**

3. **Check the console logs** - You should see:
   - `📤 Uploading file: [filename]` or `📝 Submitting text: [title]`
   - `✅ Upload response:` or `✅ Text submit response:`
   - `📥 Upload result:` or `📥 Text submit result:`

### Expected Response Format:
```json
{
  "success": true,
  "data": {
    "documentId": "uuid-here",
    "filename": "your-file-name"
  },
  "message": "Document processed successfully"
}
```

### Common Issues & Solutions:

#### Issue 1: Authentication Error
**Symptom:** Console shows `401 Unauthorized`
**Solution:**
- Make sure you're logged in
- Check if token exists: `localStorage.getItem('auth_token')`
- Try logging out and back in

#### Issue 2: Database RLS Policy Error
**Symptom:** Console shows `permission denied` or `RLS policy violation`
**Solution:**
Run this in Supabase SQL Editor:
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'ai_documents';

-- If missing, recreate them
CREATE POLICY "Users can create own documents" ON public.ai_documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Issue 3: Backend Not Running
**Symptom:** Console shows `Failed to fetch` or `Network error`
**Solution:**
```bash
cd server
npm start
```
Backend should be running on http://localhost:5000

#### Issue 4: CORS Error
**Symptom:** Console shows `CORS policy` error
**Solution:**
Check `server/server.js` - ensure your frontend URL is in `allowedOrigins`:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  // ... your URLs
];
```

### Manual Test:

Open browser console and run:
```javascript
// Test text submission
fetch('http://localhost:5000/api/ai-examiner/submit-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({
    text: 'This is a test document about photosynthesis. Plants use sunlight to create energy.',
    title: 'Test Document'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Response:', data))
.catch(err => console.error('❌ Error:', err));
```

### Check Backend Logs:

In your server terminal, you should see:
```
🌐 [requestId] POST /api/ai-examiner/submit-text from ::1
✅ [requestId] POST /api/ai-examiner/submit-text - 200 (XXXms)
```

### Verify Database Tables:

Run in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_documents', 'ai_exams');

-- Check if you can insert (replace with your user ID)
INSERT INTO ai_documents (user_id, filename, content, file_size, mime_type)
VALUES ('your-user-id-here', 'test.txt', 'test content', 12, 'text/plain');
```

### Still Not Working?

1. **Clear browser cache and localStorage:**
```javascript
localStorage.clear();
location.reload();
```

2. **Check if user is authenticated:**
```javascript
console.log('User:', JSON.parse(localStorage.getItem('confirmedUser')));
console.log('Token:', localStorage.getItem('auth_token'));
```

3. **Verify Supabase connection:**
Check `server/.env` has:
```
SUPABASE_URL=https://jdedscbvbkjvqmmdabig.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Check network tab:**
- Open DevTools → Network tab
- Try upload/paste again
- Click on the `/submit-text` or `/upload` request
- Check Response tab for actual server response

### Success Indicators:

✅ Console shows: `📥 Upload result: { success: true, data: {...} }`
✅ Toast notification: "Document ready!" or "Text ready!"
✅ Page transitions to Step 1 (Configure Exam)
✅ You see difficulty options and question type selectors

### If You See This Error:

**"Text is too short"** → Paste at least 50 characters
**"Unauthorized"** → Log in again
**"Failed to process"** → Check backend logs
**Nothing happens** → Check browser console for errors

---

## Quick Test Script

Save this as `test-ai-examiner.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head><title>AI Examiner Test</title></head>
<body>
  <h1>AI Examiner API Test</h1>
  <button onclick="testSubmitText()">Test Submit Text</button>
  <pre id="result"></pre>
  
  <script>
    async function testSubmitText() {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        document.getElementById('result').textContent = '❌ No auth token found. Please log in first.';
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/ai-examiner/submit-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: 'Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in the chloroplasts of plant cells.',
            title: 'Biology Test'
          })
        });
        
        const data = await response.json();
        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        
        if (data.success) {
          alert('✅ SUCCESS! Document ID: ' + data.data.documentId);
        } else {
          alert('❌ FAILED: ' + data.message);
        }
      } catch (error) {
        document.getElementById('result').textContent = '❌ Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

---

## Contact Support

If none of these solutions work, provide:
1. Browser console screenshot
2. Network tab screenshot (showing the request/response)
3. Backend terminal logs
4. Your Supabase project URL
