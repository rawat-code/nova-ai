import React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-lenis-prevent="true"
      className="flex h-screen w-full overflow-hidden bg-[#05060b] text-foreground"
    >
      {/* Animated Collapsible Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div
        data-lenis-prevent="true"
        className="flex flex-1 flex-col min-w-0 overflow-hidden"
      >
        <AppHeader />
        <main
          id="main-content"
          tabIndex={-1}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8 relative outline-none"
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
