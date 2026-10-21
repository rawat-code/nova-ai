import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createCardSchema = z.object({
  front: z.string().min(2, "Front text is required"),
  back: z.string().min(2, "Back text is required"),
  topic: z.string().min(2, "Topic is required"),
  documentId: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dueOnly = searchParams.get("dueOnly") === "true";
    const topic = searchParams.get("topic");

    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id);

    if (dueOnly) {
      query = query.lte("next_review_at", today);
    }

    if (topic && topic.trim()) {
      query = query.eq("topic", topic.trim());
    }

    const { data: cards, error } = await query.order("next_review_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get count of total cards and due cards for summary badge
    const { count: totalCount } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: dueCount } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .lte("next_review_at", today);

    return NextResponse.json({
      cards: cards || [],
      totalCount: totalCount || 0,
      dueCount: dueCount || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const parsed = createCardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid flashcard data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { front, back, topic, documentId } = parsed.data;
    const today = new Date().toISOString().split("T")[0];

    const { data: card, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: user.id,
        document_id: documentId || null,
        front,
        back,
        topic,
        repetition: 0,
        interval_days: 1,
        ease_factor: 2.5,
        next_review_at: today,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, card }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
