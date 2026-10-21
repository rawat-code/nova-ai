import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateFlashcardsWithRetry } from "@/lib/ai/flashcard-generator";

const generateDeckSchema = z.object({
  topic: z.string().min(2, "Topic is required"),
  documentId: z.string().uuid().optional(),
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

    const body = await req.json();
    const parsed = generateDeckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { topic, documentId, count } = parsed.data;

    let sourceText = "";
    if (documentId) {
      const { data: chunks } = await supabase
        .from("chunks")
        .select("content")
        .eq("document_id", documentId)
        .eq("user_id", user.id)
        .order("chunk_index", { ascending: true })
        .limit(10);

      if (chunks && chunks.length > 0) {
        sourceText = chunks.map((c) => c.content).join("\n\n");
      }
    }

    const generated = await generateFlashcardsWithRetry({
      topic,
      sourceText,
      cardCount: count,
      signal: req.signal,
    });

    const today = new Date().toISOString().split("T")[0];

    const cardRows = generated.map((card) => ({
      user_id: user.id,
      document_id: documentId || null,
      front: card.front,
      back: card.back,
      topic: card.topic || topic,
      repetition: 0,
      interval_days: 1,
      ease_factor: 2.5,
      next_review_at: today,
    }));

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
