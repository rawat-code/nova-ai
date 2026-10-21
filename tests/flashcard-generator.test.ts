import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildFlashcardPrompt,
  generateFlashcardsWithRetry,
  type DocumentChunkSource,
} from "@/lib/ai/flashcard-generator";
import * as providerModule from "@/lib/ai/provider";

describe("Flashcard Generation Engine (Grounded In Document Chunks)", () => {
  const sampleChunks: DocumentChunkSource[] = [
    {
      pageNumber: 1,
      chunkIndex: 0,
      content:
        "Mutable objects in Python include list, dict, set. Immutable objects include int, float, str, tuple, frozenset.",
    },
    {
      pageNumber: 2,
      chunkIndex: 1,
      content:
        "Shallow copy (copy.copy) duplicates the outer container only. Deep copy (copy.deepcopy) duplicates nested objects recursively.",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("buildFlashcardPrompt builds a prompt containing document chunk text, page numbers, and safety rules without default topics", () => {
    const { systemInstruction, userPrompt } = buildFlashcardPrompt(
      "python_intermediate_revision.md",
      sampleChunks,
      5
    );

    // 1. Chunk content & metadata assertions
    expect(userPrompt).toContain("python_intermediate_revision.md");
    expect(userPrompt).toContain("Mutable objects in Python include list, dict, set");
    expect(userPrompt).toContain("Shallow copy (copy.copy) duplicates the outer container only");
    expect(userPrompt).toContain("[CHUNK page=1 index=0]");
    expect(userPrompt).toContain("[CHUNK page=2 index=1]");

    // 2. Strict grounding & safety rules
    expect(systemInstruction).toContain("ONLY AND EXCLUSIVELY FROM THE PROVIDED STUDENT NOTES");
    expect(systemInstruction).toContain("NEVER USE OUTSIDE KNOWLEDGE");
    expect(systemInstruction).toContain("UNTRUSTED student notes");
    expect(systemInstruction).toContain("sourcePage");

    // 3. No chemistry or generic default topics
    expect(systemInstruction.toLowerCase()).not.toContain("henderson-hasselbalch");
    expect(systemInstruction.toLowerCase()).not.toContain("le chatelier");
    expect(systemInstruction.toLowerCase()).not.toContain("boltzmann");
    expect(userPrompt.toLowerCase()).not.toContain("conservation of energy");
  });

  it("generateFlashcardsWithRetry passes chunk text to the AI model and validates output with Zod", async () => {
    const mockChat = vi.fn().mockResolvedValue(
      JSON.stringify([
        {
          front: "Which built-in Python collection types are mutable?",
          back: "List, dict, and set are mutable types in Python.",
          sourcePage: 1,
        },
        {
          front: "What is the difference between shallow copy and deep copy in Python?",
          back: "Shallow copy copies the outer container only; deep copy duplicates all nested objects recursively.",
          sourcePage: 2,
        },
      ])
    );

    vi.spyOn(providerModule, "getAIProvider").mockReturnValue({
      name: "mock-gemini",
      streamChat: vi.fn(),
      generateEmbedding: vi.fn(),
      generateChat: mockChat,
    });

    const cards = await generateFlashcardsWithRetry({
      documentTitle: "python_intermediate_revision.md",
      chunks: sampleChunks,
      cardCount: 2,
    });

    // Verify mock was invoked
    expect(mockChat).toHaveBeenCalledTimes(1);
    const callArgs = mockChat.mock.calls[0][0];

    // Assert prompt contains chunk text and not default topics
    expect(callArgs.messages[0].content).toContain(
      "Mutable objects in Python include list, dict, set"
    );
    expect(callArgs.messages[0].content).not.toContain("Conservation of Energy");
    expect(callArgs.messages[0].content).not.toContain("Boltzmann");

    // Assert cards returned match document
    expect(cards).toHaveLength(2);
    expect(cards[0].front).toContain("mutable");
    expect(cards[0].sourcePage).toBe(1);
    expect(cards[1].sourcePage).toBe(2);
  });

  it("retries once on invalid JSON response and succeeds if retry returns valid JSON", async () => {
    const mockChat = vi
      .fn()
      .mockResolvedValueOnce("Invalid non-json response text from model")
      .mockResolvedValueOnce(
        JSON.stringify([
          {
            front: "What does id() return in Python?",
            back: "The memory address of the object.",
            sourcePage: 1,
          },
        ])
      );

    vi.spyOn(providerModule, "getAIProvider").mockReturnValue({
      name: "mock-gemini",
      streamChat: vi.fn(),
      generateEmbedding: vi.fn(),
      generateChat: mockChat,
    });

    const cards = await generateFlashcardsWithRetry({
      documentTitle: "python_intermediate_revision.md",
      chunks: sampleChunks,
      cardCount: 1,
    });

    expect(mockChat).toHaveBeenCalledTimes(2);
    expect(cards).toHaveLength(1);
    expect(cards[0].front).toContain("id()");
  });

  it("throws an error without returning fallback chemistry cards when model repeatedly fails", async () => {
    const mockChat = vi.fn().mockRejectedValue(new Error("Model connection timeout"));

    vi.spyOn(providerModule, "getAIProvider").mockReturnValue({
      name: "mock-gemini",
      streamChat: vi.fn(),
      generateEmbedding: vi.fn(),
      generateChat: mockChat,
    });

    await expect(
      generateFlashcardsWithRetry({
        documentTitle: "python_intermediate_revision.md",
        chunks: sampleChunks,
        cardCount: 3,
      })
    ).rejects.toThrow(/Failed to generate flashcards/);
  });
});
