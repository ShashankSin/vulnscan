"use client";

import { useEffect, useMemo, useState } from "react";
import { scanAPI } from "@/api/scanApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";

// import Link from "next/link";
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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-red-500";

    case "high":
      return "text-orange-400";

    case "medium":
      return "text-yellow-400";

    case "low":
      return "text-green-400";

    case "info":
      return "text-blue-400";

    default:
      return "text-gray-400";
  }
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

  return (
    <div className=" bg-background">
      <main className="p-4">
        {/* WELCOME */}
        <div className="mb-8">
          <h1 className="mb-2 font-mono text-2xl text-accent glow-text">
            SYSTEM_ONLINE
          </h1>

          <p className="font-mono text-sm text-muted-foreground">
            // Last activity: 2 minutes ago | Operator: User
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Scans"
            value={totalScans.toString()}
            icon={BarChart}
            color="text-blue-400"
            index={1}
          />

          <StatCard
            label="Critical Issues"
            value={criticalIssues.toString()}
            icon={AlertTriangle}
            color="text-red-500"
            index={2}
          />

          <StatCard
            label="Resolved"
            value={resolvedIssues.toString()}
            icon={CheckCircle}
            color="text-green-400"
            index={3}
          />

          <StatCard
            label="Avg Scan Time"
            value="4m 32s"
            icon={Clock}
            color="text-cyan-400"
            index={4}
          />
        </div>

        {/* SEARCH + NEW SCAN */}
        <div className="terminal-border mb-6 border border-accent/30 bg-card/50 p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="$ search_targets..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 rounded-none border-accent/20 bg-background/50 pl-10 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-accent focus-visible:ring-accent"
              />
            </div>

            <ScanDialog />
          </div>
        </div>

        {/* SCAN COUNT */}
        <div className="mb-4 font-mono text-xs text-muted-foreground">
          // SHOWING {filteredScans.length} OF {scans.length} SCANS
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-10 text-center font-mono text-sm text-accent">
            // LOADING_SCAN_DATA...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredScans.length === 0 && (
          <div className="terminal-border border border-accent/30 bg-card/50 p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              // NO_SCANS_FOUND
            </p>
          </div>
        )}

        {/* SCANS */}
        {!loading && (
          <div className="space-y-3">
            {filteredScans.map((scan) => {
              const severity = getHighestSeverity(scan.severity_summary);

              const vulnerabilityCount = scan.results?.length || 0;

              return (
                <div
                  key={scan.id}
                  className="terminal-border group border border-accent/30 bg-card/50 p-4 transition-colors hover:bg-card/80"
                >
                  <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-5">
                    {/* TARGET */}
                    <div>
                      <p className="font-mono text-sm text-foreground transition-colors group-hover:text-accent">
                        {scan.url}
                      </p>

                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {formatDate(scan.timestamp)}
                      </p>
                    </div>

                    {/* SEVERITY */}
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${getSeverityColor(severity)}`}
                      />

                      <span
                        className={`font-mono text-sm ${getSeverityColor(
                          severity,
                        )}`}
                      >
                        {severity.toUpperCase()}
                      </span>
                    </div>

                    {/* VULNERABILITIES */}
                    <div>
                      <p className="font-mono text-sm text-foreground">
                        <span className="text-red-500">
                          {vulnerabilityCount}
                        </span>{" "}
                        vulns detected
                      </p>

                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        issues_found
                      </p>
                    </div>

                    {/* STATUS */}
                    <div>
                      <span className="font-mono text-xs text-green-400">
                        ✓ COMPLETED
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-2">
                      <LinkComponent href={`/dashboard/scans/${scan.id}`}>
                        <Button
                          size="sm"
                          className="rounded-none border-border/30 font-mono text-xs"
                        >
                          REPORT
                        </Button>
                      </LinkComponent>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * STAT CARD
 */
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  index: number;
}

function StatCard({ label, value, icon: Icon, color, index }: StatCardProps) {
  return (
    <div className="terminal-border border border-accent/30 bg-card/50 p-4 transition-colors hover:bg-card/80">
      <div className="mb-3 flex items-start justify-between">
        <Icon className={`h-5 w-5 ${color}`} />

        <span className="font-mono text-xs text-muted-foreground">
          sys.{index}
        </span>
      </div>

      <div className="font-mono">
        <p className="text-2xl font-bold text-foreground">{value}</p>

        <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
