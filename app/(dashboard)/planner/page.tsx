import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function PlannerPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
        <Calendar className="size-7" />
      </div>
      <Badge variant="outline" className="mt-5">
        Phase 6 Target
      </Badge>
      <h2 className="font-display mt-3 text-2xl font-bold text-white tracking-tight">
        Adaptive Study Planner
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        AI-optimized daily study schedules designed around exams, assignments, and weekly target hours.
      </p>
    </div>
  );
}
