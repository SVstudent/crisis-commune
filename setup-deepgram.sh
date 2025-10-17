#!/bin/bash

# Crisis Commune Deepgram Voice Agent Setup Script

echo "🎤 Setting up Deepgram Voice Agent for Crisis Commune..."

# Check if we're in the right directory
if [ ! -f "backend/app.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Setup backend
echo "📦 Setting up backend dependencies..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Environment variables for Flask configuration
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///crisis_commune.db

# Deepgram API Configuration
# Get your API key from: https://console.deepgram.com/
DEEPGRAM_API_KEY=your_deepgram_api_key_here
EOF
    echo "✅ Created .env file - Please add your Deepgram API key!"
    echo "⚠️  Edit backend/.env and replace 'your_deepgram_api_key_here' with your actual API key"
else
    echo "⚠️  .env file already exists. Please ensure DEEPGRAM_API_KEY is set."
fi

cd ..

# Setup frontend
echo "📦 Setting up frontend dependencies..."
cd frontend

# Install dependencies
npm install

cd ..

echo ""
echo "🎉 Deepgram Voice Agent setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Backend:  cd backend && source venv/bin/activate && python app.py"
echo "   Frontend: cd frontend && npm run dev"
echo "   Or both:  npm run dev"
echo ""
echo "🎤 The Deepgram voice agent will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📋 Features:"
echo "   ✅ Real-time speech recognition with Deepgram"
echo "   ✅ Live transcript streaming"
echo "   ✅ Emergency call processing"
echo "   ✅ Agent response coordination"
echo "   ✅ Connection status monitoring"
echo ""
echo "🔧 API Endpoints:"
echo "   POST /api/voice/start - Start voice session"
echo "   POST /api/voice/audio/{session_id} - Send audio data"
echo "   GET  /api/voice/transcript/{session_id} - Get transcript"
echo "   POST /api/voice/stop/{session_id} - Stop voice session"
echo "   GET  /api/voice/transcript-stream - Stream transcript updates"
echo "   POST /api/voice/process-emergency - Process emergency call"
echo ""
echo "⚠️  Make sure to allow microphone permissions in your browser!"
