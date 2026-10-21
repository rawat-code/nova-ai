import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
        <Loader2 className="size-6 animate-spin text-cyan-400" />
      </div>

      <p className="mt-4 text-xs font-medium text-slate-300">
        Loading workspace data...
      </p>
    </div>
  );
}
