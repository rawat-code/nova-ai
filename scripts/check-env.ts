import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

// -----------------------------------------------------------------------------
// 1. Load Local Environment Files (if running standalone outside Next.js CLI)
// -----------------------------------------------------------------------------
const projectRoot = process.cwd();
const envLocalPath = path.join(projectRoot, ".env.local");
const envPath = path.join(projectRoot, ".env");

if (fs.existsSync(envLocalPath)) {
  try {
    process.loadEnvFile(envLocalPath);
  } catch {
    // If process.loadEnvFile is not supported or errors, read and populate process.env
    const content = fs.readFileSync(envLocalPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} else if (fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // fallback
  }
}

// -----------------------------------------------------------------------------
// 2. Define Zod Schemas for Required and Optional Variables
// -----------------------------------------------------------------------------
const requiredSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .min(1, "Site URL is required")
    .url("Must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "Supabase URL is required")
    .url("Must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase service role key is required"),
  GEMINI_API_KEY: z
    .string()
    .min(1, "Gemini API key is required"),
});

const optionalSchema = z.object({
  GEMINI_CHAT_MODEL: z.string().optional(),
  GEMINI_EMBEDDING_MODEL: z.string().optional(),
  NEXT_PUBLIC_SPLINE_SCENE_URL: z
    .string()
    .url("Must be a valid URL if provided")
    .optional()
    .or(z.literal("")),
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("Must be a valid URL if provided")
    .optional()
    .or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1)
    .optional()
    .or(z.literal("")),
});

interface EnvVarConfig {
  key: string;
  type: "Required" | "Optional";
  scope: "Client" | "Server";
  isSecret: boolean;
  defaultVal?: string;
  validator: (val: unknown) => { valid: boolean; error?: string };
}

const envConfigs: EnvVarConfig[] = [
  // Required Variables
  {
    key: "NEXT_PUBLIC_SITE_URL",
    type: "Required",
    scope: "Client",
    isSecret: false,
    validator: (v) => {
      const res = requiredSchema.shape.NEXT_PUBLIC_SITE_URL.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    type: "Required",
    scope: "Client",
    isSecret: false,
    validator: (v) => {
      const res = requiredSchema.shape.NEXT_PUBLIC_SUPABASE_URL.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    type: "Required",
    scope: "Client",
    isSecret: true,
    validator: (v) => {
      const res = requiredSchema.shape.NEXT_PUBLIC_SUPABASE_ANON_KEY.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    type: "Required",
    scope: "Server",
    isSecret: true,
    validator: (v) => {
      const res = requiredSchema.shape.SUPABASE_SERVICE_ROLE_KEY.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "GEMINI_API_KEY",
    type: "Required",
    scope: "Server",
    isSecret: true,
    validator: (v) => {
      const res = requiredSchema.shape.GEMINI_API_KEY.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  // Optional Variables
  {
    key: "GEMINI_CHAT_MODEL",
    type: "Optional",
    scope: "Server",
    isSecret: false,
    defaultVal: "gemini-3.5-flash-lite",
    validator: (v) => {
      const res = optionalSchema.shape.GEMINI_CHAT_MODEL.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "GEMINI_EMBEDDING_MODEL",
    type: "Optional",
    scope: "Server",
    isSecret: false,
    defaultVal: "text-embedding-004",
    validator: (v) => {
      const res = optionalSchema.shape.GEMINI_EMBEDDING_MODEL.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "NEXT_PUBLIC_SPLINE_SCENE_URL",
    type: "Optional",
    scope: "Client",
    isSecret: false,
    validator: (v) => {
      const res = optionalSchema.shape.NEXT_PUBLIC_SPLINE_SCENE_URL.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "UPSTASH_REDIS_REST_URL",
    type: "Optional",
    scope: "Server",
    isSecret: false,
    validator: (v) => {
      const res = optionalSchema.shape.UPSTASH_REDIS_REST_URL.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
  {
    key: "UPSTASH_REDIS_REST_TOKEN",
    type: "Optional",
    scope: "Server",
    isSecret: true,
    validator: (v) => {
      const res = optionalSchema.shape.UPSTASH_REDIS_REST_TOKEN.safeParse(v);
      return { valid: res.success, error: res.success ? undefined : res.error.issues[0]?.message };
    },
  },
];

// -----------------------------------------------------------------------------
// 3. Masking & Formatting Helpers
// -----------------------------------------------------------------------------
function maskValue(val: string, isSecret: boolean): string {
  if (!val) return "-";
  if (isSecret) {
    return "••••••••••••••••";
  }
  if (val.length > 32) {
    return val.slice(0, 29) + "...";
  }
  return val;
}

// -----------------------------------------------------------------------------
// 4. Main Validation and Table Generation
// -----------------------------------------------------------------------------
function checkEnvironment(): void {
  console.log("\n==================================================================");
  console.log("🔍 NOVA PROJECT ENVIRONMENT CONFIGURATION CHECK");
  console.log("==================================================================");

  let hasRequiredMissing = false;
  const rows: Array<{
    Variable: string;
    Status: string;
    Type: string;
    Scope: string;
    Preview: string;
  }> = [];

  for (const config of envConfigs) {
    const rawVal = process.env[config.key];
    const isPresent = rawVal !== undefined && rawVal.trim().length > 0;

    let status = "";
    let preview = "";

    if (config.type === "Required") {
      if (!isPresent) {
        status = "❌ missing";
        preview = "NOT SET";
        hasRequiredMissing = true;
      } else {
        const { valid, error } = config.validator(rawVal);
        if (valid) {
          status = "✅ set";
          preview = maskValue(rawVal, config.isSecret);
        } else {
          status = `❌ missing (${error || "invalid format"})`;
          preview = maskValue(rawVal, config.isSecret);
          hasRequiredMissing = true;
        }
      }
    } else {
      // Optional
      if (!isPresent) {
        status = "⚠️ optional-not-set";
        preview = config.defaultVal ? `(default: ${config.defaultVal})` : "-";
      } else {
        const { valid, error } = config.validator(rawVal);
        if (valid) {
          status = "✅ set";
          preview = maskValue(rawVal, config.isSecret);
        } else {
          status = `❌ invalid (${error || "invalid format"})`;
          preview = maskValue(rawVal, config.isSecret);
        }
      }
    }

    rows.push({
      Variable: config.key,
      Status: status,
      Type: config.type,
      Scope: config.scope,
      Preview: preview,
    });
  }

  // Render Table
  console.table(rows);

  console.log("------------------------------------------------------------------");
  if (hasRequiredMissing) {
    console.error("❌ CRITICAL: One or more required environment variables are missing or invalid!");
    console.error("👉 Please update your .env.local file with valid configuration.");
    console.error("👉 Refer to SETUP.md for step-by-step instructions.\n");
    process.exit(1);
  } else {
    console.log("✅ All required environment variables are properly configured.\n");
    process.exit(0);
  }
}

checkEnvironment();
