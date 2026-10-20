import React from "react";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit } from "lucide-react";

export default function TutorPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(0,245,212,0.2)]">
        <BrainCircuit className="size-7" />
      </div>
      <Badge variant="default" className="mt-5">
        Phase 3 Target
      </Badge>
      <h2 className="font-display mt-3 text-2xl font-bold text-white tracking-tight">
        Adaptive AI Tutor Interface
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Streaming Socratic & Exam prep tutoring with multi-modal LaTeX and code rendering powered by Google Gemini.
      </p>
    </div>
  );
}
