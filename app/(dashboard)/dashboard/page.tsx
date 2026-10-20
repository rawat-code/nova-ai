import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  BookOpen,
  HelpCircle,
  Layers,
  Sparkles,
  Flame,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const statCards = [
    {
      label: "Cognitive Streak",
      value: "5 Days",
      icon: Flame,
      sub: "+1 day from yesterday",
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "SM-2 Review Queue",
      value: "14 Cards",
      icon: Layers,
      sub: "Due for retention today",
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    },
    {
      label: "Notes Vault Documents",
      value: "8 Synced",
      icon: BookOpen,
      sub: "142 chunks vector-indexed",
      color: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    },
    {
      label: "Mastery Index",
      value: "84.2%",
      icon: Sparkles,
      sub: "Top 5% comprehension velocity",
      color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    },
  ];

  const modules = [
    {
      title: "AI Tutor Chat",
      desc: "Engage in Socratic dialogue or exam prep with streaming Gemini responses.",
      href: "/tutor",
      phase: "Phase 3",
      icon: BrainCircuit,
      color: "from-cyan-500/20 to-sky-500/20 text-cyan-300",
    },
    {
      title: "Notes Vault & RAG",
      desc: "Upload course materials and query them with source citations and page numbers.",
      href: "/vault",
      phase: "Phase 4",
      icon: BookOpen,
      color: "from-sky-500/20 to-indigo-500/20 text-sky-300",
    },
    {
      title: "Adaptive Quizzes",
      desc: "Test your knowledge with auto-generated questions matching your weak spots.",
      href: "/quiz",
      phase: "Phase 5",
      icon: HelpCircle,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-300",
    },
    {
      title: "Spaced Repetition Decks",
      desc: "Master facts and definitions with the SuperMemo SM-2 interval expansion algorithm.",
      href: "/flashcards",
      phase: "Phase 5",
      icon: Layers,
      color: "from-purple-500/20 to-pink-500/20 text-purple-300",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-[#0a0f24]/80 to-[#100e29]/70 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <ShieldCheck className="size-3.5" />
              <span>Phase 1 Foundation Operational</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back to your study sanctum.
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              Your layout shell, smooth scrolling engine, Supabase authentication, and design system tokens are active and synchronized.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button variant="outline" className="rounded-xl border-white/15 bg-white/[0.04] text-xs">
                Profile Settings
              </Button>
            </Link>
            <Link href="/tutor">
              <Button className="rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-semibold text-xs shadow-md">
                Launch AI Tutor
              </Button>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <div className={`flex size-8 items-center justify-center rounded-lg border ${stat.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="font-display text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Academic Modules Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">Study Modules</h3>
            <p className="text-xs text-slate-400">Core capabilities defined in NOVA_SPEC.md</p>
          </div>
          <Badge variant="secondary" size="sm">
            Roadmap View
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-200 hover:border-cyan-500/30 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <Badge variant="outline" size="sm">
                    {mod.phase}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h4 className="font-display text-base font-semibold text-white group-hover:text-cyan-200 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
