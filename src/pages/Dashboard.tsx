import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoiceBubble } from "@/components/VoiceBubble";
import { ConversationHistory, Message } from "@/components/ConversationHistory";
import { AgentResponseFeed, AgentResponse } from "@/components/AgentResponseFeed";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Handle voice bubble click
  const handleVoiceClick = () => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({
        title: "Listening...",
        description: "Speak now to report an emergency",
      });
    }
  };

  // Process completed transcripts
  useEffect(() => {
    if (transcript && !isListening) {
      // Add user message
      const userMessage: Message = {
        role: "user",
        content: transcript,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Trigger AI response
      processEmergencyCall(transcript);

      // Reset for next input
      resetTranscript();
    }
  }, [transcript, isListening]);

  // Simulate AI response with text-to-speech
  const processEmergencyCall = async (text: string) => {
    // Clear previous agent responses
    setAgentResponses([]);

    // Simulate agent processing
    const responses: AgentResponse[] = [
      {
        agent: "intake",
        message: "Emergency call received. Analyzing your report for key information...",
        status: "analyzing",
      },
      {
        agent: "geo",
        message: "Determining your location and nearest emergency units...",
        status: "analyzing",
      },
      {
        agent: "severity",
        message: "Evaluating emergency severity level...",
        status: "analyzing",
      },
      {
        agent: "dispatcher",
        message: "Preparing dispatch coordination...",
        status: "analyzing",
      },
    ];

    // Add agents one by one
    for (let i = 0; i < responses.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAgentResponses((prev) => [...prev, { ...responses[i], status: "typing" }]);

      await new Promise((resolve) => setTimeout(resolve, 1200));
      setAgentResponses((prev) =>
        prev.map((r, idx) =>
          idx === i
            ? {
                ...r,
                status: "complete",
                message:
                  i === 0
                    ? "Key details extracted: Multiple injuries reported, intersection location identified, urgent medical assistance required."
                    : i === 1
                    ? "Location confirmed: Jefferson St & 7th Ave. Nearest units: Medic 2 (2.1 mi), Engine 5 (2.8 mi). ETA: 5-7 minutes."
                    : i === 2
                    ? "Severity: HIGH PRIORITY. Multiple casualties with potential life-threatening injuries. Immediate advanced life support required."
                    : "Dispatch confirmed: Medic 2, Engine 5, and Police Unit 12 en route. Backup ambulance requested. Scene coordination established.",
              }
            : r
        )
      );
    }

    // Generate AI response
    const aiResponse = 
      "Thank you for reporting. Emergency services have been notified. Help is on the way. " +
      "Medic 2 and Engine 5 are responding with an estimated arrival time of 5 to 7 minutes. " +
      "Please stay on the line and keep the injured safe.";

    // Speak the response
    speakText(aiResponse);

    // Add assistant message
    await new Promise((resolve) => setTimeout(resolve, 500));
    const assistantMessage: Message = {
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
        {/* Left Panel: Voice Interface */}
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Voice Agent Interface</CardTitle>
                <Badge variant={isListening ? "default" : "secondary"}>
                  {isListening ? "🎤 Listening" : "⏸️ Idle"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Conversational AI 911 operator — Speak naturally
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Bubble */}
              <div className="flex flex-col items-center py-8">
                <VoiceBubble
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onClick={handleVoiceClick}
                />
                {!isListening && !isSpeaking && (
                  <p className="mt-6 text-sm text-muted-foreground text-center">
                    Click to start speaking
                  </p>
                )}
                {isSpeaking && (
                  <p className="mt-6 text-sm text-primary font-medium text-center">
                    AI Operator speaking...
                  </p>
                )}
              </div>

              {/* Live Transcript */}
              {isListening && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Live Transcript</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Recording</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[60px] max-h-[120px] overflow-y-auto">
                      {transcript || interimTranscript ? (
                        <p className="text-sm leading-relaxed">
                          <span className="text-foreground">{transcript}</span>
                          {interimTranscript && (
                            <span className="text-muted-foreground italic">
                              {transcript && " "}
                              {interimTranscript}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Start speaking...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Conversation History */}
              <div>
                <h3 className="font-semibold mb-4">Conversation History</h3>
                <ConversationHistory messages={messages} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Agent Response Feed */}
        <AgentResponseFeed responses={agentResponses} />
      </div>
    </div>
  );
}
