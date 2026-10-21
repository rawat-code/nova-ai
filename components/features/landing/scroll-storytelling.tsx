"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";

export function ScrollStorytelling() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);
  const card1Ref = useRef<HTMLDivElement | null>(null);
  const card2Ref = useRef<HTMLDivElement | null>(null);
  const card3Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    // Word spans for scroll scrub text reveal
    const words = textEl.querySelectorAll(".story-word");

    const ctx = gsap.context(() => {
      // 1. Pinned Text Reveal Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Scrub words from dimmed slate to glowing bright
      tl.to(
        words,
        {
          opacity: 1,
          color: "#ffffff",
          stagger: 0.1,
          ease: "power2.out",
        },
        0
      );

      // Parallax card 1: Tutor Thought Bubble
      if (card1Ref.current) {
        tl.fromTo(
          card1Ref.current,
          { y: 80, opacity: 0, scale: 0.9 },
          { y: -60, opacity: 1, scale: 1, ease: "power2.out" },
          0.2
        );
      }

      // Parallax card 2: Grounded Citation Highlight
      if (card2Ref.current) {
        tl.fromTo(
          card2Ref.current,
          { y: 120, opacity: 0, scale: 0.9 },
          { y: -90, opacity: 1, scale: 1, ease: "power2.out" },
          0.4
        );
      }

      // Parallax card 3: SM-2 Spaced Retention Metric
      if (card3Ref.current) {
        tl.fromTo(
          card3Ref.current,
          { y: 150, opacity: 0, scale: 0.9 },
          { y: -40, opacity: 1, scale: 1, ease: "power2.out" },
          0.6
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  const storyText =
    "Most study tools give you generic AI answers. Nova constructs your academic nervous system — grounding every explanation in your own course notes and adapting to your comprehension velocity.";

  const words = storyText.split(" ");

  return (
    <section
      ref={containerRef}
      className="relative z-20 min-h-screen w-full flex flex-col items-center justify-center overflow-hidden border-t border-white/[0.08] bg-[#05060b] px-6 py-24 sm:px-8"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-600/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Storytelling Tag */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-medium text-cyan-300">
          <Sparkles className="size-3.5" />
          <span>The Nova Difference</span>
        </div>

        {/* Scrubbed Text Reveal */}
        <h2
          ref={textRef}
          className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.25] text-slate-600 select-none"
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="story-word inline-block mr-2.5 transition-colors duration-200"
              style={{ opacity: 0.25 }}
            >
              {word}
            </span>
          ))}
        </h2>

        {/* Floating Parallax Showcase Cards */}
        <div className="relative mt-16 h-72 w-full max-w-3xl mx-auto hidden sm:block">
          {/* Card 1: Socratic AI */}
          <div
            ref={card1Ref}
            className="absolute left-4 top-2 w-72 rounded-2xl border border-cyan-500/30 bg-[#080d1e]/90 p-4.5 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-cyan-300">Socratic Tutor</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              &ldquo;Notice how equation (4) links thermodynamic equilibrium to molecular velocity distribution...&rdquo;
            </p>
          </div>

          {/* Card 2: Citation Grounding */}
          <div
            ref={card2Ref}
            className="absolute right-4 top-8 w-72 rounded-2xl border border-indigo-500/30 bg-[#0c0d22]/90 p-4.5 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span>Source Grounding</span>
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
                Pg. 48
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              100% cited directly from <span className="text-white font-medium">Biochemistry_Lecture_8.pdf</span>. No hallucinations.
            </p>
          </div>

          {/* Card 3: Spaced Retention Scheduling */}
          <div
            ref={card3Ref}
            className="absolute left-1/2 -translate-x-1/2 top-40 w-80 rounded-2xl border border-emerald-500/30 bg-[#061414]/90 p-4 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">SM-2 Spaced Recall</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300">Interval: 6 Days</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
