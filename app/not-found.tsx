import React from "react";
import Link from "next/link";
import { Compass, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#05060b] px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 shadow-2xl backdrop-blur-xl">
        <Compass className="size-10 text-cyan-400 animate-spin-slow" />
      </div>

      <div className="mt-6 font-mono text-xs uppercase tracking-widest text-cyan-400">
        404 — Cosmos Uncharted
      </div>

      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
        Page Not Found
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-400 leading-relaxed">
        The coordinate or study asset you are looking for has been moved, renamed, or never existed in this dimension.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button className="bg-cyan-500 font-semibold text-black hover:bg-cyan-400">
            <LayoutDashboard className="mr-2 size-4" />
            Go to Dashboard
          </Button>
        </Link>

        <Link href="/">
          <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">
            <Home className="mr-2 size-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
