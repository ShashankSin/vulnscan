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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Download, MoreHorizontal, Eye } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      id: "1",
      title: "Monthly Security Report - March 2024",
      type: "Monthly",
      createdBy: "System",
      status: "Published",
      date: "2024-03-31",
      downloads: 24,
    },
    {
      id: "2",
      title: "Threat Analysis Q1 2024",
      type: "Quarterly",
      createdBy: "Admin",
      status: "Published",
      date: "2024-03-15",
      downloads: 18,
    },
    {
      id: "3",
      title: "User Activity Report - March 2024",
      type: "Monthly",
      createdBy: "System",
      status: "Draft",
      date: "2024-03-20",
      downloads: 0,
    },
    {
      id: "4",
      title: "Compliance Audit Report",
      type: "Custom",
      createdBy: "John Admin",
      status: "Published",
      date: "2024-03-10",
      downloads: 42,
    },
    {
      id: "5",
      title: "Vulnerability Trends 2024",
      type: "Quarterly",
      createdBy: "Admin",
      status: "Published",
      date: "2024-03-01",
      downloads: 35,
    },
    {
      id: "6",
      title: "System Performance Report - February",
      type: "Monthly",
      createdBy: "System",
      status: "Published",
      date: "2024-02-28",
      downloads: 16,
    },
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Monthly":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
            Monthly
          </Badge>
        );
      case "Quarterly":
        return (
          <Badge className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30">
            Quarterly
          </Badge>
        );
      case "Custom":
        return (
          <Badge className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30">
            Custom
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Published")
      return (
        <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
          Published
        </Badge>
      );
    return (
      <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">
        Draft
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Reports</h2>
        <p className="text-muted-foreground">
          Generate and manage system reports
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Reports ({reports.length})</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10 border-border w-full md:w-64"
                />
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground whitespace-nowrap">
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Title</TableHead>
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Created By</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Downloads</TableHead>
                  <TableHead className="text-right text-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-foreground">
                      {report.title}
                    </TableCell>
                    <TableCell>{getTypeBadge(report.type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.createdBy}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.date}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {report.downloads}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
