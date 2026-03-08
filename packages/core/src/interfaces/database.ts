/**
 * Database interface definitions
 * These interfaces define the contract between business logic and storage adapters
 */

import type {
  MemoryEntry,
  Project,
  ProjectConfig,
  Branch,
  CreateEntryInput,
  EntryQuery,
} from '../types.js';

/**
 * Local database interface (SQLite)
 * This is the source of truth for offline-first architecture
 */
export interface ILocalDatabase {
  /**
   * Initialize the database schema
   */
  initialize(): Promise<void>;

  /**
   * Close the database connection
   */
  close(): Promise<void>;

  // ==================
  // Project Management
  // ==================

  /**
   * Create or initialize a project
   */
  initProject(config: {
    name: string;
    path: string;
    stack?: string[];
    config?: Partial<ProjectConfig>;
  }): Promise<Project>;

  /**
   * Get a project by ID
   */
  getProject(projectId: string): Promise<Project | null>;

  /**
   * Get project by path
   */
  getProjectByPath(path: string): Promise<Project | null>;

  /**
   * Update project configuration
   */
  updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): Promise<Project>;

  // ==================
  // Memory Entry CRUD
  // ==================

  /**
   * Create a new memory entry
   */
  createEntry(input: CreateEntryInput): Promise<MemoryEntry>;

  /**
   * Get a single entry by ID
   */
  getEntry(id: string): Promise<MemoryEntry | null>;

  /**
   * Update an existing entry
   */
  updateEntry(
    id: string,
    updates: Partial<Omit<MemoryEntry, 'id' | 'projectId' | 'createdAt'>>
  ): Promise<MemoryEntry>;

  /**
   * Delete an entry (soft delete by default)
   */
  deleteEntry(id: string, hard?: boolean): Promise<void>;

  /**
   * List entries with optional filters
   */
  listEntries(query: EntryQuery): Promise<MemoryEntry[]>;

  /**
   * Count entries matching query
   */
  countEntries(query: Omit<EntryQuery, 'limit' | 'offset'>): Promise<number>;

  /**
   * Search entries (full-text search)
   */
  searchEntries(
    projectId: string,
    searchTerm: string,
    options?: {
      branch?: string;
      type?: string;
      limit?: number;
    }
  ): Promise<MemoryEntry[]>;

  // ==================
  // Sync Tracking
  // ==================

  /**
   * Get all unsynced entries for a project
   */
  getUnsyncedEntries(projectId: string): Promise<MemoryEntry[]>;

  /**
   * Mark entries as synced
   */
  markSynced(ids: string[]): Promise<void>;

  /**
   * Get entries updated since a timestamp
   */
  getEntriesUpdatedSince(projectId: string, timestamp: Date): Promise<MemoryEntry[]>;

  /**
   * Update last pull timestamp
   */
  updateLastPull(projectId: string, timestamp: Date): Promise<void>;

  /**
   * Get last pull timestamp
   */
  getLastPull(projectId: string): Promise<Date | null>;

  // ==================
  // Branching
  // ==================

  /**
   * Create a new branch
   */
  createBranch(projectId: string, name: string, fromBranch: string): Promise<Branch>;

  /**
   * Get a branch by name
   */
  getBranch(projectId: string, name: string): Promise<Branch | null>;

  /**
   * List all branches for a project
   */
  listBranches(projectId: string): Promise<Branch[]>;

  /**
   * Delete a branch
   */
  deleteBranch(projectId: string, name: string): Promise<void>;

  /**
   * Get current active branch
   */
  getActiveBranch(projectId: string): Promise<string>;

  /**
   * Switch to a different branch
   */
  switchBranch(projectId: string, branchName: string): Promise<void>;

  // ==================
  // Versioning
  // ==================

  /**
   * Create a version snapshot of an entry
   */
  createVersion(entryId: string, snapshot: MemoryEntry): Promise<void>;

  /**
   * Get version history for an entry
   */
  getVersionHistory(entryId: string): Promise<MemoryEntry[]>;

  /**
   * Restore an entry to a specific version
   */
  restoreVersion(entryId: string, version: number): Promise<MemoryEntry>;

  // ==================
  // Plan Caching
  // ==================

  /**
   * Get cached plan for a user (for offline-first access)
   */
  getCachedPlan(userId: string): { planId: string; fetchedAt: number } | null;

  /**
   * Cache user's plan locally
   */
  cachePlan(userId: string, planId: string): void;
}

/**
 * Remote database interface (Supabase/Cloud)
 * Mirrors ILocalDatabase but for cloud operations
 */
export interface IRemoteDatabase {
  /**
   * Initialize connection to remote database
   */
  initialize(): Promise<void>;

  /**
   * Close connection
   */
  close(): Promise<void>;

  // ==================
  // Project Management
  // ==================

  /**
   * Sync project to remote
   */
  upsertProject(project: Project): Promise<Project>;

  /**
   * Get project from remote
   */
  getProject(projectId: string): Promise<Project | null>;

  // ==================
  // Memory Sync
  // ==================

  /**
   * Push entries to remote
   */
  pushEntries(entries: MemoryEntry[]): Promise<void>;

  /**
   * Pull entries from remote updated since timestamp
   */
  pullEntries(projectId: string, since: Date): Promise<MemoryEntry[]>;

  /**
   * Get all entries for a project
   */
  listEntries(query: EntryQuery): Promise<MemoryEntry[]>;

  // ==================
  // Semantic Search
  // ==================

  /**
   * Perform semantic search using embeddings
   */
  semanticSearch(
    projectId: string,
    queryEmbedding: number[],
    options?: {
      branch?: string;
      limit?: number;
      minSimilarity?: number;
    }
  ): Promise<MemoryEntry[]>;

  semanticSearchAll(
    userId: string,
    queryEmbedding: number[],
    options?: {
      limit?: number;
      minSimilarity?: number;
    }
  ): Promise<MemoryEntry[]>;

  // ==================
  // Branching
  // ==================

  /**
   * Sync branch to remote
   */
  upsertBranch(branch: Branch): Promise<Branch>;

  /**
   * Get branches from remote
   */
  listBranches(projectId: string): Promise<Branch[]>;

  // ==================
  // User Profile
  // ==================

  /**
   * Get user profile (for plan resolution)
   */
  getUserProfile(userId: string): Promise<{ plan_id?: string } | null>;
}
