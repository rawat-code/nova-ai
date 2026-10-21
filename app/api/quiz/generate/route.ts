import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateQuizWithRetry, type QuizDifficulty } from "@/lib/ai/quiz-generator";

const generateQuizRequestSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters").max(100),
  documentId: z.string().uuid().optional(),
  questionCount: z.number().int().min(1).max(15).default(5),
  difficulty: z.enum(["easy", "medium", "hard", "adaptive"]).default("adaptive"),
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
    const parsed = generateQuizRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { topic, documentId, questionCount, difficulty } = parsed.data;

    // 1. Fetch document text if documentId is provided
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

    // 2. Fetch past scores for adaptive difficulty calibration
    const pastScores: number[] = [];
    if (difficulty === "adaptive") {
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(10);

      if (attempts && attempts.length > 0) {
        attempts.forEach((a) => {
          if (typeof a.score === "number") pastScores.push(a.score);
        });
      }
    }

    // 3. Generate adaptive quiz with retry and Zod validation
    const generated = await generateQuizWithRetry({
      topic,
      sourceText,
      questionCount,
      requestedDifficulty: difficulty as QuizDifficulty,
      pastScores,
      signal: req.signal,
    });

    // 4. Save quiz to Supabase
    const { data: quizRow, error: saveError } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        topic: generated.topic,
        difficulty: generated.difficulty,
        questions: generated.questions,
      })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { error: `Database error saving quiz: ${saveError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quiz: quizRow,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error during quiz generation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
