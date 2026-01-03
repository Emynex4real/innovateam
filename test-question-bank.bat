@echo off
echo ========================================
echo Question Bank Diagnostic Test
echo ========================================
echo.

node test-question-banks.js

echo.
echo ========================================
echo Test Complete
echo ========================================
echo.
echo Next Steps:
echo 1. If tables missing: Run supabase/ai_question_banks.sql in Supabase
echo 2. If not admin: Update user role in database
echo 3. Open admin page and click "Run Diagnostic" button
echo.
pause
