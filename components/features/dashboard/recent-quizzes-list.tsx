"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Award, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizHistoryItem {
  id: string;
  score: number;
  completedAt: string;
  topic: string;
  difficulty: string;
}

interface RecentQuizzesListProps {
  quizzes: QuizHistoryItem[];
}

export function RecentQuizzesList({ quizzes }: RecentQuizzesListProps) {
  if (quizzes.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0a0d18]/70 p-6 text-center backdrop-blur-xl">
        <Inbox className="size-6 text-slate-600" />
        <p className="mt-2 text-xs font-semibold text-white">
          No quiz attempts on record
        </p>
        <p className="mt-1 max-w-xs text-[11px] text-slate-400">
          Take your first adaptive quiz to benchmark comprehension and map topic mastery.
        </p>
        <Link href="/quiz" className="mt-4">
          <Button size="sm" variant="outline" className="border-white/10 text-xs">
            Generate Quiz
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/80 p-5 backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h4 className="font-display text-sm font-bold text-white">
            Recent Assessments
          </h4>
          <p className="text-[11px] text-slate-400">
            Latest quiz scores and difficulty ratings
          </p>
        </div>

        <Link href="/quiz">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-indigo-400 hover:text-indigo-300 p-0 h-auto"
          >
            Take Quiz <ChevronRight className="ml-1 size-3" />
          </Button>
        </Link>
      </div>

      {/* Quiz Attempt Rows */}
      <div className="space-y-2">
        {quizzes.map((quiz) => {
          const isPass = quiz.score >= 70;
          const isHigh = quiz.score >= 85;

          return (
            <div
              key={quiz.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg border ${
                    isHigh
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : isPass
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-rose-500/30 bg-rose-950/20 text-rose-400"
                  }`}
                >
                  <Award className="size-4" />
                </div>

                <div>
                  <p className="font-display text-xs font-semibold text-white line-clamp-1 max-w-[200px] sm:max-w-[260px]">
                    {quiz.topic}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <span className="capitalize">{quiz.difficulty}</span> ·{" "}
                    {new Date(quiz.completedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-mono text-xs font-bold ${
                    isHigh
                      ? "text-emerald-400"
                      : isPass
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {quiz.score}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
