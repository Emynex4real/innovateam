# AI Examiner Testing Checklist

## Pre-Testing Setup ✅

- [x] Database tables created (`ai_documents`, `ai_exams`)
- [x] Gemini API key added to `server/.env`
- [x] Backend server restarted
- [x] Frontend connected to backend API

## Test Scenario 1: Basic Question Generation

### Steps:
1. Login to your account
2. Check wallet balance (need at least ₦300)
3. Navigate to AI Examiner page
4. Upload `test_document.txt` (provided in root folder)
5. Set:
   - Question Count: 5
   - Difficulty: Medium
   - Question Types: Multiple Choice, True/False
   - Duration: 10 minutes
6. Click "Generate AI Questions"

### Expected Results:
- ✅ Loading indicator shows
- ✅ Gemini API generates 5 questions
- ✅ Wallet deducted ₦300
- ✅ Questions displayed in exam tab
- ✅ Timer starts at 10:00

### Check Backend Logs:
```
✅ Document stored in ai_documents table
✅ Gemini API called successfully
✅ Questions stored in ai_exams table
```

---

## Test Scenario 2: Take Exam

### Steps:
1. After questions generated, click "Start Exam"
2. Answer all 5 questions
3. Navigate between questions using Previous/Next
4. Click "Submit Exam"

### Expected Results:
- ✅ Timer counts down
- ✅ Answers saved as you select them
- ✅ Can navigate between questions
- ✅ Submit button works
- ✅ Results displayed with score, percentage, grade

---

## Test Scenario 3: View Results

### Steps:
1. After submitting exam, view results tab
2. Check detailed question review
3. Verify correct/incorrect answers marked

### Expected Results:
- ✅ Score calculated correctly
- ✅ Percentage shown
- ✅ Grade assigned (A-F)
- ✅ Each question shows:
  - Your answer
  - Correct answer
  - Explanation
  - ✓ or ✗ indicator

---

## Test Scenario 4: Different Question Types

### Steps:
1. Generate new exam with:
   - 10 questions
   - Hard difficulty
   - Both question types selected

### Expected Results:
- ✅ Mix of multiple choice and true/false questions
- ✅ Questions are more challenging
- ✅ All questions relevant to document content

---

## Test Scenario 5: Error Handling

### Test A: Insufficient Balance
1. Ensure wallet has less than ₦300
2. Try to generate questions
3. **Expected:** Error message about insufficient balance

### Test B: No Document
1. Don't upload any document
2. Try to generate questions
3. **Expected:** Error message "Please upload a document first"

### Test C: Empty Document
1. Upload empty text file
2. Try to generate questions
3. **Expected:** Error message about content being too short

---

## Database Verification

### Check Supabase Tables:

**ai_documents table:**
```sql
SELECT * FROM ai_documents ORDER BY created_at DESC LIMIT 5;
```
Should show your uploaded documents.

**ai_exams table:**
```sql
SELECT id, user_id, total_questions, score, percentage, status 
FROM ai_exams 
ORDER BY created_at DESC 
LIMIT 5;
```
Should show your exam records.

---

## API Endpoint Testing (Optional)

### Using Postman or curl:

**1. Submit Text:**
```bash
POST http://localhost:5000/api/ai-examiner/submit-text
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "text": "Sample text content...",
  "title": "Test Document"
}
```

**2. Generate Questions:**
```bash
POST http://localhost:5000/api/ai-examiner/generate
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "documentId": "uuid-from-step-1",
  "questionCount": 5,
  "difficulty": "medium",
  "questionTypes": ["multiple-choice", "true-false"]
}
```

---

## Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution:** Check `server/.env` has `GEMINI_API_KEY` configured

### Issue: Questions not generating
**Solution:** 
1. Check backend console for errors
2. Verify Gemini API key is valid
3. Check internet connection

### Issue: Wallet not deducting
**Solution:** Check transaction was created in database

### Issue: Questions format wrong
**Solution:** Backend should return questions with `correct_answer` field (not `correctAnswer`)

---

## Success Criteria ✅

- [ ] Can upload documents
- [ ] Gemini AI generates relevant questions
- [ ] Wallet deducts ₦300
- [ ] Can take exam with timer
- [ ] Can submit answers
- [ ] Results calculated correctly
- [ ] Data stored in database
- [ ] Can view exam history

---

**Once all tests pass, the AI Examiner is ready for production!** 🎉
