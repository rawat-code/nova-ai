import React from "react";
import { LandingHeader } from "@/components/layout/landing-header";
import { LandingFooter } from "@/components/layout/landing-footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#05060b] text-foreground relative selection:bg-cyan-500/20 selection:text-cyan-300">
      <LandingHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">{children}</main>
      <LandingFooter />
    </div>
  );
}
