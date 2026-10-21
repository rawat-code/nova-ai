"use client";

import React from "react";
import { Plus, MessageSquare, Trash2, Sparkles, BookOpen } from "lucide-react";
import { TUTOR_MODES, type TutorMode } from "@/lib/ai/modes";
import { cn } from "@/lib/utils";

export interface ConversationSummary {
  id: string;
  title: string;
  mode: TutorMode;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: ConversationSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 flex-col border-r border-white/10 bg-[#070914] p-4 transition-transform duration-300 lg:static lg:flex lg:translate-x-0",
          isOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
        )}
      >
        {/* New Session Button */}
        <button
          type="button"
          onClick={onNew}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-sky-500/10 to-indigo-500/15 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(0,245,212,0.15)] transition-all hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(0,245,212,0.25)]"
        >
          <Plus className="size-4 text-cyan-300 transition-transform group-hover:rotate-90" />
          <span>New Study Session</span>
        </button>

        {/* Header Label */}
        <div className="mt-6 flex items-center justify-between px-2 text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
          <span>Recent Conversations</span>
          <span>{conversations.length}</span>
        </div>

        {/* Conversation List */}
        <div className="mt-2 flex-1 space-y-1 overflow-y-auto pr-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-slate-500">
              <BookOpen className="size-6 text-slate-600 mb-2" />
              <span>No past sessions yet.</span>
              <span className="text-[11px] text-slate-600 mt-1">Start a topic to begin!</span>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeId;
              const modeMeta = TUTOR_MODES[c.mode] || TUTOR_MODES.socratic;

              return (
                <div
                  key={c.id}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
                    isActive
                      ? "bg-white/[0.08] text-white border border-cyan-500/30 shadow-[0_0_15px_rgba(0,245,212,0.1)]"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex flex-1 items-center gap-2.5 overflow-hidden text-left"
                  >
                    <MessageSquare
                      className={cn(
                        "size-3.5 shrink-0",
                        isActive ? "text-cyan-400" : "text-slate-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.title || "Untitled Session"}</p>
                      <span className={cn("text-[10px] font-mono", modeMeta.color)}>
                        {modeMeta.name}
                      </span>
                    </div>
                  </button>

                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}
                      className="ml-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info pill */}
        <div className="mt-auto border-t border-white/[0.08] pt-3 text-[11px] text-slate-500 flex items-center gap-1.5 px-2">
          <Sparkles className="size-3 text-cyan-400" />
          <span>Socratic AI • Spaced Recall Sync</span>
        </div>
      </aside>
    </>
  );
}
