import React from "react";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export default function FlashcardsPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <Layers className="size-7" />
      </div>
      <Badge variant="violet" className="mt-5">
        Phase 5 Target
      </Badge>
      <h2 className="font-display mt-3 text-2xl font-bold text-white tracking-tight">
        Spaced Repetition Decks
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Active recall study decks with algorithmic SuperMemo SM-2 interval scheduling and daily review queues.
      </p>
    </div>
  );
}
