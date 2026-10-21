import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const submitAttemptSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.record(z.string(), z.string()),
  score: z.number().min(0).max(100),
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
    const parsed = submitAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { quizId, answers, score } = parsed.data;

    // Insert attempt into quiz_attempts
    const { data: attemptRow, error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        score,
        answers,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to record quiz attempt: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attempt: attemptRow,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
