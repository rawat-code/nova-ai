"use client";

import React from "react";
import {
  Dna,
  Clock,
  AlertTriangle,
  Sparkles,
  Brain,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LearningDNAInsights } from "@/lib/study/learning-dna";

interface LearningDnaCardProps {
  insights?: LearningDNAInsights | null;
}

export function LearningDnaCard({ insights }: LearningDnaCardProps) {
  const hasData =
    insights &&
    (insights.totalQuizzesTaken > 0 ||
      insights.totalStudyMinutes > 0 ||
      Object.keys(insights.topicMastery || {}).length > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0d18]/70 p-6 text-center backdrop-blur-xl">
        <div className="flex size-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
          <Dna className="size-6 animate-pulse" />
        </div>
        <h4 className="font-display mt-3 text-sm font-semibold text-white">
          Learning DNA Calibrating
        </h4>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Complete your first quiz or focus session. Nova will automatically analyze your strengths, weak spots, and peak focus rhythm.
        </p>
      </div>
    );
  }

  const topicEntries = Object.entries(insights.topicMastery || {});

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/80 p-5 backdrop-blur-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
            <Dna className="size-4" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-white">
              Cognitive Learning DNA
            </h4>
            <p className="text-[11px] text-slate-400">
              Real-time insights derived from your quiz results and study sessions
            </p>
          </div>
        </div>

        <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-[10px]">
          Live Synthesis
        </Badge>
      </div>

      {/* Grid of Key Cognitive Signals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Peak Rhythm */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="size-3.5 text-cyan-400" />
            <span>Optimal Study Rhythm</span>
          </div>
          <p className="font-display mt-1.5 text-sm font-bold text-white">
            {insights.optimalStudyHours.timeOfDay} ({insights.optimalStudyHours.peakHour}:00)
          </p>
          <span className="text-[10px] text-slate-500">
            {insights.optimalStudyHours.totalMinutesLogged}m logged
          </span>
        </div>

        {/* Preferred Style */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Brain className="size-3.5 text-indigo-400" />
            <span>Pedagogical Style</span>
          </div>
          <p className="font-display mt-1.5 text-sm font-bold text-white capitalize">
            {insights.preferredStyle}
          </p>
          <span className="text-[10px] text-slate-500">
            Injected into AI Tutor
          </span>
        </div>

        {/* Overall Mastery */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Comprehension Velocity</span>
          </div>
          <p className="font-display mt-1.5 text-sm font-bold text-amber-300">
            {insights.overallMasteryPercent}%
          </p>
          <span className="text-[10px] text-slate-500">
            Across {topicEntries.length} evaluated {topicEntries.length === 1 ? "topic" : "topics"}
          </span>
        </div>
      </div>

      {/* Weak / Struggling Topics Callout */}
      {insights.strugglingTopics.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
            <span>Target Reinforcement Areas (&lt;70% Mastery)</span>
          </div>
          <p className="text-[11px] text-slate-300">
            The AI Tutor will automatically emphasize foundational first principles for:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {insights.strugglingTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Topic Mastery Breakdown */}
      {topicEntries.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Topic Mastery Breakdown
          </span>
          <div className="space-y-2">
            {topicEntries.slice(0, 5).map(([topicName, item]) => {
              const isMastered = item.status === "mastered";
              const isStruggling = item.status === "struggling";

              return (
                <div key={topicName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white line-clamp-1 max-w-[240px]">
                      {topicName}
                    </span>
                    <span
                      className={`font-mono text-[11px] ${
                        isMastered
                          ? "text-emerald-400"
                          : isStruggling
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {item.averageScore}% ({item.attemptsCount} {item.attemptsCount === 1 ? "test" : "tests"})
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : isStruggling
                          ? "bg-gradient-to-r from-rose-500 to-orange-400"
                          : "bg-gradient-to-r from-amber-500 to-yellow-400"
                      }`}
                      style={{ width: `${Math.min(100, item.averageScore)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
