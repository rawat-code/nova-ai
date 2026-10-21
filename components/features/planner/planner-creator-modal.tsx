"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Sparkles, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudyPlanSchedule } from "@/lib/study/planner";

interface PlannerCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (schedule: StudyPlanSchedule) => void;
}

export function PlannerCreatorModal({
  isOpen,
  onClose,
  onPlanCreated,
}: PlannerCreatorModalProps) {
  const [examName, setExamName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setMinDate(todayStr);

    if (!targetDate) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setTargetDate(defaultDate.toISOString().split("T")[0]);
    }

    // Fetch topics from user's Vault notes
    fetch("/api/notes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.documents) {
          const titles = data.documents.map((d: { title: string }) =>
            d.title.replace(/\.[^/.]+$/, "")
          );
          setAvailableTopics(titles);
          setSelectedTopics(titles);
          if (titles.length > 0 && !examName) {
            setExamName(`${titles[0]} Exam Prep`);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, examName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !targetDate) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // 1. Generate schedule via AI
      const genRes = await fetch("/api/planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName: examName.trim(),
          targetDate,
          weeklyHours,
          topics: selectedTopics,
        }),
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genData.error || "Failed to generate study plan");
      }

      const generatedSchedule: StudyPlanSchedule = genData.schedule;

      // 2. Persist to database
      const saveRes = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_name: examName.trim(),
          target_date: targetDate,
          weekly_hours: weeklyHours,
          schedule: generatedSchedule,
        }),
      });

      if (!saveRes.ok) {
        const saveData = await saveRes.json();
        throw new Error(saveData.error || "Failed to save study plan to database");
      }

      onPlanCreated(generatedSchedule);
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error generating study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0d18] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
            <Calendar className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Create AI Study Plan
            </h3>
            <p className="text-xs text-slate-400">
              Paced day-by-day roadmap designed around your exam deadline and target hours
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Exam or Goal Title
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. Python Intermediate Certification, Physics Midterm..."
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Target Deadline
              </label>
              <input
                type="date"
                value={targetDate}
                min={minDate || undefined}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Weekly Hours</span>
                <span className="text-emerald-400">{weeklyHours}h</span>
              </label>
              <input
                type="range"
                min="3"
                max="35"
                step="1"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="mt-3 w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {availableTopics.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-emerald-400" />
                Include Vault Topics
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {availableTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                        isSelected
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
              className="border-white/10 text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating || !examName.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-black hover:opacity-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Study Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Plan with AI
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
