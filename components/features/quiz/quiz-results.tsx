"use client";

import React, { useState } from "react";
import {
  Trophy,
  RotateCcw,
  Layers,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizSubmissionPayload } from "./quiz-runner";

interface QuizResultsProps {
  payload: QuizSubmissionPayload;
  onRetake: () => void;
  onBackToHub: () => void;
}

export function QuizResults({ payload, onRetake, onBackToHub }: QuizResultsProps) {
  const { score, correctCount, totalCount, questions, answers } = payload;
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcardsCreated, setFlashcardsCreated] = useState(false);

  // Identify missed questions
  const missedQuestions = questions.filter((q) => {
    const userAns = (answers[q.id] || "").trim().toLowerCase();
    const correctAns = q.correctAnswer.trim().toLowerCase();
    return userAns !== correctAns && !correctAns.includes(userAns);
  });

  const getMasteryBadge = (s: number) => {
    if (s >= 90) return { label: "Mastered", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (s >= 70) return { label: "Proficient", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
    return { label: "Review Recommended", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  };

  const mastery = getMasteryBadge(score);

  const handleCreateFlashcardsFromMissed = async () => {
    if (missedQuestions.length === 0 || isGeneratingFlashcards) return;

    setIsGeneratingFlashcards(true);
    try {
      for (const q of missedQuestions) {
        await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: q.question,
            back: `${q.correctAnswer}\n\n*Explanation:* ${q.explanation}`,
            topic: "Quiz Missed Concepts",
          }),
        });
      }
      setFlashcardsCreated(true);
    } catch (err) {
      console.error("Failed to generate flashcards:", err);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in-0 duration-300">
      {/* Score Header Card */}
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0a0d18]/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
          <Trophy className="size-8" />
        </div>

        <span
          className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${mastery.color}`}
        >
          {mastery.label}
        </span>

        <h1 className="font-display mt-2 text-4xl font-extrabold text-white sm:text-5xl">
          {score}%
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          You answered <span className="text-white font-semibold">{correctCount}</span> out of{" "}
          <span className="text-white font-semibold">{totalCount}</span> questions correctly.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={onRetake}
            className="border-white/10 text-xs text-slate-300 hover:text-white"
          >
            <RotateCcw className="mr-2 size-3.5" />
            Retake Quiz
          </Button>

          {missedQuestions.length > 0 && (
            <Button
              onClick={handleCreateFlashcardsFromMissed}
              disabled={isGeneratingFlashcards || flashcardsCreated}
              className="bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500"
            >
              {isGeneratingFlashcards ? (
                <Loader2 className="mr-2 size-3.5 animate-spin" />
              ) : flashcardsCreated ? (
                <CheckCircle2 className="mr-2 size-3.5 text-emerald-400" />
              ) : (
                <Layers className="mr-2 size-3.5" />
              )}
              {flashcardsCreated
                ? "Cards Added to Spaced Repetition"
                : `Create Flashcards (${missedQuestions.length} missed)`}
            </Button>
          )}

          <Button
            onClick={onBackToHub}
            className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-xs font-semibold text-black hover:opacity-95"
          >
            <ArrowLeft className="mr-2 size-3.5" />
            Back to Quiz Hub
          </Button>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white">
          Question Breakdown & Review
        </h3>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const userAns = answers[q.id] || "No answer provided";
            const isCorrect =
              userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
              q.correctAnswer.trim().toLowerCase().includes(userAns.trim().toLowerCase());

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-[#0a0d18]/60 p-5 transition-colors hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-xs text-slate-400">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {q.type}
                    </span>
                  </div>

                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="size-4" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-rose-400">
                      <XCircle className="size-4" /> Incorrect
                    </span>
                  )}
                </div>

                <p className="mt-3 font-display text-sm font-semibold text-white">
                  {q.question}
                </p>

                <div className="mt-3 grid gap-2 rounded-xl bg-black/40 p-3 text-xs sm:grid-cols-2">
                  <div>
                    <span className="text-slate-500">Your Answer:</span>{" "}
                    <span className={isCorrect ? "text-emerald-300 font-medium" : "text-rose-300 font-medium"}>
                      {userAns}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Correct Answer:</span>{" "}
                    <span className="text-emerald-400 font-medium font-mono">{q.correctAnswer}</span>
                  </div>
                </div>

                <div className="mt-3 border-t border-white/5 pt-2.5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Explanation:</span> {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
