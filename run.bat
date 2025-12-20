@echo off
REM FinTech Application Run Script for Windows
REM This script runs both backend and frontend

echo.
echo ========================================
echo   Starting FinTech Application
echo ========================================
echo.

echo [INFO] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [INFO] Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo [SUCCESS] Application is running!
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Close the terminal windows to stop the servers.
echo.

pause

