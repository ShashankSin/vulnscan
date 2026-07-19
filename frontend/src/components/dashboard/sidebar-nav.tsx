"use client";

import {
  Terminal,
  Shield,
  ChevronLeft,
  LayoutDashboard,
  History,
  Settings,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import LinkComponent from "../ui/Link";

interface SidebarNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarNav({ isOpen, onToggle }: SidebarNavProps) {
  const location = useLocation(); // get current path
  const currentPath = location.pathname;

  // Detect if user or admin dashboard
  const isAdmin = currentPath.startsWith("/admin");

  const userMenuItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Scan History",
      href: "/dashboard/scans",
      icon: History,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminMenuItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Scans",
      href: "/admin/scans",
      icon: Shield,
    },
    {
      label: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Reports",
      href: "/admin/reports",
      icon: FileText,
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <LinkComponent
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="p-2 bg-accent rounded-lg shrink-0">
            <Terminal className="w-5 h-5 text-accent-foreground" />
          </div>
          {isOpen && (
            <span className="font-mono font-bold text-lg text-accent glow-text">
              VULNSCAN
            </span>
          )}
        </LinkComponent>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;

          return (
            <LinkComponent
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </LinkComponent>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="w-full"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4 rotate-180" />
          )}
        </Button>
      </div>
    </div>
  );
}
