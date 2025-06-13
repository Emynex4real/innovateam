@echo off
echo Starting JAMB Advisor API Server...

:: Set environment variables
set NODE_ENV=production
set PORT=5000
set JWT_SECRET=your-secret-key

:: Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if pm2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing PM2 globally...
    call npm install -g pm2
)

:: Start the server using PM2
echo Starting server with PM2...
call pm2 start server.js --name jamb-advisor-api --max-memory-restart 1G

:: Check if server started successfully
if %ERRORLEVEL% neq 0 (
    echo Failed to start server. Please check the logs.
    pause
    exit /b 1
)

echo Server started successfully!
echo Server is running on port %PORT%
echo Press Ctrl+C to stop the server
pause 