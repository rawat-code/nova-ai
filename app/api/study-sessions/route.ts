import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateStreakFromDates } from "@/lib/study/planner";

const logSessionSchema = z.object({
  duration_minutes: z.number().int().min(1).max(720),
  mode: z.enum(["pomodoro", "quiz", "tutor"]).default("pomodoro"),
});

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

    const { data: sessions, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Compute streak from session creation dates
    const activityDates = (sessions || []).map(
      (s) => new Date(s.created_at).toISOString().split("T")[0]
    );
    const streak = calculateStreakFromDates(activityDates);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayMinutes = (sessions || [])
      .filter((s) => s.created_at.startsWith(todayStr))
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    const totalMinutes = (sessions || []).reduce(
      (sum, s) => sum + (s.duration_minutes || 0),
      0
    );

    return NextResponse.json({
      sessions: sessions || [],
      streak,
      todayMinutes,
      totalMinutes,
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
    const parsed = logSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid session payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { duration_minutes, mode } = parsed.data;

    const { data: session, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: user.id,
        duration_minutes,
        mode,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
