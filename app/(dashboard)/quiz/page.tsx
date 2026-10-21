"use client";

import React, { useState } from "react";
import { Sparkles, Plus, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizGeneratorModal } from "@/components/features/quiz/quiz-generator-modal";
import { QuizRunner, type QuizSubmissionPayload } from "@/components/features/quiz/quiz-runner";
import { QuizResults } from "@/components/features/quiz/quiz-results";
import { QuizHistory, type PastAttempt } from "@/components/features/quiz/quiz-history";
import type { GeneratedQuiz } from "@/lib/ai/quiz-generator";

export default function QuizPage() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<(GeneratedQuiz & { id?: string }) | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmissionPayload | null>(null);

  const handleQuizGenerated = (quiz: GeneratedQuiz & { id?: string }) => {
    setQuizResult(null);
    setActiveQuiz(quiz);
  };

  const handleQuizComplete = async (payload: QuizSubmissionPayload) => {
    setActiveQuiz(null);
    setQuizResult(payload);

    // Save attempt to Supabase
    if (payload.quizId) {
      try {
        await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: payload.quizId,
            answers: payload.answers,
            score: payload.score,
          }),
        });
      } catch (err) {
        console.error("Failed to save quiz attempt:", err);
      }
    }
  };

  const handleRetake = () => {
    if (quizResult?.questions) {
      setActiveQuiz({
        title: "Retake Quiz",
        topic: "Review",
        difficulty: "adaptive",
        questions: quizResult.questions,
        id: quizResult.quizId,
      });
      setQuizResult(null);
    }
  };

  const handleReviewPastQuiz = (pastQuiz: PastAttempt["quizzes"]) => {
    setActiveQuiz({
      title: `${pastQuiz.topic} (${pastQuiz.difficulty})`,
      topic: pastQuiz.topic,
      difficulty: pastQuiz.difficulty as "easy" | "medium" | "hard" | "adaptive",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: pastQuiz.questions as any,
      id: pastQuiz.id,
    });
    setQuizResult(null);
  };

  // 1. Active Quiz Taking View
  if (activeQuiz) {
    return (
      <div className="py-6">
        <QuizRunner
          quiz={activeQuiz}
          onComplete={handleQuizComplete}
          onExit={() => setActiveQuiz(null)}
        />
      </div>
    );
  }

  // 2. Quiz Results Screen
  if (quizResult) {
    return (
      <div className="py-6">
        <QuizResults
          payload={quizResult}
          onRetake={handleRetake}
          onBackToHub={() => setQuizResult(null)}
        />
      </div>
    );
  }

  // 3. Main Hub Screen
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Adaptive Quizzes
            </h1>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
              Active Recall
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Synthesize MCQs, short answers, and true/false tests that adapt dynamically to your mastery level.
          </p>
        </div>

        <Button
          onClick={() => setIsGeneratorOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:opacity-95"
        >
          <Plus className="mr-2 size-4" />
          Create New Quiz
        </Button>
      </div>

      {/* Quick Launch Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0a0d18] to-purple-950/30 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 max-w-xl">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Zap className="size-3.5" /> Adaptive Engine Ready
          </span>
          <h2 className="font-display mt-2 text-xl font-bold text-white sm:text-2xl">
            Test yourself on your latest notes
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            The adaptive engine analyzes your recent performance to generate questions calibrated precisely to the edge of your knowledge.
          </p>
          <div className="mt-5 flex gap-3">
            <Button
              onClick={() => setIsGeneratorOpen(true)}
              className="bg-indigo-600 font-semibold text-xs sm:text-sm text-white hover:bg-indigo-500"
            >
              <Sparkles className="mr-2 size-4" />
              Quick Quiz
            </Button>
          </div>
        </div>
      </div>

      {/* Past Quiz History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">
            Quiz History & Performance
          </h3>
          <span className="text-xs text-slate-400">
            Past attempts stored with RLS
          </span>
        </div>

        <QuizHistory onSelectQuiz={handleReviewPastQuiz} />
      </div>

      {/* Quiz Generator Modal */}
      <QuizGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onQuizGenerated={handleQuizGenerated}
      />
    </div>
  );
}
