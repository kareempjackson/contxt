-- Cross-project semantic search function
-- Matches entries across all projects belonging to a user

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

GRANT EXECUTE ON FUNCTION match_entries_all TO authenticated;
