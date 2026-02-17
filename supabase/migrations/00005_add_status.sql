-- Migration 00005: Add status column to memory_entries
-- The status field is used for the draft/review workflow.
-- SQLite schema already has this; this migration adds it to Supabase.

ALTER TABLE memory_entries
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('active', 'draft', 'archived', 'stale'))
    DEFAULT 'active';

-- Backfill: archived entries get 'archived' status
UPDATE memory_entries
  SET status = 'archived'
  WHERE is_archived = true AND status = 'active';

-- Index for draft review queue queries
CREATE INDEX IF NOT EXISTS idx_entries_status
  ON memory_entries (project_id, status);

-- Index for cross-project draft count (sidebar badge)
CREATE INDEX IF NOT EXISTS idx_entries_status_user
  ON memory_entries (status)
  WHERE status = 'draft';
