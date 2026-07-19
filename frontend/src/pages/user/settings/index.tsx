"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="first-name"
                    defaultValue="John"
                    className="border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="last-name"
                    defaultValue="Doe"
                    className="border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john@example.com"
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground">
                  Company
                </Label>
                <Input
                  id="company"
                  defaultValue="Tech Corp"
                  className="border-border"
                />
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how you receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Critical Threats</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when critical threats are found
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Scan Completed</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your scans complete
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly security reports
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Marketing and product updates
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password regularly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-foreground">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="border-border"
                />
              </div>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border  bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
