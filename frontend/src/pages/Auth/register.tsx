"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validationSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ArrowRight,
  Mail,
  User,
  Lock,
  CheckCircle,
} from "lucide-react";
import { useAuthHandler } from "@/lib/useAuthHandler";
import { AuthLayout } from "@/components/Auth/AuthLayout";
type RegisterFormData = RegisterInput & { confirmPassword: string };
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
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const passwordChecks = {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
  const isPasswordStrong =
    passwordChecks.hasLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasNumber;
  const passwordMatch =
    confirmPassword.length === 0 || password === confirmPassword;
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of teams securing their web applications"
      switchText="Already have an account?"
      switchLink="/login"
    >
      <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="text-sm font-medium text-foreground"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              {...register("fullName")}
              className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${errors.fullName ? "border-destructive" : ""}`}
              disabled={isRegistering}
            />
          </div>
          {errors.fullName && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.fullName.message}</span>
            </div>
          )}
        </div>
        {/* Email */}
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
              className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${errors.email ? "border-destructive" : ""}`}
              disabled={isRegistering}
            />
          </div>
          {errors.email && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>
        {/* Password */}
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
              placeholder="Create a strong password"
              {...register("password")}
              className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${errors.password ? "border-destructive" : ""}`}
              disabled={isRegistering}
            />
          </div>
          {errors.password && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.password.message}</span>
            </div>
          )}
          {/* Password Strength */}
          {password.length > 0 && (
            <div className="space-y-2 mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-foreground">
                Password requirements:
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle
                    className={`w-4 h-4 ${passwordChecks.hasLength ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span
                    className={
                      passwordChecks.hasLength
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle
                    className={`w-4 h-4 ${passwordChecks.hasUppercase ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span
                    className={
                      passwordChecks.hasUppercase
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle
                    className={`w-4 h-4 ${passwordChecks.hasNumber ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span
                    className={
                      passwordChecks.hasNumber
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }
                  >
                    One number
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={`pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground ${errors.confirmPassword || !passwordMatch ? "border-destructive" : ""}`}
              disabled={isRegistering}
            />
          </div>
          {errors.confirmPassword ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.confirmPassword.message}</span>
            </div>
          ) : (
            !passwordMatch &&
            confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>Passwords do not match</span>
              </div>
            )
          )}
        </div>
        {/* Terms */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-border bg-card text-accent mt-1"
            disabled={isRegistering}
            required
          />
          <span className="text-sm text-muted-foreground">
            I agree to the
            <a
              href="#"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Terms of Service
            </a>
            and
            <a
              href="#"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mt-6"
          disabled={isRegistering || !isPasswordStrong || !passwordMatch}
        >
          {isRegistering ? (
            <>
              <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
      {/* Social Signup */}
      <div className="mt-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            disabled={isRegistering}
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
            disabled={isRegistering}
          >
            Google
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
