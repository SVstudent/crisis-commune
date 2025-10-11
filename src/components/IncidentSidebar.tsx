import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Incident {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  status: "candidate" | "confirmed";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
  description: string;
}

interface IncidentSidebarProps {
  incidents: Incident[];
  onAddIncident: () => void;
  onIncidentClick: (incident: Incident) => void;
}

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

export function IncidentSidebar({
  incidents,
  onAddIncident,
  onIncidentClick,
}: IncidentSidebarProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Active Incidents</span>
          <Badge variant="secondary">{incidents.length}</Badge>
        </CardTitle>
        <Button onClick={onAddIncident} size="sm" className="mt-4 w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Simulated Incident
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No active incidents
          </p>
        ) : (
          incidents.map((incident, index) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onIncidentClick(incident)}
              className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      severityColors[incident.severity]
                    }`}
                  />
                  <Badge
                    variant={
                      incident.status === "confirmed" ? "default" : "outline"
                    }
                    className="text-xs"
                  >
                    {incident.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {incident.id}
                </span>
              </div>

              <h4 className="font-semibold text-sm mb-1">{incident.type}</h4>
              <p className="text-xs text-muted-foreground mb-2">
                {incident.description}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">
                    {incident.location.address}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(incident.timestamp)}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Confidence:
                </span>
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${incident.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {Math.round(incident.confidence * 100)}%
                </span>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
