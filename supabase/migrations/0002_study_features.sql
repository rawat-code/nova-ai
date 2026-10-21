-- ==============================================================================
-- NOVA - STUDY FEATURES SCHEMA MIGRATION
-- Migration: 0002_study_features.sql
-- ==============================================================================
-- Defines study & learning features:
-- 1. quizzes & quiz_attempts: Adaptive testing engine with scoring history
-- 2. flashcards: SM-2 spaced repetition cards with ease factor & review dates
-- 3. study_plans & study_sessions: Dynamic schedule planner & Pomodoro logging
-- 4. learning_insights: Learning DNA topic mastery, optimal study times
-- ==============================================================================

-- 1. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  difficulty text DEFAULT 'medium' NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'adaptive')),
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS quizzes_user_id_idx ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS quizzes_created_at_idx ON public.quizzes(created_at DESC);

-- 2. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
  answers jsonb NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON public.quiz_attempts(user_id);

-- 3. FLASHCARDS TABLE (SuperMemo SM-2 algorithm)
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  front text NOT NULL,
  back text NOT NULL,
  topic text NOT NULL,
  repetition integer DEFAULT 0 NOT NULL,
  interval_days integer DEFAULT 1 NOT NULL,
  ease_factor numeric DEFAULT 2.5 NOT NULL,
  next_review_at date DEFAULT CURRENT_DATE NOT NULL,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS flashcards_user_id_idx ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS flashcards_next_review_idx ON public.flashcards(user_id, next_review_at);

-- 4. STUDY PLANS TABLE
CREATE TABLE IF NOT EXISTS public.study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_name text NOT NULL,
  target_date date NOT NULL,
  weekly_hours integer NOT NULL CHECK (weekly_hours > 0),
  schedule jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS study_plans_user_id_idx ON public.study_plans(user_id);

-- 5. STUDY SESSIONS TABLE (Focus Pomodoro logging)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  mode text NOT NULL CHECK (mode IN ('pomodoro', 'quiz', 'tutor')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_created_at_idx ON public.study_sessions(created_at DESC);

-- 6. LEARNING INSIGHTS TABLE (Learning DNA)
CREATE TABLE IF NOT EXISTS public.learning_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_mastery jsonb DEFAULT '{}'::jsonb NOT NULL,
  optimal_study_hours jsonb DEFAULT '[]'::jsonb NOT NULL,
  struggling_topics text[] DEFAULT '{}'::text[] NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS learning_insights_user_id_idx ON public.learning_insights(user_id);
