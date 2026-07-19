"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, Shield, Activity } from "lucide-react";
import { StatCard } from "@/components/status-card/stat-card";

export default function AnalyticsPage() {
  const scanTrendData = [
    { month: "Jan", scans: 400, threats: 240 },
    { month: "Feb", scans: 520, threats: 290 },
    { month: "Mar", scans: 680, threats: 340 },
    { month: "Apr", scans: 750, threats: 380 },
    { month: "May", scans: 890, threats: 450 },
    { month: "Jun", scans: 1200, threats: 520 },
  ];

  const threatDistribution = [
    { name: "Critical", value: 120, fill: "#ef4444" },
    { name: "High", value: 280, fill: "#f97316" },
    { name: "Medium", value: 450, fill: "#eab308" },
    { name: "Low", value: 620, fill: "#3b82f6" },
  ];

  const userGrowthData = [
    { month: "Jan", users: 200 },
    { month: "Feb", users: 350 },
    { month: "Mar", users: 520 },
    { month: "Apr", users: 680 },
    { month: "May", users: 850 },
    { month: "Jun", users: 1248 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Analytics</h2>
        <p className="text-muted-foreground">Platform metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Scan Time"
          value="4.2m"
          description="Per domain"
          icon={Activity}
        />
        <StatCard
          title="Threat Detection Rate"
          value="87.3%"
          description="Success rate"
          icon={Shield}
          trend={{ value: 5, label: "improvement", positive: true }}
        />
        <StatCard
          title="Platform Users"
          value="1,248"
          description="Active users"
          icon={Users}
          trend={{ value: 23, label: "this month", positive: true }}
        />
        <StatCard
          title="Revenue (MTD)"
          value="$24,500"
          description="Subscriptions"
          icon={TrendingUp}
          trend={{ value: 18, label: "vs last month", positive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Trends */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Scan Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scanTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Threat Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Threat Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Growth */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="users" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
