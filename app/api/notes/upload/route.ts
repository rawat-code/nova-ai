import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDocument } from "@/lib/ai/ingestion";

export const maxDuration = 60; // 60 seconds for larger PDF embedding jobs

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt", "md", "png", "jpg", "jpeg", "webp"]);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customTitle = formData.get("title") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided in request" }, { status: 400 });
    }

    // 1. File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum 20MB limit (size: ${(file.size / 1024 / 1024).toFixed(1)}MB)` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.type || "application/octet-stream";

    // 2. MIME type & extension validation
    const isValidType = ALLOWED_MIME_TYPES.has(mimeType) || ALLOWED_EXTENSIONS.has(ext);
    if (!isValidType) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${mimeType || ext}. Allowed formats: PDF, DOCX, TXT, MD, PNG, JPG, WEBP.`,
        },
        { status: 400 }
      );
    }

    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);
    const documentId = crypto.randomUUID();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/${documentId}/${sanitizedFileName}`;

    // 3. Upload to private Supabase Storage bucket 'notes'
    try {
      const { error: storageError } = await supabase.storage
        .from("notes")
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (storageError) {
        console.warn("Storage upload warning (continuing with database record):", storageError.message);
      }
    } catch (storageErr) {
      console.warn("Storage upload exception:", storageErr);
    }

    // 4. Create document row in Supabase
    const title = customTitle?.trim() || file.name.replace(/\.[^/.]+$/, "");
    const { data: documentRow, error: docError } = await supabase
      .from("documents")
      .insert({
        id: documentId,
        user_id: user.id,
        title,
        file_path: storagePath,
        file_type: ext,
        file_size: file.size,
        total_chunks: 0,
        status: "processing",
      })
      .select()
      .single();

    if (docError) {
      return NextResponse.json(
        { error: `Failed to create document record: ${docError.message}` },
        { status: 500 }
      );
    }

    // 5. Run Ingestion Pipeline (parse -> clean -> chunk with overlap -> embed -> store chunks)
    const ingestionResult = await ingestDocument({
      documentId,
      userId: user.id,
      fileBuffer,
      fileName: file.name,
      fileType: ext,
    });

    if (!ingestionResult.success) {
      return NextResponse.json(
        {
          error: `Document processing failed: ${ingestionResult.error}`,
          document: { ...documentRow, status: "failed" },
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          ...documentRow,
          status: "ready",
          total_chunks: ingestionResult.totalChunks,
        },
        totalPages: ingestionResult.totalPages,
        totalChunks: ingestionResult.totalChunks,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error during upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
