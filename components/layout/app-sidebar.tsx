"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrandLogo } from "./brand-logo";
import { signOutUser } from "@/lib/supabase/auth";
import {
  LayoutDashboard,
  MessageSquareCode,
  BookOpen,
  HelpCircle,
  Layers,
  Calendar,
  Timer,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Tutor", href: "/tutor", icon: MessageSquareCode, badge: "Gemini" },
  { label: "Notes Vault", href: "/vault", icon: BookOpen },
  { label: "Quizzes", href: "/quiz", icon: HelpCircle },
  { label: "Flashcards", href: "/flashcards", icon: Layers, badge: "SM-2" },
  { label: "Study Planner", href: "/planner", icon: Calendar },
  { label: "Focus Room", href: "/focus", icon: Timer },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/[0.08] bg-[#070914]/90 backdrop-blur-2xl transition-all duration-300 ease-in-out z-30 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header with Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.08]">
        <BrandLogo
          href="/dashboard"
          iconOnly={isCollapsed}
          size={isCollapsed ? "sm" : "md"}
        />

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
                isActive
                  ? "text-cyan-300"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-xl border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,245,212,0.15)]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <Icon
                className={cn(
                  "relative z-10 size-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-cyan-300" : "text-slate-400 group-hover:text-white"
                )}
              />

              {!isCollapsed && (
                <div className="relative z-10 flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Spaced Learning / DNA Status Indicator */}
      {!isCollapsed && (
        <div className="mx-3 my-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-400" />
              <span>Cognitive Streak</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">5 Days</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
          </div>
        </div>
      )}

      {/* User Profile & Sign Out Footer */}
      <div className="p-3 border-t border-white/[0.08]">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 bg-white/[0.03] border border-white/[0.06]",
            isCollapsed && "justify-center p-2"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-semibold text-xs shadow-md">
            <User className="size-4" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">Nova Scholar</p>
              <p className="truncate text-[11px] text-slate-400 font-mono">scholar@nova.ai</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
