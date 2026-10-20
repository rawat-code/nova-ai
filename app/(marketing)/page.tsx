import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  Layers,
  Calendar,
  Flame,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: BrainCircuit,
      title: "Adaptive AI Tutor",
      tag: "Socratic & Exam Modes",
      desc: "Instant multi-modal explanations with LaTeX math, code highlighting, and pedagogical modes tailored to your cognitive style.",
      color: "from-cyan-500/20 to-sky-500/20 text-cyan-300",
      border: "hover:border-cyan-500/40",
    },
    {
      icon: BookOpen,
      title: "Notes Vault & RAG",
      tag: "Citations Grounded",
      desc: "Upload PDFs, lecture slides, and notes. Ask complex conceptual questions answered with precise page and paragraph citations.",
      color: "from-sky-500/20 to-indigo-500/20 text-sky-300",
      border: "hover:border-sky-500/40",
    },
    {
      icon: HelpCircle,
      title: "Adaptive Quiz Engine",
      tag: "Auto-synthesized",
      desc: "Dynamically generates MCQs and short-answer challenges from your materials. Difficulty dynamically scales with your mastery.",
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-300",
      border: "hover:border-indigo-500/40",
    },
    {
      icon: Layers,
      title: "Spaced Repetition Decks",
      tag: "SM-2 Algorithm",
      desc: "Turn messy course material into active recall flashcards. Review queues calculate optimal retention windows scientifically.",
      color: "from-purple-500/20 to-pink-500/20 text-purple-300",
      border: "hover:border-purple-500/40",
    },
    {
      icon: Calendar,
      title: "Dynamic Study Planner",
      tag: "Exam Optimized",
      desc: "Input your exam syllabus and target grades. Nova constructs balanced daily milestone schedules that adapt when life happens.",
      color: "from-emerald-500/20 to-cyan-500/20 text-emerald-300",
      border: "hover:border-emerald-500/40",
    },
    {
      icon: Flame,
      title: "Learning DNA Analytics",
      tag: "Cognitive Profile",
      desc: "Identifies weak topic clusters, peak retention hours, and comprehension bottlenecks to personalize every study session.",
      color: "from-amber-500/20 to-rose-500/20 text-amber-300",
      border: "hover:border-amber-500/40",
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[800px] rounded-full bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl opacity-75" />
      <div className="pointer-events-none absolute top-96 -left-40 h-[400px] w-[500px] rounded-full bg-cyan-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -right-40 h-[400px] w-[500px] rounded-full bg-indigo-600/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 pb-24 text-center sm:px-8 sm:pt-24 sm:pb-32">
        {/* Release / Status Pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 shadow-[0_0_20px_rgba(0,245,212,0.18)]">
          <Sparkles className="size-3.5 text-cyan-300" />
          <span className="text-xs font-medium text-cyan-200">
            Phase 1 Foundation Live • Powered by Supabase &amp; Gemini
          </span>
          <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        {/* Hero Title with Display Font */}
        <h1 className="font-display max-w-4xl text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
          The AI Learning Companion That{" "}
          <span className="text-gradient-nova">Understands How You Study.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal">
          Not another generic chatbot wrapper. Nova is an intelligent academic partner with Socratic tutoring, citation-grounded notes vault, adaptive quizzes, and spaced repetition.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-7 text-sm font-semibold text-[#030914] shadow-[0_0_30px_rgba(0,245,212,0.35)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,245,212,0.6)] hover:scale-[1.02]">
              <Sparkles className="size-4 mr-2" />
              <span>Start Learning Free</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 rounded-xl border-white/15 bg-white/[0.04] px-7 text-sm font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white backdrop-blur-md"
            >
              Sign In to Your Workspace
            </Button>
          </Link>
        </div>

        {/* Trust & Spec Highlights */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-cyan-400" />
            <span>Lenis + GSAP Smooth Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-cyan-400" />
            <span>Supabase RLS &amp; Session Guard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-cyan-400" />
            <span>Google OAuth &amp; Email Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-cyan-400" />
            <span>Reduced-Motion Accessible</span>
          </div>
        </div>

        {/* Interactive App Shell Preview Mockup */}
        <div className="mt-16 w-full max-w-4xl rounded-2xl border border-white/15 bg-white/[0.03] p-2.5 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)]">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#070914]/90 p-6 sm:p-8 text-left">
            <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="size-3 rounded-full bg-rose-500/80" />
                  <span className="size-3 rounded-full bg-amber-500/80" />
                  <span className="size-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">nova-workspace // v0.1.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  🔥 5 Day Streak
                </Badge>
                <Badge variant="secondary" size="sm">
                  SM-2 Active
                </Badge>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <span className="text-xs font-medium text-slate-400">Tutor Mode</span>
                <p className="mt-1 text-sm font-semibold text-white">Socratic Inquiry</p>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  &ldquo;Let&apos;s trace how the cosine similarity in vector embeddings isolates semantic proximity...&rdquo;
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <span className="text-xs font-medium text-slate-400">Grounded Citations</span>
                <p className="mt-1 text-sm font-semibold text-cyan-300">Physics_Midterm.pdf</p>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Page 42, Paragraph 3: Maxwell-Boltzmann distribution under thermodynamic equilibrium.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <span className="text-xs font-medium text-slate-400">Daily Review</span>
                <p className="mt-1 text-sm font-semibold text-indigo-300">14 Cards Due Today</p>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Calculated using SuperMemo SM-2 interval expansion algorithm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Architecture Grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:px-8 border-t border-white/[0.08]">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-3">
            Core Architecture
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Academic Mastery
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Every module is synchronized to reinforce recall, structure your revision timeline, and adapt to your comprehension speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.05] hover:scale-[1.01] ${f.border}`}
              >
                <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                  <span className="text-[11px] font-mono text-slate-400">{f.tag}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
