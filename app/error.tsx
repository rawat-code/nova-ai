"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#05060b] px-4 text-center">
      <div className="relative flex size-20 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-2xl backdrop-blur-xl">
        <AlertTriangle className="size-10" />
      </div>

      <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Unexpected Disruption
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
        Nova encountered an unexpected error while processing this view. Your saved notes and progress remain secure.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-xl border border-white/5 bg-black/40 px-4 py-2 font-mono text-xs text-rose-300">
          {error.message}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          className="bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
        >
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>

        <Link href="/">
          <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">
            <Home className="mr-2 size-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
