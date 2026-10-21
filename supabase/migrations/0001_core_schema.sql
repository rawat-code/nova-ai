-- ==============================================================================
-- NOVA - CORE SCHEMA MIGRATION
-- Migration: 0001_core_schema.sql
-- ==============================================================================
-- Defines core tables:
-- 1. profiles: Student profiles, academic grade level, learning preferences
-- 2. documents: Ingested study materials (PDF, DOCX, TXT)
-- 3. chunks: Segmented document chunks with 768-dim embeddings for vector search
-- 4. conversations: AI Tutor chat sessions with mode selection
-- 5. messages: Messages within conversations including citations
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  grade_level text CHECK (grade_level IN ('high_school', 'college', 'graduate')),
  learning_style text CHECK (learning_style IN ('visual', 'socratic', 'deep_dive', 'simplified')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 2. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  total_chunks integer DEFAULT 0 NOT NULL,
  status text DEFAULT 'processing' NOT NULL CHECK (status IN ('processing', 'ready', 'failed')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON public.documents(created_at DESC);

-- 3. CHUNKS TABLE (with pgvector embedding)
CREATE TABLE IF NOT EXISTS public.chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  page_number integer,
  chunk_index integer NOT NULL,
  embedding vector(768),
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON public.chunks(document_id);
CREATE INDEX IF NOT EXISTS chunks_user_id_idx ON public.chunks(user_id);
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx ON public.chunks USING hnsw (embedding vector_cosine_ops);

-- 4. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  mode text DEFAULT 'socratic' NOT NULL CHECK (mode IN ('explain', 'deep', 'socratic', 'exam')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON public.conversations(updated_at DESC);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'model', 'system')),
  content text NOT NULL,
  citations jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at ASC);
