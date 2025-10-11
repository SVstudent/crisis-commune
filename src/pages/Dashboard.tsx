import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentMessage } from "@/components/AgentMessage";
import { IncidentSummary } from "@/components/IncidentSummary";
import { Upload, Play, Pause, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentResponse {
  agent: "intake" | "geo" | "severity" | "dispatcher";
  message: string;
  timestamp: string;
}

export default function Dashboard() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [incidentData, setIncidentData] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file",
          variant: "destructive",
        });
        return;
      }
      setAudioFile(file);
      setIsPlaying(false);
      toast({
        title: "Audio uploaded",
        description: file.name,
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !audioFile) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const simulateAgentAnalysis = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No transcript",
        description: "Please add a transcript or upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAgentResponses([]);
    setIncidentData(null);

    // Simulate agent responses with delays
    const responses: AgentResponse[] = [
      {
        agent: "intake",
        message: "Emergency call received. Analyzing audio transcript for key information: caller location, nature of emergency, and urgency indicators.",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        agent: "geo",
        message: "Location identified: 123 Main Street, Downtown District. Coordinates: 37.7749°N, 122.4194°W. Nearest units: Station 5 (2.3 miles), Station 12 (3.1 miles).",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        agent: "severity",
        message: "Severity analysis complete. Classification: HIGH PRIORITY. Medical emergency detected with potential life-threatening conditions. Immediate response required.",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        agent: "dispatcher",
        message: "Dispatch initiated. Units EMT-042 and FIRE-023 have been notified and are en route. ETA: 4-6 minutes. Police backup requested for scene security.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ];

    for (let i = 0; i < responses.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAgentResponses((prev) => [...prev, responses[i]]);
    }

    // Set incident summary
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIncidentData({
      incidentType: "Medical Emergency - Cardiac Event",
      location: "123 Main Street, Downtown District",
      coordinates: "37.7749°N, 122.4194°W",
      severity: "high",
      recommendedUnits: ["EMT-042", "FIRE-023", "POL-117"],
      eta: "4-6 minutes",
    });

    setIsAnalyzing(false);
    toast({
      title: "Analysis complete",
      description: "All agents have processed the emergency call",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Emergency Response Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Multi-agent AI system for emergency call analysis and dispatch
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Call Simulation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Call Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Audio Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Audio File</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="relative flex-1"
                    onClick={() => document.getElementById("audio-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {audioFile ? audioFile.name : "Upload Audio"}
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    disabled={!audioFile}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {audioFile && (
                  <audio
                    ref={audioRef}
                    src={URL.createObjectURL(audioFile)}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </div>

              {/* Transcript */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Call Transcript</label>
                <Textarea
                  placeholder="Enter or paste emergency call transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>

              {/* Analyze Button */}
              <Button
                onClick={simulateAgentAnalysis}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyze with AI Agents
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Agent Response Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Response Panel</CardTitle>
            </CardHeader>
            <CardContent>
              {agentResponses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Agent responses will appear here during analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentResponses.map((response, index) => (
                    <AgentMessage
                      key={index}
                      agent={response.agent}
                      message={response.message}
                      timestamp={response.timestamp}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Incident Summary Sidebar */}
        <div>
          <IncidentSummary {...incidentData} />
        </div>
      </div>
    </div>
  );
}
