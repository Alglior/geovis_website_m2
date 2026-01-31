@echo off
title GeoVis Galaxy Startup

echo.
echo 🌍 Welcome to GeoVis Galaxy! ✨
echo ==================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed or not in PATH.
    echo Please install Python 3.8+ and add it to your PATH.
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if pip is installed  
pip --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ pip is not installed or not in PATH.
    pause
    exit /b 1
)

echo ✅ pip is available

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies. Please check your internet connection.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Starting GeoVis Galaxy...
echo 🌐 The application will be available at: http://localhost:5000
echo 🔥 Press Ctrl+C to stop the server
echo.

REM Start the Flask application
python app.py

pause