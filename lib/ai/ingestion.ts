import { createClient } from "@/lib/supabase/server";
import { parseDocumentFile } from "./parser";
import { chunkPages, type DocumentChunk } from "./chunker";
import { getAIProvider } from "./provider";

export interface IngestionInput {
  documentId: string;
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
  fileType: string;
}

export interface IngestionResult {
  success: boolean;
  documentId: string;
  totalPages: number;
  totalChunks: number;
  error?: string;
}

/**
 * End-to-end document ingestion pipeline:
 * parse -> clean -> chunk (preserving page numbers) -> embed (768-dim) -> store in pgvector.
 */
export async function ingestDocument(input: IngestionInput): Promise<IngestionResult> {
  const { documentId, userId, fileBuffer, fileName, fileType } = input;
  const supabase = await createClient();
  const aiProvider = getAIProvider();

  try {
    // 1. Update document status to 'processing'
    await supabase
      .from("documents")
      .update({ status: "processing" })
      .eq("id", documentId)
      .eq("user_id", userId);

    // 2. Parse document into pages
    const parsedDoc = await parseDocumentFile(fileBuffer, fileName, fileType);

    if (parsedDoc.pages.length === 0 || !parsedDoc.fullText.trim()) {
      throw new Error("No readable text could be extracted from this document.");
    }

    // 3. Chunk with natural boundaries, overlap, and page tracking
    const chunks: DocumentChunk[] = chunkPages(parsedDoc.pages, {
      chunkSize: 1200,
      overlap: 200,
      minChunkSize: 30,
    });

    if (chunks.length === 0) {
      throw new Error("Document text is too brief to generate meaningful study chunks.");
    }

    // 4. Generate embeddings (dense 768-dim vector) in batches of 5 to avoid throttling
    const batchSize = 5;
    const chunkRows: Array<{
      document_id: string;
      user_id: string;
      content: string;
      page_number: number;
      chunk_index: number;
      embedding: number[];
      metadata: Record<string, unknown>;
    }> = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await Promise.all(
        batch.map((c) => aiProvider.generateEmbedding(c.content))
      );

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        chunkRows.push({
          document_id: documentId,
          user_id: userId,
          content: chunk.content,
          page_number: chunk.pageNumber,
          chunk_index: chunk.chunkIndex,
          embedding: embeddings[j],
          metadata: {
            ...chunk.metadata,
            fileName,
            fileType,
          },
        });
      }
    }

    // 5. Store chunks in Supabase
    // Delete any old chunks for this document if re-processing
    await supabase.from("chunks").delete().eq("document_id", documentId);

    // Insert new chunk rows in batches of 50
    for (let i = 0; i < chunkRows.length; i += 50) {
      const chunkBatch = chunkRows.slice(i, i + 50);
      const { error: insertError } = await supabase.from("chunks").insert(chunkBatch);
      if (insertError) {
        throw new Error(`Database error saving chunks: ${insertError.message}`);
      }
    }

    // 6. Update document status to 'ready'
    await supabase
      .from("documents")
      .update({
        status: "ready",
        total_chunks: chunkRows.length,
      })
      .eq("id", documentId)
      .eq("user_id", userId);

    return {
      success: true,
      documentId,
      totalPages: parsedDoc.totalPages,
      totalChunks: chunkRows.length,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Update document status to 'failed'
    try {
      await supabase
        .from("documents")
        .update({
          status: "failed",
        })
        .eq("id", documentId)
        .eq("user_id", userId);
    } catch {
      // Ignore database cleanup errors
    }

    return {
      success: false,
      documentId,
      totalPages: 0,
      totalChunks: 0,
      error: errorMsg,
    };
  }
}
