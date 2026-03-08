-- Add missing `status` column to semantic search RPC functions
-- rowToEntry() expects a status column; these functions previously omitted it.
-- Must DROP first — Postgres does not allow CREATE OR REPLACE to change return type.

DROP FUNCTION IF EXISTS match_entries(vector, UUID, TEXT, FLOAT, INT);
DROP FUNCTION IF EXISTS match_entries_all(vector, UUID, FLOAT, INT);

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
  status TEXT,
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
    memory_entries.status,
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

CREATE OR REPLACE FUNCTION match_entries_all(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 20
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
  status TEXT,
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
    me.id,
    me.project_id,
    me.type,
    me.title,
    me.content,
    me.metadata,
    me.embedding,
    me.branch,
    me.version,
    me.status,
    me.is_synced,
    me.is_archived,
    me.created_at,
    me.updated_at,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM memory_entries me
  INNER JOIN projects p ON p.id = me.project_id
  WHERE p.user_id = match_user_id
    AND me.is_archived = FALSE
    AND me.embedding IS NOT NULL
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_entries TO authenticated;
GRANT EXECUTE ON FUNCTION match_entries_all TO authenticated;
