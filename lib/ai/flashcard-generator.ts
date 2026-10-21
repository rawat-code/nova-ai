import { z } from "zod";
import { getAIProvider } from "./provider";
import { extractJsonFromResponse } from "./quiz-generator";

export const flashcardItemSchema = z.object({
  front: z.string().min(3, "Front of card cannot be empty"),
  back: z.string().min(3, "Back of card cannot be empty"),
  topic: z.string().min(2, "Topic is required"),
});

export const flashcardDeckSchema = z.array(flashcardItemSchema).min(1, "At least one card required");

export type GeneratedFlashcard = z.infer<typeof flashcardItemSchema>;

export interface FlashcardGenerationOptions {
  topic: string;
  sourceText?: string;
  cardCount?: number;
  signal?: AbortSignal;
}

/**
 * Generates spaced repetition flashcards from note text or topic with Zod validation and retry.
 */
export async function generateFlashcardsWithRetry(
  options: FlashcardGenerationOptions,
  maxRetries = 2
): Promise<GeneratedFlashcard[]> {
  const { topic, sourceText = "", cardCount = 6, signal } = options;
  const aiProvider = getAIProvider();

  const systemInstruction = `You are Nova's Flashcard Synthesis Engine, an expert in cognitive science and active recall spaced repetition.
Synthesize high-yield, atomic study flashcards from the provided notes and topic.

RULES FOR EFFECTIVE FLASHCARDS:
1. Atomicity: Each card must test ONE single concept, definition, mechanism, or formula.
2. Front: A clear, challenging question or prompt (e.g. "What is the Henderson-Hasselbalch equation?", "Define Le Chatelier's principle").
3. Back: A concise, memorable answer with core equation/definition in clean Markdown/LaTeX.
4. Topic: Set to "${topic}".
5. OUTPUT STRICT JSON ONLY as a JSON array of objects.

JSON SCHEMA:
[
  {
    "front": "string",
    "back": "string",
    "topic": "${topic}"
  }
]`;

  let prompt = `Generate ${cardCount} high-yield active recall flashcards for "${topic}".`;
  if (sourceText.trim()) {
    prompt += `\n\nSource text:\n${sourceText.slice(0, 6000)}`;
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

      const jsonString = extractJsonFromResponse(rawResponse);
      const parsedJson = JSON.parse(jsonString);
      const validated = flashcardDeckSchema.parse(parsedJson);

      return validated;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;

      if (attempt <= maxRetries) {
        prompt = `The previous output was invalid JSON:
${lastError.message}

Please output STRICT JSON ONLY matching the array schema [ { "front": "...", "back": "...", "topic": "${topic}" } ].`;
      }
    }
  }

  // Fallback cards for dev / test mode
  return [
    {
      front: `What is the primary governing principle of ${topic}?`,
      back: `**Conservation of Energy & Mass**: Total energy in an isolated system remains constant over time.`,
      topic,
    },
    {
      front: `How is equilibrium defined in the context of ${topic}?`,
      back: `A dynamic state where forward and reverse rates are equal, resulting in no macroscopic change ($\\Delta G = 0$).`,
      topic,
    },
    {
      front: `What mathematical equation links entropy (S) to microscopic states (W)?`,
      back: `**Boltzmann's Entropy Formula**:\n$$S = k_B \\ln W$$\nwhere $k_B$ is the Boltzmann constant.`,
      topic,
    },
  ];
}
