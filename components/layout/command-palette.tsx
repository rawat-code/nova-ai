"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  MessageSquareCode,
  BookOpen,
  HelpCircle,
  Layers,
  Calendar,
  Timer,
  Settings,
  Sparkles,
  ArrowRight,
  Upload,
  Play,
  RotateCcw,
  Sliders,
  X,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions";
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  description?: string;
}

const COMMANDS: CommandItem[] = [
  // Navigation
  {
    id: "nav-dash",
    title: "Overview Dashboard",
    category: "Navigation",
    icon: LayoutDashboard,
    href: "/dashboard",
    description: "View cognitive DNA, study metrics, and current streak",
  },
  {
    id: "nav-tutor",
    title: "Adaptive AI Tutor",
    category: "Navigation",
    icon: MessageSquareCode,
    href: "/tutor",
    badge: "Gemini",
    description: "Socratic dialogue and lecture concept walkthroughs",
  },
  {
    id: "nav-vault",
    title: "Notes Vault & RAG",
    category: "Navigation",
    icon: BookOpen,
    href: "/vault",
    description: "Upload PDFs, lecture slides, and search citations",
  },
  {
    id: "nav-quiz",
    title: "Adaptive Quizzes",
    category: "Navigation",
    icon: HelpCircle,
    href: "/quiz",
    description: "Auto-synthesized dynamic multi-choice quizzes",
  },
  {
    id: "nav-cards",
    title: "Spaced Repetition Decks",
    category: "Navigation",
    icon: Layers,
    href: "/flashcards",
    badge: "SM-2",
    description: "SuperMemo-2 calibrated flashcard reviews",
  },
  {
    id: "nav-planner",
    title: "Study Schedule Planner",
    category: "Navigation",
    icon: Calendar,
    href: "/planner",
    description: "Day-by-day paced exam roadmap and time blocks",
  },
  {
    id: "nav-focus",
    title: "Focus Sanctuary",
    category: "Navigation",
    icon: Timer,
    href: "/focus",
    description: "Pomodoro intervals with ambient binaural soundscapes",
  },
  {
    id: "nav-settings",
    title: "Settings & Preferences",
    category: "Navigation",
    icon: Settings,
    href: "/settings",
    description: "Customize AI models, study pacing, and theme",
  },

  // Quick Actions
  {
    id: "act-ask",
    title: "Ask AI Tutor a Question",
    category: "Quick Actions",
    icon: Sparkles,
    href: "/tutor",
    badge: "Action",
    description: "Start a Socratic discussion with your AI companion",
  },
  {
    id: "act-upload",
    title: "Upload & Index Study Notes",
    category: "Quick Actions",
    icon: Upload,
    href: "/vault",
    badge: "Action",
    description: "Add new lecture slides or PDFs to your vault",
  },
  {
    id: "act-quiz",
    title: "Generate New Concept Quiz",
    category: "Quick Actions",
    icon: Play,
    href: "/quiz",
    badge: "Action",
    description: "Synthesize an active recall practice exam",
  },
  {
    id: "act-review",
    title: "Review Due Flashcards",
    category: "Quick Actions",
    icon: RotateCcw,
    href: "/flashcards",
    badge: "Action",
    description: "Clear pending cards scheduled for today",
  },
  {
    id: "act-pomodoro",
    title: "Start 25-Min Deep Focus",
    category: "Quick Actions",
    icon: Timer,
    href: "/focus",
    badge: "Action",
    description: "Begin a timed distraction-free study block",
  },
  {
    id: "act-config",
    title: "Configure AI & Learning DNA",
    category: "Quick Actions",
    icon: Sliders,
    href: "/settings",
    badge: "Action",
    description: "Adjust Gemini model failover and tutor persona",
  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = COMMANDS.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          const target = filteredCommands[selectedIndex];
          onClose();
          router.push(target.href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, router, onClose]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:pt-28">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#090b16] shadow-[0_0_50px_rgba(0,245,212,0.15)] ring-1 ring-white/10 z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="size-4 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search commands, tools, or navigate to a page..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded p-1 text-slate-400 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <p>No commands found matching &quot;{query}&quot;</p>
                  <p className="mt-1 text-slate-500">Try searching &quot;tutor&quot;, &quot;quiz&quot;, &quot;vault&quot;, or &quot;settings&quot;</p>
                </div>
              ) : (
                filteredCommands.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                        isSelected
                          ? "bg-cyan-500/15 text-white shadow-[0_0_20px_rgba(0,245,212,0.15)] border border-cyan-500/30"
                          : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                            isSelected
                              ? "bg-cyan-400/20 border-cyan-400/40 text-cyan-300"
                              : "bg-white/[0.04] border-white/10 text-slate-400 group-hover:text-white"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] uppercase font-mono text-slate-400">
                          {item.category}
                        </span>
                        <ArrowRight
                          className={`size-3.5 transition-transform ${
                            isSelected
                              ? "text-cyan-300 translate-x-1"
                              : "text-slate-400 opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/15 bg-white/[0.06] px-1 py-0.5 font-mono text-[9px]">↑</kbd>
                  <kbd className="rounded border border-white/15 bg-white/[0.06] px-1 py-0.5 font-mono text-[9px]">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                  <span>select</span>
                </span>
              </div>
              <span>Nova Quick Navigator</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
