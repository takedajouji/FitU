#!/bin/bash

# FitU Application Launcher
# This script starts both the backend server and opens the frontend

echo "🏋️ Starting FitU Application..."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/src/server.js" ]; then
    echo "❌ Error: Please run this script from the FitU/app directory"
    echo "📁 Current directory: $(pwd)"
    echo "🔧 Expected files: backend/src/server.js, frontend/index.html"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "🔗 Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "🔧 Please create .env file with Firebase credentials"
    echo "📖 See: frontend/README.md for setup instructions"
    echo ""
fi

# Start the backend server
echo "🚀 Starting FitU Backend Server..."
echo "📍 Server will run on: http://localhost:3000"
echo "📖 API documentation: http://localhost:3000/api"
echo ""

# Start server in background
node backend/src/server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if curl -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
    echo "✅ Backend server is running successfully!"
else
    echo "❌ Backend server failed to start"
    echo "🔧 Check the terminal output above for errors"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🌐 Opening FitU Frontend..."
echo "📍 Frontend URL: file://$(pwd)/frontend/index.html"
echo ""

# Open the frontend in default browser
if command -v open &> /dev/null; then
    # macOS
    open "frontend/index.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "frontend/index.html"
elif command -v start &> /dev/null; then
    # Windows
    start "frontend/index.html"
else
    echo "📱 Please manually open: frontend/index.html"
fi

echo ""
echo "🎉 FitU Application is now running!"
echo ""
echo "📋 What's Available:"
echo "   🔐 Firebase Authentication (Google + Email)"
echo "   🍎 Food Logging with Nutrition Tracking"
echo "   💪 Exercise Logging with Smart Calories"
echo "   ⚖️  Calorie Balance Dashboard"
echo "   🤖 AI Workout Recommendations"
echo "   🔧 System Health & Auth Testing"
echo ""
echo "🛑 To stop the server:"
echo "   Press Ctrl+C or run: kill $SERVER_PID"
echo ""
echo "🔍 Server logs will appear below..."
echo "📖 Check frontend/README.md for detailed usage instructions"
echo ""
echo "==============================================="

# Keep script running and show server logs
wait $SERVER_PID
