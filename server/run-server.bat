@echo off
echo Starting server with logging...
node server.js 2>&1 | tee server-output.log
pause