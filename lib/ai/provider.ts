import { getServerEnv } from "@/lib/env";

export interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface AIProvider {
  name: string;
  streamChat(options: ChatOptions): Promise<ReadableStream<string>>;
  generateChat(options: ChatOptions): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
}

/**
 * GeminiProvider
 * Direct HTTP/REST implementation of Google Gemini API (gemini-2.5-flash & text-embedding-004)
 * Supports SSE streaming, abort signals, system instructions, and embedding vectorization.
 */
export class GeminiProvider implements AIProvider {
  name = "gemini";
  private apiKey: string;
  private chatModel: string;
  private embeddingModel: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(config?: {
    apiKey?: string;
    chatModel?: string;
    embeddingModel?: string;
  }) {
    if (config?.apiKey) {
      this.apiKey = config.apiKey;
      this.chatModel = config.chatModel || "gemini-2.5-flash";
      this.embeddingModel = config.embeddingModel || "text-embedding-004";
    } else {
      const env = getServerEnv();
      this.apiKey = env.GEMINI_API_KEY;
      this.chatModel = env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
      this.embeddingModel = env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
    }
  }

  private isMockApiKey(): boolean {
    return (
      !this.apiKey ||
      this.apiKey === "your_gemini_api_key_here" ||
      this.apiKey.startsWith("mock_") ||
      this.apiKey.includes("dummy")
    );
  }

  /**
   * Format generic ChatMessages into Gemini contents array.
   */
  private formatContents(messages: ChatMessage[]) {
    return messages
      .filter((m) => m.role === "user" || m.role === "model")
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));
  }

  /**
   * Stream conversational AI responses via Server-Sent Events (SSE).
   */
  async streamChat(options: ChatOptions): Promise<ReadableStream<string>> {
    const { messages, systemInstruction, temperature = 0.7, maxOutputTokens = 2048, signal } = options;

    // Graceful mock streaming if running in local sandbox with unconfigured key
    if (this.isMockApiKey()) {
      return this.mockStreamChat(options);
    }

    const endpoint = `${this.baseUrl}/models/${encodeURIComponent(this.chatModel)}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: this.formatContents(messages),
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini streamChat failed [HTTP ${response.status}]: ${errText || response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Gemini streamChat response missing readable stream body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    return new ReadableStream<string>({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            if (signal?.aborted) {
              controller.error(new DOMException("Aborted", "AbortError"));
              break;
            }

            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;

              if (trimmed.startsWith("data: ")) {
                const dataJson = trimmed.slice(6).trim();
                if (dataJson === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(dataJson);
                  const candidate = parsed?.candidates?.[0];
                  const textPart = candidate?.content?.parts?.[0]?.text;
                  if (textPart) {
                    controller.enqueue(textPart);
                  }
                } catch {
                  // Skip invalid JSON lines
                }
              }
            }
          }

          controller.close();
        } catch (err) {
          if (signal?.aborted) {
            controller.error(new DOMException("Aborted", "AbortError"));
          } else {
            controller.error(err);
          }
        } finally {
          reader.releaseLock();
        }
      },
    });
  }

  /**
   * Non-streaming single generation.
   */
  async generateChat(options: ChatOptions): Promise<string> {
    const stream = await this.streamChat(options);
    const reader = stream.getReader();
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += value;
    }

    return result;
  }

  /**
   * Generate 768-dimensional dense vector embeddings.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (this.isMockApiKey()) {
      return this.mockEmbedding(text);
    }

    const endpoint = `${this.baseUrl}/models/${encodeURIComponent(this.embeddingModel)}:embedContent?key=${this.apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Gemini embedContent failed [HTTP ${response.status}]: ${errText || response.statusText}`);
    }

    const data = await response.json();
    const values = data?.embedding?.values;

    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("Invalid or empty embedding values received from Gemini");
    }

    return values;
  }

  private mockStreamChat(options: ChatOptions): ReadableStream<string> {
    const lastUserMsg = options.messages.filter((m) => m.role === "user").pop()?.content || "your question";
    const modeNote = options.systemInstruction?.includes("Socratic")
      ? "Let's examine the first principles of this problem together."
      : options.systemInstruction?.includes("Explain Simply")
      ? "Think of this like water flowing through a garden pipe."
      : options.systemInstruction?.includes("Exam")
      ? "[EXAM RUBRIC: 10/10] Key criterion satisfied."
      : "Here is a structured academic breakdown.";

    const mockResponse = `### Nova AI Tutor Response\n\n${modeNote}\n\nRegarding: "${lastUserMsg}"\n\n$$\\Delta S_{univ} \\ge 0$$\n\nEvery physical process increases total entropy in a closed system. How would you apply this to the equilibrium constant $K_{eq}$?`;
    const words = mockResponse.split(" ");

    return new ReadableStream<string>({
      async start(controller) {
        if (options.signal?.aborted) {
          controller.error(new DOMException("Aborted", "AbortError"));
          return;
        }

        const onAbort = () => {
          controller.error(new DOMException("Aborted", "AbortError"));
        };

        options.signal?.addEventListener("abort", onAbort);

        try {
          for (let i = 0; i < words.length; i++) {
            if (options.signal?.aborted) {
              return;
            }
            controller.enqueue(words[i] + (i === words.length - 1 ? "" : " "));
            await new Promise((r) => setTimeout(r, 20));
          }
          controller.close();
        } finally {
          options.signal?.removeEventListener("abort", onAbort);
        }
      },
    });
  }

  private mockEmbedding(text: string): number[] {
    const dim = 768;
    const embedding = new Array<number>(dim);
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed = (seed + text.charCodeAt(i) * 31) % 100000;
    }
    for (let i = 0; i < dim; i++) {
      embedding[i] = Math.sin(seed + i * 0.1) * 0.1;
    }
    return embedding;
  }
}

let defaultProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!defaultProvider) {
    defaultProvider = new GeminiProvider();
  }
  return defaultProvider;
}
