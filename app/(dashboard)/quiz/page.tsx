import React from "react";
import { Badge } from "@/components/ui/badge";
import { HelpCircle } from "lucide-react";

export default function QuizPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
        <HelpCircle className="size-7" />
      </div>
      <Badge variant="violet" className="mt-5">
        Phase 5 Target
      </Badge>
      <h2 className="font-display mt-3 text-2xl font-bold text-white tracking-tight">
        Adaptive Quiz Generator
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Generate MCQs, true/false, and short answer queries synthesized directly from your vault materials.
      </p>
    </div>
  );
}
