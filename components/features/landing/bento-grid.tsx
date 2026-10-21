"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  BookOpen,
  HelpCircle,
  Layers,
  Sparkles,
  CheckCircle2,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoGrid() {
  const [activeTutorMode, setActiveTutorMode] = useState<"socratic" | "simple" | "deep" | "exam">("socratic");
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

  const tutorModes = [
    { id: "socratic", label: "Socratic" },
    { id: "simple", label: "Explain Simply" },
    { id: "deep", label: "Deep Dive" },
    { id: "exam", label: "Exam Mode" },
  ] as const;

  const tutorSnippets = {
    socratic:
      "If the reaction is exothermic and entropy increases, at what temperatures will Gibbs free energy be negative?",
    simple:
      "Think of Gibbs free energy like a slide: if the slope goes downward, the ball rolls naturally without you pushing it.",
    deep:
      "Under constant T and P, ΔG = ΔH - TΔS. When ΔH < 0 and ΔS > 0, ΔG is strictly negative for all positive temperatures T in Kelvin.",
    exam:
      "Target Question: Calculate equilibrium constant K at 298K given ΔG° = -12.4 kJ/mol. Formula: ΔG° = -RT ln(K).",
  };

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge variant="default" className="mb-3">
          Adaptive Architecture
        </Badge>
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
          A Cognition Engine Built Around You
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300">
          Explore how Nova connects your lecture notes, active recall queues, and adaptive tutoring into a singular feedback loop.
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Card 1: AI Tutor Interactive Engine (Span 2) */}
        <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070a16]/80 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(0,245,212,0.15)] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  <BrainCircuit className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Adaptive AI Tutor</h3>
                  <p className="text-xs text-slate-400">Streaming Gemini 2.5 Flash with Pedagogical Modes</p>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
                {tutorModes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveTutorMode(m.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200",
                      activeTutorMode === m.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Chat Bubble Mockup */}
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0a0f24]/90 p-5 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mb-2">
                <Sparkles className="size-3.5" />
                <span>Mode: {activeTutorMode.toUpperCase()}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Response streaming</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {tutorSnippets[activeTutorMode]}
              </p>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/[0.06] text-[11px] text-slate-400">
                <span>LaTeX math formula: <code className="text-cyan-300">$$\Delta G^\circ = -RT \ln(K)$$</code></span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="size-3" /> Grounded
                </span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        {/* Bento Card 2: Grounded Notes Vault (Span 1) */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070a16]/80 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_0_35px_rgba(56,189,248,0.15)] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 mb-4">
              <BookOpen className="size-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Notes Vault &amp; RAG</h3>
            <p className="mt-1 text-xs text-slate-400">
              pgvector embeddings with verifiable page citations.
            </p>

            <div className="mt-6 space-y-2.5">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-xs font-medium text-white">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileCheck className="size-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">Organic_Chem_Ch4.pdf</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    Pg. 19
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 truncate">
                  Nucleophilic acyl substitution mechanism...
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-xs font-medium text-white">
                  <span className="flex items-center gap-1.5 truncate">
                    <FileCheck className="size-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">Neuroscience_Lec3.pdf</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    Pg. 84
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 truncate">
                  Action potential depolarization through voltage gates...
                </p>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-sky-500/10 blur-2xl" />
        </div>

        {/* Bento Card 3: Adaptive Quizzes (Span 1) */}
        <div className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070a16]/80 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
              <HelpCircle className="size-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Adaptive Quizzes</h3>
            <p className="mt-1 text-xs text-slate-400">
              Difficulty recalibrates based on past attempt speed.
            </p>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0c0e22]/90 p-4">
              <p className="text-xs font-medium text-white">
                Which neurotransmitter mediates fast inhibitory transmission in the CNS?
              </p>
              <div className="mt-3 space-y-1.5">
                {["Glutamate", "GABA (γ-aminobutyric acid)", "Dopamine"].map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedQuizOption(idx)}
                    className={cn(
                      "w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                      selectedQuizOption === idx
                        ? idx === 1
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    )}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-indigo-500/10 blur-2xl" />
        </div>

        {/* Bento Card 4: Spaced Repetition SM-2 (Span 2) */}
        <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#070a16]/80 p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_35px_rgba(168,85,247,0.15)] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Spaced Repetition Decks</h3>
                  <p className="text-xs text-slate-400">Algorithmic SuperMemo SM-2 Interval Calculation</p>
                </div>
              </div>
              <Badge variant="violet" size="sm">
                14 Cards Due
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0d0f28]/80 p-5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Front of Card</span>
                  <span className="font-mono text-cyan-300">Biochemistry</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  What is the catalytic role of ATP synthase in oxidative phosphorylation?
                </p>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Interval:</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">+6 Days on Good</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0d0f28]/80 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Active SM-2 Buttons</span>
                    <span className="font-mono text-purple-300">Quality 0 - 5</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Graded feedback dynamically shifts ease factors from 1.3 to 2.5.
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-1.5 text-center">
                  <div className="rounded-lg bg-rose-500/20 border border-rose-500/30 p-1 text-[11px] font-medium text-rose-300">
                    Again
                  </div>
                  <div className="rounded-lg bg-amber-500/20 border border-amber-500/30 p-1 text-[11px] font-medium text-amber-300">
                    Hard
                  </div>
                  <div className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 p-1 text-[11px] font-medium text-cyan-300">
                    Good
                  </div>
                  <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-1 text-[11px] font-medium text-emerald-300">
                    Easy
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -bottom-20 size-72 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
