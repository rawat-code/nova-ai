"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CommandPalette } from "./command-palette";
import { NotificationsPopover } from "./notifications-popover";
import { StreakPopover } from "./streak-popover";
import { UserMenuPopover } from "./user-menu-popover";

export function AppHeader() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-[#05060b]/80 px-4 sm:px-6 backdrop-blur-xl z-20">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-display text-base font-semibold text-white tracking-tight truncate">
            {getPageTitle(pathname)}
          </h1>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500">•</span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
            workspace // active
          </span>
        </div>

        {/* Global Interactive Actions on Top Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search & Command Palette Button */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            aria-label="Open command palette search"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 sm:px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title="Search commands or pages (⌘K)"
          >
            <Search className="size-3.5 text-cyan-400" />
            <span className="hidden md:inline">Quick search or command...</span>
            <kbd className="hidden sm:inline-block rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
              ⌘K
            </kbd>
          </button>

          {/* Interactive Streak Popover */}
          <StreakPopover />

          {/* Interactive Notification Bell */}
          <NotificationsPopover />

          {/* Interactive User Account Avatar Menu */}
          <UserMenuPopover />
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}

