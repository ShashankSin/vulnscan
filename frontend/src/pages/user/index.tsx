"use client";

import { useEffect, useMemo, useState } from "react";
import { scanAPI } from "@/api/scanApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Shield, Clock, AlertCircle, CheckCircle, Search } from "lucide-react";

import { StatCard } from "@/components/status-card/stat-card";
import LinkComponent from "@/components/ui/Link";
import ScanDialog from "@/components/Scan/ScanDialog";

interface Scan {
  id: string;
  url: string;
  timestamp: string;
  results: unknown[];
  severity_summary: Record<string, number> | null;
}

type Severity = "critical" | "high" | "medium" | "low" | "info";

const getHighestSeverity = (
  summary: Record<string, number> | null,
): Severity => {
  if (!summary) return "info";

  if ((summary.critical || 0) > 0) return "critical";
  if ((summary.high || 0) > 0) return "high";
  if ((summary.medium || 0) > 0) return "medium";
  if ((summary.low || 0) > 0) return "low";

  return "info";
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * Fetch scans from API
   */
  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true);

        const data = await scanAPI.listScans();

        setScans(data);
      } catch (error) {
        console.error("Failed to load scans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  /**
   * Search scans
   */
  const filteredScans = useMemo(() => {
    return scans.filter((scan) =>
      scan.url.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [scans, searchQuery]);

  /**
   * Dashboard statistics
   */
  const totalScans = scans.length;

  const criticalIssues = scans.reduce((total, scan) => {
    return total + (scan.severity_summary?.critical || 0);
  }, 0);

  const resolvedIssues = scans.reduce((total, scan) => {
    return total + (scan.severity_summary?.low || 0);
  }, 0);

  const numberOfIssue = (summary: Record<string, number> | null) => {
    if (!summary) return 0;
    return (
      (summary.critical || 0) +
      (summary.high || 0) +
      (summary.medium || 0) +
      (summary.low || 0)
    );
  };

  /**
   * Get severity badge
   */
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "critical":
        return (
          <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30">
            Critical
          </Badge>
        );

      case "high":
        return (
          <Badge className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30">
            High
          </Badge>
        );

      case "medium":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">
            Medium
          </Badge>
        );

      case "low":
        return (
          <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
            Low
          </Badge>
        );

      case "info":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
            Info
          </Badge>
        );

      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="mb-2 text-3xl font-bold text-foreground">
          Security Scans
        </h2>

        <p className="text-muted-foreground">
          Monitor and analyze your web application security scans
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Scans"
          value={totalScans.toString()}
          description="All time scans"
          icon={Shield}
        />

        <StatCard
          title="Critical Threats"
          value={criticalIssues.toString()}
          description="Requires attention"
          icon={AlertCircle}
          trend={{
            value: criticalIssues,
            label: "critical issues",
            positive: false,
          }}
        />

        <StatCard
          title="Resolved Issues"
          value={resolvedIssues.toString()}
          description="Low severity issues"
          icon={CheckCircle}
          trend={{
            value: resolvedIssues,
            label: "resolved",
            positive: true,
          }}
        />

        <StatCard
          title="Avg Scan Time"
          value="4.2m"
          description="Per domain"
          icon={Clock}
        />
      </div>

      {/* SEARCH + NEW SCAN */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Scan History</CardTitle>

            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-9 sm:w-64"
                />
              </div>

              <ScanDialog />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* SCAN COUNT */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredScans.length} of {scans.length} scans
          </div>

          {/* LOADING */}
          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading scan data...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredScans.length === 0 && (
            <div className="rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No scans found</p>
            </div>
          )}

          {/* SCAN TABLE */}
          {!loading && filteredScans.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Domain</TableHead>

                    <TableHead className="text-foreground">Severity</TableHead>

                    <TableHead className="text-foreground">
                      Threats Found
                    </TableHead>

                    <TableHead className="text-foreground">Status</TableHead>

                    <TableHead className="text-foreground">Date</TableHead>

                    <TableHead className="text-right text-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredScans.map((scan) => {
                    const severity = getHighestSeverity(scan.severity_summary);

                    return (
                      <TableRow key={scan.id}>
                        {/* DOMAIN */}
                        <TableCell className="font-medium text-foreground">
                          {scan.url}
                        </TableCell>

                        {/* SEVERITY */}
                        <TableCell>{getSeverityBadge(severity)}</TableCell>

                        {/* THREATS */}
                        <TableCell className="text-foreground">
                          {numberOfIssue(scan.severity_summary) || 0}
                        </TableCell>

                        {/* STATUS */}
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                            Completed
                          </Badge>
                        </TableCell>

                        {/* DATE */}
                        <TableCell className="text-muted-foreground">
                          {formatDate(scan.timestamp)}
                        </TableCell>

                        {/* ACTION */}
                        <TableCell className="text-right">
                          <LinkComponent href={`/dashboard/scans/${scan.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-accent hover:bg-accent/10"
                            >
                              View Report
                            </Button>
                          </LinkComponent>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
