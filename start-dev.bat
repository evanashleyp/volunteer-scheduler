@echo off
REM Start the Barista Scheduler (Backend API + Frontend)
REM Run this from the BaristaScheduleApp directory

echo.
echo Starting Barista Scheduler...
echo.
echo 1. Starting Flask API on http://localhost:5000
echo 2. Starting Frontend on http://localhost:5173
echo.
echo Wait for both servers to start, then open http://localhost:5173 in your browser
echo.

REM Start Python API in a new terminal
start "Flask API" cmd /k python backend/api.py

REM Wait a moment for API to start
timeout /t 2 /nobreak

REM Start frontend in a new terminal
cd frontend
start "React Frontend" cmd /k "pnpm dev"

echo.
echo Both servers should be starting in new windows...
echo Press any key to close this window.
pause > nul
