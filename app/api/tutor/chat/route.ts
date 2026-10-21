import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAIProvider, type ChatMessage } from "@/lib/ai/provider";
import { buildSystemInstruction, type TutorMode } from "@/lib/ai/modes";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { createClient } from "@/lib/supabase/server";

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  mode: z.enum(["explain", "deep", "socratic", "exam"]).default("socratic"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model", "system"]),
        content: z.string().min(1, "Message content cannot be empty"),
      })
    )
    .min(1, "At least one message is required"),
  topic: z.string().optional(),
  documentIds: z.array(z.string().uuid()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Zod Validation
    const body = await req.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { conversationId, mode, messages, topic, documentIds } = parsed.data;

    // 2. Authentication & User Identification
    let userId: string = "anonymous-dev-user";
    let studentName: string | undefined;
    let gradeLevel: string | undefined;
    let learningStyle: string | undefined;
    let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

    try {
      supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;

        // Fetch student profile for personalized pedagogical context
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, grade_level, learning_style")
          .eq("id", user.id)
          .single();

        if (profile) {
          studentName = profile.full_name || undefined;
          gradeLevel = profile.grade_level || undefined;
          learningStyle = profile.learning_style || undefined;
        }
      }
    } catch {
      // In dev mode without active cookie session, proceed with dev user ID
    }

    // 3. Rate Limiting Check (30 requests per minute)
    const rateLimit = await checkRateLimit(userId, 30, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending another prompt.",
          limit: rateLimit.limit,
          reset: rateLimit.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 4. Grounded Notes Retrieval (RAG via pgvector match_chunks if documents provided)
    let citedNotes: Array<{ title: string; page?: number; content: string }> | undefined;
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    if (supabase && userId !== "anonymous-dev-user" && documentIds && documentIds.length > 0 && lastUserMessage) {
      try {
        const aiProvider = getAIProvider();
        const queryEmbedding = await aiProvider.generateEmbedding(lastUserMessage);

        const { data: matchingChunks, error: matchError } = await supabase.rpc("match_chunks", {
          query_embedding: queryEmbedding,
          match_threshold: 0.65,
          match_count: 4,
          p_user_id: userId,
          p_document_ids: documentIds,
        });

        if (!matchError && Array.isArray(matchingChunks) && matchingChunks.length > 0) {
          // Fetch document titles for citations
          const { data: docs } = await supabase
            .from("documents")
            .select("id, title")
            .in("id", documentIds);

          const docMap = new Map((docs || []).map((d) => [d.id, d.title]));

          citedNotes = matchingChunks.map((chunk) => ({
            title: docMap.get(chunk.document_id) || "Uploaded Note",
            page: chunk.page_number || undefined,
            content: chunk.content,
          }));
        }
      } catch (ragError) {
        console.warn("[TutorChat] RAG retrieval failed, proceeding without citations:", ragError);
      }
    }

    // 5. Build Dynamic System Prompt with Pedagogical Guardrails
    const systemInstruction = buildSystemInstruction(mode as TutorMode, {
      studentName,
      gradeLevel,
      learningStyle,
      topic,
      citedNotes,
    });

    // 6. Request Stream from AI Provider
    const aiProvider = getAIProvider();
    const chatStream = await aiProvider.streamChat({
      messages: messages as ChatMessage[],
      systemInstruction,
      temperature: mode === "deep" ? 0.4 : mode === "exam" ? 0.3 : 0.7,
      signal: req.signal,
    });

    // 7. Stream Response & Optional Asynchronous Database Persistence
    const encoder = new TextEncoder();
    let accumulatedText = "";

    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = chatStream.getReader();

        try {
          while (true) {
            if (req.signal.aborted) {
              controller.close();
              break;
            }

            const { done, value } = await reader.read();
            if (done) break;

            accumulatedText += value;
            // Send chunk to client in standard SSE format
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: value })}\n\n`));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

          // Persist conversation & messages if Supabase session and conversationId are present
          if (supabase && userId !== "anonymous-dev-user" && conversationId) {
            try {
              // Save user message
              const userMsg = messages[messages.length - 1];
              if (userMsg && userMsg.role === "user") {
                await supabase.from("messages").insert({
                  conversation_id: conversationId,
                  user_id: userId,
                  role: "user",
                  content: userMsg.content,
                  citations: [],
                });
              }

              // Save assistant response
              if (accumulatedText.trim().length > 0) {
                await supabase.from("messages").insert({
                  conversation_id: conversationId,
                  user_id: userId,
                  role: "model",
                  content: accumulatedText,
                  citations: citedNotes || [],
                });

                // Update conversation timestamp
                await supabase
                  .from("conversations")
                  .update({ updated_at: new Date().toISOString() })
                  .eq("id", conversationId);
              }
            } catch (dbErr) {
              console.warn("[TutorChat] Background persistence failed:", dbErr);
            }
          }
        } catch (err: unknown) {
          if (!req.signal.aborted) {
            console.error("[TutorChat] Stream error:", err);
            const errMessage = err instanceof Error ? err.message : "Stream processing error";
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMessage })}\n\n`));
          }
          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("[TutorChat] Unhandled route error:", error);
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: "Tutor service temporarily unavailable", details: errMessage }, { status: 500 });
  }
}
