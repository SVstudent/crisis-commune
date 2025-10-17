# Crisis Commune - Emergency Response Management System

A full-stack application for managing emergency response operations with AI agents and **Deepgram-powered voice recognition**.

## Project Structure

```
crisis-commune-1/
├── backend/          # Python Flask API with Deepgram integration
│   ├── app.py       # Main Flask application
│   ├── models.py    # Database models
│   ├── routes.py    # API routes
│   ├── deepgram_agent.py  # Deepgram voice agent
│   ├── requirements.txt
│   └── setup.sh     # Backend setup script
├── frontend/         # React Vite TypeScript
│   ├── src/         # React source code
│   │   ├── hooks/useDeepgramVoice.ts  # Deepgram voice hook
│   │   └── components/DeepgramVoiceBubble.tsx  # Voice interface
│   ├── public/      # Static assets
│   ├── package.json
│   └── vite.config.ts
├── setup-deepgram.sh # Complete setup script
└── README.md
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the complete setup script
./setup-deepgram.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///crisis_commune.db
DEEPGRAM_API_KEY=your_deepgram_api_key_here
EOF

# Start backend server
python app.py
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎤 Deepgram Voice Agent

### Features
- **Real-time Speech Recognition**: Powered by Deepgram's Nova-2 model
- **Live Audio Streaming**: Continuous audio processing with interim results
- **Connection Status**: Visual indicators for Deepgram connection state
- **Error Handling**: Comprehensive error recovery and user feedback
- **Agent Integration**: Seamlessly connected to existing agent system

### How to Use
1. **Open your browser** and go to http://localhost:3000 (or 3001 if 3000 is in use)
2. **Navigate to the Dashboard** to access the Deepgram Voice Agent
3. **Allow microphone permissions** when prompted
4. **Click the voice bubble** to start speaking
5. **Speak naturally** - Deepgram will transcribe in real-time
6. **Watch agent responses** as they process your emergency call

## 🌐 Access Points

- **Frontend**: http://localhost:3000 (or 3001)
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔧 API Endpoints

### Core API
- `GET /api/health` - Health check with Deepgram status
- `GET /api/incidents` - List all incidents
- `POST /api/incidents` - Create new incident
- `GET /api/agents` - List all agents
- `GET /api/logs` - Get system logs
- `GET /api/agent-responses` - Get agent responses

### Deepgram Voice API
- `POST /api/voice/start` - Start voice session
- `POST /api/voice/audio/{session_id}` - Send audio data
- `GET /api/voice/transcript/{session_id}` - Get transcript
- `POST /api/voice/stop/{session_id}` - Stop voice session
- `GET /api/voice/transcript-stream` - Stream transcript updates
- `POST /api/voice/process-emergency` - Process emergency call

## 🛠️ Development

### Running Both Servers
```bash
# From project root
npm run dev  # Runs both backend and frontend concurrently
```

### Individual Servers
```bash
# Backend only
cd backend && source venv/bin/activate && python app.py

# Frontend only
cd frontend && npm run dev
```

### Environment Variables
The application uses the following environment variables:
- `FLASK_ENV`: Development mode
- `SECRET_KEY`: Flask secret key
- `DATABASE_URL`: Database connection string
- `DEEPGRAM_API_KEY`: Your Deepgram API key (pre-configured)

## 🎯 Features

- **Incident Management**: Create, track, and manage emergency incidents
- **AI Agent System**: Deploy AI agents for automated response
- **Deepgram Voice Recognition**: Enterprise-grade speech recognition
- **Real-time Logging**: Monitor system activities and agent responses
- **Interactive Map**: Visualize incidents and agent locations
- **Dashboard**: Comprehensive overview with voice interface
- **Live Transcripts**: Real-time speech-to-text with interim results

## 🔍 Troubleshooting

### Voice Agent Not Connecting
1. Check browser console for error messages
2. Ensure microphone permissions are granted
3. Verify backend is running on port 5000
4. Check that Deepgram API key is valid

### Port Conflicts
- Backend: If port 5000 is in use, kill existing processes: `pkill -f "python app.py"`
- Frontend: Vite will automatically use port 3001 if 3000 is occupied

### Dependencies Issues
```bash
# Backend
cd backend && source venv/bin/activate && pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

## 📋 Requirements

- **Python 3.8+**
- **Node.js 18+**
- **Microphone access** (for voice features)
- **Modern browser** with WebRTC support

## 🔑 Deepgram API Key

The application comes pre-configured with a Deepgram API key. For production use, replace the key in the `.env` file with your own Deepgram API key.

## 🎉 Success Indicators

When everything is working correctly, you should see:
- ✅ Backend health check shows `"deepgram_enabled": true`
- ✅ Frontend loads without console errors
- ✅ Voice bubble shows "🔗 Connected" status
- ✅ Microphone permissions granted
- ✅ Real-time transcription working
