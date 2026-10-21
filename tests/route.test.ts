import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tutor/chat/route";
import { NextRequest } from "next/server";
import * as providerModule from "@/lib/ai/provider";

describe("Tutor Chat Streaming Route Handler", () => {
  beforeEach(() => {
    vi.spyOn(providerModule, "getAIProvider").mockReturnValue(
      new providerModule.GeminiProvider({ apiKey: "mock_test_key" })
    );
  });
  it("rejects empty or invalid JSON payloads with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/tutor/chat", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid request payload");
  });

  it("rejects invalid tutor modes with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/tutor/chat", {
      method: "POST",
      body: JSON.stringify({
        mode: "invalid_mode_xyz",
        messages: [{ role: "user", content: "Test" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("accepts valid requests and returns an SSE streaming response", async () => {
    const req = new NextRequest("http://localhost:3000/api/tutor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "socratic",
        messages: [{ role: "user", content: "Explain rotational inertia" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const reader = res.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      text += decoder.decode(value);
    }

    expect(text).toContain("data: ");
    expect(text).toContain("[DONE]");
  }, 30000);
});
