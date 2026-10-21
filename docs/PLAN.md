# Nova — Architecture & Implementation Plan

> **Product**: AI Learning Companion for Students (high school → college)  
> **Aesthetic**: Dark, premium, cinematic (deep near-black, electric cyan/aurora teal & cosmic violet accents, glassmorphism, noise overlay)  
> **Tech Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + Google Gemini + Framer Motion + GSAP + Lenis

---

## 1. Project Directory Structure

```text
nova/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                # Cinematic auth container with ambient glow & glass card
│   │   ├── login/page.tsx            # Email & Google OAuth login
│   │   └── signup/page.tsx           # Student signup & onboarding trigger
│   ├── (dashboard)/
│   │   ├── layout.tsx                # App shell: animated collapsible sidebar + command bar + header
│   │   ├── dashboard/page.tsx        # Overview: streak, DNA metrics, upcoming exams, recent notes
│   │   ├── tutor/page.tsx            # AI Tutor chat interface with mode switcher (Phase 3)
│   │   ├── vault/page.tsx            # Notes Vault & RAG document manager (Phase 4)
│   │   ├── quiz/page.tsx             # Adaptive quiz generator & runner (Phase 5)
│   │   ├── flashcards/page.tsx       # Spaced repetition SM-2 flashcard deck (Phase 5)
│   │   ├── planner/page.tsx          # Study schedule & exam planner (Phase 6)
│   │   ├── focus/page.tsx            # Pomodoro timer & ambient focus room (Phase 6)
│   │   └── settings/page.tsx         # User preferences, API keys, learning style settings
│   ├── (marketing)/
│   │   ├── layout.tsx                # Public site layout with smooth scroll & glass nav
│   │   └── page.tsx                  # Cinematic landing page with React Bits hero & GSAP storytelling (Phase 2)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts     # Supabase OAuth PKCE exchange handler
│   │   ├── tutor/
│   │   │   └── chat/route.ts         # Streaming Gemini AI tutor endpoint (Phase 3)
│   │   ├── notes/
│   │   │   ├── upload/route.ts       # Secure document ingestion (Phase 4)
│   │   │   └── query/route.ts        # Vector similarity search with citations (Phase 4)
│   │   ├── quiz/
│   │   │   ├── generate/route.ts     # AI quiz synthesis (Phase 5)
│   │   │   └── submit/route.ts       # Score & mastery calculation (Phase 5)
│   │   ├── flashcards/
│   │   │   └── review/route.ts       # SM-2 interval calculator (Phase 5)
│   │   └── dna/
│   │       └── insights/route.ts     # Student mastery & learning pattern analytics (Phase 6)
│   ├── favicon.ico
│   ├── globals.css                   # Tailwind v4 theme, CSS variables, glass & glow utilities
│   └── layout.tsx                    # Root layout: fonts (Outfit + Inter), grain overlay, Lenis provider
├── components/
│   ├── ui/                           # Base design primitives (button, input, badge, dialog, etc.)
│   ├── features/                     # Domain components (tutor-chat, flashcard-card, study-calendar)
│   ├── layout/                       # App sidebar, navigation, command palette, grain overlay
│   └── providers/                    # Lenis smooth scroll, Supabase auth provider, theme provider
├── lib/
│   ├── ai/
│   │   ├── provider.ts               # Gemini client wrapper & model switching abstraction
│   │   ├── prompts.ts                # System prompts for Explain Simply / Deep Dive / Socratic / Exam
│   │   ├── embeddings.ts             # Gemini text-embedding-004 wrapper
│   │   └── ratelimit.ts              # Upstash Redis rate limiter with in-memory dev fallback
│   ├── db/
│   │   └── queries.ts                # Type-safe database access helpers
│   ├── motion/
│   │   └── tokens.ts                 # Centralized easing curves, durations, and motion variants
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (createBrowserClient)
│   │   ├── server.ts                 # Server client with async cookies()
│   │   └── middleware.ts             # Session refresh & protected route guard
│   ├── env.ts                        # Zod-validated environment config
│   └── utils.ts                      # Styling (cn) and formatting helpers
├── supabase/
│   └── migrations/
│       ├── 0000_extensions.sql      # pgvector, pgcrypto
│       ├── 0001_core_schema.sql      # profiles, documents, chunks, conversations, messages
│       ├── 0002_study_features.sql   # quizzes, quiz_attempts, flashcards, study_plans
│       └── 0003_rls_policies.sql     # Strict Row Level Security on every table
├── docs/
│   ├── NOVA_SPEC.md                  # Master specification
│   └── PLAN.md                       # Architectural plan & phase status (this file)
├── proxy.ts                          # Next.js 16 Proxy convention for auth & route protection
└── package.json
```

---

## 2. Database Schema (Supabase Postgres + pgvector)

### Tables
1. **`profiles`**
   - `id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE`
   - `full_name text`, `avatar_url text`, `grade_level text` (high_school | college | graduate)
   - `learning_style text` (visual | socratic | deep_dive | simplified)
   - `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`

