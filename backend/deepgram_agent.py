import asyncio
import json
import os
import ssl
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import threading
import queue
import time

# Disable SSL verification globally for websockets (development only)
# This fixes "CERTIFICATE_VERIFY_FAILED" errors on macOS
import warnings
warnings.filterwarnings('ignore', message='Unverified HTTPS request')

# Monkey-patch ssl to create unverified context by default
_original_create_default_context = ssl.create_default_context

def _create_unverified_context(*args, **kwargs):
    context = _original_create_default_context(*args, **kwargs)
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    return context

ssl.create_default_context = _create_unverified_context

# Try to import Deepgram SDK but fail gracefully on SyntaxError / incompatible Python
DEEPGRAM_AVAILABLE = False
DeepgramClient = None
LiveTranscriptionEvents = None
LiveOptions = None
try:
    try:
        # Importing may raise SyntaxError on older Python versions if the SDK uses newer syntax
        from deepgram import DeepgramClient, DeepgramClientOptions, LiveTranscriptionEvents, LiveOptions
        DEEPGRAM_AVAILABLE = True
    except Exception as _e:
        # Import failed (could be SyntaxError or other incompatibility). We'll degrade gracefully.
        print(f"Deepgram SDK not available or failed to import: {_e}")
        DEEPGRAM_AVAILABLE = False
except SyntaxError as se:
    print(f"Deepgram SDK import raised SyntaxError (likely Python version incompatibility): {se}")
    DEEPGRAM_AVAILABLE = False

