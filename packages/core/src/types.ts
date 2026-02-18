/**
 * Core type definitions for MemoCore
 */

/**
 * Memory entry types
 */
export type MemoryEntryType = 'decision' | 'pattern' | 'context' | 'document' | 'session';

/**
 * Memory entry status
 */
export type MemoryEntryStatus = 'active' | 'draft' | 'archived' | 'stale';

/**
 * User tier levels
 */
export type UserTier = 'free' | 'pro';

/**
 * Core memory entry
 */
export interface MemoryEntry {
  id: string;
  projectId: string;
  type: MemoryEntryType;
  title: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  branch: string;
  version: number;
  status: MemoryEntryStatus;
  isSynced: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project configuration
 */
export interface Project {
  id: string;
  userId?: string;
  name: string;
  path: string;
  stack?: string[];
  config: ProjectConfig;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project configuration options
 */
export interface ProjectConfig {
  defaultBranch: string;
  maxTokens: number;
  autoSession: boolean;
  stackDetection: boolean;
  autoSync: boolean;
  syncIntervalMinutes: number;
}

/**
 * Branch information
 */
export interface Branch {
  id: string;
  projectId: string;
  name: string;
  parentBranch?: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  email?: string;
  tier: UserTier;
  createdAt: Date;
}

/**
 * Authentication session
 */
export interface AuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Sync operation result
 */
export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

/**
 * Entry query filters
 */
export interface EntryQuery {
  projectId: string;
  type?: MemoryEntryType;
  branch?: string;
  isArchived?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Input for creating a new entry
 */
export interface CreateEntryInput {
  id?: string; // Optional - if not provided, will be auto-generated
  projectId: string;
  type: MemoryEntryType;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  branch?: string;
  status?: MemoryEntryStatus; // Optional - defaults to 'active'
}

/**
 * Decision-specific input
 */
export interface DecisionInput {
  title: string;
  rationale: string;
  alternatives?: string[];
  consequences?: string[];
  tags?: string[];
}

/**
 * Pattern-specific input
 */
export interface PatternInput {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

/**
 * Context-specific input
 */
export interface ContextInput {
  feature?: string;
  blockers?: string[];
  nextSteps?: string[];
  activeFiles?: string[];
}

/**
 * Document-specific input
 */
export interface DocumentInput {
  title: string;
  content: string;
  url?: string;
  tags?: string[];
}

/**
 * Session-specific input
 */
export interface SessionInput {
  feature: string;
  description?: string;
}

/**
 * Ranked entry for context retrieval
 */
export interface RankedEntry {
  entry: MemoryEntry;
  score: number;
  reasons: string[];
}

/**
 * Context retrieval options
 */
export interface SuggestOptions {
  projectId: string;
  taskDescription?: string;
  taskEmbedding?: number[];
  activeFiles?: string[];
  branch?: string;
  maxResults?: number;
  maxTokens?: number;
  minRelevance?: number;
}

/**
 * Activity item for the dashboard activity feed.
 * Derived from memory_entries changes — no separate table needed.
 */
export interface ActivityItem {
  id: string;
  projectId: string;
  projectName: string;
  entryId?: string;
  type: 'push' | 'session' | 'branch' | 'draft' | 'edit' | 'archive';
  description: string;
  actor: 'user' | 'auto';
  createdAt: Date;
}

/**
 * Usage statistics for the sidebar usage meters.
 */
export interface UsageStats {
  entries: { used: number; limit: number };
  projects: { used: number; limit: number | null };
  searches: { used: number; limit: number };
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Authentication error
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
