"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Calendar, CheckCircle2, ArrowRight } from "lucide-react";

export function StreakPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const days = [
    { label: "M", done: true },
    { label: "T", done: true },
    { label: "W", done: true },
    { label: "T", done: true },
    { label: "F", done: true },
    { label: "S", done: false },
    { label: "S", done: false },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      {/* Clickable Streak Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View study streak progress"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isOpen
            ? "border-amber-500/50 bg-amber-500/20 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/15"
        }`}
        title="Current Cognitive Streak: 5 Days"
      >
        <Flame className="size-3.5 fill-amber-400 text-amber-400 animate-pulse" />
        <span>5 Days</span>
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 sm:w-80 overflow-hidden rounded-2xl border border-amber-500/25 bg-[#090b16] p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Flame className="size-4 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Cognitive Streak</h4>
                  <p className="text-[11px] text-amber-300 font-mono">5 Consecutive Days Active</p>
                </div>
              </div>
            </div>

            {/* Week Progress Circles */}
            <div className="pt-3 pb-2">
              <p className="text-[11px] text-slate-400 mb-2">Weekly Activity</p>
              <div className="flex items-center justify-between gap-1">
                {days.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`flex size-7 items-center justify-center rounded-lg text-xs font-semibold ${
                        day.done
                          ? "bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                          : "bg-white/[0.04] border border-white/10 text-slate-500"
                      }`}
                    >
                      {day.done ? <CheckCircle2 className="size-3.5" /> : day.label}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Milestone */}
            <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 flex items-center gap-2.5">
              <Trophy className="size-4 text-cyan-400 shrink-0" />
              <div className="text-[11px]">
                <p className="text-slate-200 font-medium">Next Milestone: 7-Day Badge</p>
                <p className="text-slate-400">2 more days to unlock the Bronze Scholar tier</p>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/focus");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-indigo-500/20 border border-amber-500/30 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition-all"
            >
              <span>Start Today&apos;s Focus Block</span>
              <ArrowRight className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
