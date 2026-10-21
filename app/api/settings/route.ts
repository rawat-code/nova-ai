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

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, grade_level, learning_style, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || "Scholar",
        grade_level: "college",
        learning_style: "socratic",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, grade_level, learning_style } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof full_name === "string") updates.full_name = full_name.trim();
    if (["high_school", "college", "graduate"].includes(grade_level)) {
      updates.grade_level = grade_level;
    }
    if (["visual", "socratic", "deep_dive", "simplified"].includes(learning_style)) {
      updates.learning_style = learning_style;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      // If profile row didn't exist yet, insert it
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: updates.full_name || user.user_metadata?.full_name || "Scholar",
          grade_level: updates.grade_level || "college",
          learning_style: updates.learning_style || "socratic",
          ...updates,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, profile: insertedProfile });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
