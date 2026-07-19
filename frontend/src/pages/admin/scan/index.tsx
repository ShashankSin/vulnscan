"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ScansPage() {
  const allScans = [
    {
      id: "1",
      user: "John Doe",
      domain: "example.com",
      threats: 3,
      severity: "High",
      status: "Completed",
      date: "2024-03-10",
    },
    {
      id: "2",
      user: "Jane Smith",
      domain: "myapp.io",
      threats: 0,
      severity: "None",
      status: "Completed",
      date: "2024-03-09",
    },
    {
      id: "3",
      user: "Bob Johnson",
      domain: "test-site.app",
      threats: 5,
      severity: "Critical",
      status: "Completed",
      date: "2024-03-08",
    },
    {
      id: "4",
      user: "Alice Brown",
      domain: "secure-app.dev",
      threats: 1,
      severity: "Medium",
      status: "In Progress",
      date: "2024-03-07",
    },
    {
      id: "5",
      user: "Charlie Wilson",
      domain: "api.service.com",
      threats: 2,
      severity: "Medium",
      status: "Completed",
      date: "2024-03-06",
    },
    {
      id: "6",
      user: "Diana Prince",
      domain: "blog.company.org",
      threats: 0,
      severity: "None",
      status: "Completed",
      date: "2024-03-05",
    },
    {
      id: "7",
      user: "Eve Martinez",
      domain: "shop.store.io",
      threats: 4,
      severity: "High",
      status: "Completed",
      date: "2024-03-04",
    },
    {
      id: "8",
      user: "Frank Miller",
      domain: "dashboard.app.dev",
      threats: 1,
      severity: "Low",
      status: "Completed",
      date: "2024-03-03",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/30";
      case "High":
        return "bg-orange-500/20 text-orange-700 hover:bg-orange-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30";
      case "Low":
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30";
      default:
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Global Scans
        </h2>
        <p className="text-muted-foreground">
          Monitor all vulnerability scans across the platform
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Scans ({allScans.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search scans..."
                className="pl-10 border-border w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">User</TableHead>
                  <TableHead className="text-foreground">Domain</TableHead>
                  <TableHead className="text-foreground">Threats</TableHead>
                  <TableHead className="text-foreground">Severity</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-right text-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="text-foreground">
                      {scan.user}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {scan.domain}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {scan.threats}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(scan.severity)}>
                        {scan.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scan.status === "Completed" ? (
                        <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
                          In Progress
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {scan.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:bg-accent/10"
                      >
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
