import { useState, useEffect, useRef, useCallback } from 'react';

interface DeepgramVoiceOptions {
  model?: string;
  language?: string;
  sampleRate?: number;
  channels?: number;
  interimResults?: boolean;
}

interface TranscriptData {
  session_id: string;
  transcript: string;
  is_final: boolean;
  timestamp: number;
}

export const useDeepgramVoice = (options: DeepgramVoiceOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionIdRef = useRef<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const {
    model = 'nova-2',
    language = 'en-US',
    sampleRate = 16000,  // Use 16kHz for linear16 PCM
    channels = 1,
    interimResults = true
  } = options;

  // Initialize audio context and get microphone access
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: sampleRate,
          channelCount: channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;
      
      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate });
      audioContextRef.current = audioContext;
      
      return true;
    } catch (err) {
      setError(`Failed to access microphone: ${err}`);
      return false;
    }
  }, [sampleRate, channels]);

  // Start voice session with Deepgram
  const startSession = useCallback(async () => {
    try {
      const response = await fetch('/api/voice/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          model,
          language,
          sample_rate: sampleRate,
          channels,
          interim_results: interimResults
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        sessionIdRef.current = data.session_id;
        setIsConnected(true);
        return true;
      } else {
        setError(data.message || 'Failed to start voice session');
        return false;
      }
    } catch (err) {
      setError(`Failed to start session: ${err}`);
      return false;
    }
  }, [model, language, sampleRate, channels, interimResults]);

  // Setup transcript streaming
  const setupTranscriptStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    eventSourceRef.current = new EventSource('/api/voice/transcript-stream');
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data: TranscriptData = JSON.parse(event.data);
        
        if (data.session_id === sessionIdRef.current) {
          if (data.is_final) {
            setTranscript(prev => prev + data.transcript + ' ');
            setInterimTranscript('');
          } else {
            setInterimTranscript(data.transcript);
          }
        }
      } catch (err) {
        console.error('Error parsing transcript data:', err);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error('Transcript stream error:', err);
      setError('Lost connection to transcript stream');
    };
  }, []);

  // Send audio data to Deepgram
  const sendAudioData = useCallback(async (audioBlob: Blob) => {
    try {
      const response = await fetch(`/api/voice/audio/${sessionIdRef.current}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error('Failed to send audio data');
      }
    } catch (err) {
      console.error('Error sending audio:', err);
      setError(`Failed to send audio: ${err}`);
    }
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize audio if not already done
      if (!streamRef.current) {
        const audioInitialized = await initializeAudio();
        if (!audioInitialized) return;
      }

      // Check if we're connected, if not, try to reconnect
      if (!isConnected) {
        const sessionStarted = await startSession();
        if (!sessionStarted) return;
      }

      // Setup transcript streaming
      setupTranscriptStream();

      // Use AudioWorklet or ScriptProcessor to capture raw PCM audio
      const audioContext = audioContextRef.current!;
      const source = audioContext.createMediaStreamSource(streamRef.current!);
      
      // Create a script processor to capture raw audio data
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      
      processor.onaudioprocess = async (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array (PCM 16-bit)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp to prevent overflow and convert to 16-bit PCM
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send PCM data as raw bytes
        const blob = new Blob([pcmData.buffer], { type: 'application/octet-stream' });
        await sendAudioData(blob);
      };
      
      // Connect the nodes
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      // Store processor reference for cleanup
      (streamRef.current as any).audioProcessor = processor;
      
      setIsListening(true);
      
    } catch (err) {
      setError(`Failed to start listening: ${err}`);
    }
  }, [isConnected, initializeAudio, startSession, setupTranscriptStream, sendAudioData]);

  // Stop listening
  const stopListening = useCallback(async () => {
    try {
      // Stop audio processor if it exists
      if (streamRef.current && (streamRef.current as any).audioProcessor) {
        const processor = (streamRef.current as any).audioProcessor;
        processor.disconnect();
        delete (streamRef.current as any).audioProcessor;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      setIsListening(false);
      
      // Close transcript stream
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
    } catch (err) {
      setError(`Failed to stop listening: ${err}`);
    }
  }, []);

  // Stop session
  const stopSession = useCallback(async () => {
    try {
      await stopListening();
      
      if (sessionIdRef.current) {
        await fetch(`/api/voice/stop/${sessionIdRef.current}`, {
          method: 'POST',
        });
      }
      
      setIsConnected(false);
      sessionIdRef.current = '';
      
      // Clean up audio resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
    } catch (err) {
      setError(`Failed to stop session: ${err}`);
    }
  }, [stopListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Process emergency call
  const processEmergencyCall = useCallback(async (transcriptText: string) => {
    try {
      const response = await fetch('/api/voice/process-emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          session_id: sessionIdRef.current,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to process emergency call');
      }
    } catch (err) {
      setError(`Failed to process emergency call: ${err}`);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  // Generate session ID and establish connection on mount
  useEffect(() => {
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Automatically establish connection when component mounts
    const establishConnection = async () => {
      try {
        console.log('Attempting to establish Deepgram connection...');
        console.log('Session ID:', sessionIdRef.current);
        
        const response = await fetch('/api/voice/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            model,
            language,
            sample_rate: sampleRate,
            channels,
            interim_results: interimResults
          }),
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
          console.log('Deepgram connection established successfully');
          setIsConnected(true);
          setError(null);
        } else {
          console.error('Failed to establish connection:', data.message);
          setError(data.message || 'Failed to establish connection');
        }
      } catch (err) {
        console.error('Error establishing connection:', err);
        setError(`Failed to establish connection: ${err}`);
      }
    };

    establishConnection();
  }, [model, language, sampleRate, channels, interimResults]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isConnected,
    error,
    startListening,
    stopListening,
    stopSession,
    resetTranscript,
    processEmergencyCall,
  };
};
