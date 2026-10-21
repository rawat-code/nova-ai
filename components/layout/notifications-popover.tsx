"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Layers,
  Flame,
  BookOpen,
  Sparkles,
  CheckCheck,
  Trash2,
  ExternalLink,
  X,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "review" | "streak" | "vault" | "ai";
  href: string;
  isRead: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "5 Cards Due for SM-2 Review",
    message: "Your spaced repetition interval is ready for active recall practice.",
    time: "10m ago",
    category: "review",
    href: "/flashcards",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "5-Day Streak Maintained!",
    message: "Great consistency. Complete 1 focus block to reach 6 days.",
    time: "1h ago",
    category: "streak",
    href: "/focus",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Notes Indexed in Vector Store",
    message: "Lecture materials vectorized with 768-dim embeddings ready for Socratic Q&A.",
    time: "3h ago",
    category: "vault",
    href: "/vault",
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Gemini 3.5 Flash-Lite Active",
    message: "Multi-model failover engine operational with zero downtime.",
    time: "Yesterday",
    category: "ai",
    href: "/settings",
    isRead: true,
  },
];

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setIsOpen(false);
    router.push(item.href);
  };

  const getCategoryIcon = (cat: NotificationItem["category"]) => {
    switch (cat) {
      case "review":
        return <Layers className="size-4 text-cyan-400" />;
      case "streak":
        return <Flame className="size-4 text-amber-400" />;
      case "vault":
        return <BookOpen className="size-4 text-emerald-400" />;
      case "ai":
        return <Sparkles className="size-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`relative rounded-xl border p-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          isOpen
            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(0,245,212,0.15)]"
            : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
        }`}
        title="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-[#05060b] shadow-[0_0_8px_#00f5d4] ring-2 ring-[#05060b]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden rounded-2xl border border-white/15 bg-[#090b16] shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="size-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification Items */}
            <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06]">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  <Bell className="size-6 text-slate-600 mx-auto mb-2" />
                  <p>You&apos;re all caught up!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No unread alerts or study reminders</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-white/[0.04] ${
                      !item.isRead ? "bg-cyan-500/[0.03]" : ""
                    }`}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium truncate ${!item.isRead ? "text-white" : "text-slate-300"}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {item.message}
                      </p>
                    </div>

                    {!item.isRead && (
                      <span className="size-2 rounded-full bg-cyan-400 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-black/40 px-4 py-2 text-center text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings");
                }}
                className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
              >
                <span>Notification Settings</span>
                <ExternalLink className="size-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
