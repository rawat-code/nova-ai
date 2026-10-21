import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch past attempts joined with quiz details
    const { data: attempts, error } = await supabase
      .from("quiz_attempts")
      .select(`
        id,
        quiz_id,
        score,
        answers,
        completed_at,
        quizzes (
          id,
          topic,
          difficulty,
          questions
        )
      `)
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      history: attempts || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