class DeepgramVoiceAgent:
    def __init__(self):
        # Note: do not assume Deepgram SDK is importable. Initialize client only when available.
        self.api_key = os.getenv('DEEPGRAM_API_KEY', '')
        self.client = None
        if DEEPGRAM_AVAILABLE and self.api_key:
            try:
                # SSL verification is already disabled globally via ssl.create_default_context patch
                config = DeepgramClientOptions(
                    options={
                        "keepalive": "true"
                    }
                )
                self.client = DeepgramClient(self.api_key, config)
                print("Deepgram client initialized successfully (SSL verification disabled for dev)")
            except Exception as e:
                print(f"Failed to initialize Deepgram client: {e}")
                self.client = None

        self.connections = {}  # Store active connections by session_id
        self.transcript_queue = queue.Queue()
        
    def create_connection(self, session_id):
        """Create a new Deepgram connection for a session"""
        try:
            if not DEEPGRAM_AVAILABLE or not self.client:
                print("Deepgram SDK not available or client not initialized. Cannot create connection.")
                return False

            print(f"Creating Deepgram connection for session: {session_id}")
            print(f"Using API key: {self.api_key[:10]}...")

            # Configure for browser MediaRecorder audio
            # Note: Browser sends webm container, but we configure for the codec inside (opus)
            # Deepgram can handle the webm container when encoding is set to the audio codec
            options = LiveOptions(
                model="nova-2",
                language="en-US",
                smart_format=True,
                encoding="linear16",  # Use linear16 for better compatibility
                sample_rate=16000,
                channels=1,
                interim_results=True,
                endpointing=300,
                vad_events=True,
                utterance_end_ms=1000
            )

            connection = self.client.listen.live.v("1")
            connection.on(LiveTranscriptionEvents.Open, self.on_open)
            connection.on(LiveTranscriptionEvents.Transcript, self.on_transcript)
            connection.on(LiveTranscriptionEvents.Metadata, self.on_metadata)
            connection.on(LiveTranscriptionEvents.Error, self.on_error)
            connection.on(LiveTranscriptionEvents.Close, self.on_close)

            if connection.start(options):
                print(f"Deepgram connection started successfully for session: {session_id}")
                self.connections[session_id] = {
                    'connection': connection,
                    'transcript': '',
                    'interim_transcript': '',
                    'is_listening': False,
                    'created_at': time.time()
                }
                return True
            else:
                print(f"Failed to start Deepgram connection for session: {session_id}")
                return False
        except Exception as e:
            print(f"Error creating Deepgram connection: {e}")
            return False
    
    def on_open(self, *args, **kwargs):
        print("Deepgram connection opened")
    
    def on_transcript(self, *args, **kwargs):
        """Handle transcript results"""
        try:
            # In Deepgram SDK v3+, result is a LiveResultResponse object, not a dict
            result = kwargs.get('result')
            if not result:
                return
            
            # Try to convert to dict if it has a to_dict method
            transcript = ''
            is_final = False
            
            if hasattr(result, 'to_dict'):
                result_dict = result.to_dict()
                
                # Parse from dict
                is_final = result_dict.get('is_final', False)
                
                if 'channel' in result_dict:
                    channel = result_dict['channel']
                    if 'alternatives' in channel and len(channel['alternatives']) > 0:
                        alternative = channel['alternatives'][0]
                        transcript = alternative.get('transcript', '')
                        
                # Only log when we actually have text
                if transcript:
                    print(f"🎤 Transcript: '{transcript}' (final={is_final})")
            else:
                # Fallback: try object attribute access if to_dict doesn't exist
                is_final = getattr(result, 'is_final', False)
                if hasattr(result, 'channel'):
                    channel = result.channel
                    if hasattr(channel, 'alternatives') and len(channel.alternatives) > 0:
                        alternative = channel.alternatives[0]
                        if hasattr(alternative, 'transcript'):
                            transcript = alternative.transcript
                            if transcript:
                                print(f"🎤 Transcript: '{transcript}' (final={is_final})")
            
            # Only continue processing if we have actual transcript text
            if not transcript:
                return
            # Find the session for this connection
            session_id = None
            for sid, conn_data in self.connections.items():
                # Match by connection object
                if len(args) > 0 and conn_data['connection'] == args[0]:
                    session_id = sid
                    break
            
            if not session_id:
                # Fallback: use the first/only session if we can't match
                if len(self.connections) == 1:
                    session_id = list(self.connections.keys())[0]
            
            if session_id:
                if is_final:
                    self.connections[session_id]['transcript'] += transcript + ' '
                    self.connections[session_id]['interim_transcript'] = ''
                else:
                    self.connections[session_id]['interim_transcript'] = transcript
                
                # Put transcript data in queue for processing
                self.transcript_queue.put({
                    'session_id': session_id,
                    'transcript': transcript,
                    'is_final': is_final,
                    'timestamp': time.time()
                })
                
        except Exception as e:
            import traceback
            print(f"Error processing transcript: {e}")
            traceback.print_exc()
    
    def on_metadata(self, *args, **kwargs):
        print(f"Metadata: {kwargs}")
    
    def on_error(self, *args, **kwargs):
        print(f"Deepgram error: {kwargs}")
    
    def on_close(self, *args, **kwargs):
        print("Deepgram connection closed")
    
    def send_audio(self, session_id, audio_data):
        """Send audio data to Deepgram"""
        if session_id in self.connections:
            try:
                print(f"Sending {len(audio_data)} bytes of audio data for session {session_id}")
                self.connections[session_id]['connection'].send(audio_data)
                return True
            except Exception as e:
                print(f"Error sending audio: {e}")
                import traceback
                traceback.print_exc()
                return False
        else:
            print(f"Session {session_id} not found in connections: {list(self.connections.keys())}")
        return False
    
    def finish_connection(self, session_id):
        """Finish and close a Deepgram connection"""
        if session_id in self.connections:
            try:
                self.connections[session_id]['connection'].finish()
                del self.connections[session_id]
                return True
            except Exception as e:
                print(f"Error finishing connection: {e}")
                return False
        return False
    
    def get_transcript(self, session_id):
        """Get current transcript for a session"""
        if session_id in self.connections:
            conn_data = self.connections[session_id]
            return {
                'transcript': conn_data['transcript'],
                'interim_transcript': conn_data['interim_transcript'],
                'is_listening': conn_data['is_listening']
            }
        return None
    
    def set_listening_state(self, session_id, is_listening):
        """Set listening state for a session"""
        if session_id in self.connections:
            self.connections[session_id]['is_listening'] = is_listening
            return True
        return False

# Global Deepgram agent instance (created when routes are registered)
deepgram_agent = None

