"use client";

import React, { useState, useEffect } from "react";
import { Clock, Inbox } from "lucide-react";

interface StudyDayData {
  day: string;
  date: string;
  minutes: number;
}

interface StudyTimeChartProps {
  data: StudyDayData[];
}

export function StudyTimeChart({ data }: StudyTimeChartProps) {
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const totalMinutes = data.reduce((acc, d) => acc + d.minutes, 0);
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60);

  if (totalMinutes === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0d18]/70 p-6 text-center backdrop-blur-xl">
        <Inbox className="size-6 text-slate-600" />
        <p className="mt-2 text-xs font-semibold text-white">
          No study sessions logged this week
        </p>
        <p className="mt-1 max-w-xs text-[11px] text-slate-400">
          Complete a session in <strong>Focus Mode</strong> to map your weekly time distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/80 p-5 backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h4 className="font-display text-sm font-bold text-white">
            Weekly Focus Volume
          </h4>
          <p className="text-[11px] text-slate-400">
            Study minutes logged across the past 7 days
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
          <Clock className="size-3.5" />
          <span>{totalMinutes} mins total</span>
        </div>
      </div>

      {/* Bar Chart Grid */}
      <div className="flex h-44 items-end justify-between gap-2 pt-6 pb-2 px-2">
        {data.map((day) => {
          const heightPercent = Math.max(8, (day.minutes / maxMinutes) * 100);
          const isToday = todayStr ? day.date === todayStr : false;

          return (
            <div
              key={day.date}
              className="group relative flex flex-1 flex-col items-center justify-end h-full"
            >
              {/* Tooltip on Hover */}
              <div className="pointer-events-none absolute -top-8 z-20 hidden rounded-md border border-white/10 bg-black/90 px-2 py-0.5 text-[10px] font-mono text-white shadow-xl backdrop-blur-md group-hover:block animate-in fade-in-0 duration-150">
                {day.minutes}m
              </div>

              {/* Bar */}
              <div className="w-full max-w-[36px] rounded-t-lg bg-white/5 overflow-hidden flex items-end h-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ease-out ${
                    day.minutes > 0
                      ? isToday
                        ? "bg-gradient-to-t from-cyan-500 via-sky-400 to-indigo-500 shadow-[0_0_15px_rgba(0,245,212,0.3)]"
                        : "bg-gradient-to-t from-indigo-600 to-sky-400 group-hover:from-indigo-500 group-hover:to-cyan-300"
                      : "bg-white/[0.03]"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day Label */}
              <div className="mt-2 text-center">
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "font-bold text-cyan-300" : "text-slate-400"
                  }`}
                >
                  {day.day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
