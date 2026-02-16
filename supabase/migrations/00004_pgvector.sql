-- MemoCore Semantic Search with pgvector
-- Enables vector embeddings and semantic similarity search

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (already defined in 00001, but ensure it's there)
-- This migration is safe to run even if column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memory_entries'
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE memory_entries ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- Create index for vector similarity search (IVFFlat algorithm)
-- This speeds up cosine similarity searches
CREATE INDEX IF NOT EXISTS idx_entries_embedding
  ON memory_entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Function to match entries by semantic similarity
CREATE OR REPLACE FUNCTION match_entries(
  query_embedding vector(1536),
  match_project_id UUID,
  match_branch TEXT DEFAULT 'main',
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  type TEXT,
  title TEXT,
  content TEXT,
  metadata JSONB,
  embedding vector(1536),
  branch TEXT,
  version INTEGER,
  is_synced BOOLEAN,
  is_archived BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memory_entries.id,
    memory_entries.project_id,
    memory_entries.type,
    memory_entries.title,
    memory_entries.content,
    memory_entries.metadata,
    memory_entries.embedding,
    memory_entries.branch,
    memory_entries.version,
    memory_entries.is_synced,
    memory_entries.is_archived,
    memory_entries.created_at,
    memory_entries.updated_at,
    1 - (memory_entries.embedding <=> query_embedding) AS similarity
  FROM memory_entries
  WHERE memory_entries.project_id = match_project_id
    AND memory_entries.branch = match_branch
    AND memory_entries.is_archived = FALSE
    AND memory_entries.embedding IS NOT NULL
    AND 1 - (memory_entries.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Create function to update embedding (for future use with Edge Functions)
CREATE OR REPLACE FUNCTION update_entry_embedding(
  entry_id UUID,
  new_embedding vector(1536)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE memory_entries
  SET embedding = new_embedding
  WHERE id = entry_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_entries TO authenticated;
GRANT EXECUTE ON FUNCTION update_entry_embedding TO service_role;
