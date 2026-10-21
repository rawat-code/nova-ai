-- ==============================================================================
-- NOVA - ROW LEVEL SECURITY (RLS) POLICIES & HELPER FUNCTIONS
-- Migration: 0003_rls_policies.sql
-- ==============================================================================
-- Strict security policies ensuring complete multi-tenant tenant isolation:
-- User A cannot read, insert, update, or delete User B's records.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_insights ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "documents_select_own"
  ON public.documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "documents_insert_own"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_update_own"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "documents_delete_own"
  ON public.documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. CHUNKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "chunks_select_own"
  ON public.chunks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chunks_insert_own"
  ON public.chunks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chunks_update_own"
  ON public.chunks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chunks_delete_own"
  ON public.chunks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. CONVERSATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "conversations_select_own"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "conversations_insert_own"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_own"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_delete_own"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. MESSAGES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. QUIZZES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "quizzes_select_own"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "quizzes_insert_own"
  ON public.quizzes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quizzes_update_own"
  ON public.quizzes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quizzes_delete_own"
  ON public.quizzes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. QUIZ ATTEMPTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_update_own"
  ON public.quiz_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_delete_own"
  ON public.quiz_attempts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. FLASHCARDS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "flashcards_select_own"
  ON public.flashcards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "flashcards_insert_own"
  ON public.flashcards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcards_update_own"
  ON public.flashcards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcards_delete_own"
  ON public.flashcards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. STUDY PLANS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "study_plans_select_own"
  ON public.study_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "study_plans_insert_own"
  ON public.study_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_plans_update_own"
  ON public.study_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_plans_delete_own"
  ON public.study_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. STUDY SESSIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "study_sessions_select_own"
  ON public.study_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_insert_own"
  ON public.study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_update_own"
  ON public.study_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_delete_own"
  ON public.study_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 12. LEARNING INSIGHTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "learning_insights_select_own"
  ON public.learning_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "learning_insights_insert_own"
  ON public.learning_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_insights_update_own"
  ON public.learning_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_insights_delete_own"
  ON public.learning_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 13. AUTOMATIC PROFILE CREATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 14. VECTOR SIMILARITY SEARCH HELPER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid,
  p_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  page_number int,
  chunk_index int,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.page_number,
    c.chunk_index,
    (1 - (c.embedding <=> query_embedding))::float AS similarity
  FROM public.chunks c
  WHERE c.user_id = p_user_id
    AND (p_document_ids IS NULL OR c.document_id = ANY(p_document_ids))
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
