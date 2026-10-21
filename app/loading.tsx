import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#05060b] px-4">
      <div className="relative flex size-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-2xl backdrop-blur-xl">
        <Sparkles className="size-8 animate-pulse text-cyan-400" />
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-300">
        <Loader2 className="size-4 animate-spin text-cyan-400" />
        <span>Initializing Nova neural workspace...</span>
      </div>
    </div>
  );
}
