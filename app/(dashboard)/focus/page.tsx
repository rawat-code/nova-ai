import React from "react";
import { Badge } from "@/components/ui/badge";
import { Timer } from "lucide-react";

export default function FocusPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <Timer className="size-7" />
      </div>
      <Badge variant="outline" className="mt-5">
        Phase 6 Target
      </Badge>
      <h2 className="font-display mt-3 text-2xl font-bold text-white tracking-tight">
        Focus Room & Pomodoro Sanctuary
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Ambient audiovisual focus environment with customizable interval timers and study streak logging.
      </p>
    </div>
  );
}
