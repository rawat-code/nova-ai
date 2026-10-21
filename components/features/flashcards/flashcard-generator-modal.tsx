"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlashcardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

interface VaultDocSummary {
  id: string;
  title: string;
}

export function FlashcardGeneratorModal({
  isOpen,
  onClose,
  onGenerated,
}: FlashcardGeneratorModalProps) {
  const [topic, setTopic] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [count, setCount] = useState(6);
  const [documents, setDocuments] = useState<VaultDocSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    fetch("/api/notes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.documents) {
          setDocuments(data.documents.map((d: { id: string; title: string }) => ({ id: d.id, title: d.title })));
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          documentId: selectedDocId || undefined,
          count,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      onGenerated();
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error generating cards");
    } finally {
      setIsGenerating(false);
    }
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
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
            <Layers className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Synthesize Flashcards
            </h3>
            <p className="text-xs text-slate-400">
              Create active recall cards with SuperMemo SM-2 interval scheduling
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Deck Topic or Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Organic Reaction Mechanisms, Neurotransmitters..."
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {documents.length > 0 && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Ground in Vault Notes (Optional)
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  const doc = documents.find((d) => d.id === e.target.value);
                  if (doc && !topic) setTopic(doc.title);
                }}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">No document (Generate from topic knowledge)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span>Card Count</span>
              <span className="text-purple-400">{count} cards</span>
            </div>
            <div className="mt-2 flex gap-2">
              {[5, 10, 15].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    count === num
                      ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                      : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  {num} Cards
                </button>
              ))}
            </div>
          </div>

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
              disabled={isGenerating || !topic.trim()}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold text-white hover:opacity-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Active Recall Cards...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Create Deck
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
