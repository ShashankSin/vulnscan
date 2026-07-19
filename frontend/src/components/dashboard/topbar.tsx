"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell } from "lucide-react";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import LinkComponent from "../ui/Link";
import { USERAUTHAPI } from "@/api/auth";
import { removeUser } from "@/lib/storage";
import { useAuthStore } from "@/store/authStore/authStore";
import Cookies from "js-cookie";
export function Topbar() {
  const { mutate: logout } = USERAUTHAPI.useUserLogout();

  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach((cookie) => Cookies.remove(cookie));
    localStorage.clear();
    removeUser();
    logout();
    useAuthStore.getState().resetAuth();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* Theme toggle */}
          <AnimatedThemeToggler />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  Account
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">
                  john@example.com
                </p>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <LinkComponent href="/dashboard/settings">
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </LinkComponent>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* 🔥 LOGOUT BUTTON */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
