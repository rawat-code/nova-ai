import { describe, it, expect } from "vitest";
import { cleanExtractedText } from "@/lib/ai/parser";
import { chunkPages } from "@/lib/ai/chunker";

describe("Text Cleaning & Sanitization", () => {
  it("normalizes inconsistent line breaks and trims whitespace", () => {
    const raw = "  Line 1\r\nLine 2\rLine 3\n\n\n\nLine 4   ";
    const cleaned = cleanExtractedText(raw);
    expect(cleaned).toBe("Line 1\nLine 2\nLine 3\n\nLine 4");
  });

  it("removes non-printable null bytes and control characters", () => {
    const dirty = "Study\x00Notes\x07with\x1Fhidden\x08bytes";
    const cleaned = cleanExtractedText(dirty);
    expect(cleaned).toBe("StudyNoteswithhiddenbytes");
  });

  it("returns empty string for empty or null-like inputs", () => {
    expect(cleanExtractedText("")).toBe("");
    expect(cleanExtractedText("    \n\n\t  ")).toBe("");
  });
});

describe("Document Chunking Engine", () => {
  it("preserves exact page numbers for each chunk", () => {
    const pages = [
      { pageNumber: 1, text: "Newton's First Law of Motion: An object remains at rest unless acted upon." },
      { pageNumber: 2, text: "Newton's Second Law: Force equals mass times acceleration (F = ma)." },
      { pageNumber: 3, text: "Newton's Third Law: For every action, there is an equal and opposite reaction." },
    ];

    const chunks = chunkPages(pages, { chunkSize: 500, overlap: 50 });

    expect(chunks).toHaveLength(3);
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].content).toContain("First Law");

    expect(chunks[1].pageNumber).toBe(2);
    expect(chunks[1].chunkIndex).toBe(1);
    expect(chunks[1].content).toContain("Second Law");

    expect(chunks[2].pageNumber).toBe(3);
    expect(chunks[2].chunkIndex).toBe(2);
    expect(chunks[2].content).toContain("Third Law");
  });

  it("splits long single-page documents into multiple chunks with overlap", () => {
    // Generate a long text with distinct sentences
    const sentences = [
      "Mitochondria are the powerhouses of the cell generating ATP through cellular respiration.",
      "The citric acid cycle, also known as the Krebs cycle, takes place within the mitochondrial matrix.",
      "Electron transport chains embedded in the inner mitochondrial membrane pump protons creating an electrochemical gradient.",
      "ATP synthase utilizes this proton-motive force to phosphorylate adenosine diphosphate into ATP.",
      "Glycolysis occurs in the cytoplasm producing pyruvate which is subsequently transported into the mitochondria.",
      "Anaerobic conditions result in lactic acid fermentation or ethanol fermentation depending on the organism.",
    ];

    const longText = sentences.join(" ");
    const pages = [{ pageNumber: 1, text: longText }];

    const chunkSize = 160;
    const overlap = 50;

    const chunks = chunkPages(pages, { chunkSize, overlap, minChunkSize: 20 });

    expect(chunks.length).toBeGreaterThan(1);
    // All chunks must retain pageNumber 1
    chunks.forEach((chunk) => {
      expect(chunk.pageNumber).toBe(1);
      expect(chunk.content.length).toBeGreaterThanOrEqual(20);
    });

    // Check that consecutive chunks exhibit overlap
    for (let i = 0; i < chunks.length - 1; i++) {
      const currentChunk = chunks[i].content;
      const nextChunk = chunks[i + 1].content;

      // Extract words from the end of currentChunk
      const currentWords = currentChunk.split(/\s+/).filter(Boolean);

      // At least some phrase near the end of current should be present or near the start of next
      const overlapFound = nextChunk.toLowerCase().includes(currentWords[currentWords.length - 1].toLowerCase());
      expect(overlapFound, `Chunks ${i} and ${i + 1} should share overlap words`).toBe(true);
    }
  });

  it("splits gracefully along natural sentence and paragraph boundaries", () => {
    const textWithParagraphs =
      "Introduction to Thermodynamics.\n\nFirst Law deals with energy conservation in closed systems.\n\nSecond Law defines entropy and the irreversible direction of natural spontaneous processes.";

    const pages = [{ pageNumber: 1, text: textWithParagraphs }];
    const chunks = chunkPages(pages, { chunkSize: 100, overlap: 20 });

    expect(chunks.length).toBeGreaterThan(1);
    // Ensure chunks don't cut words in half
    chunks.forEach((chunk) => {
      expect(chunk.content.trim()).not.toMatch(/^\S{20,}$/); // Not a broken word
    });
  });

  it("ignores completely empty pages without crashing", () => {
    const pages = [
      { pageNumber: 1, text: "" },
      { pageNumber: 2, text: "   \n\t   " },
      { pageNumber: 3, text: "Valid content on page three." },
    ];

    const chunks = chunkPages(pages);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].pageNumber).toBe(3);
    expect(chunks[0].content).toContain("Valid content");
  });
});
