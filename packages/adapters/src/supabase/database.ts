/**
 * Supabase Database Adapter
 * Implements IRemoteDatabase for cloud sync
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IRemoteDatabase } from '@memocore/core';
import type {
  MemoryEntry,
  Project,
  Branch,
  EntryQuery,
} from '@memocore/core';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  accessToken?: string;
}

export class SupabaseDatabase implements IRemoteDatabase {
  private client: SupabaseClient;
  private userId: string | null = null;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: config.accessToken
          ? { Authorization: `Bearer ${config.accessToken}` }
          : {},
      },
    });
  }

  async initialize(): Promise<void> {
    // Get current user session
    const {
      data: { session },
    } = await this.client.auth.getSession();

    if (!session) {
      throw new Error('Not authenticated. Run `memocore auth login` first.');
    }

    this.userId = session.user.id;
  }

  async close(): Promise<void> {
    // Supabase client doesn't need explicit closing
    // Sessions are managed automatically
  }

  // ==================
  // Project Management
  // ==================

  async upsertProject(project: Project): Promise<Project> {
    const { data, error } = await this.client
      .from('projects')
      .upsert({
        id: project.id,
        user_id: this.userId,
        name: project.name,
        path: project.path,
        stack: project.stack || [],
        config: project.config || {},
        created_at: project.createdAt.toISOString(),
        updated_at: project.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert project: ${error.message}`);
    }

    return this.rowToProject(data);
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get project: ${error.message}`);
    }

    return this.rowToProject(data);
  }

  // ==================
  // Memory Sync
  // ==================

  async pushEntries(entries: MemoryEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const rows = entries.map((entry) => ({
      id: entry.id,
      project_id: entry.projectId,
      type: entry.type,
      title: entry.title,
      content: entry.content,
      metadata: entry.metadata,
      embedding: entry.embedding || null,
      branch: entry.branch,
      version: entry.version,
      is_synced: true,
      is_archived: entry.isArchived,
      created_at: entry.createdAt.toISOString(),
      updated_at: entry.updatedAt.toISOString(),
    }));

    const { error } = await this.client.from('memory_entries').upsert(rows);

    if (error) {
      throw new Error(`Failed to push entries: ${error.message}`);
    }
  }

  async pullEntries(projectId: string, since: Date): Promise<MemoryEntry[]> {
    const { data, error } = await this.client
      .from('memory_entries')
      .select('*')
      .eq('project_id', projectId)
      .gte('updated_at', since.toISOString())
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to pull entries: ${error.message}`);
    }

    return data.map((row) => this.rowToEntry(row));
  }

  async listEntries(query: EntryQuery): Promise<MemoryEntry[]> {
    let queryBuilder = this.client
      .from('memory_entries')
      .select('*')
      .eq('project_id', query.projectId);

    if (query.branch) {
      queryBuilder = queryBuilder.eq('branch', query.branch);
    }

    if (query.type) {
      queryBuilder = queryBuilder.eq('type', query.type);
    }

    if (query.isArchived !== undefined) {
      queryBuilder = queryBuilder.eq('is_archived', query.isArchived);
    }

    queryBuilder = queryBuilder.order('updated_at', { ascending: false });

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        query.offset + (query.limit || 50) - 1
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to list entries: ${error.message}`);
    }

    return data.map((row) => this.rowToEntry(row));
  }

  // ==================
  // Semantic Search
  // ==================

  async semanticSearch(
    projectId: string,
    queryEmbedding: number[],
    options?: {
      branch?: string;
      limit?: number;
      minSimilarity?: number;
    }
  ): Promise<MemoryEntry[]> {
    // Use pgvector's cosine similarity
    // Note: This requires pgvector extension enabled in Supabase
    const limit = options?.limit || 10;
    const minSimilarity = options?.minSimilarity || 0.7;

    let query = this.client.rpc('match_entries', {
      query_embedding: queryEmbedding,
      match_project_id: projectId,
      match_branch: options?.branch || 'main',
      match_threshold: minSimilarity,
      match_count: limit,
    });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to perform semantic search: ${error.message}`);
    }

    return data.map((row: any) => this.rowToEntry(row));
  }

  // ==================
  // Branching
  // ==================

  async upsertBranch(branch: Branch): Promise<Branch> {
    const { data, error } = await this.client
      .from('branches')
      .upsert({
        id: branch.id,
        project_id: branch.projectId,
        name: branch.name,
        parent_branch: branch.parentBranch || null,
        is_active: branch.isActive,
        created_at: branch.createdAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert branch: ${error.message}`);
    }

    return this.rowToBranch(data);
  }

  async listBranches(projectId: string): Promise<Branch[]> {
    const { data, error } = await this.client
      .from('branches')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list branches: ${error.message}`);
    }

    return data.map((row) => this.rowToBranch(row));
  }

  // ==================
  // Helper Methods
  // ==================

  private rowToProject(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      path: row.path,
      stack: row.stack || [],
      config: row.config || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private rowToEntry(row: any): MemoryEntry {
    return {
      id: row.id,
      projectId: row.project_id,
      type: row.type,
      title: row.title,
      content: row.content,
      metadata: row.metadata || {},
      embedding: row.embedding || undefined,
      branch: row.branch,
      version: row.version,
      isSynced: row.is_synced,
      isArchived: row.is_archived,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private rowToBranch(row: any): Branch {
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      parentBranch: row.parent_branch || undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    };
  }
}
