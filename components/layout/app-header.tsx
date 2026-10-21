"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Flame, Bell } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dashboard Overview";
    if (path.startsWith("/tutor")) return "Adaptive AI Tutor";
    if (path.startsWith("/vault")) return "Notes Vault & RAG";
    if (path.startsWith("/quiz")) return "Adaptive Quizzes";
    if (path.startsWith("/flashcards")) return "Spaced Repetition Decks";
    if (path.startsWith("/planner")) return "Study Schedule Planner";
    if (path.startsWith("/focus")) return "Focus Room & Pomodoro";
    if (path.startsWith("/settings")) return "Account & AI Settings";
    return "Nova Companion";
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-[#05060b]/80 px-6 backdrop-blur-xl z-20">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-base font-semibold text-white tracking-tight">
          {getPageTitle(pathname)}
        </h1>
        <span className="hidden sm:inline-block text-xs font-mono text-slate-500">•</span>
        <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
          workspace // active
        </span>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette Placeholder */}
        <button
          type="button"
          onClick={() => {}}
          className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-white transition-all shadow-sm"
        >
          <Search className="size-3.5 text-slate-400" />
          <span>Quick search or command...</span>
          <kbd className="ml-2 rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
          <Flame className="size-3.5 fill-amber-400 text-amber-400 animate-pulse" />
          <span>5 Days</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-cyan-400 ring-2 ring-[#05060b]" />
        </button>
      </div>
    </header>
  );
}
