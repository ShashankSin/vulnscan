"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, AlertCircle, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validationSchema";
import { useAuthHandler } from "@/lib/useAuthHandler";
import { AuthLayout } from "@/components/Auth/AuthLayout";

export default function LoginPage() {
  const { handleLogin, isLoggingIn } = useAuthHandler();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your VulnScan dashboard and manage your security scans"
      switchText="Don't have an account?"
      switchLink="/register"
    >
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                errors.email ? "border-destructive" : ""
              }`}
              disabled={isLoggingIn}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {errors.email.message}
            </div>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${
                errors.password ? "border-destructive" : ""
              }`}
              disabled={isLoggingIn}
            />
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {errors.password.message}
            </div>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-card text-accent"
              disabled={isLoggingIn}
            />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <a
            href="#"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <>
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Social Login */}
      <div className="mt-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            className="border-border text-muted hover:bg-muted/20 hover:text-muted-foreground gap-2 transition-colors"
            disabled={isLoggingIn}
          >
            GitHub
          </Button>
          <Button
            className="border-border text-muted hover:bg-muted/20 hover:text-muted-foreground gap-2 transition-colors"
            disabled={isLoggingIn}
          >
            Google
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
