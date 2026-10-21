"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  BookOpen,
  HelpCircle,
  Layers,
  Flame,
  Clock,
  Calendar,
  Timer,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { StudyTimeChart } from "@/components/features/dashboard/study-time-chart";
import { RecentQuizzesList } from "@/components/features/dashboard/recent-quizzes-list";
import { LearningDnaCard } from "@/components/features/learning-dna/learning-dna-card";
import type { LearningDNAInsights } from "@/lib/study/learning-dna";
import type { StudyPlanSchedule } from "@/lib/study/planner";

interface DashboardData {
  streak: {
    currentStreak: number;
    longestStreak: number;
    isActiveToday: boolean;
  };
  todayMinutes: number;
  totalMinutes: number;
  dueCardsCount: number;
  totalCardsCount: number;
  notesCount: number;
  totalChunksCount: number;
  past7Days: Array<{ day: string; date: string; minutes: number }>;
  quizHistory: Array<{
    id: string;
    score: number;
    completedAt: string;
    topic: string;
    difficulty: string;
  }>;
  learningDNA: LearningDNAInsights;
  activePlan: {
    id: string;
    exam_name: string;
    target_date: string;
    weekly_hours: number;
    schedule: StudyPlanSchedule;
  } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
      })
      .catch((err) => console.warn("Failed to load dashboard metrics:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (isMounted && resData) setData(resData);
      })
      .catch((err) => console.warn("Failed to load dashboard metrics:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const streakCount = data?.streak?.currentStreak || 0;
  const isStreakActive = data?.streak?.isActiveToday || false;

  const statCards = [
    {
      label: "Cognitive Streak",
      value: `${streakCount} ${streakCount === 1 ? "Day" : "Days"}`,
      icon: Flame,
      sub: isStreakActive ? "Active today" : "Complete a session to maintain",
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Today's Focus",
      value: `${data?.todayMinutes || 0}m`,
      icon: Clock,
      sub: `All-time: ${Math.round(((data?.totalMinutes || 0) / 60) * 10) / 10} hours`,
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    },
    {
      label: "SM-2 Review Queue",
      value: `${data?.dueCardsCount || 0} Cards`,
      icon: Layers,
      sub: `${data?.totalCardsCount || 0} total cards in decks`,
      color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    },
    {
      label: "Notes Vault",
      value: `${data?.notesCount || 0} Synced`,
      icon: BookOpen,
      sub: `${data?.totalChunksCount || 0} chunks vector-indexed`,
      color: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    },
  ];

  const modules = [
    {
      title: "AI Tutor Chat",
      desc: "Socratic guidance and grounded exam prep with streaming Gemini responses.",
      href: "/tutor",
      icon: BrainCircuit,
      color: "from-cyan-500/20 to-sky-500/20 text-cyan-300",
    },
    {
      title: "Notes Vault & RAG",
      desc: "Upload lecture notes and query them with grounded source citations.",
      href: "/vault",
      icon: BookOpen,
      color: "from-sky-500/20 to-indigo-500/20 text-sky-300",
    },
    {
      title: "Focus Sanctuary",
      desc: "Pomodoro timer with ambient soundscapes and automated session logging.",
      href: "/focus",
      icon: Timer,
      color: "from-amber-500/20 to-yellow-500/20 text-amber-300",
    },
    {
      title: "Study Planner",
      desc: "AI-paced day-by-day roadmap tailored to your exams and weekly hours.",
      href: "/planner",
      icon: Calendar,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-300",
    },
    {
      title: "Adaptive Quizzes",
      desc: "Reinforce concepts with questions auto-calibrated to your weak spots.",
      href: "/quiz",
      icon: HelpCircle,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-300",
    },
    {
      title: "Spaced Repetition",
      desc: "Master definitions and formulas with SuperMemo SM-2 interval scheduling.",
      href: "/flashcards",
      icon: Layers,
      color: "from-purple-500/20 to-pink-500/20 text-purple-300",
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome & Action Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/40 via-[#0a0f24]/80 to-[#100e29]/70 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <ShieldCheck className="size-3.5" />
              <span>Cognitive Workspace Active</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back to your study sanctum.
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your learning velocity, daily cognitive streak, and personalized Learning DNA insights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={loading}
              className="rounded-xl border-white/15 bg-white/[0.04] text-xs text-slate-300 hover:text-white"
            >
              <RefreshCw className={`mr-1.5 size-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/tutor">
              <Button className="rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-semibold text-xs shadow-md">
                Launch AI Tutor
              </Button>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Real Stats Grid */}
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

      {/* Main Analytics & DNA Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Study Time Chart & Learning DNA */}
        <div className="space-y-6">
          <StudyTimeChart data={data?.past7Days || []} />
          <LearningDnaCard insights={data?.learningDNA} />
        </div>

        {/* Right Column: Active Study Plan & Recent Quizzes */}
        <div className="space-y-6">
          {/* Active Study Plan Quick Card */}
          {data?.activePlan ? (
            <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/80 p-5 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h4 className="font-display text-sm font-bold text-white">
                    Active Study Roadmap
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Deadline: {data.activePlan.target_date}
                  </p>
                </div>

                <Link href="/planner">
                  <Button variant="ghost" size="sm" className="text-xs text-emerald-400 p-0 h-auto">
                    View Planner <ChevronRight className="ml-1 size-3" />
                  </Button>
                </Link>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-display text-sm font-semibold text-white">
                    {data.activePlan.exam_name}
                  </h5>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px]">
                    {data.activePlan.weekly_hours}h / week
                  </Badge>
                </div>
                {data.activePlan.schedule?.overview && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                    {data.activePlan.schedule.overview}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{data.activePlan.schedule?.days?.length || 0} Scheduled Days</span>
                  <Link href="/planner" className="text-emerald-400 hover:underline">
                    Manage Schedule →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0d18]/70 p-6 text-center backdrop-blur-xl">
              <Calendar className="size-6 text-slate-600" />
              <h4 className="font-display mt-2 text-sm font-semibold text-white">
                No active study plan
              </h4>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Paced day-by-day schedules calibrated to your exams and weekly hours.
              </p>
              <Link href="/planner" className="mt-4">
                <Button size="sm" variant="outline" className="border-white/10 text-xs">
                  Create Study Plan
                </Button>
              </Link>
            </div>
          )}

          {/* Recent Quizzes Ledger */}
          <RecentQuizzesList quizzes={data?.quizHistory || []} />
        </div>
      </div>

      {/* Academic Modules Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">Study Modules</h3>
            <p className="text-xs text-slate-400">Interactive learning tools across the Nova ecosystem</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-200 hover:border-cyan-500/30 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <ChevronRight className="size-4 text-slate-600 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <h4 className="font-display text-sm font-semibold text-white group-hover:text-cyan-200 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
