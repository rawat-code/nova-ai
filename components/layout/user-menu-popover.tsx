"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOutUser } from "@/lib/supabase/auth";
import {
  User,
  Settings,
  Timer,
  Calendar,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

export function UserMenuPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState("Scholar");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load cached profile or email from local state / fetch
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.full_name) {
          setUserName(data.profile.full_name);
        }
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

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

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOutUser();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed:", err);
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user profile menu"
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 rounded-xl border p-1 sm:px-2 sm:py-1 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          isOpen
            ? "border-cyan-500/40 bg-cyan-500/10 text-white"
            : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]"
        }`}
        title="Scholar Profile"
      >
        <div className="relative flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
          {getInitials(userName)}
          <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#05060b]" />
        </div>
        <span className="hidden md:inline-block text-xs font-medium text-slate-200 max-w-[100px] truncate">
          {userName}
        </span>
        <ChevronDown
          className={`hidden md:inline-block size-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-cyan-300" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-white/15 bg-[#090b16] shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 z-50"
          >
            {/* User Info Header */}
            <div className="border-b border-white/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md">
                  {getInitials(userName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white truncate">{userName}</p>
                    <ShieldCheck className="size-3.5 text-cyan-400 shrink-0" />
                  </div>
                  {userEmail ? (
                    <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
                  ) : (
                    <p className="text-[10px] font-mono text-cyan-300">Nova Scholar // Active</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Shortcuts */}
            <div className="p-1.5 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Settings className="size-4 text-cyan-400" />
                <span>Account & AI Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/focus");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Timer className="size-4 text-indigo-400" />
                <span>Focus Room & Pomodoro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/planner");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Calendar className="size-4 text-emerald-400" />
                <span>Study Schedule Planner</span>
              </button>
            </div>

            {/* Sign Out Action */}
            <div className="border-t border-white/10 p-1.5">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors disabled:opacity-50"
              >
                <LogOut className="size-4 text-rose-400" />
                <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
