import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateStudyPlanWithAI } from "@/lib/ai/planner-generator";

const generatePlanSchema = z.object({
  examName: z.string().min(1, "Exam/goal name is required"),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be in YYYY-MM-DD format"),
  weeklyHours: z.number().int().min(1).max(60).default(10),
  topics: z.array(z.string()).optional(),
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
    const parsed = generatePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid study plan request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { examName, targetDate, weeklyHours, topics } = parsed.data;

    // If topics not provided, fetch user's indexed document titles as topics
    let finalTopics = topics || [];
    if (finalTopics.length === 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("title")
        .eq("user_id", user.id)
        .eq("status", "ready")
        .limit(10);

      if (docs && docs.length > 0) {
        finalTopics = docs.map((d) => d.title.replace(/\.[^/.]+$/, ""));
      }
    }

    const schedule = await generateStudyPlanWithAI({
      examName,
      targetDate,
      weeklyHours,
      topics: finalTopics,
      signal: req.signal,
    });

    return NextResponse.json({
      success: true,
      schedule,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
