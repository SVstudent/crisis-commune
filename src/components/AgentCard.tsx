import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";

type AgentStatus = "active" | "idle" | "responding" | "offline";

interface AgentCardProps {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  location?: string;
  lastActivity?: string;
}

const statusConfig = {
  active: {
    color: "bg-success",
    label: "Active",
    icon: CheckCircle2,
  },
  idle: {
    color: "bg-muted",
    label: "Idle",
    icon: Clock,
  },
  responding: {
    color: "bg-warning",
    label: "Responding",
    icon: Activity,
  },
  offline: {
    color: "bg-destructive",
    label: "Offline",
    icon: AlertCircle,
  },
};

export function AgentCard({ id, name, type, status, location, lastActivity }: AgentCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        <div className={`absolute top-0 left-0 w-1 h-full ${config.color}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{type}</p>
            </div>
            <Badge variant={status === "active" || status === "responding" ? "default" : "secondary"}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2 text-sm">
            {location && (
              <div className="flex items-center text-muted-foreground">
                <span className="font-medium mr-2">Location:</span>
                {location}
              </div>
            )}
            {lastActivity && (
              <div className="flex items-center text-muted-foreground">
                <span className="font-medium mr-2">Last Activity:</span>
                {lastActivity}
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <span className="font-medium mr-2">ID:</span>
              {id}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
