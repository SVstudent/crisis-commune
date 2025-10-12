import { useState } from "react";
import { AgentCard } from "@/components/AgentCard";
import { mockAgents } from "@/data/mockAgents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockAgents.length,
    active: mockAgents.filter((a) => a.status === "active").length,
    responding: mockAgents.filter((a) => a.status === "responding").length,
    idle: mockAgents.filter((a) => a.status === "idle").length,
    offline: mockAgents.filter((a) => a.status === "offline").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Directory</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage all responder agents in the network
        </p>
      </div>

      {/* Status Overview */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={statusFilter === "all" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => setStatusFilter("all")}
        >
          All ({statusCounts.all})
        </Badge>
        <Badge
          variant={statusFilter === "active" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => setStatusFilter("active")}
        >
          Active ({statusCounts.active})
        </Badge>
        <Badge
          variant={statusFilter === "responding" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => setStatusFilter("responding")}
        >
          Responding ({statusCounts.responding})
        </Badge>
        <Badge
          variant={statusFilter === "idle" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => setStatusFilter("idle")}
        >
          Idle ({statusCounts.idle})
        </Badge>
        <Badge
          variant={statusFilter === "offline" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => setStatusFilter("offline")}
        >
          Offline ({statusCounts.offline})
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name, ID, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="responding">Responding</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAgents.length} of {mockAgents.length} agents
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agents found matching your criteria</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
