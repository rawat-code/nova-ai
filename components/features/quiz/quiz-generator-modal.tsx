"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2, BookOpen, Brain, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedQuiz, QuizDifficulty } from "@/lib/ai/quiz-generator";

interface QuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: GeneratedQuiz & { id?: string }) => void;
}

interface VaultDocSummary {
  id: string;
  title: string;
}

export function QuizGeneratorModal({
  isOpen,
  onClose,
  onQuizGenerated,
}: QuizGeneratorModalProps) {
  const [topic, setTopic] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("adaptive");
  const [questionCount, setQuestionCount] = useState(5);
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
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          documentId: selectedDocId || undefined,
          questionCount,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      onQuizGenerated({
        ...data.quiz,
        id: data.quiz?.id,
      });
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error generating quiz");
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
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400">
            <Brain className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Create Adaptive Quiz
            </h3>
            <p className="text-xs text-slate-400">
              Auto-generate MCQs, true/false, and short answer questions
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          {/* Topic input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Study Topic or Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Thermodynamics, Mitosis, Organic Reactions..."
              required
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Document selection */}
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
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="">No document (Generate from general topic)</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Difficulty Calibration
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {[
                { id: "adaptive", label: "Adaptive", icon: Zap },
                { id: "easy", label: "Easy", icon: BookOpen },
                { id: "medium", label: "Medium", icon: Target },
                { id: "hard", label: "Hard", icon: Sparkles },
              ].map((lvl) => {
                const Icon = lvl.icon;
                const isSelected = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id as QuizDifficulty)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs transition-all ${
                      isSelected
                        ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <Icon className="size-4 mb-1" />
                    <span className="font-medium">{lvl.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Adaptive analyzes your past attempts to calibrate optimal challenge level.
            </p>
          </div>

          {/* Question count */}
          <div>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span>Question Count</span>
              <span className="text-indigo-400">{questionCount} questions</span>
            </div>
            <div className="mt-2 flex gap-2">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                    questionCount === num
                      ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                      : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                  }`}
                >
                  {num} Questions
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
              className="bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white hover:opacity-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Synthesizing Questions...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
