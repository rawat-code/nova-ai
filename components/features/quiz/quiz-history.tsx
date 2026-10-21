"use client";

import React, { useEffect, useState } from "react";
import { Brain, Trophy, Calendar, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PastAttempt {
  id: string;
  quiz_id: string;
  score: number;
  completed_at: string;
  quizzes: {
    id: string;
    topic: string;
    difficulty: string;
    questions: Array<{
      id: string;
      question: string;
      correctAnswer: string;
      explanation: string;
      type: string;
    }>;
  };
}

interface QuizHistoryProps {
  onSelectQuiz: (quiz: PastAttempt["quizzes"]) => void;
}

export function QuizHistory({ onSelectQuiz }: QuizHistoryProps) {
  const [history, setHistory] = useState<PastAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetch("/api/quiz/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.history) {
          setHistory(data.history);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center text-slate-500">
        <Loader2 className="mr-2 size-5 animate-spin text-indigo-400" />
        <span className="text-xs">Loading past attempts...</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0a0d18]/40 py-10 text-center">
        <Trophy className="size-8 text-slate-600" />
        <p className="mt-2 text-xs font-medium text-slate-400">No quizzes completed yet</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Generate an adaptive quiz above to test your mastery.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {history.map((attempt) => {
        const quiz = attempt.quizzes;
        if (!quiz) return null;

        const scoreColor =
          attempt.score >= 85
            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            : attempt.score >= 65
            ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
            : "text-amber-400 border-amber-500/30 bg-amber-500/10";

        return (
          <div
            key={attempt.id}
            className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0a0d18]/70 p-4 transition-all hover:border-white/20 hover:bg-[#0c1022]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  {quiz.difficulty}
                </span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-bold font-mono ${scoreColor}`}>
                  {attempt.score}%
                </span>
              </div>

              <h4 className="mt-2 font-display text-sm font-semibold text-white line-clamp-1">
                {quiz.topic}
              </h4>

              <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Brain className="size-3 text-slate-500" />
                  {quiz.questions?.length || 0} questions
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-slate-500" />
                  {new Date(attempt.completed_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-white/5 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectQuiz(quiz)}
                className="h-7 w-full justify-between px-2 text-xs text-slate-300 hover:text-white"
              >
                <span>Review / Retake</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
