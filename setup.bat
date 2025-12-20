@echo off
REM FinTech Application Setup Script for Windows
REM This script sets up and runs the FinTech application

echo.
echo ========================================
echo   FinTech Application Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker is not installed. You'll need to set up PostgreSQL manually.
    set USE_DOCKER=false
) else (
    set USE_DOCKER=true
)

echo [INFO] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install
) else (
    echo Backend dependencies already installed
)

REM Setup backend .env if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating backend .env file...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_PORT=5433
        echo DB_NAME=fintech_db
        echo DB_USER=postgres
        echo DB_PASSWORD=postgres
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:5173
        echo.
        echo # CORS
        echo CORS_ORIGIN=http://localhost:5173
    ) > .env
    echo [SUCCESS] Backend .env file created
) else (
    echo Backend .env file already exists
)

REM Start PostgreSQL with Docker if available
if "%USE_DOCKER%"=="true" (
    echo [INFO] Starting PostgreSQL with Docker...
    docker-compose up -d
    echo Waiting for PostgreSQL to be ready...
    timeout /t 5 /nobreak >nul
)

REM Run migrations
echo [INFO] Running database migrations...
call npm run migrate

REM Seed database
echo [INFO] Seeding database...
call npm run seed

cd ..

echo [INFO] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
) else (
    echo Frontend dependencies already installed
)

REM Setup frontend .env if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating frontend .env file...
    echo VITE_API_URL=http://localhost:3001/api > .env
    echo [SUCCESS] Frontend .env file created
) else (
    echo Frontend .env file already exists
)

cd ..

echo.
echo [SUCCESS] Setup complete!
echo.
echo To run the application:
echo   1. Backend:  cd backend ^&^& npm run dev
echo   2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Or use the run script: run.bat
echo.

