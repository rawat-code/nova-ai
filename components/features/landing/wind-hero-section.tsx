"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { WindGlassFlower } from "./wind-glass-flower";
import { ArrowRight, Sparkles, BookOpen } from "lucide-react";

export function WindHeroSection() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0284c7] select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 1. ATMOSPHERIC SKY & CLOUDS BACKGROUND                                */}
      {/* -------------------------------------------------------------------- */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0284c7] via-[#38bdf8] to-[#bae6fd]" />

      {/* Floating Animated Clouds */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-12 left-[-10%] h-48 w-96 rounded-full bg-white/60 blur-3xl animate-pulse" />
        <div className="absolute top-28 right-[-5%] h-64 w-[450px] rounded-full bg-white/70 blur-3xl animate-pulse" />
        <div className="absolute top-44 left-1/4 h-36 w-80 rounded-full bg-white/50 blur-2xl" />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. TUSCAN ROLLING HILLS LANDSCAPE (CLONED FROM SPLINE DESIGN)       */}
      {/* -------------------------------------------------------------------- */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[42vh] sm:h-[48vh] md:h-[55vh] z-0 overflow-hidden">
        <Image
          src="/images/wind-hero-landscape.jpg"
          alt="Painterly rolling hills landscape"
          fill
          priority
          className="object-cover object-bottom"
        />
        {/* Soft atmospheric mist blend above the hills */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#38bdf8]/15 to-[#38bdf8]/40" />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. MAIN HERO CONTENT & 3D GLASS FLOWER CENTERPIECE                  */}
      {/* -------------------------------------------------------------------- */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-28 text-center sm:px-8">
        {/* Floating 3D Glass Star Model in Background of Text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          <WindGlassFlower />
        </div>

        {/* Centered Typography (Matching Spline 'The Wind' Design) */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center pointer-events-auto">
          {/* Elegant Serif Italic Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif italic text-white/95 text-base sm:text-lg tracking-widest mb-2 select-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
          >
            — A new space —
          </motion.p>

          {/* Massive Display Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight text-white select-none drop-shadow-[0_12px_40px_rgba(2,132,199,0.5)]"
          >
            The Nova
          </motion.h1>

          {/* Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base font-medium text-white/95 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] select-none"
          >
            Adaptive AI learning companion for scholars. Socratic dialogue, citation-grounded notes retrieval, and spaced repetition in real-time.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/signup">
              <button
                type="button"
                className="group relative inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0369a1] shadow-[0_0_35px_rgba(255,255,255,0.6)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.9)] hover:scale-105"
              >
                <Sparkles className="size-4 text-sky-600 transition-transform group-hover:rotate-12" />
                <span>Begin Your Journey</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/vault">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md hover:bg-white/25 transition-all shadow-sm"
              >
                <BookOpen className="size-4 text-white" />
                <span>Explore Notes Vault</span>
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
