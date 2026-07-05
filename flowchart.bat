@echo off
title flowchart: 3013
cd C:\Web_Practice\Function\flowchart
echo C:\Web_Practice\Function\flowchart
echo Starting server.js ...
start "" cmd /c "timeout /t 2 >nul && start chrome http://localhost:3013"
node server.js
pause
