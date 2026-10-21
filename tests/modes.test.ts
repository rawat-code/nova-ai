import { describe, it, expect } from "vitest";
import {
  TUTOR_MODES,
  buildSystemInstruction,
  type TutorMode,
} from "@/lib/ai/modes";

describe("Tutor Modes & Prompt Builders", () => {
  const modes: TutorMode[] = ["explain", "deep", "socratic", "exam"];

  it("defines metadata for all four core modes", () => {
    for (const mode of modes) {
      const config = TUTOR_MODES[mode];
      expect(config).toBeDefined();
      expect(config.id).toBe(mode);
      expect(config.name.length).toBeGreaterThan(0);
      expect(config.description.length).toBeGreaterThan(0);
      expect(config.samplePrompt.length).toBeGreaterThan(0);
    }
  });

  describe("Explain Simply Mode", () => {
    it("generates instructions emphasizing analogies and Feynman technique", () => {
      const prompt = buildSystemInstruction("explain");
      expect(prompt).toContain("[MODE: EXPLAIN SIMPLY]");
      expect(prompt).toContain("analogy");
      expect(prompt).toContain("Feynman technique");
      expect(prompt).toContain("Avoid unnecessary academic jargon");
      expect(prompt).toContain("TL;DR");
    });
  });

  describe("Deep Dive Mode", () => {
    it("generates instructions emphasizing derivations, proofs, and edge cases", () => {
      const prompt = buildSystemInstruction("deep");
      expect(prompt).toContain("[MODE: DEEP DIVE]");
      expect(prompt).toContain("first-principles");
      expect(prompt).toContain("derivations");
      expect(prompt).toContain("edge cases");
    });
  });

  describe("Socratic Inquiry Mode", () => {
    it("strictly forbids directly revealing answers and mandates guiding questions", () => {
      const prompt = buildSystemInstruction("socratic");
      expect(prompt).toContain("[MODE: SOCRATIC INQUIRY]");
      expect(prompt).toContain("NEVER directly hand the student the full final solution");
      expect(prompt).toContain("guiding questions");
      expect(prompt).toContain("progressive hint");
    });
  });

  describe("Exam Mode", () => {
    it("mandates rubric grading, score deductions, and missing keyword identification", () => {
      const prompt = buildSystemInstruction("exam");
      expect(prompt).toContain("[MODE: EXAM MODE]");
      expect(prompt).toContain("rubric-based scoring");
      expect(prompt).toContain("key terms that were present or missing");
      expect(prompt).toContain("Score:");
    });
  });

  describe("Context Injection", () => {
    it("injects student grade level and name", () => {
      const prompt = buildSystemInstruction("socratic", {
        studentName: "Alex Rivera",
        gradeLevel: "college",
      });
      expect(prompt).toContain("Target Academic Level: college.");
      expect(prompt).toContain("Student Name: Alex Rivera.");
    });

    it("injects grounded course notes with citations and anti-hallucination constraint", () => {
      const prompt = buildSystemInstruction("explain", {
        citedNotes: [
          {
            title: "Cell_Biology_Lecture_3.pdf",
            page: 14,
            content: "Mitochondria produce ATP through oxidative phosphorylation.",
          },
        ],
      });

      expect(prompt).toContain("[GROUNDED COURSE NOTES]");
      expect(prompt).toContain("[Source 1: Cell_Biology_Lecture_3.pdf (Page 14)]");
      expect(prompt).toContain("Mitochondria produce ATP through oxidative phosphorylation.");
      expect(prompt).toContain("Never hallucinate citations.");
    });
  });
});
