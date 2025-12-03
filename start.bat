@echo off
echo ====================================
echo   RORAC Calculator - Starting All Services
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
)

REM Check if Python dependencies are installed
cd pdf_service
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Python dependencies
        cd ..
        pause
        exit /b 1
    )
)
cd ..

echo.
echo Starting services...
echo - React App (Frontend)
echo - Node.js API Server
echo - PDF Generation Service
echo.
echo Press Ctrl+C to stop all services
echo.

npm run dev
