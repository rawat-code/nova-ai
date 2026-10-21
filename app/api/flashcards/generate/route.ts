import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateFlashcardsWithRetry } from "@/lib/ai/flashcard-generator";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

const generateDeckSchema = z.object({
  documentId: z.string().uuid("A valid document ID is required"),
  topic: z.string().optional(),
  count: z.number().int().min(1).max(20).default(6),
});

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

    const rateLimit = await checkRateLimit(`flashcards:${user.id}`, 20, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before generating another deck.",
          limit: rateLimit.limit,
          reset: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const parsed = generateDeckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { documentId, topic, count } = parsed.data;

    // 1. Fetch document metadata scoped to current user
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("id, title, status")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Selected document not found or you do not have permission to access it." },
        { status: 404 }
      );
    }

    // 2. Fetch document chunks strictly scoped to current user
    const { data: chunks, error: chunkError } = await supabase
      .from("chunks")
      .select("id, document_id, content, page_number, chunk_index")
      .eq("document_id", documentId)
      .eq("user_id", user.id)
      .order("chunk_index", { ascending: true })
      .limit(20);

    if (chunkError) {
      return NextResponse.json(
        { error: `Database error retrieving document chunks: ${chunkError.message}` },
        { status: 500 }
      );
    }

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        {
          error:
            "No indexed text chunks found for this document. Please ensure the document is uploaded and vectorized in your Notes Vault.",
        },
        { status: 400 }
      );
    }

    // 3. Generate flashcards strictly from the document chunks
    const generated = await generateFlashcardsWithRetry({
      documentTitle: document.title,
      chunks: chunks.map((c) => ({
        content: c.content,
        pageNumber: c.page_number,
        chunkIndex: c.chunk_index,
      })),
      cardCount: count,
      signal: req.signal,
    });

    const today = new Date().toISOString().split("T")[0];
    const deckTopic = topic?.trim() || document.title;

    // 4. Save cards with document_id and source page citations
    const cardRows = generated.map((card) => {
      const pageInfo = card.sourcePage ? ` (Page ${card.sourcePage})` : "";
      const backWithSource = `${card.back}\n\n> 📄 *Source: ${document.title}${pageInfo}*`;

      return {
        user_id: user.id,
        document_id: document.id,
        front: card.front,
        back: backWithSource,
        topic: deckTopic,
        repetition: 0,
        interval_days: 1,
        ease_factor: 2.5,
        next_review_at: today,
      };
    });

    const { data: inserted, error: insertError } = await supabase
      .from("flashcards")
      .insert(cardRows)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: `Database error saving flashcards: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: inserted?.length || 0,
      flashcards: inserted || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
