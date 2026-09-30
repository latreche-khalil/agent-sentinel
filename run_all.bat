@echo off
echo ========================================================
echo  Launching AGENT SENTINEL Platform (Backend + Frontend)
echo ========================================================
start "Sentinel Gateway Backend (Port 8000)" cmd /k "run_backend.bat"
timeout /t 3 /nobreak >nul
start "Sentinel Console Frontend (Port 3000)" cmd /k "run_frontend.bat"
echo.
echo Sentinel Gateway starting on:  http://localhost:8000
echo Sentinel UI Console starting on: http://localhost:3000
echo.
pause
