"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Flame,
  Play,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlashcardDeck, type FlashcardItem } from "@/components/features/flashcards/flashcard-deck";
import { FlashcardList } from "@/components/features/flashcards/flashcard-list";
import { FlashcardGeneratorModal } from "@/components/features/flashcards/flashcard-generator-modal";
import type { UserRating } from "@/lib/study/sm2";

export default function FlashcardsPage() {
  const [allCards, setAllCards] = useState<FlashcardItem[]>([]);
  const [dueCards, setDueCards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const loadCards = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/flashcards?dueOnly=false").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/flashcards?dueOnly=true").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([allData, dueData]) => {
        if (allData?.cards) setAllCards(allData.cards);
        if (dueData?.cards) setDueCards(dueData.cards);
      })
      .catch((err) => console.warn("Failed to load cards:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      fetch("/api/flashcards?dueOnly=false").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/flashcards?dueOnly=true").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([allData, dueData]) => {
        if (!ignore) {
          if (allData?.cards) setAllCards(allData.cards);
          if (dueData?.cards) setDueCards(dueData.cards);
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

  const handleReviewCard = async (cardId: string, rating: UserRating) => {
    try {
      await fetch("/api/flashcards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, rating }),
      });
    } catch (err) {
      console.error("Review update failed:", err);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      const res = await fetch(`/api/flashcards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAllCards((prev) => prev.filter((c) => c.id !== id));
        setDueCards((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleFinishQueue = () => {
    setIsReviewing(false);
    loadCards();
  };

  if (isReviewing && dueCards.length > 0) {
    return (
      <div className="py-6">
        <FlashcardDeck
          cards={dueCards}
          onReviewCard={handleReviewCard}
          onFinishQueue={handleFinishQueue}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Spaced Repetition
            </h1>
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              SM-2 Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Scientifically scheduled reviews using the SuperMemo SM-2 algorithm to prevent the forgetting curve.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCards}
            disabled={loading}
            className="border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`mr-2 size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsGeneratorOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:opacity-95"
          >
            <Sparkles className="mr-2 size-4" />
            Synthesize Deck
          </Button>
        </div>
      </div>

      {/* Review Queue Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0a0d18] to-indigo-950/40 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
              <Flame className="size-4" />
              <span>Daily Review Queue</span>
            </div>
            <h2 className="font-display mt-2 text-2xl font-bold text-white sm:text-3xl">
              {dueCards.length} Cards Due for Review
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              {dueCards.length > 0
                ? "Optimal retention window open. Review now to lock in memory traces."
                : "All caught up for today! Your retention queue is up to date."}
            </p>
          </div>

          <Button
            onClick={() => setIsReviewing(true)}
            disabled={dueCards.length === 0}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-cyan-400 font-semibold text-black hover:opacity-95 disabled:opacity-40"
          >
            <Play className="mr-2 size-4 fill-black" />
            Start Daily Review ({dueCards.length})
          </Button>
        </div>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Total Cards</span>
          <p className="mt-1 font-display text-2xl font-bold text-white">{allCards.length}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Due Today</span>
          <p className="mt-1 font-display text-2xl font-bold text-purple-400">{dueCards.length}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Learned (&gt;10d)</span>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-400">
            {allCards.filter((c) => c.interval_days >= 10).length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-400">Avg Ease Factor</span>
          <p className="mt-1 font-display text-2xl font-bold text-sky-400">
            {allCards.length > 0
              ? (
                  allCards.reduce((acc, c) => acc + Number(c.ease_factor), 0) / allCards.length
                ).toFixed(2)
              : "2.50"}
          </p>
        </div>
      </div>

      {/* Flashcard Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">
            All Flashcards ({allCards.length})
          </h3>
          <span className="text-xs text-slate-400">
            SuperMemo SM-2 interval active
          </span>
        </div>

        <FlashcardList
          cards={allCards}
          onRefresh={loadCards}
          onDeleteCard={handleDeleteCard}
        />
      </div>

      {/* Generator Modal */}
      <FlashcardGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerated={loadCards}
      />
    </div>
  );
}
