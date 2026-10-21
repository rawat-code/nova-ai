"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Only access navigator on client
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOffline = () => {
        setIsOffline(true);
        setWasOffline(true);
      };

      const handleOnline = () => {
        setIsOffline(false);
        // Hide reconnected banner after 3 seconds
        setTimeout(() => setWasOffline(false), 3000);
      };

      window.addEventListener("offline", handleOffline);
      window.addEventListener("online", handleOnline);

      return () => {
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("online", handleOnline);
      };
    }
  }, []);

  if (!isOffline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-md animate-in slide-in-from-bottom-3 duration-300 pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all ${
          isOffline
            ? "border-amber-500/30 bg-amber-950/80 text-amber-200"
            : "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
        }`}
      >
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
            isOffline ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {isOffline ? <WifiOff className="size-4" /> : <Wifi className="size-4" />}
        </div>

        <div className="flex-1 text-xs">
          <p className="font-semibold">
            {isOffline ? "Offline Mode Active" : "Connection Restored"}
          </p>
          <p className="text-[11px] opacity-80">
            {isOffline
              ? "Cached study sessions and flashcards are available. AI generation requires reconnecting."
              : "Nova is back online. Syncing sessions..."}
          </p>
        </div>
      </div>
    </div>
  );
}
