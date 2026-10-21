import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "./provider";
import type { GroundedChunk } from "./rag-prompts";

export interface RetrievalOptions {
  query: string;
  userId: string;
  documentIds?: string[];
  topK?: number;
  similarityThreshold?: number;
  alpha?: number; // 0.0 (pure keyword) to 1.0 (pure vector). Default 0.7
}

export interface ScoredRetrievalChunk extends GroundedChunk {
  vectorScore: number;
  keywordScore: number;
  combinedScore: number;
}

/**
 * Calculates keyword relevance between query terms and chunk text.
 */
export function calculateKeywordScore(query: string, content: string): number {
  const queryTokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (queryTokens.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let matches = 0;

  for (const token of queryTokens) {
    if (contentLower.includes(token)) {
      matches++;
    }
  }

  return matches / queryTokens.length;
}

/**
 * Performs hybrid retrieval (Vector similarity + Keyword search) across student chunks.
 */
export async function retrieveRelevantChunks(
  options: RetrievalOptions
): Promise<ScoredRetrievalChunk[]> {
  const {
    query,
    userId,
    documentIds,
    topK = 6,
    similarityThreshold = 0.40,
    alpha = 0.7,
  } = options;

  const aiProvider = getAIProvider();
  const queryEmbedding = await aiProvider.generateEmbedding(query);

  const supabase = await createClient();

  // Try the hybrid database RPC function first
  try {
    const { data: hybridData, error: hybridError } = await supabase.rpc(
      "match_chunks_hybrid",
      {
        query_text: query,
        query_embedding: queryEmbedding,
        match_threshold: similarityThreshold,
        match_count: topK * 2,
        p_user_id: userId,
        p_document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
      }
    );

    if (!hybridError && Array.isArray(hybridData) && hybridData.length > 0) {
      // Get document titles
      const docIds = [...new Set(hybridData.map((d: { document_id: string }) => d.document_id))];
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title")
        .in("id", docIds);

      const titleMap = new Map<string, string>();
      docs?.forEach((d: { id: string; title: string }) => titleMap.set(d.id, d.title));

      return hybridData.slice(0, topK).map((row: {
        id: string;
        document_id: string;
        content: string;
        page_number: number;
        chunk_index: number;
        vector_score: number;
        keyword_score: number;
        combined_score: number;
      }) => ({
        documentId: row.document_id,
        documentTitle: titleMap.get(row.document_id) || "Study Document",
        pageNumber: row.page_number || 1,
        chunkIndex: row.chunk_index,
        content: row.content,
        similarity: row.vector_score,
        vectorScore: row.vector_score,
        keywordScore: row.keyword_score,
        combinedScore: row.combined_score,
      }));
    }
  } catch {
    // If RPC is unavailable or returns an error, fallback to match_chunks or direct query
  }

  // Fallback 1: match_chunks RPC
  try {
    const { data: vectorData, error: vectorError } = await supabase.rpc(
      "match_chunks",
      {
        query_embedding: queryEmbedding,
        match_threshold: similarityThreshold,
        match_count: topK * 2,
        p_user_id: userId,
        p_document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
      }
    );

    if (!vectorError && Array.isArray(vectorData) && vectorData.length > 0) {
      const docIds = [...new Set(vectorData.map((d: { document_id: string }) => d.document_id))];
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title")
        .in("id", docIds);

      const titleMap = new Map<string, string>();
      docs?.forEach((d: { id: string; title: string }) => titleMap.set(d.id, d.title));

      const scored = vectorData.map((row: {
        id: string;
        document_id: string;
        content: string;
        page_number: number;
        chunk_index: number;
        similarity: number;
      }) => {
        const kScore = calculateKeywordScore(query, row.content);
        const vScore = row.similarity;
        const combined = alpha * vScore + (1 - alpha) * kScore;

        return {
          documentId: row.document_id,
          documentTitle: titleMap.get(row.document_id) || "Study Document",
          pageNumber: row.page_number || 1,
          chunkIndex: row.chunk_index,
          content: row.content,
          similarity: vScore,
          vectorScore: vScore,
          keywordScore: kScore,
          combinedScore: combined,
        };
      });

      return scored.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, topK);
    }
  } catch {
    // Fallback 2: Direct chunks query with keyword scoring
  }

  // Fallback 2: Direct select for cases where vector functions are not active (e.g. dev/test fallback)
  try {
    let queryBuilder = supabase
      .from("chunks")
      .select("id, document_id, content, page_number, chunk_index")
      .eq("user_id", userId)
      .limit(30);

    if (documentIds && documentIds.length > 0) {
      queryBuilder = queryBuilder.in("document_id", documentIds);
    }

    const { data: chunksData } = await queryBuilder;

    if (chunksData && chunksData.length > 0) {
      const docIds = [...new Set(chunksData.map((d: { document_id: string }) => d.document_id))];
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title")
        .in("id", docIds);

      const titleMap = new Map<string, string>();
      docs?.forEach((d: { id: string; title: string }) => titleMap.set(d.id, d.title));

      const scored = chunksData.map((row: {
        id: string;
        document_id: string;
        content: string;
        page_number: number;
        chunk_index: number;
      }) => {
        const kScore = calculateKeywordScore(query, row.content);
        // Default similarity estimate in test fallback
        const vScore = kScore > 0 ? 0.65 : 0.40;
        const combined = alpha * vScore + (1 - alpha) * kScore;

        return {
          documentId: row.document_id,
          documentTitle: titleMap.get(row.document_id) || "Study Document",
          pageNumber: row.page_number || 1,
          chunkIndex: row.chunk_index,
          content: row.content,
          similarity: vScore,
          vectorScore: vScore,
          keywordScore: kScore,
          combinedScore: combined,
        };
      });

      return scored
        .filter((c) => c.combinedScore >= 0.35)
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, topK);
    }
  } catch {
    // No chunks found
  }

  return [];
}
