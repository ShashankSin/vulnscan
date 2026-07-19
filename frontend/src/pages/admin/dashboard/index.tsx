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
import { Users, Shield, Activity, TrendingUp } from "lucide-react";
import { StatCard } from "../../../components/status-card/stat-card";

export default function AdminDashboard() {
  const recentUsers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "Active",
      joinDate: "2024-02-01",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "Active",
      joinDate: "2024-02-15",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      status: "Inactive",
      joinDate: "2024-01-10",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      status: "Active",
      joinDate: "2024-03-01",
    },
  ];

  const recentScans = [
    {
      id: "1",
      user: "John Doe",
      domain: "example.com",
      threats: 3,
      status: "Completed",
      date: "2024-03-10",
    },
    {
      id: "2",
      user: "Jane Smith",
      domain: "myapp.io",
      threats: 0,
      status: "Completed",
      date: "2024-03-09",
    },
    {
      id: "3",
      user: "Bob Johnson",
      domain: "test-site.app",
      threats: 5,
      status: "Completed",
      date: "2024-03-08",
    },
    {
      id: "4",
      user: "Alice Brown",
      domain: "secure-app.dev",
      threats: 1,
      status: "In Progress",
      date: "2024-03-07",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h2>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="1,248"
          description="Active accounts"
          icon={Users}
          trend={{ value: 8, label: "this month", positive: true }}
        />
        <StatCard
          title="Total Scans"
          value="12,456"
          description="All time"
          icon={Shield}
          trend={{ value: 23, label: "vs last month", positive: true }}
        />
        <StatCard
          title="Critical Threats"
          value="43"
          description="Across all users"
          icon={Activity}
          trend={{ value: 5, label: "new this week", positive: false }}
        />
        <StatCard
          title="System Health"
          value="99.8%"
          description="Uptime"
          icon={TrendingUp}
        />
      </div>

      {/* Users Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.status === "Active" ? (
                        <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-700 hover:bg-gray-500/30">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.joinDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">User</TableHead>
                  <TableHead className="text-foreground">Domain</TableHead>
                  <TableHead className="text-foreground">Threats</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScans.map((scan) => (
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
