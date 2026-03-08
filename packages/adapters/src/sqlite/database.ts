/**
 * SQLite Database Adapter
 * Local source of truth for offline-first architecture
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import type { ILocalDatabase } from '@mycontxt/core';
import type {
  MemoryEntry,
  Project,
  ProjectConfig,
  Branch,
  CreateEntryInput,
  EntryQuery,
} from '@mycontxt/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class SQLiteDatabase implements ILocalDatabase {
  private db: Database.Database;
  private initialized = false;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('journal_mode = WAL');
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Read and execute schema
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    this.db.exec(schema);

    this.initialized = true;
  }

  async close(): Promise<void> {
    this.db.close();
  }

  // ==================
  // Project Management
  // ==================

  async initProject(config: {
    name: string;
    path: string;
    stack?: string[];
    config?: Partial<ProjectConfig>;
  }): Promise<Project> {
    const existing = await this.getProjectByPath(config.path);
    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const defaultConfig: ProjectConfig = {
      defaultBranch: 'main',
      maxTokens: 4000,
      autoSession: false,
      stackDetection: true,
      ...config.config,
    };

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, path, stack, config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      config.name,
      config.path,
      JSON.stringify(config.stack || []),
      JSON.stringify(defaultConfig)
    );

    // Create default branch
    await this.createBranch(id, 'main', 'main');

    // Set active branch
    this.db
      .prepare('INSERT INTO project_config (project_id, active_branch) VALUES (?, ?)')
      .run(id, 'main');

    const project = await this.getProject(id);
    if (!project) {
      throw new Error('Failed to create project');
    }
    return project;
  }

  async getProject(projectId: string): Promise<Project | null> {
    const row = this.db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(projectId) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      path: row.path,
      stack: JSON.parse(row.stack || '[]'),
      config: JSON.parse(row.config),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getProjectByPath(path: string): Promise<Project | null> {
    const row = this.db
      .prepare('SELECT * FROM projects WHERE path = ?')
      .get(path) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      path: row.path,
      stack: JSON.parse(row.stack || '[]'),
      config: JSON.parse(row.config),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): Promise<Project> {
    const current = await this.getProject(projectId);
    if (!current) {
      throw new Error(`Project ${projectId} not found`);
    }

    const stmt = this.db.prepare(`
      UPDATE projects
      SET name = ?, stack = ?, config = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      updates.name || current.name,
      JSON.stringify(updates.stack || current.stack),
      JSON.stringify(updates.config || current.config),
      projectId
    );

    const updated = await this.getProject(projectId);
    if (!updated) {
      throw new Error('Failed to update project');
    }
    return updated;
  }

  // ==================
  // Memory Entry CRUD
  // ==================

  async createEntry(input: CreateEntryInput): Promise<MemoryEntry> {
    const id = input.id || randomUUID();
    const branch = input.branch || (await this.getActiveBranch(input.projectId));
    const status = input.status || 'active';

    return this.db.transaction(() => {
      const stmt = this.db.prepare(`
        INSERT INTO memory_entries (
          id, project_id, type, title, content, metadata, branch,
          version, status, is_synced, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 0, datetime('now'), datetime('now'))
      `);

      stmt.run(
        id,
        input.projectId,
        input.type,
        input.title,
        input.content,
        JSON.stringify(input.metadata || {}),
        branch,
        status
      );

      // Get the created entry
      const row = this.db
        .prepare('SELECT * FROM memory_entries WHERE id = ?')
        .get(id) as any;

      const entry = this.rowToEntry(row);

      // Create initial version
      this.createVersionSnapshot(entry);

      return entry;
    })();
  }

  async getEntry(id: string): Promise<MemoryEntry | null> {
    let row: any;
    if (id.length < 36) {
      // Short ID prefix match
      row = this.db
        .prepare('SELECT * FROM memory_entries WHERE id LIKE ?')
        .get(id + '%') as any;
    } else {
      row = this.db
        .prepare('SELECT * FROM memory_entries WHERE id = ?')
        .get(id) as any;
    }

    if (!row) return null;

    return this.rowToEntry(row);
  }

  async updateEntry(
    id: string,
    updates: Partial<Omit<MemoryEntry, 'id' | 'projectId' | 'createdAt'>>
  ): Promise<MemoryEntry> {
    const current = await this.getEntry(id);
    if (!current) {
      throw new Error(`Entry ${id} not found`);
    }

    return this.db.transaction(() => {
      const newVersion = current.version + 1;

      const stmt = this.db.prepare(`
        UPDATE memory_entries
        SET title = ?, content = ?, metadata = ?, version = ?, status = ?,
            is_synced = 0, updated_at = datetime('now')
        WHERE id = ?
      `);

      stmt.run(
        updates.title || current.title,
        updates.content || current.content,
        JSON.stringify(updates.metadata || current.metadata),
        newVersion,
        updates.status || current.status,
        id
      );

      // Get the updated entry
      const row = this.db
        .prepare('SELECT * FROM memory_entries WHERE id = ?')
        .get(id) as any;

      const updated = this.rowToEntry(row);

      // Create version snapshot
      this.createVersionSnapshot(updated);

      return updated;
    })();
  }

  async deleteEntry(id: string, hard = false): Promise<void> {
    if (hard) {
      this.db.prepare('DELETE FROM memory_entries WHERE id = ?').run(id);
    } else {
      // Soft delete
      this.db
        .prepare('UPDATE memory_entries SET is_archived = 1 WHERE id = ?')
        .run(id);
    }
  }

  async listEntries(query: EntryQuery): Promise<MemoryEntry[]> {
    let sql = 'SELECT * FROM memory_entries WHERE project_id = ?';
    const params: any[] = [query.projectId];

    if (query.type) {
      sql += ' AND type = ?';
      params.push(query.type);
    }

    if (query.branch) {
      sql += ' AND branch = ?';
      params.push(query.branch);
    }

    if (query.isArchived !== undefined) {
      sql += ' AND is_archived = ?';
      params.push(query.isArchived ? 1 : 0);
    }

    sql += ' ORDER BY updated_at DESC';

    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    if (query.offset) {
      sql += ' OFFSET ?';
      params.push(query.offset);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((row) => this.rowToEntry(row));
  }

  async countEntries(
    query: Omit<EntryQuery, 'limit' | 'offset'>
  ): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM memory_entries WHERE project_id = ?';
    const params: any[] = [query.projectId];

    if (query.type) {
      sql += ' AND type = ?';
      params.push(query.type);
    }

    if (query.branch) {
      sql += ' AND branch = ?';
      params.push(query.branch);
    }

    if (query.isArchived !== undefined) {
      sql += ' AND is_archived = ?';
      params.push(query.isArchived ? 1 : 0);
    }

    const row = this.db.prepare(sql).get(...params) as any;
    return row.count;
  }

  async searchEntries(
    projectId: string,
    searchTerm: string,
    options?: { branch?: string; type?: string; limit?: number }
  ): Promise<MemoryEntry[]> {
    let sql = `
      SELECT e.*
      FROM memory_entries e
      JOIN memory_entries_fts fts ON fts.id = e.id
      WHERE e.project_id = ? AND memory_entries_fts MATCH ?
    `;
    const params: any[] = [projectId, searchTerm];

    if (options?.branch) {
      sql += ' AND e.branch = ?';
      params.push(options.branch);
    }

    if (options?.type) {
      sql += ' AND e.type = ?';
      params.push(options.type);
    }

    sql += ' ORDER BY rank';

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map((row) => this.rowToEntry(row));
  }

  // ==================
  // Sync Tracking
  // ==================

  async getUnsyncedEntries(projectId: string): Promise<MemoryEntry[]> {
    const rows = this.db
      .prepare('SELECT * FROM memory_entries WHERE project_id = ? AND is_synced = 0')
      .all(projectId) as any[];

    return rows.map((row) => this.rowToEntry(row));
  }

  async markSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const placeholders = ids.map(() => '?').join(',');
    this.db
      .prepare(`UPDATE memory_entries SET is_synced = 1 WHERE id IN (${placeholders})`)
      .run(...ids);
  }

  async getEntriesUpdatedSince(
    projectId: string,
    timestamp: Date
  ): Promise<MemoryEntry[]> {
    const rows = this.db
      .prepare(
        'SELECT * FROM memory_entries WHERE project_id = ? AND updated_at > ?'
      )
      .all(projectId, timestamp.toISOString()) as any[];

    return rows.map((row) => this.rowToEntry(row));
  }

  async updateLastPull(projectId: string, timestamp: Date): Promise<void> {
    this.db
      .prepare(
        `
      INSERT INTO sync_metadata (project_id, last_pull_at)
      VALUES (?, ?)
      ON CONFLICT(project_id) DO UPDATE SET last_pull_at = excluded.last_pull_at
    `
      )
      .run(projectId, timestamp.toISOString());
  }

  async getLastPull(projectId: string): Promise<Date | null> {
    const row = this.db
      .prepare('SELECT last_pull_at FROM sync_metadata WHERE project_id = ?')
      .get(projectId) as any;

    return row?.last_pull_at ? new Date(row.last_pull_at) : null;
  }

  // ==================
  // Branching
  // ==================

  async createBranch(
    projectId: string,
    name: string,
    fromBranch: string
  ): Promise<Branch> {
    const id = randomUUID();

    this.db
      .prepare(`
      INSERT INTO branches (id, project_id, name, parent_branch, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `)
      .run(id, projectId, name, fromBranch !== name ? fromBranch : null);

    const branch = await this.getBranch(projectId, name);
    if (!branch) {
      throw new Error('Failed to create branch');
    }
    return branch;
  }

  async getBranch(projectId: string, name: string): Promise<Branch | null> {
    const row = this.db
      .prepare('SELECT * FROM branches WHERE project_id = ? AND name = ?')
      .get(projectId, name) as any;

    if (!row) return null;

    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      parentBranch: row.parent_branch,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
    };
  }

  async listBranches(projectId: string): Promise<Branch[]> {
    const rows = this.db
      .prepare('SELECT * FROM branches WHERE project_id = ? ORDER BY created_at')
      .all(projectId) as any[];

    return rows.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      parentBranch: row.parent_branch,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
    }));
  }

  async deleteBranch(projectId: string, name: string): Promise<void> {
    if (name === 'main') {
      throw new Error('Cannot delete main branch');
    }

    this.db
      .prepare('DELETE FROM branches WHERE project_id = ? AND name = ?')
      .run(projectId, name);
  }

  async getActiveBranch(projectId: string): Promise<string> {
    const row = this.db
      .prepare('SELECT active_branch FROM project_config WHERE project_id = ?')
      .get(projectId) as any;

    return row?.active_branch || 'main';
  }

  async switchBranch(projectId: string, branchName: string): Promise<void> {
    // Verify branch exists
    const branch = await this.getBranch(projectId, branchName);
    if (!branch) {
      throw new Error(`Branch ${branchName} not found`);
    }

    this.db
      .prepare(
        `
      INSERT INTO project_config (project_id, active_branch)
      VALUES (?, ?)
      ON CONFLICT(project_id) DO UPDATE SET active_branch = excluded.active_branch
    `
      )
      .run(projectId, branchName);
  }

  // ==================
  // Versioning
  // ==================

  async createVersion(entryId: string, snapshot: MemoryEntry): Promise<void> {
    this.createVersionSnapshot(snapshot);
  }

  private createVersionSnapshot(entry: MemoryEntry): void {
    const id = randomUUID();

    this.db
      .prepare(`
      INSERT INTO memory_versions (
        id, entry_id, version, title, content, metadata, branch, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
      .run(
        id,
        entry.id,
        entry.version,
        entry.title,
        entry.content,
        JSON.stringify(entry.metadata),
        entry.branch
      );
  }

  async getVersionHistory(entryId: string): Promise<MemoryEntry[]> {
    const rows = this.db
      .prepare(
        'SELECT * FROM memory_versions WHERE entry_id = ? ORDER BY version DESC'
      )
      .all(entryId) as any[];

    return rows.map((row) => ({
      id: row.entry_id,
      projectId: '', // Not stored in versions
      type: 'decision' as any, // Not stored in versions
      title: row.title,
      content: row.content,
      metadata: JSON.parse(row.metadata || '{}'),
      embedding: undefined,
      branch: row.branch,
      version: row.version,
      isSynced: false,
      isArchived: false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.created_at),
    }));
  }

  async restoreVersion(entryId: string, version: number): Promise<MemoryEntry> {
    const versionRow = this.db
      .prepare('SELECT * FROM memory_versions WHERE entry_id = ? AND version = ?')
      .get(entryId, version) as any;

    if (!versionRow) {
      throw new Error(`Version ${version} not found for entry ${entryId}`);
    }

    const current = await this.getEntry(entryId);
    if (!current) {
      throw new Error(`Entry ${entryId} not found`);
    }

    return this.updateEntry(entryId, {
      title: versionRow.title,
      content: versionRow.content,
      metadata: JSON.parse(versionRow.metadata || '{}'),
    });
  }

  // ==================
  // Plan Caching (for offline-first billing)
  // ==================

  getCachedPlan(userId: string): { planId: string; fetchedAt: number } | null {
    const row = this.db.prepare(
      'SELECT plan_id, fetched_at FROM plan_cache WHERE user_id = ?'
    ).get(userId) as { plan_id: string; fetched_at: number } | undefined;

    if (!row) return null;

    return {
      planId: row.plan_id,
      fetchedAt: row.fetched_at,
    };
  }

  cachePlan(userId: string, planId: string): void {
    this.db.prepare(
      'INSERT OR REPLACE INTO plan_cache (user_id, plan_id, fetched_at) VALUES (?, ?, ?)'
    ).run(userId, planId, Date.now());
  }

  // ==================
  // Helper Methods
  // ==================

  private rowToEntry(row: any): MemoryEntry {
    return {
      id: row.id,
      projectId: row.project_id,
      type: row.type,
      title: row.title,
      content: row.content,
      metadata: JSON.parse(row.metadata || '{}'),
      embedding: row.embedding ? JSON.parse(row.embedding) : undefined,
      branch: row.branch,
      version: row.version,
      status: row.status || 'active',
      isSynced: row.is_synced === 1,
      isArchived: row.is_archived === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
