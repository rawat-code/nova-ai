"use client";

import React, { useState } from "react";
import {
  Trash2,
  Calendar,
  Search,
  Plus,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlashcardItem } from "./flashcard-deck";

interface FlashcardListProps {
  cards: FlashcardItem[];
  onRefresh: () => void;
  onDeleteCard: (id: string) => Promise<void>;
}

export function FlashcardList({
  cards,
  onRefresh,
  onDeleteCard,
}: FlashcardListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = cards.filter(
    (c) =>
      c.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateManualCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim() || !topic.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: front.trim(),
          back: back.trim(),
          topic: topic.trim(),
        }),
      });

      if (res.ok) {
        setFront("");
        setBack("");
        setTopic("");
        setIsAddingCard(false);
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards by question or topic..."
            className="w-full rounded-xl border border-white/10 bg-[#0a0d18]/70 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <Button
          onClick={() => setIsAddingCard((prev) => !prev)}
          variant="outline"
          size="sm"
          className="border-white/10 text-xs text-slate-300 hover:text-white"
        >
          <Plus className="mr-1.5 size-3.5" />
          {isAddingCard ? "Close Creator" : "Add Card"}
        </Button>
      </div>

      {/* Manual Card Form */}
      {isAddingCard && (
        <form
          onSubmit={handleCreateManualCard}
          className="rounded-2xl border border-purple-500/30 bg-[#0d1226]/80 p-5 space-y-3 animate-in fade-in-0 duration-200"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300">
            Create Custom Flashcard
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] text-slate-400">Front (Prompt)</label>
              <input
                type="text"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or concept..."
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Physics, History..."
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Back (Answer)</label>
            <textarea
              rows={2}
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Answer or definition (supports Markdown and LaTeX)..."
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingCard(false)}
              className="text-xs text-slate-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : "Save Flashcard"}
            </Button>
          </div>
        </form>
      )}

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0a0d18]/40 py-12 text-center">
          <Layers className="size-8 text-slate-600" />
          <p className="mt-2 text-xs font-medium text-slate-400">No flashcards found</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Synthesize a new deck above to begin spaced repetition learning.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0a0d18]/70 p-4 transition-all hover:border-white/20 hover:bg-[#0c1022]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                    {card.topic}
                  </span>
                  <button
                    onClick={() => onDeleteCard(card.id)}
                    className="p-1 text-slate-500 transition-colors hover:text-rose-400"
                    title="Delete card"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <p className="mt-3 font-display text-xs font-semibold text-white line-clamp-2">
                  {card.front}
                </p>

                <p className="mt-2 text-xs text-slate-300 line-clamp-3">
                  {card.back}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2.5 text-[11px] font-mono text-slate-500">
                <span>Interval: {card.interval_days}d</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  Due: {card.next_review_at}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
