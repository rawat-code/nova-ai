import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default function VaultPlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
        <BookOpen className="size-7" />
      </div>
      <Badge variant="secondary" className="mt-5">
        Phase 4 Target
      </Badge>
      <h2 className="font-display mt-3 text-2xl font-bold text-white tracking-tight">
        Notes Vault & RAG Engine
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Upload course PDFs, DOCX, and slides. Chunk, vectorize with text-embedding-004, and ask citation-grounded questions.
      </p>
    </div>
  );
}
