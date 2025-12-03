# AI Examiner Setup Guide

## Stage 1: Database Setup ✅

### Step 1: Run SQL Script in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/ai_examiner_tables.sql`
6. Paste into the SQL editor
7. Click **Run** button

### What This Creates:

✅ **ai_documents** table - Stores uploaded documents
- id, user_id, filename, content, file_size, mime_type, created_at

✅ **ai_exams** table - Stores generated exams and results
- id, user_id, document_id, questions, difficulty, subject, total_questions, total_points, status, score, percentage, correct_answers, user_answers, results, created_at, completed_at

✅ **Indexes** - For better query performance

✅ **RLS Policies** - Security policies so users can only see their own data

### Verify Installation:

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_documents', 'ai_exams');
```

You should see both tables listed.

---

## Stage 2: Backend API Integration ✅

### What Was Done:

✅ Installed `@google/generative-ai` package
✅ Added `GEMINI_API_KEY` to `server/.env`
✅ Created `server/services/gemini.service.js` - Gemini AI integration
✅ Updated `server/controllers/aiExaminer.controller.js` - Uses Gemini for question generation
✅ Updated `server/.env.example` - Documentation

### API Endpoints Available:

- `POST /api/ai-examiner/submit-text` - Upload document text
- `POST /api/ai-examiner/generate` - Generate questions using Gemini AI
- `POST /api/ai-examiner/submit/:examId` - Submit exam answers
- `GET /api/ai-examiner/history` - Get exam history
- `GET /api/ai-examiner/results/:examId` - Get exam results

---

## Stage 3: Frontend Connection ✅

### What Was Done:

✅ Updated `src/services/aiExaminer.service.js` - Connected to backend API
✅ Updated `src/pages/ai examiner/index.jsx` - Real API integration
✅ Fixed question type formats to match backend
✅ Integrated wallet deduction after successful generation
✅ Removed mock/fallback data

### How It Works:

1. User uploads document → Text extracted
2. Click "Generate Questions" → Checks wallet balance (₦300)
3. Backend submits text → Stores in `ai_documents` table
4. Gemini AI generates questions → Returns structured JSON
5. Backend creates exam → Stores in `ai_exams` table
6. Frontend displays questions → User takes exam
7. Submit answers → Backend grades and returns results

---

## Testing Instructions:

### Test the Complete Flow:

1. **Start Backend Server:**
   ```bash
   cd server
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd ..
   npm start
   ```

3. **Test Steps:**
   - Login to your account
   - Ensure wallet has at least ₦300
   - Go to AI Examiner page
   - Upload a text file or paste text
   - Set question count (5-10 for testing)
   - Click "Generate AI Questions"
   - Wait for Gemini to generate questions
   - Take the exam
   - Submit and view results

### Expected Results:

✅ Questions generated using Gemini AI
✅ Wallet deducted ₦300
✅ Exam stored in database
✅ Results calculated and displayed

---

**Current Status:** All Stages Complete - Ready for Production! 🎉
