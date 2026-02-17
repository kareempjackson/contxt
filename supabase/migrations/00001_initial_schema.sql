-- MemoCore Initial Schema
-- Core tables for projects and memory entries

-- Enable pgvector extension (required for vector column in memory_entries)
CREATE EXTENSION IF NOT EXISTS vector;

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  stack JSONB DEFAULT '[]'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure user can't create duplicate project paths
  UNIQUE(user_id, path)
);

-- Branches table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_branch TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique branch names per project
  UNIQUE(project_id, name)
);

-- Memory entries table
CREATE TABLE memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('decision', 'pattern', 'context', 'document', 'session')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536), -- pgvector for semantic search (added in Day 6)
  branch TEXT NOT NULL DEFAULT 'main',
  version INTEGER NOT NULL DEFAULT 1,
  is_synced BOOLEAN NOT NULL DEFAULT TRUE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memory versions table (for time travel)
CREATE TABLE memory_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES memory_entries(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique versions per entry
  UNIQUE(entry_id, version)
);

-- Sync metadata table (track sync state)
CREATE TABLE sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  last_push_at TIMESTAMPTZ,
  last_pull_at TIMESTAMPTZ,
  sync_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One sync metadata per project
  UNIQUE(project_id)
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_path ON projects(path);

CREATE INDEX idx_branches_project_id ON branches(project_id);
CREATE INDEX idx_branches_active ON branches(is_active) WHERE is_active = true;
-- Only one active branch per project (replaces EXCLUDE USING gist)
CREATE UNIQUE INDEX idx_one_active_branch ON branches(project_id) WHERE is_active = true;

CREATE INDEX idx_entries_project_id ON memory_entries(project_id);
CREATE INDEX idx_entries_branch ON memory_entries(project_id, branch);
CREATE INDEX idx_entries_type ON memory_entries(type);
CREATE INDEX idx_entries_archived ON memory_entries(is_archived) WHERE is_archived = false;
CREATE INDEX idx_entries_updated_at ON memory_entries(updated_at);
CREATE INDEX idx_entries_metadata ON memory_entries USING gin(metadata);

CREATE INDEX idx_versions_entry_id ON memory_versions(entry_id);

-- Full-text search index (using PostgreSQL built-in)
CREATE INDEX idx_entries_search ON memory_entries USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_entries_updated_at
  BEFORE UPDATE ON memory_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_metadata_updated_at
  BEFORE UPDATE ON sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-versioning trigger for memory entries
CREATE OR REPLACE FUNCTION create_memory_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version on updates, not inserts
  IF TG_OP = 'UPDATE' AND (
    OLD.title != NEW.title OR
    OLD.content != NEW.content OR
    OLD.metadata::text != NEW.metadata::text
  ) THEN
    -- Increment version
    NEW.version = OLD.version + 1;

    -- Save old version
    INSERT INTO memory_versions (entry_id, version, title, content, metadata, created_at)
    VALUES (OLD.id, OLD.version, OLD.title, OLD.content, OLD.metadata, OLD.updated_at);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_version_memory_entries
  BEFORE UPDATE ON memory_entries
  FOR EACH ROW
  EXECUTE FUNCTION create_memory_version();
