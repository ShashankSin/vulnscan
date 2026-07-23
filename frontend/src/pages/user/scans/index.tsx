import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import LinkComponent from "@/components/ui/Link";
import { scanAPI } from "@/api/scanApi";

interface Scan {
  id: string;
  url: string;
  timestamp: string;
  results: unknown[];
  severity_summary: Record<string, number> | null;
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const data = await scanAPI.listScans();
        setScans(data);
      } catch (err) {
        console.error("Failed to load scans:", err);
      }
    };

    fetchScans();
  }, []);

  const filteredScans = scans.filter((scan) =>
    scan.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/30 border border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 border border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30 border border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30 border border-green-500/30";
    }
  };

  const getHighestSeverity = (summary: Record<string, number> | null) => {
    if (!summary) return null;
    if (summary.critical > 0) return "critical";
    if (summary.high > 0) return "high";
    if (summary.medium > 0) return "medium";
    if (summary.low > 0) return "low";
    return "info";
  };

  const numberOfIssue = (summary: Record<string, number> | null) => {
    if (!summary) return 0;
    return (
      (summary.critical || 0) +
      (summary.high || 0) +
      (summary.medium || 0) +
      (summary.low || 0)
    );
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Scan History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your vulnerability scans
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 bg-secondary/50 border-border hover:bg-secondary/70 transition-colors"
            placeholder="Search by domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* SCANS TABLE */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg">All Scans</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredScans.length} scan{filteredScans.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {filteredScans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Domain
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Issues
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Severity
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Scanned
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredScans.map((scan) => (
                    <TableRow
                      key={scan.id}
                      className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        {scan.url}
                      </TableCell>

                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-600 border border-green-500/30">
                          ✓ Completed
                        </Badge>
                      </TableCell>

                      <TableCell className="text-foreground font-semibold">
                        {numberOfIssue(scan.severity_summary) || 0}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`capitalize font-medium ${getSeverityColor(
                            getHighestSeverity(scan.severity_summary) || "info",
                          )}`}
                        >
                          {getHighestSeverity(
                            scan.severity_summary,
                          )?.toUpperCase() || "NONE"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(scan.timestamp).toLocaleDateString()} at{" "}
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <LinkComponent
                          href={`/dashboard/scans/${scan.id}`}
                          className="inline-flex items-center gap-1 text-accent hover:gap-2 transition-all text-sm font-medium"
                        >
                          View <ArrowRight className="w-4 h-4" />
                        </LinkComponent>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No scans found. Start by running a new scan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
