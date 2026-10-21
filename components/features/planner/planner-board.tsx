"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Circle,
  GripVertical,
  BookOpen,
  Code,
  RotateCcw,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type StudyPlanSchedule,
  type PlanTask,
  rescheduleTask,
  toggleTaskInSchedule,
} from "@/lib/study/planner";

interface PlannerBoardProps {
  schedule: StudyPlanSchedule;
  planId?: string;
  onUpdateSchedule: (updated: StudyPlanSchedule) => Promise<void>;
  onDeletePlan: () => Promise<void>;
}

export function PlannerBoard({
  schedule,
  onUpdateSchedule,
  onDeletePlan,
}: PlannerBoardProps) {
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState("");
  const [diffDays, setDiffDays] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    setTodayStr(today.toISOString().split("T")[0]);
    const examDate = new Date(schedule.targetDate);
    const diff = Math.max(
      0,
      Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    setDiffDays(diff);
  }, [schedule.targetDate]);

  // Calculate completion statistics
  let totalTasks = 0;
  let completedTasks = 0;
  let totalMinutes = 0;
  let completedMinutes = 0;

  schedule.days.forEach((day) => {
    day.tasks.forEach((task) => {
      totalTasks++;
      totalMinutes += task.durationMinutes;
      if (task.completed) {
        completedTasks++;
        completedMinutes += task.durationMinutes;
      }
    });
  });

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Toggle completion
  const handleToggleTask = async (taskId: string) => {
    const { updatedSchedule } = toggleTaskInSchedule(schedule, taskId);
    await onUpdateSchedule(updatedSchedule);
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, sourceDate: string) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ taskId, sourceDate })
    );
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    if (dragOverDate !== date) {
      setDragOverDate(date);
    }
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    setDragOverDate(null);

    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const { taskId, sourceDate } = JSON.parse(raw);
      if (sourceDate === targetDate) return;

      const updated = rescheduleTask(schedule, taskId, sourceDate, targetDate);
      await onUpdateSchedule(updated);
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const getTaskIcon = (type: PlanTask["type"]) => {
    switch (type) {
      case "practice":
        return <Code className="size-3 text-cyan-400" />;
      case "review":
        return <RotateCcw className="size-3 text-purple-400" />;
      case "quiz":
        return <HelpCircle className="size-3 text-amber-400" />;
      case "reading":
      default:
        return <BookOpen className="size-3 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-950/40 via-[#0a121d]/80 to-[#101924]/70 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                Active Roadmap
              </span>
              <span className="text-xs text-slate-400">
                Target: {schedule.targetDate}{diffDays !== null ? ` (${diffDays} ${diffDays === 1 ? "day" : "days"} remaining)` : ""}
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              {schedule.examName}
            </h2>

            {schedule.overview && (
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {schedule.overview}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDeletePlan}
              className="border-rose-500/20 bg-rose-950/10 text-xs text-rose-300 hover:bg-rose-900/30 hover:text-rose-200"
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Reset Plan
            </Button>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] text-slate-400">Progress</span>
            <p className="font-display mt-0.5 text-lg font-bold text-emerald-400">
              {completionPercent}%
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] text-slate-400">Tasks Completed</span>
            <p className="font-display mt-0.5 text-lg font-bold text-white">
              {completedTasks} / {totalTasks}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] text-slate-400">Target Pace</span>
            <p className="font-display mt-0.5 text-lg font-bold text-cyan-300">
              {schedule.weeklyHours}h / week
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <span className="text-[11px] text-slate-400">Time Mastered</span>
            <p className="font-display mt-0.5 text-lg font-bold text-purple-300">
              {Math.round((completedMinutes / 60) * 10) / 10}h / {Math.round((totalMinutes / 60) * 10) / 10}h
            </p>
          </div>
        </div>
      </div>

      {/* Drag-to-reschedule Instructions */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <p className="flex items-center gap-1.5">
          <GripVertical className="size-3.5 text-slate-500" />
          <span>Tip: Drag any task card between days to reschedule your study load.</span>
        </p>
        <span className="font-mono text-[11px] text-slate-500">
          {schedule.days.length} Days Scheduled
        </span>
      </div>

      {/* Day-by-Day Calendar Board */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {schedule.days.map((day) => {
          const isToday = todayStr ? day.date === todayStr : false;
          const isOver = dragOverDate === day.date;
          const dayCompletedTasks = day.tasks.filter((t) => t.completed).length;

          return (
            <div
              key={day.date}
              onDragOver={(e) => handleDragOver(e, day.date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day.date)}
              className={`flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200 min-h-[220px] ${
                isOver
                  ? "border-emerald-500 bg-emerald-950/30 scale-[1.01]"
                  : isToday
                  ? "border-cyan-500/40 bg-[#0d1627]/80 shadow-[0_0_20px_rgba(0,245,212,0.1)]"
                  : "border-white/10 bg-[#0a0d18]/70 hover:border-white/20"
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-sm font-bold text-white">
                        {day.dayOfWeek}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-cyan-500/20 px-2 py-0.2 text-[9px] font-bold text-cyan-300">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {day.date}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {dayCompletedTasks}/{day.tasks.length}
                  </span>
                </div>

                {/* Day Tasks List */}
                <div className="mt-3 space-y-2">
                  {day.tasks.length === 0 ? (
                    <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 text-[11px] text-slate-500">
                      No tasks scheduled
                    </div>
                  ) : (
                    day.tasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id, day.date)}
                        className={`group relative flex items-start gap-2 rounded-xl border p-2.5 transition-all cursor-grab active:cursor-grabbing ${
                          task.completed
                            ? "border-white/5 bg-white/[0.02] opacity-60"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 shrink-0 text-slate-400 transition-colors hover:text-emerald-400"
                          title={task.completed ? "Mark incomplete" : "Mark complete"}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : (
                            <Circle className="size-4" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-medium leading-snug line-clamp-2 ${
                              task.completed
                                ? "text-slate-400 line-through"
                                : "text-white"
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              {getTaskIcon(task.type)}
                              <span className="capitalize">{task.type}</span>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="size-2.5" />
                              {task.durationMinutes}m
                            </span>
                          </div>
                        </div>

                        <GripVertical className="size-3.5 shrink-0 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Day Duration Footer */}
              <div className="mt-3 border-t border-white/5 pt-2 text-right text-[10px] text-slate-500 font-mono">
                Total: {day.tasks.reduce((sum, t) => sum + t.durationMinutes, 0)}m
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
