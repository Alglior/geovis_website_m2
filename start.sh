#!/bin/bash

# GeoVis Galaxy Startup Script
echo "🌍 Welcome to GeoVis Galaxy! ✨"
echo "=================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ to continue."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip to continue."
    exit 1
fi

echo "✅ pip is available"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check your internet connection."
    exit 1
fi

echo ""
echo "🚀 Starting GeoVis Galaxy..."
echo "🌐 The application will be available at: http://localhost:5000"
echo "🔥 Press Ctrl+C to stop the server"
echo ""

# Start the Flask application
python app.py