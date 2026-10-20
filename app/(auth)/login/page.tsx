"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail, signInWithGoogle } from "@/lib/supabase/auth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const initialError = useMemo(() => {
    if (urlError === "oauth_exchange_failed") {
      return "Google authentication failed. Please try again or use email.";
    }
    if (urlError === "auth_callback_failed") {
      return "Authentication session callback failed. Please retry.";
    }
    return null;
  }, [urlError]);

  const activeError = formError || initialError;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Please enter both your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (!result.success) {
        setFormError(result.error || "Invalid login credentials.");
      } else {
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle(nextUrl);
      if (!result.success) {
        setFormError(result.error || "Could not initialize Google OAuth.");
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Google authentication error.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/85 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <BrandLogo size="lg" />
        <h2 className="font-display mt-4 text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your credentials to access your Nova study sanctum.
        </p>
      </div>

      {/* Error Alert Banner */}
      {activeError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">{activeError}</div>
        </div>
      )}

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isLoading}
        className="w-full h-11 rounded-xl border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white transition-all duration-200 flex items-center justify-center gap-2.5"
      >
        {isGoogleLoading ? (
          <Loader2 className="size-4 animate-spin text-cyan-400" />
        ) : (
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-white/[0.08]" />
        <span className="absolute bg-[#0a0d18] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          Or continue with email
        </span>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="scholar@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isGoogleLoading}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <Link
              href="/login#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert("Password reset is linked to Supabase Auth magic link.");
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isGoogleLoading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 font-semibold text-[#030914] shadow-[0_0_25px_rgba(0,245,212,0.3)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(0,245,212,0.5)] hover:scale-[1.01]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin text-black" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Sign In</span>
              <ArrowRight className="size-4" />
            </div>
          )}
        </Button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Don&apos;t have an account yet?{" "}
        <Link
          href={`/signup${nextUrl !== "/dashboard" ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
          className="font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-cyan-300">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
