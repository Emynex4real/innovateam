@echo off
echo ========================================
echo   Leaderboard Setup Instructions
echo ========================================
echo.
echo This will guide you through setting up the leaderboard system.
echo.
echo STEP 1: Database Setup
echo ----------------------
echo 1. Open your browser and go to: https://supabase.com/dashboard
echo 2. Select your project
echo 3. Click on "SQL Editor" in the left sidebar
echo 4. Click "New Query"
echo 5. Open the file: supabase\practice_leaderboard.sql
echo 6. Copy ALL the contents and paste into the SQL Editor
echo 7. Click "Run" to execute
echo.
pause
echo.
echo STEP 2: Verify Setup
echo --------------------
echo Run this query in SQL Editor to verify:
echo.
echo SELECT * FROM practice_sessions LIMIT 1;
echo SELECT * FROM leaderboard_stats LIMIT 5;
echo.
pause
echo.
echo STEP 3: Test the System
echo -----------------------
echo 1. Start your application
echo 2. Complete a practice quiz
echo 3. Go to the Leaderboard page
echo 4. You should see your ranking!
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo For detailed instructions, see: LEADERBOARD_SETUP.md
echo.
pause
