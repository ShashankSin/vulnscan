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
import { Search, MoreHorizontal, Lock, Unlock, Trash2 } from "lucide-react";

export default function UsersPage() {
  const users = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "Active",
      plan: "Premium",
      scans: 24,
      joinDate: "2024-02-01",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "Active",
      plan: "Pro",
      scans: 18,
      joinDate: "2024-02-15",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      status: "Suspended",
      plan: "Free",
      scans: 5,
      joinDate: "2024-01-10",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      status: "Active",
      plan: "Premium",
      scans: 32,
      joinDate: "2024-03-01",
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie@example.com",
      status: "Active",
      plan: "Pro",
      scans: 15,
      joinDate: "2024-03-05",
    },
    {
      id: "6",
      name: "Diana Prince",
      email: "diana@example.com",
      status: "Inactive",
      plan: "Free",
      scans: 2,
      joinDate: "2024-01-20",
    },
    {
      id: "7",
      name: "Eve Martinez",
      email: "eve@example.com",
      status: "Active",
      plan: "Premium",
      scans: 41,
      joinDate: "2024-02-10",
    },
    {
      id: "8",
      name: "Frank Miller",
      email: "frank@example.com",
      status: "Active",
      plan: "Pro",
      scans: 22,
      joinDate: "2024-02-28",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30">
            Suspended
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-gray-500/20 text-gray-700 hover:bg-gray-500/30">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Premium":
        return (
          <Badge className="bg-purple-500/20 text-purple-700 hover:bg-purple-500/30">
            Premium
          </Badge>
        );
      case "Pro":
        return (
          <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30">
            Pro
          </Badge>
        );
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          User Management
        </h2>
        <p className="text-muted-foreground">
          Manage all user accounts and permissions
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Users ({users.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Plan</TableHead>
                  <TableHead className="text-foreground">Scans</TableHead>
                  <TableHead className="text-foreground">Join Date</TableHead>
                  <TableHead className="text-right text-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell className="text-foreground">
                      {user.scans}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.joinDate}
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          {user.status === "Active" ? (
                            <DropdownMenuItem className="text-red-600">
                              <Lock className="w-4 h-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <Unlock className="w-4 h-4 mr-2" />
                              Restore User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
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
