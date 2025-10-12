import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Ambulance, Clock } from "lucide-react";

interface IncidentSummaryProps {
  incidentType?: string;
  location?: string;
  coordinates?: string;
  severity?: "low" | "medium" | "high" | "critical";
  recommendedUnits?: string[];
  eta?: string;
}

const severityConfig = {
  low: {
    label: "Low",
    color: "bg-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500",
    textColor: "text-yellow-600 dark:text-yellow-400",
  },
  high: {
    label: "High",
    color: "bg-orange-500",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  critical: {
    label: "Critical",
    color: "bg-red-500",
    textColor: "text-red-600 dark:text-red-400",
  },
};

export function IncidentSummary({
  incidentType,
  location,
  coordinates,
  severity,
  recommendedUnits,
  eta,
}: IncidentSummaryProps) {
  const severityInfo = severity ? severityConfig[severity] : null;

  if (!incidentType && !location && !severity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Incident Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No incident data available yet. Analyze an emergency call to see the summary.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Incident Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {incidentType && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Incident Type</p>
              <p className="text-sm font-semibold">{incidentType}</p>
            </div>
          )}

          {location && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </p>
              <p className="text-sm font-semibold">{location}</p>
              {coordinates && (
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {coordinates}
                </p>
              )}
            </div>
          )}

          {severityInfo && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Severity Level</p>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${severityInfo.color}`} />
                <Badge
                  variant="outline"
                  className={`${severityInfo.textColor} border-current`}
                >
                  {severityInfo.label}
                </Badge>
              </div>
            </div>
          )}

          {recommendedUnits && recommendedUnits.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Ambulance className="h-3 w-3" />
                Recommended Units
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendedUnits.map((unit, index) => (
                  <Badge key={index} variant="secondary">
                    {unit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {eta && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimated Response Time
              </p>
              <p className="text-sm font-semibold text-primary">{eta}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