2. **`documents`**
   - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE`
   - `title text NOT NULL`, `file_path text NOT NULL`, `file_type text NOT NULL`, `file_size int NOT NULL`
   - `total_chunks int DEFAULT 0`, `status text DEFAULT 'processing'` (processing | ready | failed)
   - `created_at timestamptz DEFAULT now()`

3. **`chunks`**
   - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   - `document_id uuid NOT NULL REFERENCES documents ON DELETE CASCADE`
   - `user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE`
   - `content text NOT NULL`, `page_number int`, `chunk_index int NOT NULL`
   - `embedding vector(768)` (text-embedding-004 dimensionality)
   - `metadata jsonb DEFAULT '{}'::jsonb`
   - `created_at timestamptz DEFAULT now()`
   - *Index*: `ivfflat` / `hnsw` cosine index on `embedding`.

4. **`conversations` & `messages`**
   - `conversations`: `id uuid`, `user_id uuid`, `title text`, `mode text` (explain | deep | socratic | exam), `created_at`, `updated_at`
   - `messages`: `id uuid`, `conversation_id uuid`, `role text` (user | model | system), `content text`, `citations jsonb`, `created_at`

5. **`quizzes` & `quiz_attempts`**
   - `quizzes`: `id uuid`, `user_id uuid`, `topic text`, `difficulty text`, `questions jsonb` (MCQ, short-answer, true-false), `created_at`
   - `quiz_attempts`: `id uuid`, `quiz_id uuid`, `user_id uuid`, `score numeric`, `answers jsonb`, `completed_at`

6. **`flashcards`** (Spaced Repetition with SM-2)
   - `id uuid`, `user_id uuid`, `document_id uuid (nullable)`, `front text`, `back text`, `topic text`
   - `repetition int DEFAULT 0`, `interval_days int DEFAULT 1`, `ease_factor numeric DEFAULT 2.5`
   - `next_review_at date DEFAULT CURRENT_DATE`, `last_reviewed_at timestamptz`

7. **`study_plans` & `study_sessions`**
   - `study_plans`: `id uuid`, `user_id uuid`, `exam_name text`, `target_date date`, `weekly_hours int`, `schedule jsonb`
   - `study_sessions`: `id uuid`, `user_id uuid`, `duration_minutes int`, `mode text` (pomodoro | quiz | tutor), `created_at`

8. **`learning_insights`** (Learning DNA)
   - `id uuid`, `user_id uuid`, `topic_mastery jsonb`, `optimal_study_hours jsonb`, `struggling_topics text[]`, `updated_at`

---

## 3. Design Tokens & Visual Direction

### Visual Palette
- **Obsidian / Cosmic Void Base**:
  - Deep canvas: `#05060b` (`--background`)
  - Elevated surfaces: `#0a0d18` (`--card`)
  - Sub-surfaces & floating cards: `#121626`
  - Subtle borders: `rgba(255, 255, 255, 0.08)`
  - Active borders: `rgba(0, 245, 212, 0.35)`
- **Vivid Accent Gradient**:
  - Electric Aurora Cyan: `#00f5d4`
  - Celestial Azure: `#00b4d8`
  - Cosmic Violet: `#6366f1`
  - Accent Gradient: `linear-gradient(135deg, #00f5d4 0%, #00b4d8 50%, #6366f1 100%)`
- **Atmospheric Glows & Glass**:
  - `.glass-card`: `backdrop-filter: blur(20px); background: rgba(10, 13, 24, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);`
  - `.glow-cyan`: `box-shadow: 0 0 30px -5px rgba(0, 245, 212, 0.25);`
  - `.glow-violet`: `box-shadow: 0 0 35px -5px rgba(99, 102, 241, 0.25);`
  - `.grain-overlay`: Fixed SVG noise texture at 3.5% opacity with `pointer-events: none`

### Typography
- **Display Font**: `Outfit` (`next/font/google`), weights 500, 600, 700, tight tracking (`tracking-tight` / `-0.03em`)
- **Body Font**: `Inter` (`next/font/google`), weights 400, 500, 600, optimized for readable study notes
- **Code Font**: `JetBrains Mono` / `Geist Mono`

### Motion Tokens (`lib/motion/tokens.ts`)
- **Durations**:
  - `instant`: 0.1s
  - `fast`: 0.2s
  - `normal`: 0.35s
  - `slow`: 0.6s
  - `deliberate`: 0.9s
- **Easing Curves**:
  - `smooth`: `[0.22, 1, 0.36, 1]` (clean deceleration)
  - `snappy`: `[0.16, 1, 0.3, 1]` (interactive feedback)
  - `bounce`: `[0.34, 1.56, 0.64, 1]` (spring micro-interaction)
  - `gentle`: `[0.4, 0, 0.2, 1]`
- **Scroll**: Lenis smooth scroll synchronized with GSAP Ticker and `prefers-reduced-motion` bypass.

---

## 4. Phases Roadmap

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Plan: folder tree, DB schema, API routes, design tokens, spec review | **Done** |
| **Phase 1** | Foundation: design system tokens, fonts, grain, Lenis+GSAP, layout shell, Supabase auth, protected routes, login/signup | **Done** |
| **Phase 2** | Landing Page: React Bits hero background, GSAP ScrollTrigger storytelling, bento grid, marquee, responsive & reduced-motion pass | **Done** |
| **Phase 3** | Data & AI Core: Supabase migrations, RLS, Gemini provider abstraction, streaming tutor chat with modes | **Done** |
| **Phase 4** | Notes Vault & RAG: upload, parsing, embeddings, cited Q&A | **Next** |
| **Phase 5** | Quiz Engine & Flashcards: adaptive generator, SM-2 algorithm, review queue | Planned |
| **Phase 6** | Planner, Focus Mode, Learning DNA, Dashboard metrics | Planned |
| **Phase 7** | Hardening: Vitest/Playwright tests, rate limits, a11y audit, Lighthouse optimization | Planned |
