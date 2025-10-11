import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox, MapPin, AlertTriangle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AgentResponse {
  agent: "intake" | "geo" | "severity" | "dispatcher";
  message: string;
  status: "analyzing" | "typing" | "complete";
}

interface AgentResponseFeedProps {
  responses: AgentResponse[];
}

const agentConfig = {
  intake: {
    name: "Intake Agent",
    icon: Inbox,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  geo: {
    name: "Geo Locator",
    icon: MapPin,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  severity: {
    name: "Severity Evaluator",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  dispatcher: {
    name: "Dispatcher",
    icon: Radio,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
};

export const AgentResponseFeed = ({ responses }: AgentResponseFeedProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI System Response Feed</CardTitle>
        <p className="text-sm text-muted-foreground">
          Multi-agent coordination in real-time
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-250px)]">
          {responses.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>AI agents will respond here once analysis begins</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => {
                const config = agentConfig[response.agent];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={cn("border-l-4", config.bg)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", config.bg)}>
                            <Icon className={cn("w-5 h-5", config.color)} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">{config.name}</h4>
                              <span
                                className={cn(
                                  "text-xs px-2 py-1 rounded-full",
                                  response.status === "complete"
                                    ? "bg-success/10 text-success"
                                    : "bg-warning/10 text-warning"
                                )}
                              >
                                {response.status === "analyzing" && "Analyzing..."}
                                {response.status === "typing" && (
                                  <span className="flex items-center gap-1">
                                    <span className="animate-pulse">●</span>
                                    <span className="animate-pulse delay-75">●</span>
                                    <span className="animate-pulse delay-150">●</span>
                                  </span>
                                )}
                                {response.status === "complete" && "Complete"}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {response.message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
