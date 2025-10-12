import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeepgramVoiceBubble } from "@/components/DeepgramVoiceBubble";
import { ConversationHistory, Message } from "@/components/ConversationHistory";
import { AgentResponseFeed, AgentResponse } from "@/components/AgentResponseFeed";
import { IncidentSummary } from "@/components/IncidentSummary";
import { useDeepgramVoice } from "@/hooks/useDeepgramVoice";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [incidentData, setIncidentData] = useState<{
    incidentType?: string;
    location?: string;
    coordinates?: string;
    severity?: "low" | "medium" | "high" | "critical";
    recommendedUnits?: string[];
    eta?: string;
  }>({});
  const { toast } = useToast();

  const {
    isListening,
    transcript,
    interimTranscript,
    isConnected,
    error,
    startListening,
    stopListening,
    resetTranscript,
    processEmergencyCall,
  } = useDeepgramVoice();

  // Handle voice bubble click
  const handleVoiceClick = () => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Connecting...",
        description: "Establishing connection to Deepgram voice service",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
      toast({
        title: "Listening...",
        description: "Deepgram voice agent is now listening. Speak naturally.",
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

      // Process emergency call with Deepgram
      processEmergencyCall(transcript).then((response) => {
        if (response) {
          handleEmergencyResponse(response);
        }
      });

      // Reset for next input
      resetTranscript();
    }
  }, [transcript, isListening, processEmergencyCall, resetTranscript]);

  // Handle emergency response from Deepgram processing
  const handleEmergencyResponse = async (response: any) => {
    // Clear previous agent responses and incident data
    setAgentResponses([]);
    setIncidentData({});

    // Process agent responses
    const responses: AgentResponse[] = response.agents || [];
    
    // Add agents one by one with realistic timing
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
                message: responses[i].message,
              }
            : r
        )
      );
    }

    // Set incident data
    if (response.incident_data) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIncidentData(response.incident_data);
    }

    // Generate AI response and speak it
    const aiResponse = response.ai_response || "Thank you for reporting. Emergency services have been notified.";
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
        {/* Left Panel: Deepgram Voice Interface */}
        <div className="flex flex-col space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deepgram Voice Agent</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "🔗 Connected" : "🔌 Disconnected"}
                  </Badge>
                  {isListening && (
                    <Badge variant="destructive">
                      🎤 Listening
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered emergency response with Deepgram speech recognition
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deepgram Voice Bubble */}
              <div className="flex flex-col items-center py-6">
                <DeepgramVoiceBubble
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isConnected={isConnected}
                  onClick={handleVoiceClick}
                  error={error}
                />
                {!isListening && !isSpeaking && isConnected && (
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    Click to start speaking with Deepgram AI
                  </p>
                )}
                {!isConnected && !error && (
                  <p className="mt-4 text-sm text-yellow-500 font-medium text-center">
                    Connecting to Deepgram service...
                  </p>
                )}
                {error && (
                  <p className="mt-4 text-sm text-red-500 font-medium text-center">
                    Connection failed. Please check your microphone permissions.
                  </p>
                )}
              </div>

              {/* Live Transcript */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Live Transcript</h3>
                  {isListening && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Deepgram Processing</span>
                    </div>
                  )}
                </div>
                <Card className={isListening ? "border-green-500/50 bg-green-500/5" : ""}>
                  <CardContent className="p-4">
                    <div className="min-h-[80px] max-h-[120px] overflow-y-auto">
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
                          {isListening ? "Deepgram is listening..." : "Transcript will appear here when you speak"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversation History */}
              <div>
                <h3 className="font-semibold mb-3">Conversation History</h3>
                <ConversationHistory messages={messages} />
              </div>

              {/* Incident Summary */}
              <div>
                <IncidentSummary
                  incidentType={incidentData.incidentType}
                  location={incidentData.location}
                  coordinates={incidentData.coordinates}
                  severity={incidentData.severity}
                  recommendedUnits={incidentData.recommendedUnits}
                  eta={incidentData.eta}
                />
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
