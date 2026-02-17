-- MemoCore SQLite Schema
-- Local source of truth for offline-first architecture

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ==================
-- Projects
-- ==================
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  stack TEXT, -- JSON array
  config TEXT NOT NULL, -- JSON object
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path);

-- ==================
-- Branches
-- ==================
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_branch TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_branches_project ON branches(project_id);

-- ==================
-- Memory Entries
-- ==================
CREATE TABLE IF NOT EXISTS memory_entries (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('decision', 'pattern', 'context', 'document', 'session')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT, -- JSON object
  embedding TEXT, -- JSON array of floats
  branch TEXT NOT NULL DEFAULT 'main',
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'stale')),
  is_synced INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_project ON memory_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_project_branch ON memory_entries(project_id, branch);
CREATE INDEX IF NOT EXISTS idx_entries_type ON memory_entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_status ON memory_entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_synced ON memory_entries(is_synced);
CREATE INDEX IF NOT EXISTS idx_entries_archived ON memory_entries(is_archived);

-- Full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS memory_entries_fts USING fts5(
  id UNINDEXED,
  title,
  content,
  content=memory_entries,
  content_rowid=rowid
);

-- Triggers to keep FTS index up-to-date
CREATE TRIGGER IF NOT EXISTS memory_entries_ai AFTER INSERT ON memory_entries BEGIN
  INSERT INTO memory_entries_fts(rowid, id, title, content)
  VALUES (new.rowid, new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS memory_entries_ad AFTER DELETE ON memory_entries BEGIN
  DELETE FROM memory_entries_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS memory_entries_au AFTER UPDATE ON memory_entries BEGIN
  UPDATE memory_entries_fts
  SET title = new.title, content = new.content
  WHERE rowid = old.rowid;
END;

-- ==================
-- Memory Versions (for time travel)
-- ==================
CREATE TABLE IF NOT EXISTS memory_versions (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  branch TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (entry_id) REFERENCES memory_entries(id) ON DELETE CASCADE,
  UNIQUE(entry_id, version)
);

CREATE INDEX IF NOT EXISTS idx_versions_entry ON memory_versions(entry_id);

-- ==================
-- Sync Metadata
-- ==================
CREATE TABLE IF NOT EXISTS sync_metadata (
  project_id TEXT PRIMARY KEY,
  last_pull_at TEXT,
  last_push_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- ==================
-- Project Config (separate table for easier access)
-- ==================
CREATE TABLE IF NOT EXISTS project_config (
  project_id TEXT PRIMARY KEY,
  active_branch TEXT NOT NULL DEFAULT 'main',
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
