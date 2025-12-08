# AI Examiner Backend Issues & Fixes

## 🔴 CRITICAL ISSUES FOUND

### Issue 1: Missing Database Tables
**Problem:** The `ai_documents` and `ai_exams` tables don't exist in your Supabase database.

**Fix:** 
1. Go to your Supabase Dashboard → SQL Editor
2. Run the corrected SQL below (fixes user table reference):

```sql
-- AI Documents table (stores uploaded documents)
CREATE TABLE IF NOT EXISTS public.ai_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Exams table (stores generated exams)
CREATE TABLE IF NOT EXISTS public.ai_exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID REFERENCES public.ai_documents(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  subject TEXT DEFAULT 'General',
  total_questions INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  score INTEGER,
  percentage DECIMAL(5,2),
  correct_answers INTEGER,
  user_answers JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_documents_user_id ON public.ai_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_documents_created_at ON public.ai_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_exams_user_id ON public.ai_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_exams_status ON public.ai_exams(status);
CREATE INDEX IF NOT EXISTS idx_ai_exams_created_at ON public.ai_exams(created_at);

-- Enable RLS
ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_documents
CREATE POLICY "Users can view own documents" ON public.ai_documents 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" ON public.ai_documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.ai_documents 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_exams
CREATE POLICY "Users can view own exams" ON public.ai_exams 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exams" ON public.ai_exams 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" ON public.ai_exams 
  FOR UPDATE USING (auth.uid() = user_id);
```

---

### Issue 2: User ID Extraction Bug
**Problem:** Controller tries to access `req.user?.sub` but middleware only sets `req.user.id`

**Location:** `server/controllers/aiExaminer.controller.js`

**Current Code (Lines 12, 64, 96):**
```javascript
const userId = req.user?.sub || req.user?.id;
```

**Fixed Code:**
```javascript
const userId = req.user?.id;
```

---

### Issue 3: Missing npm Dependencies
**Problem:** `pdf-parse` and `mammoth` packages may not be installed

**Fix:** Run in your server directory:
```bash
cd server
npm install pdf-parse mammoth
```

---

### Issue 4: GEMINI_API_KEY is Set (Good!)
✅ Your `.env` file has `GEMINI_API_KEY=AIzaSyDSLu6vt64YNgis_c3LNuJ6XvBHkNUOImI`

---

## 🔧 QUICK FIX CHECKLIST

1. ✅ **Run the SQL migration** in Supabase Dashboard
2. ✅ **Install missing packages**: `npm install pdf-parse mammoth`
3. ✅ **Fix user ID extraction** in controller (see Issue 2)
4. ✅ **Restart your backend server**

---

## 🧪 TESTING AFTER FIXES

### Test 1: Upload Document
```bash
# Use the test file at: test-ai-examiner-backend.js
node test-ai-examiner-backend.js
```

### Test 2: Paste Text
1. Open AI Examiner page
2. Click "Paste Text" tab
3. Enter some text (at least 50 words)
4. Click "Analyze Text"
5. Should proceed to configuration step

---

## 📊 ROOT CAUSE ANALYSIS

### Why Upload Wasn't Working:
1. **Database tables missing** → Supabase insert failed silently
2. **User ID mismatch** → `req.user.sub` was undefined
3. **Missing dependencies** → File parsing failed

### Why Text Paste Wasn't Working:
1. Same database table issue
2. Same user ID issue

---

## 🚀 EXPECTED BEHAVIOR AFTER FIXES

### Upload Flow:
1. User uploads PDF/DOCX/TXT → ✅ File parsed
2. Text extracted → ✅ Saved to `ai_documents` table
3. Returns `documentId` → ✅ Frontend proceeds to Step 1 (Config)

### Text Paste Flow:
1. User pastes text → ✅ Validated (min 5 chars)
2. Saved to `ai_documents` → ✅ Returns `documentId`
3. Frontend proceeds to Step 1 (Config)

---

## 🔍 DEBUGGING TIPS

If issues persist after fixes:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for INSERT errors on `ai_documents`

2. **Check Backend Console:**
   - Look for "Upload error:" messages
   - Check if user authentication is working

3. **Check Browser Console:**
   - Look for 401 (Unauthorized) errors
   - Check if token is being sent in headers

4. **Verify Tables Exist:**
   ```sql
   SELECT * FROM public.ai_documents LIMIT 1;
   SELECT * FROM public.ai_exams LIMIT 1;
   ```

---

## 📝 ADDITIONAL NOTES

- Your authentication middleware is working correctly
- Your routes are properly configured
- Your Gemini service is properly set up
- The frontend is correctly handling FormData uploads

The main issue is just the **missing database tables** and **user ID extraction bug**.
