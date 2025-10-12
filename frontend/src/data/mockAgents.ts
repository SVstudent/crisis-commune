export interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "responding" | "offline";
  location?: string;
  lastActivity?: string;
  coordinates?: [number, number];
}

export const mockAgents: Agent[] = [
  {
    id: "EMT-001",
    name: "Medical Response Unit Alpha",
    type: "Emergency Medical Technician",
    status: "responding",
    location: "Downtown District",
    lastActivity: "2 min ago",
    coordinates: [-122.4194, 37.7749],
  },
  {
    id: "FIRE-023",
    name: "Fire Response Team Beta",
    type: "Fire Department",
    status: "active",
    location: "Industrial Zone",
    lastActivity: "5 min ago",
    coordinates: [-122.4094, 37.7849],
  },
  {
    id: "POL-117",
    name: "Police Unit Charlie",
    type: "Law Enforcement",
    status: "idle",
    location: "North Precinct",
    lastActivity: "15 min ago",
    coordinates: [-122.4294, 37.7649],
  },
  {
    id: "EMT-042",
    name: "Medical Response Unit Delta",
    type: "Emergency Medical Technician",
    status: "active",
    location: "Central Hospital",
    lastActivity: "1 min ago",
    coordinates: [-122.3994, 37.7949],
  },
  {
    id: "FIRE-088",
    name: "Fire Response Team Echo",
    type: "Fire Department",
    status: "offline",
    location: "Station 5",
    lastActivity: "45 min ago",
    coordinates: [-122.4394, 37.7549],
  },
  {
    id: "POL-203",
    name: "Police Unit Foxtrot",
    type: "Law Enforcement",
    status: "responding",
    location: "Highway Patrol",
    lastActivity: "3 min ago",
    coordinates: [-122.4494, 37.7449],
  },
];
