"use client";

import { Shield } from "lucide-react";
import LinkComponent from "../ui/Link";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  switchText: string;
  switchLink: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  switchText,
  switchLink,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <LinkComponent
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-accent rounded-lg">
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">VulnScan</span>
          </LinkComponent>
          <AnimatedThemeToggler />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form */}
          {children}

          {/* Switch Auth Page */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {switchText}{" "}
            <LinkComponent
              href={switchLink}
              className="text-accent hover:text-accent/80 font-medium transition-colors"
            >
              {switchLink === "/login" ? "Sign in" : "Create account"}
            </LinkComponent>
          </div>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
}
