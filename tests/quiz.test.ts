import { describe, it, expect } from "vitest";
import {
  calculateAdaptiveDifficulty,
  extractJsonFromResponse,
  quizSchema,
  quizQuestionSchema,
} from "@/lib/ai/quiz-generator";

describe("Quiz Adaptive Difficulty Engine", () => {
  it("defaults to easy for new students with no past attempts", () => {
    expect(calculateAdaptiveDifficulty([])).toBe("easy");
  });

  it("calculates easy difficulty when average score is below 60%", () => {
    expect(calculateAdaptiveDifficulty([40, 55, 50])).toBe("easy");
  });

  it("calculates medium difficulty when average score is between 60% and 84%", () => {
    expect(calculateAdaptiveDifficulty([65, 75, 80])).toBe("medium");
    expect(calculateAdaptiveDifficulty([60])).toBe("medium");
    expect(calculateAdaptiveDifficulty([84])).toBe("medium");
  });

  it("calculates hard difficulty when average score is 85% or higher", () => {
    expect(calculateAdaptiveDifficulty([85, 90, 95])).toBe("hard");
    expect(calculateAdaptiveDifficulty([100, 90])).toBe("hard");
  });
});

describe("Quiz JSON Extraction & Sanitization", () => {
  it("extracts clean JSON from markdown code block fences", () => {
    const rawWithFence = "```json\n{\"title\": \"Calculus Quiz\", \"topic\": \"Derivatives\"}\n```";
    const extracted = extractJsonFromResponse(rawWithFence);
    expect(extracted).toBe("{\"title\": \"Calculus Quiz\", \"topic\": \"Derivatives\"}");
  });

  it("extracts JSON embedded inside conversational model remarks", () => {
    const rawWithChatter =
      "Here is your customized adaptive quiz:\n\n{\"title\": \"Physics 101\", \"topic\": \"Kinematics\"}\n\nGood luck studying!";
    const extracted = extractJsonFromResponse(rawWithChatter);
    expect(extracted).toBe("{\"title\": \"Physics 101\", \"topic\": \"Kinematics\"}");
  });
});

describe("Quiz Zod Schema Validation", () => {
  it("validates a complete multiple choice question", () => {
    const validMcq = {
      id: "q1",
      type: "mcq",
      question: "What is the speed of light in vacuum?",
      options: ["3 x 10^8 m/s", "1.5 x 10^8 m/s", "3 x 10^6 m/s", "Infinite"],
      correctAnswer: "3 x 10^8 m/s",
      explanation: "Light travels at exactly 299,792,458 m/s in vacuum.",
      difficulty: "easy",
    };

    const parsed = quizQuestionSchema.safeParse(validMcq);
    expect(parsed.success).toBe(true);
  });

  it("validates true/false and short answer question types", () => {
    const validTf = {
      id: "q2",
      type: "true_false",
      question: "Mitochondria possess their own distinct circular DNA.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "According to endosymbiotic theory, mitochondria originated from engulfed prokaryotes.",
      difficulty: "medium",
    };

    const validSa = {
      id: "q3",
      type: "short_answer",
      question: "State the formula for kinetic energy in classical mechanics.",
      correctAnswer: "1/2 mv^2",
      explanation: "Kinetic energy equals one half of mass times velocity squared.",
      difficulty: "easy",
    };

    expect(quizQuestionSchema.safeParse(validTf).success).toBe(true);
    expect(quizQuestionSchema.safeParse(validSa).success).toBe(true);
  });

  it("rejects questions missing essential fields like explanation or correctAnswer", () => {
    const invalidQuestion = {
      id: "q4",
      type: "mcq",
      question: "What is 2+2?",
      // missing correctAnswer and explanation
    };

    expect(quizQuestionSchema.safeParse(invalidQuestion).success).toBe(false);
  });

  it("validates full quiz object structure", () => {
    const fullQuiz = {
      title: "Cellular Biology Mastery Quiz",
      topic: "Cellular Respiration",
      difficulty: "medium",
      questions: [
        {
          id: "q1",
          type: "mcq",
          question: "Where does glycolysis occur within an animal cell?",
          options: ["Cytoplasm", "Mitochondrial Matrix", "Nucleus", "Ribosome"],
          correctAnswer: "Cytoplasm",
          explanation: "Glycolysis is an anaerobic process occurring in the cytoplasm.",
          difficulty: "medium",
        },
      ],
    };

    const result = quizSchema.safeParse(fullQuiz);
    expect(result.success).toBe(true);
  });
});
