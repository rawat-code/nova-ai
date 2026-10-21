"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/features/vault/file-uploader";
import { DocumentList, type VaultDocument } from "@/components/features/vault/document-list";
import { ChunkPreviewModal } from "@/components/features/vault/chunk-preview-modal";
import { GroundedQaPanel } from "@/components/features/vault/grounded-qa-panel";

export default function VaultPage() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [inspectDoc, setInspectDoc] = useState<VaultDocument | null>(null);

  const refreshDocuments = useCallback(() => {
    setLoading(true);
    fetch("/api/notes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setDocuments(data.documents || []);
        }
      })
      .catch((err) => console.warn("Failed to fetch documents:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/notes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setDocuments(data.documents || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setSelectedDocIds((prev) => prev.filter((dId) => dId !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAskDoc = (doc: VaultDocument) => {
    setSelectedDocIds([doc.id]);
    // Scroll smoothly to QA panel
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const totalChunks = documents.reduce((acc, doc) => acc + (doc.total_chunks || 0), 0);
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const formattedStorage = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Notes Vault
            </h1>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
              RAG Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Upload lecture notes, textbooks, and syllabus PDFs. Vectorized with 768-dim embeddings for cited Q&A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDocuments}
            disabled={loading}
            className="border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`mr-2 size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <FolderOpen className="size-4 text-cyan-400" />
            <span>Documents</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {documents.length}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Layers className="size-4 text-indigo-400" />
            <span>Vector Chunks</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {totalChunks}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <HardDrive className="size-4 text-sky-400" />
            <span>Vault Storage</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">
            {formattedStorage} <span className="text-sm font-normal text-slate-400">MB</span>
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0d18]/60 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Isolation</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-emerald-400">
            RLS Active
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/40 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-white">
            Add New Study Material
          </h2>
          <span className="text-xs text-slate-400">
            Max 20MB · PDF, DOCX, TXT, MD, Images
          </span>
        </div>
        <FileUploader onUploadSuccess={refreshDocuments} />
      </div>

      {/* Document Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Your Indexed Study Notes
          </h2>
          <span className="text-xs text-slate-400">
            {documents.length} document{documents.length === 1 ? "" : "s"} indexed
          </span>
        </div>

        <DocumentList
          documents={documents}
          selectedDocIds={selectedDocIds}
          onToggleSelectDoc={handleToggleSelectDoc}
          onInspectChunks={(doc) => setInspectDoc(doc)}
          onAskDoc={handleAskDoc}
          onDeleteDoc={handleDeleteDoc}
        />
      </div>

      {/* Grounded Notes Q&A Panel */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">
          Citation-Grounded Q&A
        </h2>
        <GroundedQaPanel
          selectedDocIds={selectedDocIds}
          docCount={documents.length}
        />
      </div>

      {/* Chunk Inspection Modal */}
      <ChunkPreviewModal
        documentId={inspectDoc?.id || null}
        documentTitle={inspectDoc?.title || ""}
        onClose={() => setInspectDoc(null)}
      />
    </div>
  );
}
