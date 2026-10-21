import { describe, it, expect } from "vitest";
import { GeminiProvider } from "@/lib/ai/provider";

describe("AI Provider Abstraction & Gemini Implementation", () => {
  it("initializes with mock API key in testing environment", () => {
    const provider = new GeminiProvider({ apiKey: "mock_test_key" });
    expect(provider.name).toBe("gemini");
  });

  it("streams chat responses with chunked text", async () => {
    const provider = new GeminiProvider({ apiKey: "mock_test_key" });
    const stream = await provider.streamChat({
      messages: [{ role: "user", content: "What is thermodynamics?" }],
      systemInstruction: "You are in Socratic mode.",
    });

    const reader = stream.getReader();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += value;
    }

    expect(accumulated).toContain("Nova AI Tutor Response");
    expect(accumulated).toContain("thermodynamics");
    expect(accumulated).toContain("entropy");
  });

  it("handles abort signals cleanly", async () => {
    const provider = new GeminiProvider({ apiKey: "mock_test_key" });
    const controller = new AbortController();

    const streamPromise = provider.streamChat({
      messages: [{ role: "user", content: "Long task" }],
      signal: controller.signal,
    });

    const stream = await streamPromise;
    const reader = stream.getReader();

    // Abort after first chunk
    controller.abort();

    await expect(reader.read()).rejects.toThrow();
  });

  it("generates 768-dimensional embeddings", async () => {
    const provider = new GeminiProvider({ apiKey: "mock_test_key" });
    const embedding = await provider.generateEmbedding("Calculus derivative test");

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding).toHaveLength(768);
    expect(typeof embedding[0]).toBe("number");
  });
});
