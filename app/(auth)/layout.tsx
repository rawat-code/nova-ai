import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[#05060b] text-foreground overflow-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Cinematic Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[650px] rounded-full bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-3xl opacity-80" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[380px] w-[450px] rounded-full bg-cyan-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-[380px] w-[450px] rounded-full bg-indigo-600/10 blur-3xl" />

      {/* Top Bar with Home Link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Auth Content Container */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {children}
      </div>

      {/* Auth Footer */}
      <div className="relative z-10 mt-8 text-center text-xs text-slate-500">
        <p>Encrypted with Supabase Auth • Strict Row Level Security</p>
      </div>
    </div>
  );
}
