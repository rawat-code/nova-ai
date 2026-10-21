import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeLearningDNA } from "@/lib/study/learning-dna";

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

    // 1. Fetch real quiz attempts and quizzes
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("id, score, completed_at, quizzes(topic, difficulty)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(100);

    // 2. Fetch real study sessions
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("id, duration_minutes, mode, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    // 3. Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("learning_style, grade_level")
      .eq("id", user.id)
      .maybeSingle();

    // 4. Fetch conversations
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id, mode")
      .eq("user_id", user.id)
      .limit(50);

    // 5. Compute real Learning DNA (No fake data!)
    const insights = computeLearningDNA(
      (attempts || []).map((a) => {
        const quizObj = Array.isArray(a.quizzes)
          ? a.quizzes[0]
          : (a.quizzes as unknown as { topic?: string; difficulty?: string } | null);
        return {
          id: a.id,
          score: a.score,
          completed_at: a.completed_at,
          quizzes: quizObj
            ? {
                topic: quizObj.topic || "General",
                difficulty: quizObj.difficulty || "medium",
              }
            : null,
        };
      }),
      sessions || [],
      profile,
      conversations || []
    );

    // 6. Upsert into learning_insights table
    try {
      await supabase
        .from("learning_insights")
        .upsert(
          {
            user_id: user.id,
            topic_mastery: insights.topicMastery,
            optimal_study_hours: insights.optimalStudyHours,
            struggling_topics: insights.strugglingTopics,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    } catch (saveErr) {
      console.warn("[LearningDNA] Failed to persist insights to DB:", saveErr);
    }

    return NextResponse.json({ insights });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
