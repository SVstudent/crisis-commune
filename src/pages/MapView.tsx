import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockAgents } from "@/data/mockAgents";
import { MapPin, Search } from "lucide-react";

export default function MapView() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = mockAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Map View</h1>
        <p className="text-muted-foreground mt-2">
          Geographic visualization of all responder locations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="relative h-[600px] bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Map Integration</h3>
                  <p className="text-muted-foreground max-w-md">
                    Connect Mapbox API to visualize responder locations in real-time.
                    Add your Mapbox token to enable the interactive map.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent List Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agents on Map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{agent.name}</h4>
                        <p className="text-xs text-muted-foreground">{agent.id}</p>
                      </div>
                      <Badge 
                        variant={agent.status === "active" || agent.status === "responding" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {agent.location}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
