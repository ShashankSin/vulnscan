"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validationSchema";
import { useAuthHandler } from "@/lib/useAuthHandler";
import LinkComponent from "@/components/ui/Link";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Grid background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,65,.05)_25%,rgba(0,255,65,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,65,.05)_75%,rgba(0,255,65,.05)_76%,transparent_77%,transparent)] bg-size-[50px_50px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Terminal header */}
        <div className="border border-accent/30 rounded-none mb-8 p-4 terminal-border bg-card/50">
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="w-5 h-5 text-accent glow-accent" />
            <span className="font-mono text-sm text-accent glow-text">
              VULNSCAN.AUTH
            </span>
            <span className="text-xs text-muted-foreground ml-auto">v1.0</span>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">
                $ OPERATOR_EMAIL
              </Label>
              <Input
                type="email"
                placeholder="agent@vulnscan.io"
                {...register("email")}
                className="bg-background/50 border-accent/20 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm h-10 rounded-none focus-visible:ring-accent focus-visible:border-accent"
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-mono">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                $ SECURITY_PASSPHRASE
              </label>
              <Input
                type="password"
                placeholder="••••••••••••••••"
                {...register("password")}
                className="bg-background/50 border-accent/20 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm h-10 rounded-none focus-visible:ring-accent focus-visible:border-accent"
                required
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-mono">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 text-muted-foreground hover:text-accent cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>remember_session</span>
              </label>
              <LinkComponent
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                forgot_passphrase
              </LinkComponent>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-sm h-10 rounded-none disabled:opacity-50"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin">⟳</span>
                  AUTHENTICATING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  AUTHENTICATE <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Status line */}
            <div className="pt-2 border-t border-accent/20">
              <p className="font-mono text-xs text-muted-foreground text-center">
                // Connection: SECURE | Protocol: TLS 1.3
              </p>
            </div>
          </form>
        </div>

        {/* Sign up link */}
        <div className="text-center font-mono text-xs text-muted-foreground">
          new_operator?{" "}
          <LinkComponent
            href="/register"
            className="text-accent hover:glow-text transition-colors"
          >
            create_account
          </LinkComponent>
        </div>
      </div>
    </div>
  );
}
