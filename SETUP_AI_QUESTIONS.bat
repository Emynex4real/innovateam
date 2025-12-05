@echo off
echo ========================================
echo AI Questions Setup Helper
echo ========================================
echo.

echo Step 1: Check GEMINI_API_KEY
echo ----------------------------------------
findstr "GEMINI_API_KEY" server\.env
echo.

echo Step 2: SQL Migration Instructions
echo ----------------------------------------
echo Please run the SQL migration manually:
echo 1. Go to: https://supabase.com/dashboard
echo 2. Open SQL Editor
echo 3. Copy content from: supabase\ai_question_banks.sql
echo 4. Paste and Run in Supabase
echo.
echo Press any key after running SQL migration...
pause

echo.
echo Step 3: Restarting Server
echo ----------------------------------------
cd server
echo Starting server...
start cmd /k npm start

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Server is starting in a new window
echo Login as admin and check AI Questions tab
echo.
pause
