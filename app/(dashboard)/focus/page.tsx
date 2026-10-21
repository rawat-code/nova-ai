"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Flame, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PomodoroTimer } from "@/components/features/focus/pomodoro-timer";

interface StudySessionItem {
  id: string;
  duration_minutes: number;
  mode: string;
  created_at: string;
}

export default function FocusPage() {
  const [sessions, setSessions] = useState<StudySessionItem[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSessionData = useCallback(() => {
    fetch("/api/study-sessions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.sessions) setSessions(data.sessions);
          if (data.streak?.currentStreak !== undefined) {
            setStreakCount(data.streak.currentStreak);
          }
          if (data.todayMinutes !== undefined) {
            setTodayMinutes(data.todayMinutes);
          }
        }
      })
      .catch((err) => console.warn("Failed to load study sessions:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSessionData();
  }, [fetchSessionData]);

  const handleSessionLogged = () => {
    fetchSessionData();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Focus Sanctuary
            </h1>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
              Pomodoro Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Immersive audiovisual study sanctuary with interval pacing and automatic session logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <Flame className="size-4 fill-amber-400" />
            <span>{streakCount} {streakCount === 1 ? "Day" : "Days"} Streak</span>
          </div>
        </div>
      </div>

      {/* Interactive Pomodoro Timer Module */}
      <PomodoroTimer
        onSessionLogged={handleSessionLogged}
        streakCount={streakCount}
        todayMinutes={todayMinutes}
      />

      {/* Focus Session History Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              Recent Focus Logs
            </h3>
            <p className="text-xs text-slate-400">
              Sessions recorded directly to your study ledger
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {sessions.length} recorded
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-xs text-slate-500">
            Loading session ledger...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0a0d18]/50 py-12 text-center backdrop-blur-xl">
            <Inbox className="size-8 text-slate-600" />
            <p className="mt-3 font-display text-sm font-semibold text-white">
              No focus sessions logged yet
            </p>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Start your first 25-minute Pomodoro timer above. Once completed, your focus minutes will be recorded here and count toward your study streak.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0d18]/70 p-3.5 backdrop-blur-md transition-colors hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <p className="font-display text-xs font-semibold text-white capitalize">
                      {session.mode} Session
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(session.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(session.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-semibold text-cyan-400">
                  +{session.duration_minutes}m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
