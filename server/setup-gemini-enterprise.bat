@echo off
echo ========================================
echo  GEMINI ENTERPRISE SERVICE SETUP
echo ========================================
echo.

echo [1/3] Checking environment...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and add your GEMINI_API_KEY
    pause
    exit /b 1
)

findstr /C:"GEMINI_API_KEY" .env >nul
if errorlevel 1 (
    echo ERROR: GEMINI_API_KEY not found in .env
    echo Please add: GEMINI_API_KEY=your_key_here
    pause
    exit /b 1
)

echo ✓ Environment configured
echo.

echo [2/3] Testing Gemini Service...
node test-gemini.js
if errorlevel 1 (
    echo.
    echo ERROR: Gemini service test failed
    echo Please check your API key and internet connection
    pause
    exit /b 1
)

echo.
echo [3/3] Setup Instructions
echo ========================================
echo.
echo ✓ Gemini service is working!
echo.
echo NEXT STEPS:
echo 1. Run the database migration in Supabase SQL Editor:
echo    server/database/migrations/2025_api_usage_tracking.sql
echo.
echo 2. Add cost monitoring routes to server.js:
echo    app.use('/api/cost-monitoring', require('./routes/apiCost.routes'));
echo.
echo 3. Update aiExaminer.controller.js to pass userId parameter
echo    (See GEMINI_ENTERPRISE_UPGRADE.md for details)
echo.
echo 4. Review full documentation:
echo    GEMINI_ENTERPRISE_UPGRADE.md
echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
pause
