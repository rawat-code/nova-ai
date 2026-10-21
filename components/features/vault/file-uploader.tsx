"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onUploadSuccess: () => void;
}

const ACCEPTED_TYPES = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMessage(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File exceeds 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setSelectedFile(null);
      return;
    }

    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!ACCEPTED_TYPES.includes(ext)) {
      setErrorMessage(
        `Unsupported file type (${ext}). Please upload a PDF, DOCX, TXT, MD, or study image.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress("Uploading to secure storage...");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (documentTitle.trim()) {
        formData.append("title", documentTitle.trim());
      }

      setUploadProgress("Parsing text, extracting pages & generating vector embeddings...");
      const res = await fetch("/api/notes/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress("Document indexed and ready in pgvector!");
      setSelectedFile(null);
      setDocumentTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        setUploadProgress(null);
        onUploadSuccess();
      }, 1000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to upload document");
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(0,245,212,0.2)]"
            : selectedFile
            ? "border-cyan-500/50 bg-[#0d1222]/80 shadow-[0_0_20px_rgba(0,245,212,0.1)]"
            : "border-white/10 bg-[#0a0d18]/60 hover:border-white/20 hover:bg-[#0c1020]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400 transition-transform duration-300 group-hover:scale-105 group-hover:border-cyan-400/30 group-hover:shadow-[0_0_20px_rgba(0,245,212,0.25)]">
          {isUploading ? (
            <Loader2 className="size-7 animate-spin text-cyan-400" />
          ) : (
            <Upload className="size-7" />
          )}
        </div>

        <div className="mt-4">
          <p className="font-display text-base font-semibold text-white">
            {selectedFile ? (
              <span className="text-cyan-300">{selectedFile.name}</span>
            ) : (
              <>
                Drag & drop your study notes, or{" "}
                <span className="text-cyan-400 underline underline-offset-4">browse</span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Supports PDF, DOCX, TXT, Markdown, and whiteboard images (up to 20MB)
          </p>
        </div>
      </div>

      {/* Selected file actions & title input */}
      {selectedFile && !isUploading && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-[#0d1224]/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="size-5" />
            </div>
            <div>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document Title"
                className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-sm font-medium text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <p className="mt-1 text-xs text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click Upload to ingest & vectorize
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setDocumentTitle("");
              }}
              className="border-white/10 text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 font-semibold text-black hover:opacity-95"
            >
              Upload & Vectorize
            </Button>
          </div>
        </div>
      )}

      {/* Progress state */}
      {isUploading && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-cyan-300">
          <Loader2 className="size-4 animate-spin text-cyan-400 shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
