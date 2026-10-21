"use client";

import React, { useState } from "react";
import {
  Trash2,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VaultDocument {
  id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  total_chunks: number;
  status: "processing" | "ready" | "failed";
  created_at: string;
}

interface DocumentListProps {
  documents: VaultDocument[];
  selectedDocIds: string[];
  onToggleSelectDoc: (id: string) => void;
  onInspectChunks: (doc: VaultDocument) => void;
  onAskDoc: (doc: VaultDocument) => void;
  onDeleteDoc: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileBadgeColor(type: string): { bg: string; text: string; border: string } {
  const t = type.toLowerCase();
  if (t === "pdf") {
    return { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" };
  }
  if (t === "docx") {
    return { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" };
  }
  if (["png", "jpg", "jpeg", "webp"].includes(t)) {
    return { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" };
  }
  return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
}

export function DocumentList({
  documents,
  selectedDocIds,
  onToggleSelectDoc,
  onInspectChunks,
  onAskDoc,
  onDeleteDoc,
}: DocumentListProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document and all its vector chunks?")) {
      return;
    }
    setDeletingId(id);
    try {
      await onDeleteDoc(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0a0d18]/40 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-white/5 text-slate-500">
          <BookOpen className="size-6" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-400">No study notes uploaded yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Drag and drop your lecture slides, notes, or readings above to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter notes by title..."
          className="w-full rounded-xl border border-white/10 bg-[#0a0d18]/80 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none"
        />
      </div>

      {/* Document Grid / Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.map((doc) => {
          const badge = getFileBadgeColor(doc.file_type);
          const isSelected = selectedDocIds.includes(doc.id);
          const isDeleting = deletingId === doc.id;

          return (
            <div
              key={doc.id}
              className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? "border-cyan-500/50 bg-[#0c1328]/80 shadow-[0_0_20px_rgba(0,245,212,0.12)]"
                  : "border-white/10 bg-[#0a0d18]/70 hover:border-white/20 hover:bg-[#0d1122]"
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {doc.file_type}
                  </span>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {doc.status === "ready" ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="size-3.5" />
                        <span>Ready</span>
                      </span>
                    ) : doc.status === "processing" ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Ingesting...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <AlertTriangle className="size-3.5" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                </div>

                <h4
                  className="mt-3 font-display text-sm font-semibold text-white line-clamp-1 title"
                  title={doc.title}
                >
                  {doc.title}
                </h4>

                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{formatBytes(doc.file_size)}</span>
                  <span>•</span>
                  <span>{doc.total_chunks} chunks</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onInspectChunks(doc)}
                    className="h-7 px-2 text-xs text-slate-400 hover:text-cyan-300"
                    title="Inspect Vector Chunks"
                  >
                    <Layers className="mr-1 size-3.5" />
                    Chunks
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAskDoc(doc)}
                    className="h-7 px-2 text-xs text-slate-400 hover:text-cyan-300"
                    title="Ask Grounded Questions"
                  >
                    <Sparkles className="mr-1 size-3.5 text-cyan-400" />
                    Ask
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleSelectDoc(doc.id)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting}
                    className="rounded-md p-1 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    title="Delete document"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
