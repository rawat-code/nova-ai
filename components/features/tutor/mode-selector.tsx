"use client";

import React from "react";
import { TUTOR_MODES, type TutorMode } from "@/lib/ai/modes";
import { Sparkles, Layers, HelpCircle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  currentMode: TutorMode;
  onSelectMode: (mode: TutorMode) => void;
  disabled?: boolean;
}

const MODE_ICONS: Record<TutorMode, React.ComponentType<{ className?: string }>> = {
  explain: Sparkles,
  deep: Layers,
  socratic: HelpCircle,
  exam: GraduationCap,
};

export function ModeSelector({ currentMode, onSelectMode, disabled }: ModeSelectorProps) {
  const modes: TutorMode[] = ["socratic", "explain", "deep", "exam"];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl border border-white/10 bg-[#080b18]/80 backdrop-blur-xl">
      {modes.map((modeId) => {
        const config = TUTOR_MODES[modeId];
        const Icon = MODE_ICONS[modeId];
        const isActive = currentMode === modeId;

        return (
          <button
            key={modeId}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMode(modeId)}
            className={cn(
              "group relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 outline-none",
              isActive
                ? "bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-indigo-500/20 text-white border border-cyan-400/40 shadow-[0_0_15px_rgba(0,245,212,0.2)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title={config.description}
          >
            <Icon
              className={cn(
                "size-3.5 transition-transform group-hover:scale-110",
                isActive ? config.color : "text-slate-500"
              )}
            />
            <span>{config.name}</span>
            {isActive && (
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
