"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RotateCcw,
  Trophy,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageContent } from "../tutor/message-content";
import type { UserRating } from "@/lib/study/sm2";

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  topic: string;
  repetition: number;
  interval_days: number;
  ease_factor: number;
  next_review_at: string;
}

interface FlashcardDeckProps {
  cards: FlashcardItem[];
  onReviewCard: (cardId: string, rating: UserRating) => Promise<void>;
  onFinishQueue: () => void;
}

export function FlashcardDeck({
  cards,
  onReviewCard,
  onFinishQueue,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentCard = cards[currentIndex];
  const isFinished = currentIndex >= cards.length;

  const handleRating = useCallback(
    async (rating: UserRating) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await onReviewCard(currentCard.id, rating);
        setReviewedCount((prev) => prev + 1);
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting, onReviewCard]
  );

  // Keyboard navigation: Space to flip, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === "1") handleRating("again");
        if (e.key === "2") handleRating("hard");
        if (e.key === "3") handleRating("good");
        if (e.key === "4") handleRating("easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, handleRating]);

  if (isFinished || !currentCard) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0a0d18]/90 p-10 text-center shadow-2xl backdrop-blur-xl animate-in fade-in-0 duration-300">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          <Trophy className="size-8" />
        </div>

        <h2 className="font-display mt-4 text-2xl font-bold text-white sm:text-3xl">
          Daily Review Complete!
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          You reviewed <span className="text-white font-semibold">{reviewedCount}</span> cards today.
          Your memory traces have been reinforced according to the SuperMemo SM-2 interval curve.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={onFinishQueue}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold text-white hover:opacity-95"
          >
            Back to Flashcard Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-purple-400">
          <Flame className="size-4" /> Spaced Repetition Queue
        </span>
        <span className="font-mono">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="group relative min-h-[340px] cursor-pointer rounded-3xl border border-white/10 bg-[#0c1022]/90 p-8 shadow-2xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col justify-between"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[11px] font-semibold text-purple-300">
            {currentCard.topic}
          </span>

          <span className="text-xs text-slate-500">
            {isFlipped ? "Answer" : "Prompt"} · Click or Space to flip
          </span>
        </div>

        {/* Card Body */}
        <div className="my-auto py-6 text-center">
          {!isFlipped ? (
            <h3 className="font-display text-xl font-bold leading-relaxed text-white sm:text-2xl">
              {currentCard.front}
            </h3>
          ) : (
            <div className="text-left text-sm leading-relaxed text-slate-200">
              <MessageContent content={currentCard.back} />
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-500">
          <span>Interval: {currentCard.interval_days}d · Rep: #{currentCard.repetition}</span>
          <span className="flex items-center gap-1">
            <RotateCcw className="size-3" /> Flip Card
          </span>
        </div>
      </div>

      {/* SM-2 Rating Controls (Revealed after flip) */}
      {isFlipped ? (
        <div className="space-y-2 animate-in fade-in-0 duration-200">
          <p className="text-center text-xs font-medium text-slate-400">
            How well did you recall this concept? (Keys: 1, 2, 3, 4)
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleRating("again")}
              disabled={isSubmitting}
              className="group flex flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-rose-300 transition-all hover:bg-rose-900/40 hover:border-rose-500/60"
            >
              <span className="text-xs font-bold">Again</span>
              <span className="text-[10px] text-rose-400/80">1 day · [1]</span>
            </button>

            <button
              onClick={() => handleRating("hard")}
              disabled={isSubmitting}
              className="group flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-amber-300 transition-all hover:bg-amber-900/40 hover:border-amber-500/60"
            >
              <span className="text-xs font-bold">Hard</span>
              <span className="text-[10px] text-amber-400/80">
                {Math.max(1, Math.round(currentCard.interval_days * 1.2))}d · [2]
              </span>
            </button>

            <button
              onClick={() => handleRating("good")}
              disabled={isSubmitting}
              className="group flex flex-col items-center justify-center rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 text-sky-300 transition-all hover:bg-sky-900/40 hover:border-sky-500/60"
            >
              <span className="text-xs font-bold">Good</span>
              <span className="text-[10px] text-sky-400/80">
                {currentCard.repetition === 0 ? "1d" : currentCard.repetition === 1 ? "6d" : `${Math.round(currentCard.interval_days * currentCard.ease_factor)}d`} · [3]
              </span>
            </button>

            <button
              onClick={() => handleRating("easy")}
              disabled={isSubmitting}
              className="group flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-emerald-300 transition-all hover:bg-emerald-900/40 hover:border-emerald-500/60"
            >
              <span className="text-xs font-bold">Easy</span>
              <span className="text-[10px] text-emerald-400/80">
                {currentCard.repetition === 0 ? "2d" : currentCard.repetition === 1 ? "8d" : `${Math.round(currentCard.interval_days * (currentCard.ease_factor + 0.15))}d`} · [4]
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={() => setIsFlipped(true)}
            variant="outline"
            className="border-white/10 text-xs text-slate-300 hover:text-white"
          >
            Show Answer (Space)
          </Button>
        </div>
      )}
    </div>
  );
}
