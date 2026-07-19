import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validationSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, ArrowRight } from "lucide-react";
import { useAuthHandler } from "@/lib/useAuthHandler";
import LinkComponent from "@/components/ui/Link";

type RegisterFormData = RegisterInput & {
  confirmPassword: string;
};

export default function RegisterPage() {
  const { handleRegister, isRegistering } = useAuthHandler();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const passwordMatch = !confirmPassword || password === confirmPassword;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,65,.05)_25%,rgba(0,255,65,.05)_26%,transparent_27%,transparent_74%,rgba(0,255,65,.05)_75%,rgba(0,255,65,.05)_76%,transparent_77%,transparent)] bg-[size:50px_50px] pointer-events-none" />

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

          <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                $ FULLNAME
              </label>

              <Input
                type="text"
                placeholder="Your FullName"
                {...register("fullName")}
                className="bg-background/50 border-accent/20 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm h-10 rounded-none focus-visible:ring-accent focus-visible:border-accent"
              />

              {errors.fullName && (
                <p className="text-xs text-red-400 font-mono">
                  // ERROR: {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                $ OPERATOR_EMAIL
              </label>

              <Input
                type="email"
                placeholder="admin@yourcompany.io"
                {...register("email")}
                className="bg-background/50 border-accent/20 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm h-10 rounded-none focus-visible:ring-accent focus-visible:border-accent"
              />

              {errors.email && (
                <p className="text-xs text-red-400 font-mono">
                  // ERROR: {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                $ SECURITY_PASSPHRASE
              </label>

              <Input
                type="password"
                placeholder="••••••••••••••••"
                {...register("password")}
                className="bg-background/50 border-accent/20 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm h-10 rounded-none focus-visible:ring-accent focus-visible:border-accent"
              />

              {errors.password && (
                <p className="text-xs text-red-400 font-mono">
                  // ERROR: {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="font-mono text-xs text-muted-foreground">
                $ CONFIRM_PASSPHRASE
              </label>

              <Input
                type="password"
                placeholder="••••••••••••••••"
                {...register("confirmPassword")}
                className={`bg-background/50 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm h-10 rounded-none focus-visible:ring-accent focus-visible:border-accent ${
                  confirmPassword && !passwordMatch
                    ? "border-red-500"
                    : "border-accent/20"
                }`}
              />

              {confirmPassword && !passwordMatch && (
                <p className="text-xs text-red-400 font-mono">
                  // ERROR: Passphrases do not match
                </p>
              )}

              {errors.confirmPassword && (
                <p className="text-xs text-red-400 font-mono">
                  // ERROR: {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="text-xs font-mono text-muted-foreground pt-2">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="w-4 h-4 mt-0.5" required />

                <span>
                  I agree to the{" "}
                  <LinkComponent
                    href="#"
                    className="text-accent hover:glow-text"
                  >
                    Terms
                  </LinkComponent>{" "}
                  and{" "}
                  <LinkComponent
                    href="#"
                    className="text-accent hover:glow-text"
                  >
                    Privacy Policy
                  </LinkComponent>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={isRegistering || !passwordMatch}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-sm h-10 rounded-none disabled:opacity-50 mt-6"
            >
              {isRegistering ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block animate-spin">⟳</span>
                  REGISTERING...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  CREATE_ACCOUNT
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Status Line */}
            <div className="pt-2 border-t border-accent/20">
              <p className="font-mono text-xs text-muted-foreground text-center">
                // Encryption: AES-256 | Status: ACTIVE
              </p>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center font-mono text-xs text-muted-foreground">
          have_account?{" "}
          <LinkComponent
            href="/login"
            className="text-accent hover:glow-text transition-colors"
          >
            login_now
          </LinkComponent>
        </div>
      </div>
    </div>
  );
}
