/**
 * Supabase Database Adapter
 * Implements IRemoteDatabase for cloud sync
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import type { IRemoteDatabase } from '@mycontxt/core';
import type {
  MemoryEntry,
  MemoryEntryStatus,
  Project,
  Branch,
  EntryQuery,
  CreateEntryInput,
  ActivityItem,
  UsageStats,
} from '@mycontxt/core';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  accessToken?: string;
}

export class SupabaseDatabase implements IRemoteDatabase {
  private client: SupabaseClient;
  private userId: string | null = null;
  private accessToken: string | null;

  constructor(config: SupabaseConfig) {
    this.accessToken = config.accessToken ?? null;
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
    // When an access token is passed (CLI usage), validate it directly.
    // getSession() only checks in-memory/localStorage session storage, not the
    // Authorization header — so we must use getUser() for token-based auth.
    if (this.accessToken) {
      const { data: { user }, error } = await this.client.auth.getUser(this.accessToken);
      if (error || !user) {
        throw new Error('Not authenticated. Run `contxt auth login` first.');
      }
      this.userId = user.id;
      return;
    }

    // Web app: session is stored in cookies via @supabase/ssr
    const { data: { session } } = await this.client.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated. Run `contxt auth login` first.');
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

  async updateProject(projectId: string, updates: { config: Project['config'] }): Promise<Project> {
    const { data, error } = await this.client
      .from('projects')
      .update({ config: updates.config, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
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
      status: entry.status ?? 'active',
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
  // Dashboard Queries
  // ==================

  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }

    return data.map((row) => this.rowToProject(row));
  }

  async getProjectByName(userId: string, name: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', name)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get project by name: ${error.message}`);
    }

    return data ? this.rowToProject(data) : null;
  }

  async getEntry(entryId: string): Promise<MemoryEntry | null> {
    const { data, error } = await this.client
      .from('memory_entries')
      .select('*')
      .eq('id', entryId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get entry: ${error.message}`);
    }

    return data ? this.rowToEntry(data) : null;
  }

  async createEntry(input: CreateEntryInput): Promise<MemoryEntry> {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('memory_entries')
      .insert({
        id: input.id || randomUUID(),
        project_id: input.projectId,
        type: input.type,
        title: input.title,
        content: input.content,
        metadata: input.metadata || {},
        branch: input.branch || 'main',
        version: 1,
        status: input.status || 'active',
        is_synced: true,
        is_archived: false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create entry: ${error.message}`);
    }

    return this.rowToEntry(data);
  }

  async updateEntry(entryId: string, updates: Partial<Pick<MemoryEntry, 'title' | 'content' | 'metadata' | 'status'>>): Promise<MemoryEntry> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.content !== undefined) row.content = updates.content;
    if (updates.metadata !== undefined) row.metadata = updates.metadata;
    if (updates.status !== undefined) row.status = updates.status;

    const { data, error } = await this.client
      .from('memory_entries')
      .update(row)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update entry: ${error.message}`);
    }

    return this.rowToEntry(data);
  }

  async archiveEntry(entryId: string): Promise<void> {
    const { error } = await this.client
      .from('memory_entries')
      .update({ is_archived: true, status: 'archived' as MemoryEntryStatus, updated_at: new Date().toISOString() })
      .eq('id', entryId);

    if (error) {
      throw new Error(`Failed to archive entry: ${error.message}`);
    }
  }

  async getDrafts(userId: string, projectId?: string): Promise<MemoryEntry[]> {
    // Join through projects to filter by user_id
    let query = this.client
      .from('memory_entries')
      .select('*, projects!inner(user_id)')
      .eq('projects.user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get drafts: ${error.message}`);
    }

    return data.map((row) => this.rowToEntry(row));
  }

  async confirmDraft(entryId: string): Promise<MemoryEntry> {
    return this.updateEntry(entryId, { status: 'active' });
  }

  async discardDraft(entryId: string): Promise<void> {
    const { error } = await this.client
      .from('memory_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      throw new Error(`Failed to discard draft: ${error.message}`);
    }
  }

  async searchEntries(
    projectId: string,
    query: string,
    options?: { type?: string; branch?: string; limit?: number }
  ): Promise<MemoryEntry[]> {
    // Use Postgres full-text search via the existing FTS index
    let qb = this.client
      .from('memory_entries')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .textSearch('title', query, { config: 'english', type: 'websearch' })
      .order('updated_at', { ascending: false })
      .limit(options?.limit || 20);

    if (options?.type) qb = qb.eq('type', options.type);
    if (options?.branch) qb = qb.eq('branch', options.branch);

    const { data, error } = await qb;

    if (error) {
      throw new Error(`Failed to search entries: ${error.message}`);
    }

    return data.map((row) => this.rowToEntry(row));
  }

  async searchAllEntries(
    userId: string,
    query: string,
    options?: { type?: string; limit?: number }
  ): Promise<MemoryEntry[]> {
    // Cross-project FTS: join with projects to scope to this user's entries
    let qb = this.client
      .from('memory_entries')
      .select('*, projects!inner(user_id)')
      .eq('projects.user_id', userId)
      .eq('is_archived', false)
      .textSearch('title', query, { config: 'english', type: 'websearch' })
      .order('updated_at', { ascending: false })
      .limit(options?.limit || 30);

    if (options?.type) qb = qb.eq('type', options.type);

    const { data, error } = await qb;

    if (error) {
      throw new Error(`Failed to search all entries: ${error.message}`);
    }

    return data.map((row) => this.rowToEntry(row));
  }

  async getActivity(
    userId: string,
    options?: { projectId?: string; limit?: number }
  ): Promise<ActivityItem[]> {
    // Derive activity from memory_entries + projects; no separate log table
    let query = this.client
      .from('memory_entries')
      .select('id, project_id, type, title, status, updated_at, is_archived, projects!inner(name, user_id)')
      .eq('projects.user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(options?.limit || 50);

    if (options?.projectId) {
      query = query.eq('project_id', options.projectId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get activity: ${error.message}`);
    }

    return data.map((row: any): ActivityItem => ({
      id: row.id,
      projectId: row.project_id,
      projectName: row.projects?.name ?? '',
      entryId: row.id,
      type: (row.status === 'draft' ? 'draft' : row.is_archived ? 'archive' : row.type === 'session' ? 'session' : 'push') as ActivityItem['type'],
      description: row.title,
      actor: 'user',
      createdAt: new Date(row.updated_at),
    }));
  }

  async getSessions(projectId: string, options?: { limit?: number }): Promise<MemoryEntry[]> {
    return this.listEntries({
      projectId,
      type: 'session',
      limit: options?.limit || 20,
    });
  }

  async getUsage(userId: string): Promise<UsageStats> {
    const [entriesResult, projectsResult, usageResult] = await Promise.all([
      this.client
        .from('memory_entries')
        .select('id', { count: 'exact', head: true })
        .eq('projects.user_id', userId),
      this.client
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      this.client
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId),
    ]);

    const entriesUsed = entriesResult.count ?? 0;
    const projectsUsed = projectsResult.count ?? 0;
    const searchesRow = usageResult.data?.find((r: any) => r.metric === 'searches');
    const searchesUsed = searchesRow?.count ?? 0;

    return {
      entries: { used: entriesUsed, limit: 50000 },
      projects: { used: projectsUsed, limit: null },
      searches: { used: searchesUsed, limit: 10000 },
    };
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

  // ==================
  // User Profile (for plan resolution)
  // ==================

  async getUserProfile(userId: string): Promise<{ plan_id?: string } | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('plan_id')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    return data;
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
      metadata: row.metadata || {},
      embedding: row.embedding || undefined,
      branch: row.branch,
      version: row.version,
      status: (row.status as MemoryEntryStatus) || 'active',
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
