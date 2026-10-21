-- ==============================================================================
-- NOVA MIGRATION 0004: STORAGE BUCKET & HYBRID SEARCH
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FULL TEXT SEARCH INDEX ON CHUNKS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS chunks_content_fts_idx 
  ON public.chunks USING gin (to_tsvector('english', content));

-- ------------------------------------------------------------------------------
-- 2. HYBRID RETRIEVAL (VECTOR + KEYWORD RANKING)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_chunks_hybrid(
  query_text text,
  query_embedding vector(768),
  match_threshold float DEFAULT 0.45,
  match_count int DEFAULT 8,
  p_user_id uuid DEFAULT NULL,
  p_document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  page_number int,
  chunk_index int,
  vector_score float,
  keyword_score float,
  combined_score float
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Default to auth.uid() if not explicitly provided
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  WITH scored_chunks AS (
    SELECT
      c.id,
      c.document_id,
      c.content,
      c.page_number,
      c.chunk_index,
      (1 - (c.embedding <=> query_embedding))::float AS v_score,
      ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', query_text))::float AS k_score
    FROM public.chunks c
    WHERE c.user_id = v_user_id
      AND (p_document_ids IS NULL OR c.document_id = ANY(p_document_ids))
  )
  SELECT
    sc.id,
    sc.document_id,
    sc.content,
    sc.page_number,
    sc.chunk_index,
    sc.v_score AS vector_score,
    sc.k_score AS keyword_score,
    -- Hybrid combination: 70% vector similarity + 30% normalized keyword score
    ((0.7 * sc.v_score) + (0.3 * LEAST(sc.k_score * 2.0, 1.0)))::float AS combined_score
  FROM scored_chunks sc
  WHERE sc.v_score >= match_threshold OR sc.k_score > 0.05
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. STORAGE BUCKET INITIALIZATION: 'notes'
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'notes',
      'notes',
      false,
      20971520, -- 20MB limit
      ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'image/png',
        'image/jpeg',
        'image/webp'
      ]
    )
    ON CONFLICT (id) DO UPDATE SET
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. STORAGE RLS POLICIES FOR 'notes' BUCKET
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    -- Enable RLS on storage.objects if not already enabled
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop previous policies if they exist
    DROP POLICY IF EXISTS "notes_storage_insert_own" ON storage.objects;
    DROP POLICY IF EXISTS "notes_storage_select_own" ON storage.objects;
    DROP POLICY IF EXISTS "notes_storage_update_own" ON storage.objects;
    DROP POLICY IF EXISTS "notes_storage_delete_own" ON storage.objects;

    -- Only allow students to insert into their own folder: notes/{userId}/...
    CREATE POLICY "notes_storage_insert_own"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'notes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );

    -- Only allow students to read from their own folder
    CREATE POLICY "notes_storage_select_own"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'notes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );

    -- Only allow students to update their own files
    CREATE POLICY "notes_storage_update_own"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'notes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'notes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );

    -- Only allow students to delete their own files
    CREATE POLICY "notes_storage_delete_own"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'notes'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
