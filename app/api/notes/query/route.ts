import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { retrieveRelevantChunks } from "@/lib/ai/retrieval";
import { buildGroundedPrompt } from "@/lib/ai/rag-prompts";
import { getAIProvider } from "@/lib/ai/provider";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

const querySchema = z.object({
  query: z.string().min(1, "Query cannot be empty").max(1000, "Query is too long"),
  documentIds: z.array(z.string().uuid()).optional(),
  topK: z.number().int().min(1).max(20).default(6),
  stream: z.boolean().default(true),
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

    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || user.id;
    const rateLimit = await checkRateLimit(user.id || clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before asking another question." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.reset - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = querySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { query, documentIds, topK, stream } = parsed.data;

    // 1. Retrieve student profile to personalize grade level
    const { data: profile } = await supabase
      .from("profiles")
      .select("grade_level")
      .eq("id", user.id)
      .single();

    // 2. Perform hybrid retrieval
    const retrievedChunks = await retrieveRelevantChunks({
      query,
      userId: user.id,
      documentIds,
      topK,
      similarityThreshold: 0.40,
    });

    // 3. Build grounded prompt with untrusted data isolation and citation rules
    const groundedPrompt = buildGroundedPrompt({
      query,
      chunks: retrievedChunks,
      studentGradeLevel: profile?.grade_level || "college",
    });

    const aiProvider = getAIProvider();

    const citations = Array.from(
      new Set(
        retrievedChunks.map((c) => `[Doc: ${c.documentTitle}, Page ${c.pageNumber}]`)
      )
    );

    // If client requested streaming SSE
    if (stream) {
      const chatStream = await aiProvider.streamChat({
        messages: [{ role: "user", content: groundedPrompt.userPromptWithContext }],
        systemInstruction: groundedPrompt.systemInstruction,
        signal: req.signal,
      });

      const responseStream = new ReadableStream({
        async start(controller) {
          const reader = chatStream.getReader();
          const encoder = new TextEncoder();

          // Send citations and context info first
          const initEvent = {
            type: "metadata",
            hasSufficientContext: groundedPrompt.hasSufficientContext,
            citations,
            chunks: retrievedChunks.map((c) => ({
              documentId: c.documentId,
              documentTitle: c.documentTitle,
              pageNumber: c.pageNumber,
              similarity: c.similarity,
            })),
          };
          controller.enqueue(encoder.encode(`event: metadata\ndata: ${JSON.stringify(initEvent)}\n\n`));

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: value })}\n\n`));
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            controller.error(err);
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
        },
      });
    }

    // Non-streaming response
    const answer = await aiProvider.generateChat({
      messages: [{ role: "user", content: groundedPrompt.userPromptWithContext }],
      systemInstruction: groundedPrompt.systemInstruction,
      signal: req.signal,
    });

    return NextResponse.json({
      answer,
      citations,
      chunks: retrievedChunks,
      hasSufficientContext: groundedPrompt.hasSufficientContext,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error during RAG query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
