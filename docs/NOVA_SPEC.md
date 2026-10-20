# MASTER PROMPT: "Nova" — AI Learning Companion for Students

You are a senior full-stack engineer + product designer. Build the full project end-to-end in this workspace. Work in PHASES. After each phase: run the app, run lint + typecheck + tests, fix errors, write a short summary of what's done, and STOP for my approval before the next phase. Never skip a gate. Never leave TODOs or placeholder code in finished phases.

PREREQUISITES ARE ALREADY DONE: project is bootstrapped, deps installed, `.env.local` filled by me, `npm run check-env` passes. Do not redo setup. Start at Phase 0.

## 1. Product
Nova is an AI learning companion for students (high school → college). It learns how the student studies and adapts. Not a generic chatbot wrapper.

### Core features
1. AI Tutor chat: streaming responses, modes: Explain Simply / Deep Dive / Socratic / Exam Mode. Markdown + LaTeX + code highlighting.
2. Notes Vault + RAG: upload PDF/DOCX/TXT/images, chunk + embed, ask questions grounded in the student's notes with source citations (page refs).
3. Quiz Engine: auto-generate MCQ / short-answer / true-false from notes or a topic; difficulty adapts to past performance; explanations for each answer.
4. Flashcards with spaced repetition: SM-2 algorithm, auto-generated from notes, daily review queue.
5. Study Planner: student enters exams + deadlines + weekly hours; AI generates a day-by-day plan; drag-to-reschedule; streak tracking.
6. Learning DNA (differentiator): track weak topics, best study times, preferred explanation style. Show insights on the dashboard and feed them into tutor prompts.
7. Focus Mode: Pomodoro timer with an ambient animated scene, session logging.
8. Progress Dashboard: streaks, mastery per topic, quiz history, study-time charts.

## 2. Tech stack (do not substitute without asking)
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS + shadcn/ui
- Animation: Framer Motion (UI transitions), GSAP + ScrollTrigger (scroll storytelling)
- Smooth scroll: Lenis, wired to the GSAP ticker so ScrollTrigger stays in sync
- Hero visual: animated background from React Bits (aurora / orb / particles). Spline is unavailable (free plan): keep an optional slot behind NEXT_PUBLIC_SPLINE_SCENE_URL (lazy-loaded via @splinetool/react-spline) so a scene can be plugged in later. If the env var is empty, use the React Bits hero.
- Backend: Next.js Route Handlers + Supabase (Postgres, Auth, Storage, pgvector, Row Level Security on every table)
- AI: Gemini API (streaming chat, embeddings for RAG), wrapped in a provider abstraction (`lib/ai/provider.ts`) so the model can be swapped
- Validation: Zod on every API input. Rate limiting on AI routes (Upstash Redis, in-memory fallback in dev)
- State/data: TanStack Query + Zustand where needed
- Testing: Vitest for logic (SM-2, chunking, prompt builders), Playwright for 2–3 critical flows
- Deploy target: Vercel + Supabase

## 3. Design direction (must be "next level")
- Aesthetic: dark, premium, cinematic. Deep near-black base, one vivid accent gradient, subtle glassmorphism, soft glows, fine grain/noise overlay. NOT a default shadcn look and NOT a generic purple-gradient SaaS.
- Typography: one expressive display font + one clean body font (next/font). Large, confident hero type with tight tracking.
- Landing page: full-viewport hero with the animated background reacting to the cursor; scroll-driven storytelling (pinned sections, text reveals, parallax, feature cards animating in sequence); animated number counters; smooth page transitions; magnetic buttons; custom cursor on desktop.
- App UI: animated sidebar, command palette (Cmd+K), skeleton loaders, optimistic updates, micro-interactions on every interactive element, animated charts.
- Scroll: Lenis site-wide, correctly integrated with GSAP ScrollTrigger and Framer Motion. No jank, no scroll-jacking that traps the user.
- Motion rules: consistent easing curves + durations defined as tokens in one file. Respect `prefers-reduced-motion`.
- Performance: lazy-load the hero background after first paint, dynamic import GSAP sections, pause animations when off-screen, target Lighthouse Performance ≥ 85 on landing, no layout shift, optimized images.
- Responsive. On mobile and low-power devices, swap the hero background for a static gradient or lightweight animation.
- Accessibility: keyboard nav, focus states, AA contrast, aria labels.

### Component sources
- Allowed sources: Magic UI (magicui.design) and React Bits (reactbits.dev). No others.
- Magic UI: bento grid, animated counters, beams, marquee, shimmer/magnetic buttons, text reveals.
- React Bits: hero background (aurora/orb/particles) and text animations.
- Use plain shadcn/ui for forms, tables, dashboard, settings.
- Restyle every imported component to our design tokens (colors, fonts, easing). None may keep its original look.
- Ask me before installing any new dependency a component needs.
- Check each component's license. No pro/paid components.
- Test every animated component with Lenis smooth scroll and prefers-reduced-motion.

## 4. Architecture requirements
- Folders: `app/`, `components/ui`, `components/features`, `lib/ai`, `lib/db`, `lib/motion`, `hooks/`, `supabase/migrations`, `tests/`
- DB schema with migrations: profiles, documents, chunks (vector), conversations, messages, quizzes, quiz_attempts, flashcards (SM-2 fields), study_plans, study_sessions, learning_insights. RLS policies for each, tested.
- Secrets only in env vars. Never expose service keys to the client.
- Streaming chat via SSE/ReadableStream with abort support and error recovery.
- RAG pipeline: parse → clean → chunk (with overlap) → embed → store → hybrid retrieval → grounded prompt with citations → refuse politely when the notes don't contain the answer.
- Prompt-injection hygiene: treat uploaded document text as untrusted data, never as instructions.
- Centralized error handling + typed API responses.

## 5. Phases and gates
Phase 0, Plan: read this whole spec. Output: final folder tree, DB schema, API route list, design tokens (colors, fonts, easing), and any questions. STOP.
Phase 1, Foundation: design system, tokens, layout shell, Lenis + GSAP integration, Supabase auth (email + Google), protected routes. STOP.
Phase 2, Landing page: hero with React Bits background, scroll storytelling, all animations, responsive + reduced-motion + perf pass. STOP.
Phase 3, Data + AI core: migrations, RLS, provider abstraction, streaming tutor chat with modes. STOP.
Phase 4, Notes + RAG: upload, parsing, embeddings, cited Q&A. STOP.
Phase 5, Quiz + Flashcards: generation, SM-2, review queue, history. STOP.
Phase 6, Planner + Focus + Dashboard + Learning DNA. STOP.
Phase 7, Hardening: tests, rate limits, error and empty states, a11y audit, Lighthouse, README with setup + architecture diagram, deployment steps. STOP.

## 6. Working rules
- Ask before adding any dependency not already installed.
- Small, composable components. No file over ~300 lines.
- Every phase ends with: how to run it, what to test manually, known limitations.
- If something is ambiguous, ask once, concisely, then proceed with the most sensible default and note it.
- No fake data in finished features. Seed data only in a clearly named `seed` script.
- Commit after each phase with a clear message.

Begin with Phase 0 now.
