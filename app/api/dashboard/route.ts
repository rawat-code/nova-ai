import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateStreakFromDates } from "@/lib/study/planner";
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

    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Parallel queries for real user data
    const [
      sessionsRes,
      attemptsRes,
      cardsDueRes,
      cardsTotalRes,
      docsRes,
      planRes,
      profileRes,
      convsRes,
    ] = await Promise.all([
      supabase
        .from("study_sessions")
        .select("id, duration_minutes, mode, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("quiz_attempts")
        .select("id, score, completed_at, quizzes(topic, difficulty)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(20),
      supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_at", todayStr),
      supabase
        .from("flashcards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("documents")
        .select("id, title, total_chunks, status")
        .eq("user_id", user.id)
        .eq("status", "ready"),
      supabase
        .from("study_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("learning_style, grade_level, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("conversations")
        .select("id, mode")
        .eq("user_id", user.id)
        .limit(50),
    ]);

    const sessions = sessionsRes.data || [];
    const attempts = attemptsRes.data || [];
    const dueCardsCount = cardsDueRes.count || 0;
    const totalCardsCount = cardsTotalRes.count || 0;
    const readyDocs = docsRes.data || [];
    const activePlan = planRes.data || null;

    // 2. Compute combined activity streak
    const activityDates = [
      ...sessions.map((s) => new Date(s.created_at).toISOString().split("T")[0]),
      ...attempts.map((a) => new Date(a.completed_at).toISOString().split("T")[0]),
    ];
    const streak = calculateStreakFromDates(activityDates);

    // 3. Today & Total study minutes
    const todayMinutes = sessions
      .filter((s) => s.created_at.startsWith(todayStr))
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (s.duration_minutes || 0),
      0
    );

    // 4. Past 7 Days Study Time Chart Data
    const past7Days: Array<{ day: string; date: string; minutes: number }> = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];

      const dayMins = sessions
        .filter((s) => s.created_at.startsWith(dateString))
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      past7Days.push({
        day: dayName,
        date: dateString,
        minutes: dayMins,
      });
    }

    // 5. Compute real Learning DNA
    const learningDNA = computeLearningDNA(
      attempts.map((a) => {
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
      sessions,
      profileRes.data,
      convsRes.data || []
    );

    // 6. Recent Quiz History
    const quizHistory = attempts.slice(0, 5).map((a) => {
      const quizObj = Array.isArray(a.quizzes)
        ? a.quizzes[0]
        : (a.quizzes as unknown as { topic?: string; difficulty?: string } | null);
      return {
        id: a.id,
        score: a.score,
        completedAt: a.completed_at,
        topic: quizObj?.topic || "Quiz Assessment",
        difficulty: quizObj?.difficulty || "medium",
      };
    });

    return NextResponse.json({
      streak,
      todayMinutes,
      totalMinutes,
      dueCardsCount,
      totalCardsCount,
      notesCount: readyDocs.length,
      totalChunksCount: readyDocs.reduce((acc, d) => acc + (d.total_chunks || 0), 0),
      past7Days,
      quizHistory,
      learningDNA,
      activePlan,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