def create_voice_routes(app):
    """Create voice-related API routes"""
    global deepgram_agent
    # Instantiate deepgram agent lazily so importing this module doesn't fail on incompatible SDK
    if deepgram_agent is None:
        deepgram_agent = DeepgramVoiceAgent()
    
    @app.route('/api/voice/start', methods=['POST'])
    def start_voice_session():
        """Start a new voice session"""
        try:
            data = request.get_json()
            session_id = data.get('session_id', f'session_{int(time.time())}')
            
            if deepgram_agent.create_connection(session_id):
                deepgram_agent.set_listening_state(session_id, True)
                return jsonify({
                    'success': True,
                    'session_id': session_id,
                    'message': 'Voice session started'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to start voice session'
                }), 500
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error starting voice session: {str(e)}'
            }), 500
    
    @app.route('/api/voice/audio/<session_id>', methods=['POST'])
    def send_audio(session_id):
        """Send audio data to Deepgram"""
        try:
            audio_data = request.data
            
            if deepgram_agent.send_audio(session_id, audio_data):
                return jsonify({'success': True})
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to send audio data'
                }), 400
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error sending audio: {str(e)}'
            }), 500
    
    @app.route('/api/voice/transcript/<session_id>', methods=['GET'])
    def get_transcript(session_id):
        """Get current transcript for a session"""
        try:
            transcript_data = deepgram_agent.get_transcript(session_id)
            
            if transcript_data:
                return jsonify({
                    'success': True,
                    'transcript': transcript_data['transcript'],
                    'interim_transcript': transcript_data['interim_transcript'],
                    'is_listening': transcript_data['is_listening']
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Session not found'
                }), 404
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error getting transcript: {str(e)}'
            }), 500
    
    @app.route('/api/voice/stop/<session_id>', methods=['POST'])
    def stop_voice_session(session_id):
        """Stop and close a voice session"""
        try:
            if deepgram_agent.finish_connection(session_id):
                return jsonify({
                    'success': True,
                    'message': 'Voice session stopped'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Session not found or already closed'
                }), 404
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error stopping voice session: {str(e)}'
            }), 500
    
    @app.route('/api/voice/transcript-stream', methods=['GET'])
    def stream_transcripts():
        """Stream transcript updates via Server-Sent Events"""
        def generate():
            while True:
                try:
                    # Get transcript data from queue
                    transcript_data = deepgram_agent.transcript_queue.get(timeout=1)
                    yield f"data: {json.dumps(transcript_data)}\n\n"
                except queue.Empty:
                    yield "data: {}\n\n"  # Keep connection alive
                except Exception as e:
                    print(f"Error in transcript stream: {e}")
                    break
        
        return Response(generate(), mimetype='text/event-stream', headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        })
    
    @app.route('/api/voice/process-emergency', methods=['POST'])
    def process_emergency_call():
        """Process emergency call transcript and trigger agent responses"""
        try:
            data = request.get_json()
            transcript = data.get('transcript', '')
            session_id = data.get('session_id', '')
            
            if not transcript:
                return jsonify({
                    'success': False,
                    'message': 'No transcript provided'
                }), 400
            
            # Here you would integrate with your existing agent system
            # For now, we'll return a mock response
            response = {
                'success': True,
                'agents': [
                    {
                        'agent': 'intake',
                        'message': 'Emergency call received. Analyzing your report for key information...',
                        'status': 'analyzing'
                    },
                    {
                        'agent': 'geo',
                        'message': 'Determining your location and nearest emergency units...',
                        'status': 'analyzing'
                    },
                    {
                        'agent': 'severity',
                        'message': 'Evaluating emergency severity level...',
                        'status': 'analyzing'
                    },
                    {
                        'agent': 'dispatcher',
                        'message': 'Preparing dispatch coordination...',
                        'status': 'analyzing'
                    }
                ],
                'incident_data': {
                    'incidentType': 'Multi-Vehicle Traffic Collision',
                    'location': 'Jefferson St & 7th Ave, San Francisco, CA',
                    'coordinates': '37.7749° N, 122.4194° W',
                    'severity': 'high',
                    'recommendedUnits': ['Medic 2', 'Engine 5', 'Police Unit 12', 'Backup Ambulance'],
                    'eta': '5-7 minutes'
                },
                'ai_response': 'Thank you for reporting. Emergency services have been notified. Help is on the way. Medic 2 and Engine 5 are responding with an estimated arrival time of 5 to 7 minutes. Please stay on the line and keep the injured safe.'
            }
            
            return jsonify(response)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error processing emergency call: {str(e)}'
            }), 500
