import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateSM2FromRating, type UserRating } from "@/lib/study/sm2";

const reviewSchema = z.object({
  cardId: z.string().uuid(),
  rating: z.enum(["again", "hard", "good", "easy"]),
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
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid review payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { cardId, rating } = parsed.data;

    // 1. Fetch current card state
    const { data: card, error: fetchError } = await supabase
      .from("flashcards")
      .select("id, repetition, interval_days, ease_factor")
      .eq("id", cardId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !card) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    // 2. Compute SM-2 update
    const sm2Result = calculateSM2FromRating(
      {
        repetition: card.repetition,
        intervalDays: card.interval_days,
        easeFactor: Number(card.ease_factor),
      },
      rating as UserRating
    );

    // 3. Update card in Supabase
    const { data: updatedCard, error: updateError } = await supabase
      .from("flashcards")
      .update({
        repetition: sm2Result.repetition,
        interval_days: sm2Result.intervalDays,
        ease_factor: sm2Result.easeFactor,
        next_review_at: sm2Result.nextReviewDate,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", cardId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update flashcard review: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
      sm2: sm2Result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
