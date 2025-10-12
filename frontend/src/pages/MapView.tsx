import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapControls } from "@/components/MapControls";
import { IncidentSidebar } from "@/components/IncidentSidebar";
import incidentsData from "@/data/incidents.json";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

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

interface Resource {
  id: string;
  type: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  assignedTo: string | null;
}

export default function MapView() {
  const [mapboxToken, setMapboxToken] = useState(
    localStorage.getItem("mapbox_token") || ""
  );
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>(
    incidentsData.incidents as Incident[]
  );
  const [resources] = useState<Resource[]>(
    incidentsData.resources as Resource[]
  );
  const [mapStyle, setMapStyle] = useState("streets-v12");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();

  const saveToken = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Token required",
        description: "Please enter your Mapbox access token",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("mapbox_token", mapboxToken);
    setIsTokenSet(true);
    toast({
      title: "Token saved",
      description: "Initializing map...",
    });
  };

  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
  };

  const createMarkers = () => {
    if (!map.current) return;
    clearMarkers();

    // Add incident markers
    incidents.forEach((incident) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      el.style.border = "3px solid white";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

      if (incident.status === "confirmed") {
        el.style.backgroundColor = "#ef4444";
      } else {
        el.style.backgroundColor = "#fca5a5";
      }

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${incident.type}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${incident.description}</p>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 11px; color: #6b7280;"><strong>Severity:</strong> ${incident.severity}</p>
            <p style="font-size: 11px; color: #6b7280;"><strong>Confidence:</strong> ${Math.round(incident.confidence * 100)}%</p>
            <p style="font-size: 11px; color: #6b7280;"><strong>Status:</strong> ${incident.status}</p>
            <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">${incident.location.address}</p>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([incident.location.lng, incident.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Add resource markers
    resources.forEach((resource) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

      if (resource.status === "responding") {
        el.style.backgroundColor = "#3b82f6";
      } else {
        el.style.backgroundColor = "#10b981";
      }

      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${resource.id}</h3>
          <p style="font-size: 12px; color: #6b7280;">Type: ${resource.type}</p>
          <p style="font-size: 12px; color: #6b7280;">Status: ${resource.status}</p>
          ${resource.assignedTo ? `<p style="font-size: 12px; color: #6b7280;">Assigned to: ${resource.assignedTo}</p>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([resource.location.lng, resource.location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      setIsTokenSet(true);
      setMapboxToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!isTokenSet || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-left");

    map.current.on("load", () => {
      createMarkers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isTokenSet, mapboxToken]);

  useEffect(() => {
    if (map.current && isTokenSet) {
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
      map.current.once("styledata", () => {
        createMarkers();
      });
    }
  }, [mapStyle]);

  useEffect(() => {
    if (map.current && isTokenSet) {
      createMarkers();
    }
  }, [incidents]);

  const handleZoomIn = () => {
    map.current?.zoomIn();
  };

  const handleZoomOut = () => {
    map.current?.zoomOut();
  };

  const handleAddIncident = () => {
    const newIncident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, "0")}`,
      type: "Test Incident",
      severity: "medium",
      confidence: 0.88,
      status: "candidate",
      location: {
        lat: 37.7749 + (Math.random() - 0.5) * 0.05,
        lng: -122.4194 + (Math.random() - 0.5) * 0.05,
        address: `${Math.floor(Math.random() * 999) + 1} Test St, San Francisco, CA`,
      },
      timestamp: new Date().toISOString(),
      description: "Simulated test incident",
    };

    setIncidents([...incidents, newIncident]);
    toast({
      title: "Incident added",
      description: newIncident.id,
    });
  };

  const handleIncidentClick = (incident: Incident) => {
    if (map.current) {
      map.current.flyTo({
        center: [incident.location.lng, incident.location.lat],
        zoom: 15,
        duration: 1500,
      });

      // Find and open the popup for this incident
      const marker = markers.current.find((m) => {
        const lngLat = m.getLngLat();
        return (
          lngLat.lat === incident.location.lat &&
          lngLat.lng === incident.location.lng
        );
      });
      marker?.togglePopup();
    }
  };

  if (!isTokenSet) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Map View</h1>
          <p className="text-muted-foreground mt-2">
            Configure Mapbox to visualize incidents and resources
          </p>
        </div>

        <Card className="max-w-xl mx-auto p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Mapbox Configuration</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              To enable the interactive map, you need a Mapbox access token.
              Get yours from{" "}
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Mapbox Dashboard
              </a>
            </p>
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
              <Input
                id="mapbox-token"
                type="password"
                placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbG..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
            </div>
            <Button onClick={saveToken} className="w-full">
              Save Token & Initialize Map
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Map View</h1>
        <p className="text-muted-foreground mt-2">
          Real-time incident tracking and resource deployment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3 relative">
          <div
            ref={mapContainer}
            className="w-full h-[600px] rounded-lg shadow-lg"
          />
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onStyleChange={setMapStyle}
            currentStyle={mapStyle}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <IncidentSidebar
            incidents={incidents}
            onAddIncident={handleAddIncident}
            onIncidentClick={handleIncidentClick}
          />
        </div>
      </div>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-sm">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow" />
            <span>Confirmed Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-300 border-2 border-white shadow" />
            <span>Candidate Incident</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span>Responding Unit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow" />
            <span>Available Unit</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
