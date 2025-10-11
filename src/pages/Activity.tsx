import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  type: "info" | "success" | "warning" | "error";
}

const activityLogs: ActivityLog[] = [
  {
    id: "1",
    timestamp: "2 minutes ago",
    agent: "EMT-001",
    action: "Dispatched to medical emergency at Downtown District",
    type: "warning",
  },
  {
    id: "2",
    timestamp: "5 minutes ago",
    agent: "FIRE-023",
    action: "Successfully resolved fire alarm at Industrial Zone",
    type: "success",
  },
  {
    id: "3",
    timestamp: "8 minutes ago",
    agent: "POL-203",
    action: "En route to traffic incident on Highway 101",
    type: "info",
  },
  {
    id: "4",
    timestamp: "12 minutes ago",
    agent: "EMT-042",
    action: "Arrived at Central Hospital with patient",
    type: "success",
  },
  {
    id: "5",
    timestamp: "15 minutes ago",
    agent: "POL-117",
    action: "Status changed to idle at North Precinct",
    type: "info",
  },
  {
    id: "6",
    timestamp: "18 minutes ago",
    agent: "FIRE-088",
    action: "Connection lost - attempting to reconnect",
    type: "error",
  },
];

const typeConfig = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  success: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  warning: {
    icon: AlertCircle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export default function Activity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-2">
          Real-time activity feed from all agents in the network
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs.map((log) => {
              const config = typeConfig[log.type];
              const Icon = config.icon;
              
              return (
                <div
                  key={log.id}
                  className="flex gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.agent}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{log.action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
