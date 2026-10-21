import React, { Suspense } from "react";
import Link from "next/link";
import { WindHeroSection } from "@/components/features/landing/wind-hero-section";
import { MagneticButton } from "@/components/features/landing/magnetic-button";
import { CustomCursor } from "@/components/features/landing/custom-cursor";
import { AnimatedCounter } from "@/components/features/landing/animated-counter";
import { Marquee } from "@/components/features/landing/marquee";
import { ScrollStorytelling } from "@/components/features/landing/scroll-storytelling";
import { BentoGrid } from "@/components/features/landing/bento-grid";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  FileCheck,
  Atom,
} from "lucide-react";

export default function LandingPage() {
  const subjects = [
    "Multivariable Calculus",
    "Organic Chemistry",
    "Quantum Mechanics",
    "Molecular Biology",
    "Data Structures & Algorithms",
    "Macroeconomics",
    "Cognitive Neuroscience",
    "Computer Architecture",
    "Anatomy & Physiology",
    "Linear Algebra",
  ];

  return (
    <div className="relative min-h-screen bg-[#05060b] text-foreground selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Interactive Custom Cursor on Desktop */}
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>

      {/* -------------------------------------------------------------------- */}
      {/* WIND HERO SECTION (CLONED FROM SPLINE DESIGN)                         */}
      {/* -------------------------------------------------------------------- */}
      <WindHeroSection />

      {/* -------------------------------------------------------------------- */}
      {/* SOCIAL PROOF & METRICS COUNTER BAR                                   */}
      {/* -------------------------------------------------------------------- */}
      <section className="relative z-10 border-b border-white/[0.08] bg-[#070914] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="border-r border-white/[0.08] last:border-none pr-4">
              <p className="font-display text-3xl sm:text-4xl font-bold text-cyan-300">
                <AnimatedCounter value={99.4} suffix="%" decimals={1} />
              </p>
              <p className="mt-1 text-xs text-slate-400">Target Exam Readiness</p>
            </div>

            <div className="border-r border-white/[0.08] last:border-none pr-4">
              <p className="font-display text-3xl sm:text-4xl font-bold text-sky-300">
                <AnimatedCounter value={14000} suffix="+" />
              </p>
              <p className="mt-1 text-xs text-slate-400">Active Flashcards Retained</p>
            </div>

            <div className="border-r border-white/[0.08] last:border-none pr-4">
              <p className="font-display text-3xl sm:text-4xl font-bold text-indigo-300">
                <AnimatedCounter value={3.8} suffix="x" decimals={1} />
              </p>
              <p className="mt-1 text-xs text-slate-400">Study Velocity Increase</p>
            </div>

            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-emerald-300">
                <AnimatedCounter value={100} suffix="%" />
              </p>
              <p className="mt-1 text-xs text-slate-400">Verifiable Page Citations</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* INFINITE MARQUEE STRIP                                               */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="disciplines"
        aria-label="Supported Disciplines"
        className="relative z-10 w-full overflow-hidden border-y border-white/[0.08] bg-[#030408] py-4"
      >
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030408] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030408] to-transparent z-10" />

        <Marquee repeat={3}>
          {subjects.map((sub) => (
            <div
              key={sub}
              className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 text-xs font-medium text-slate-300"
            >
              <Atom className="size-3 text-cyan-400" />
              <span>{sub}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* SCROLL STORYTELLING (Pinned GSAP Section & Text Reveals)               */}
      {/* -------------------------------------------------------------------- */}
      <ScrollStorytelling />

      {/* -------------------------------------------------------------------- */}
      {/* MAGIC UI BENTO GRID                                                  */}
      {/* -------------------------------------------------------------------- */}
      <div id="features">
        <BentoGrid />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* GROUNDED RAG PROMISE SECTION                                         */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="vault"
        className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:px-8 border-t border-white/[0.08]"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0a0f28]/90 via-[#070918]/80 to-[#05060b] p-8 sm:p-14 text-center backdrop-blur-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <Badge variant="default">Grounded Architecture</Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Untrusted Notes Ingested as Data. Never as Prompt Instructions.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Every document is parsed, chunked with semantic overlap, and vectorized into Supabase pgvector. When asked a question, Nova retrieves hybrid semantic neighbors and answers only with what you uploaded, citing exact page numbers. If your notes do not contain the answer, Nova politely informs you instead of hallucinating.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-cyan-300">
              <span className="flex items-center gap-1.5">
                <FileCheck className="size-4" /> PDF, DOCX, TXT Support
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> Prompt Injection Immune
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4" /> Sub-Second Retrieval
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 -top-24 -translate-x-1/2 size-96 rounded-full bg-cyan-500/15 blur-3xl" />
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* FINAL CALL TO ACTION                                                 */}
      {/* -------------------------------------------------------------------- */}
      <section
        id="cta"
        aria-label="Call to Action"
        className="relative z-10 mx-auto max-w-5xl px-6 py-28 text-center sm:px-8 overflow-hidden"
      >
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[750px] rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-600/15 to-transparent blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300">
            <GraduationCap className="size-4" />
            <span>Join Hundreds of Scholars Today</span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Ready to upgrade your academic nervous system?
          </h2>

          <p className="mx-auto max-w-xl text-base text-slate-300">
            Begin learning with Socratic AI dialogue, spaced repetition, and citation-grounded lecture notes today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <MagneticButton
                id="footer-signup-cta"
                className="group h-13 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-8 py-3.5 text-sm font-semibold text-[#030914] shadow-[0_0_35px_rgba(0,245,212,0.4)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(0,245,212,0.7)]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4" />
                  <span>Create Your Free Account</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </MagneticButton>
            </Link>

            <Link href="/login">
              <MagneticButton
                id="footer-login-cta"
                className="h-13 rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-slate-200 hover:bg-white/[0.08] hover:text-white backdrop-blur-md"
              >
                <span>Sign In to Existing Workspace</span>
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
