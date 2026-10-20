import React from "react";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#030408] py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex flex-col items-center md:items-start gap-2">
            <BrandLogo size="md" />
            <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
              The adaptive AI learning companion for high school & college scholars.
              Grounded in your notes, powered by Gemini.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="#tutor" className="hover:text-cyan-300 transition-colors">
              AI Tutor
            </Link>
            <Link href="#vault" className="hover:text-cyan-300 transition-colors">
              Notes Vault
            </Link>
            <Link href="#quiz" className="hover:text-cyan-300 transition-colors">
              Quizzes
            </Link>
            <Link href="#flashcards" className="hover:text-cyan-300 transition-colors">
              Flashcards
            </Link>
            <Link href="/login" className="hover:text-cyan-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
          <p>© 2026 Nova Learning Systems. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-[11px] font-mono text-slate-400">All AI Models Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
