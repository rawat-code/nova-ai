import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconOnly?: boolean;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({
  className,
  iconOnly = false,
  href = "/",
  size = "md",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  };

  const textClasses = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl tracking-tighter",
  };

  const Content = (
    <div className={cn("group inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(0,245,212,0.35)] transition-transform duration-300 group-hover:scale-105",
          sizeClasses[size]
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070913]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4/6 text-cyan-300 transition-transform duration-300 group-hover:rotate-12"
          >
            {/* Nova Star / Sparkle Geometry */}
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#nova-grad)" />
            <defs>
              <linearGradient id="nova-grad" x1="2" y1="2" x2="22" y2="22">
                <stop offset="0%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {!iconOnly && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-display font-bold text-white tracking-wide uppercase transition-colors group-hover:text-cyan-200",
              textClasses[size]
            )}
          >
            Nova
          </span>
          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300 uppercase tracking-widest">
            AI
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="focus:outline-none">{Content}</Link>;
  }

  return Content;
}
