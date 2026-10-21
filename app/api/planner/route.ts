import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { studyPlanScheduleSchema } from "@/lib/study/planner";

const savePlanSchema = z.object({
  id: z.string().uuid().optional(),
  exam_name: z.string().min(1, "Exam name is required"),
  target_date: z.string(), // "YYYY-MM-DD"
  weekly_hours: z.number().int().min(1).max(60),
  schedule: studyPlanScheduleSchema,
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

    const { data: plan, error } = await supabase
      .from("study_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan });
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
    const parsed = savePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid study plan payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, exam_name, target_date, weekly_hours, schedule } = parsed.data;

    let planRecord;
    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from("study_plans")
        .update({
          exam_name,
          target_date,
          weekly_hours,
          schedule,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      planRecord = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from("study_plans")
        .insert({
          user_id: user.id,
          exam_name,
          target_date,
          weekly_hours,
          schedule,
        })
        .select()
        .single();

      if (error) throw error;
      planRecord = data;
    }

    return NextResponse.json({ success: true, plan: planRecord });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
    const id = searchParams.get("id");

    let query = supabase.from("study_plans").delete().eq("user_id", user.id);
    if (id) {
      query = query.eq("id", id);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
