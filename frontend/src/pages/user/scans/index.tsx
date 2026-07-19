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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30";
      default:
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Scan History</h2>
        <p className="text-muted-foreground">
          View all your past vulnerability scans
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between gap-4">
            <CardTitle>All Scans</CardTitle>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4" />
                <Input className="pl-10" placeholder="Search domains..." />
              </div>

              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Threats</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>{scan.url}</TableCell>

                  <TableCell>
                    <Badge className="bg-green-500/20 text-green-700">
                      Completed
                    </Badge>
                  </TableCell>

                  <TableCell>{scan.results?.length || 0}</TableCell>

                  <TableCell>
                    <Badge
                      className={getSeverityColor(
                        getHighestSeverity(scan.severity_summary) || "info",
                      )}
                    >
                      {getHighestSeverity(
                        scan.severity_summary,
                      )?.toUpperCase() || "NONE"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(scan.timestamp).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <LinkComponent href={`/dashboard/scans/${scan.id}`}>
                      View
                    </LinkComponent>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
