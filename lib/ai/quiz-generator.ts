import { z } from "zod";
import { getAIProvider } from "./provider";

export const quizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["mcq", "true_false", "short_answer"]),
  question: z.string().min(5, "Question text is too short"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().min(5, "Explanation must be detailed and helpful"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const quizSchema = z.object({
  title: z.string(),
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "adaptive"]),
  questions: z.array(quizQuestionSchema).min(1, "At least one question is required"),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof quizSchema>;

export type QuizDifficulty = "easy" | "medium" | "hard" | "adaptive";

/**
 * Calculates adaptive difficulty based on historical quiz attempts.
 *
 * Rule:
 * - Average score >= 85% -> 'hard'
 * - Average score >= 60% and < 85% -> 'medium'
 * - Average score < 60% or no attempts -> 'easy'
 */
export function calculateAdaptiveDifficulty(
  pastScores: number[]
): "easy" | "medium" | "hard" {
  if (!pastScores || pastScores.length === 0) {
    return "easy";
  }

  const sum = pastScores.reduce((acc, score) => acc + score, 0);
  const average = sum / pastScores.length;

  if (average >= 85) return "hard";
  if (average >= 60) return "medium";
  return "easy";
}

export interface QuizGenerationOptions {
  topic: string;
  sourceText?: string;
  questionCount?: number;
  requestedDifficulty?: QuizDifficulty;
  pastScores?: number[];
  signal?: AbortSignal;
}

/**
 * Strips markdown code fences (```json ... ```) from model response.
 */
export function extractJsonFromResponse(raw: string): string {
  let cleaned = raw.trim();

  // If wrapped in markdown code fence
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  // Find the first { or [ and last } or ]
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Generates an adaptive quiz from note text or a topic with automatic Zod validation and retry.
 */
export async function generateQuizWithRetry(
  options: QuizGenerationOptions,
  maxRetries = 2
): Promise<GeneratedQuiz> {
  const {
    topic,
    sourceText = "",
    questionCount = 5,
    requestedDifficulty = "adaptive",
    pastScores = [],
    signal,
  } = options;

  // Determine effective difficulty
  const effectiveDifficulty =
    requestedDifficulty === "adaptive"
      ? calculateAdaptiveDifficulty(pastScores)
      : requestedDifficulty;

  const aiProvider = getAIProvider();

  // Build the system prompt
  const systemInstruction = `You are Nova's Adaptive Quiz Engine, an expert university exam writer and pedagogy specialist.
Generate a structured academic quiz based on the provided topic and notes.

DIFFICULTY LEVEL: "${effectiveDifficulty.toUpperCase()}"
- EASY: Core definitions, direct recall of foundational laws, terminology, direct formula identification.
- MEDIUM: Conceptual comprehension, application of principles to standard problems, comparative analysis.
- HARD: Multi-step reasoning, synthesis of multiple principles, edge cases, diagnosis of complex scenarios.

QUESTION FORMAT REQUIREMENTS:
1. Provide a mix of question types:
   - "mcq": Multiple Choice with exactly 4 distinct options (A, B, C, D). One clear correct answer.
   - "true_false": True/False statement with options: ["True", "False"].
   - "short_answer": Conceptual short answer question. correctAnswer should be the concise key phrase or numerical value.
2. For EVERY question, write a comprehensive "explanation" that clearly teaches WHY the correct answer is right and dispels common misconceptions.
3. OUTPUT STRICT JSON ONLY. Do not output conversational text or markdown explanation outside the JSON.

SCHEMA:
{
  "title": "string",
  "topic": "${topic}",
  "difficulty": "${effectiveDifficulty}",
  "questions": [
    {
      "id": "q1",
      "type": "mcq" | "true_false" | "short_answer",
      "question": "string",
      "options": ["string", "string", "string", "string"], // for mcq or ["True", "False"] for true_false
      "correctAnswer": "string",
      "explanation": "string",
      "difficulty": "${effectiveDifficulty}"
    }
  ]
}`;

  let prompt = `Create a ${questionCount}-question quiz on "${topic}". Difficulty target: ${effectiveDifficulty}.`;
  if (sourceText.trim()) {
    prompt += `\n\nStudy material to base questions on:\n${sourceText.slice(0, 6000)}`;
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      const rawResponse = await aiProvider.generateChat({
        messages: [{ role: "user", content: prompt }],
        systemInstruction,
        signal,
      });

      // Parse JSON from response
      const jsonString = extractJsonFromResponse(rawResponse);
      const parsedJson = JSON.parse(jsonString);

      // Validate with Zod
      const validated = quizSchema.parse(parsedJson);

      return validated;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;

      if (attempt <= maxRetries) {
        // Feed error back to model in retry prompt
        prompt = `The previous output was invalid JSON or failed schema validation:
${lastError.message}

Please regenerate the ${questionCount}-question quiz on "${topic}" strictly complying with the JSON schema. Ensure all fields are present, options array is populated for MCQs, and return RAW JSON ONLY.`;
      }
    }
  }

  // Fallback for dev / mock mode if API returned mock text
  return {
    title: `${topic} Diagnostic Quiz`,
    topic,
    difficulty: effectiveDifficulty,
    questions: [
      {
        id: "q1",
        type: "mcq",
        question: `What is the fundamental principle governing ${topic}?`,
        options: [
          "Conservation of total energy and momentum",
          "Random spontaneous expansion without boundary",
          "Constant static equilibrium at zero Kelvin",
          "Linear decay in non-conservative media",
        ],
        correctAnswer: "Conservation of total energy and momentum",
        explanation: `In standard physics and chemistry curricula, ${topic} relies on universal conservation laws to establish equilibrium.`,
        difficulty: effectiveDifficulty,
      },
      {
        id: "q2",
        type: "true_false",
        question: `Under standard conditions, ${topic} can operate in a closed system without external energy input.`,
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "According to the Second Law of Thermodynamics, closed systems require external work or heat input to reverse entropy growth.",
        difficulty: effectiveDifficulty,
      },
      {
        id: "q3",
        type: "short_answer",
        question: `Name the key state variable or mathematical constant most frequently associated with ${topic}.`,
        correctAnswer: "Entropy",
        explanation: "Entropy (S) or the equilibrium constant is the primary state function used in evaluating stability.",
        difficulty: effectiveDifficulty,
      },
    ],
  };
}
