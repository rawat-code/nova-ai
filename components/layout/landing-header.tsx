"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-white/10 bg-[#070914]/85 backdrop-blur-xl py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          : "bg-transparent py-5 sm:py-6"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10">
        {/* Brand Logo - 8-petal glass asterisk matching Spline design */}
        <Link href="/" className="group flex items-center gap-2.5 focus:outline-none">
          <div className="relative flex size-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.35)] transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white drop-shadow-sm">
            Nova
          </span>
        </Link>

        {/* Minimalist Navigation Links (Spline 'Wind' Navigation Design) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
          <a href="#tutor" className="hover:text-white transition-colors drop-shadow-sm">
            Products
          </a>
          <a href="#features" className="hover:text-white transition-colors drop-shadow-sm">
            Use Cases
          </a>
          <Link href="/login" className="hover:text-white transition-colors drop-shadow-sm">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-sky-950 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:bg-white/90 transition-all hover:scale-105"
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-white/20 bg-white/10 p-2 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#070914]/95 px-6 py-5 backdrop-blur-2xl">
          <nav className="flex flex-col gap-3">
            <a
              href="#tutor"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-white/[0.06]"
            >
              Products
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-white/[0.06]"
            >
              Use Cases
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-white/[0.06]"
            >
              Sign In
            </Link>
            <div className="pt-2">
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center rounded-xl bg-white px-4 py-2 text-xs font-semibold text-sky-950 shadow-md"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
