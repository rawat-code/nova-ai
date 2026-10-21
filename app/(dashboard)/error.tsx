"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
        <AlertCircle className="size-8" />
      </div>

      <h2 className="mt-4 font-display text-xl font-bold text-white">
        Failed to load view
      </h2>

      <p className="mt-1.5 max-w-sm text-xs text-slate-400">
        We encountered a problem loading this workspace. Check your internet connection or try refreshing.
      </p>

      {error?.message && (
        <div className="mt-3 max-w-md rounded-lg border border-white/5 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-rose-300">
          {error.message}
        </div>
      )}

      <Button
        onClick={() => reset()}
        className="mt-6 bg-cyan-500 text-xs font-semibold text-black hover:bg-cyan-400"
      >
        <RefreshCw className="mr-1.5 size-3.5" />
        Retry View
      </Button>
    </div>
  );
}
