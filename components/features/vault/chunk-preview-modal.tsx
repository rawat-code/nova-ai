"use client";

import React, { useEffect, useState } from "react";
import { X, Layers, Loader2, Hash, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChunkPreviewModalProps {
  documentId: string | null;
  documentTitle: string;
  onClose: () => void;
}

interface ChunkItem {
  id: string;
  chunk_index: number;
  page_number: number;
  content: string;
}

export function ChunkPreviewModal({
  documentId,
  documentTitle,
  onClose,
}: ChunkPreviewModalProps) {
  const [chunks, setChunks] = useState<ChunkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;
    fetch(`/api/notes/${documentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chunks");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setChunks(data.chunks || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  if (!documentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#0a0d18] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-white">
                Vector Chunks: {documentTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {chunks.length} chunks generated with 768-dim embeddings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="size-6 animate-spin text-cyan-400" />
              <p className="text-xs">Loading vector chunks from pgvector...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
              {error}
            </div>
          ) : chunks.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">
              No chunks recorded for this document yet.
            </div>
          ) : (
            <div className="space-y-4">
              {chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-cyan-500/30"
                >
                  <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Hash className="size-3.5" /> Chunk #{chunk.chunk_index}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <BookOpen className="size-3.5" /> Page {chunk.page_number}
                    </span>
                    <span className="text-slate-500">
                      {chunk.content.length} characters
                    </span>
                  </div>
                  <p className="text-xs font-mono leading-relaxed text-slate-300 whitespace-pre-wrap line-clamp-6 hover:line-clamp-none transition-all">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 px-6 py-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
