"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlannerBoard } from "@/components/features/planner/planner-board";
import { PlannerCreatorModal } from "@/components/features/planner/planner-creator-modal";
import type { StudyPlanSchedule } from "@/lib/study/planner";

interface DbStudyPlan {
  id: string;
  exam_name: string;
  target_date: string;
  weekly_hours: number;
  schedule: StudyPlanSchedule;
  created_at: string;
}

export default function PlannerPage() {
  const [activePlan, setActivePlan] = useState<DbStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const loadPlan = useCallback(() => {
    fetch("/api/planner")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.plan) {
          setActivePlan(data.plan);
        } else {
          setActivePlan(null);
        }
      })
      .catch((err) => console.warn("Failed to load planner:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleUpdateSchedule = async (updated: StudyPlanSchedule) => {
    if (!activePlan) return;

    // Optimistically update
    setActivePlan((prev) => (prev ? { ...prev, schedule: updated } : null));

    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activePlan.id,
          exam_name: activePlan.exam_name,
          target_date: activePlan.target_date,
          weekly_hours: activePlan.weekly_hours,
          schedule: updated,
        }),
      });
    } catch (err) {
      console.error("Failed to update schedule in database:", err);
    }
  };

  const handleDeletePlan = async () => {
    if (!confirm("Are you sure you want to delete this study plan?")) return;

    try {
      const res = await fetch(`/api/planner?id=${activePlan?.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setActivePlan(null);
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
    }
  };

  const handlePlanCreated = () => {
    loadPlan();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Adaptive Study Planner
            </h1>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
              AI Paced
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Day-by-day exam schedules calibrated to your deadlines, target hours, and vault notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePlan && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadPlan}
              disabled={loading}
              className="border-white/10 bg-white/5 text-slate-300 hover:text-white"
            >
              <RefreshCw className={`mr-2 size-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          )}

          <Button
            onClick={() => setIsCreatorOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-black shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:opacity-95"
          >
            <Sparkles className="mr-2 size-4" />
            {activePlan ? "New Study Plan" : "Generate Plan with AI"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-xs text-slate-500">
          <RefreshCw className="size-5 animate-spin text-emerald-400 mb-2" />
          Loading your study planner...
        </div>
      ) : activePlan && activePlan.schedule ? (
        <PlannerBoard
          schedule={activePlan.schedule}
          planId={activePlan.id}
          onUpdateSchedule={handleUpdateSchedule}
          onDeletePlan={handleDeletePlan}
        />
      ) : (
        /* Empty State (No Plan Yet) */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#080b16]/70 p-12 text-center shadow-2xl backdrop-blur-xl">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Calendar className="size-8" />
          </div>

          <h3 className="font-display mt-5 text-xl font-bold text-white sm:text-2xl">
            No active study plan scheduled
          </h3>
          <p className="mt-2 max-w-md text-xs text-slate-400 leading-relaxed">
            Enter your upcoming exam or target deadline, along with your available weekly hours. Nova&apos;s AI will synthesize a paced, day-by-day roadmap grounded in your course materials.
          </p>

          <Button
            onClick={() => setIsCreatorOpen(true)}
            className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-black shadow-lg hover:opacity-95"
          >
            <Sparkles className="mr-2 size-4" />
            Generate Study Plan with AI
          </Button>
        </div>
      )}

      {/* Plan Creator Modal */}
      <PlannerCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onPlanCreated={handlePlanCreated}
      />
    </div>
  );
}
