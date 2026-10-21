"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, Sparkles, Loader2, AlertCircle, FileText } from "lucide-react";
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
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;

    fetch("/api/notes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore) {
          if (data?.documents) {
            const readyDocs = data.documents
              .filter((d: { status: string }) => d.status === "ready")
              .map((d: { id: string; title: string }) => ({ id: d.id, title: d.title }));
            setDocuments(readyDocs);
            if (readyDocs.length > 0) {
              setSelectedDocId((prev) => prev || readyDocs[0].id);
              setTopic((prev) => prev || readyDocs[0].title);
            }
          }
          setLoadingDocs(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load documents");
          setLoadingDocs(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) {
      setErrorMessage("Please select a document from your Vault to generate flashcards.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          topic: topic.trim() || undefined,
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
              Grounded exclusively in your uploaded study notes (SM-2 Spaced Repetition)
            </p>
          </div>
        </div>

        {loadingDocs ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
            <Loader2 className="size-4 animate-spin" />
            Loading notes from Vault...
          </div>
        ) : documents.length === 0 ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex gap-3 items-start">
              <AlertCircle className="size-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold text-white">No indexed notes found in Vault</p>
                <p className="mt-1 text-slate-300">
                  Flashcards must be grounded directly in your notes. Please upload and vectorize a document in the <strong>Notes Vault</strong> first.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/10 text-slate-400 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileText className="size-3.5 text-purple-400" />
                Source Note / Document (Required)
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  const doc = documents.find((d) => d.id === e.target.value);
                  if (doc) setTopic(doc.title);
                }}
                required
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Cards will be extracted strictly from this document&apos;s text chunks with page citations.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Deck Title / Focus Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Python Intermediate Revision"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

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
                disabled={isGenerating || !selectedDocId}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold text-white hover:opacity-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Extracting Cards From Notes...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Synthesize Deck
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
