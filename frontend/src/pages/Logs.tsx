import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Clock, Download } from "lucide-react";
import logsData from "@/data/logs.json";

interface Log {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  confidence: number;
  outcome: string;
}

type SortField = "timestamp" | "agent";
type SortDirection = "asc" | "desc";

export default function Logs() {
  const [logs] = useState<Log[]>(logsData.logs as Log[]);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9)
      return { variant: "default" as const, label: "High" };
    if (confidence >= 0.8)
      return { variant: "secondary" as const, label: "Medium" };
    return { variant: "outline" as const, label: "Low" };
  };

  const sortedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      let comparison = 0;

      if (sortField === "timestamp") {
        comparison =
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortField === "agent") {
        comparison = a.agent.localeCompare(b.agent);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [logs, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "Agent", "Action", "Confidence", "Outcome"].join(","),
      ...sortedLogs.map((log) =>
        [
          log.timestamp,
          log.agent,
          `"${log.action}"`,
          log.confidence,
          `"${log.outcome}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `responderai-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Activity Logs</h1>
          <p className="text-muted-foreground mt-2">
            Chronological record of all agent actions and decisions
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (logs.reduce((sum, log) => sum + log.confidence, 0) /
                  logs.length) *
                  100
              )}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map((log) => log.agent)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRelativeTime(
                logs.sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )[0]?.timestamp || new Date().toISOString()
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full justify-start font-semibold"
                      onClick={() => handleSort("timestamp")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Timestamp
                      <ArrowUpDown className="h-3 w-3 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full justify-start font-semibold"
                      onClick={() => handleSort("agent")}
                    >
                      Agent
                      <ArrowUpDown className="h-3 w-3 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="w-[120px] text-center">
                    Confidence
                  </TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log, index) => {
                  const confidenceBadge = getConfidenceBadge(log.confidence);
                  return (
                    <TableRow
                      key={log.id}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-muted/30"
                      }
                    >
                      <TableCell className="font-mono text-xs">
                        <div>{formatTimestamp(log.timestamp)}</div>
                        <div className="text-muted-foreground mt-1">
                          {formatRelativeTime(log.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {log.agent}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={confidenceBadge.variant}>
                            {confidenceBadge.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(log.confidence * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.outcome}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
