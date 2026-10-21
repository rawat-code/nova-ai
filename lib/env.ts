import { z } from "zod";

/**
 * Client-safe Environment Variables Schema
 * Exposed to the browser with NEXT_PUBLIC_ prefix.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL (e.g., http://localhost:3000)"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL (e.g., https://your-project.supabase.co)"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_SPLINE_SCENE_URL: z
    .string()
    .url("NEXT_PUBLIC_SPLINE_SCENE_URL must be a valid URL if provided")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : undefined)),
});

/**
 * Server-only Environment Variables Schema
 * CRITICAL: These must NEVER be leaked or sent to the browser bundle.
 */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required for server admin operations"),
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required for Google Gemini AI operations"),
  GEMINI_CHAT_MODEL: z
    .string()
    .min(1)
    .default("gemini-2.5-flash"),
  GEMINI_EMBEDDING_MODEL: z
    .string()
    .min(1)
    .default("gemini-embedding-001"),
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL must be a valid URL if provided")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : undefined)),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? val : undefined)),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

// In non-Next environments (e.g., test runners, standalone tsx scripts), load .env.local if present
if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    process.loadEnvFile?.(".env.local");
  } catch {
    // Ignore if not present or unsupported
  }
}

/**
 * Validate and cache client environment variables.
 * Safe to access in client components, server components, and edge routes.
 */
function parseClientEnv(): ClientEnv {
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SPLINE_SCENE_URL: process.env.NEXT_PUBLIC_SPLINE_SCENE_URL,
  });

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid client environment variables:\n${formattedErrors}\nCheck your .env.local file.`
    );
  }

  return result.data;
}

let cachedServerEnv: ServerEnv | null = null;

/**
 * Validate and cache server environment variables.
 */
function parseServerEnv(): ServerEnv {
  if (cachedServerEnv) {
    return cachedServerEnv;
  }

  const result = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL,
    GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid server environment variables:\n${formattedErrors}\nCheck your .env.local file.`
    );
  }

  cachedServerEnv = result.data;
  return cachedServerEnv;
}

/**
 * Exported client environment variables.
 * Can be safely imported across client and server files.
 */
export const clientEnv: ClientEnv = parseClientEnv();

/**
 * Exported server environment variables with strict runtime guard.
 * If imported or accessed in browser/client components, an immediate descriptive error is thrown.
 */
export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    if (typeof window !== "undefined") {
      throw new Error(
        `❌ Security Guard: Attempted to access server-only environment variable "${String(
          prop
        )}" on the client!\nServer variables are strictly confidential and must only be accessed within Server Components, Route Handlers, or Server Actions.`
      );
    }
    const env = parseServerEnv();
    return env[prop as keyof ServerEnv];
  },
});

export function getServerEnv(): ServerEnv {
  return parseServerEnv();
}

export function getClientEnv(): ClientEnv {
  return parseClientEnv();
}

