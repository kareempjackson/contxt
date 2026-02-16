/**
 * Memory Engine - Core business logic for memory management
 */

import { nanoid } from 'nanoid';
import type { ILocalDatabase } from '../interfaces/database.js';
import type {
  MemoryEntry,
  CreateEntryInput,
  DecisionInput,
  PatternInput,
  ContextInput,
  DocumentInput,
  SessionInput,
  EntryQuery,
} from '../types.js';
import { ValidationError, NotFoundError } from '../types.js';

export class MemoryEngine {
  constructor(private db: ILocalDatabase) {}

  // ==================
  // Decision Management
  // ==================

  async addDecision(projectId: string, input: DecisionInput): Promise<MemoryEntry> {
    // Validate input
    if (!input.title?.trim()) {
      throw new ValidationError('Decision title is required');
    }
    if (!input.rationale?.trim()) {
      throw new ValidationError('Decision rationale is required');
    }

    // Create entry
    const entry = await this.db.createEntry({
      projectId,
      type: 'decision',
      title: input.title.trim(),
      content: input.rationale.trim(),
      metadata: {
        alternatives: input.alternatives || [],
        consequences: input.consequences || [],
        tags: input.tags || [],
      },
    });

    return entry;
  }

  async listDecisions(projectId: string, branch?: string): Promise<MemoryEntry[]> {
    return this.db.listEntries({
      projectId,
      type: 'decision',
      branch,
      isArchived: false,
    });
  }

  async getDecision(id: string): Promise<MemoryEntry> {
    const entry = await this.db.getEntry(id);
    if (!entry || entry.type !== 'decision') {
      throw new NotFoundError(`Decision with id ${id} not found`);
    }
    return entry;
  }

  async updateDecision(
    id: string,
    updates: Partial<DecisionInput>
  ): Promise<MemoryEntry> {
    const existing = await this.getDecision(id);

    return this.db.updateEntry(id, {
      title: updates.title?.trim() || existing.title,
      content: updates.rationale?.trim() || existing.content,
      metadata: {
        ...existing.metadata,
        alternatives: updates.alternatives || existing.metadata.alternatives,
        consequences: updates.consequences || existing.metadata.consequences,
        tags: updates.tags || existing.metadata.tags,
      },
    });
  }

  // ==================
  // Pattern Management
  // ==================

  async addPattern(projectId: string, input: PatternInput): Promise<MemoryEntry> {
    if (!input.title?.trim()) {
      throw new ValidationError('Pattern title is required');
    }
    if (!input.content?.trim()) {
      throw new ValidationError('Pattern content is required');
    }

    return this.db.createEntry({
      projectId,
      type: 'pattern',
      title: input.title.trim(),
      content: input.content.trim(),
      metadata: {
        category: input.category || 'general',
        tags: input.tags || [],
      },
    });
  }

  async listPatterns(projectId: string, branch?: string): Promise<MemoryEntry[]> {
    return this.db.listEntries({
      projectId,
      type: 'pattern',
      branch,
      isArchived: false,
    });
  }

  async getPattern(id: string): Promise<MemoryEntry> {
    const entry = await this.db.getEntry(id);
    if (!entry || entry.type !== 'pattern') {
      throw new NotFoundError(`Pattern with id ${id} not found`);
    }
    return entry;
  }

  async updatePattern(
    id: string,
    updates: Partial<PatternInput>
  ): Promise<MemoryEntry> {
    const existing = await this.getPattern(id);

    return this.db.updateEntry(id, {
      title: updates.title?.trim() || existing.title,
      content: updates.content?.trim() || existing.content,
      metadata: {
        ...existing.metadata,
        category: updates.category || existing.metadata.category,
        tags: updates.tags || existing.metadata.tags,
      },
    });
  }

  // ==================
  // Context Management
  // ==================

  async setContext(projectId: string, input: ContextInput): Promise<MemoryEntry> {
    // Get or create context entry for the project
    const existing = await this.db.listEntries({
      projectId,
      type: 'context',
      isArchived: false,
    });

    const contextData = {
      feature: input.feature || '',
      blockers: input.blockers || [],
      nextSteps: input.nextSteps || [],
      activeFiles: input.activeFiles || [],
    };

    if (existing.length > 0) {
      // Update existing context
      return this.db.updateEntry(existing[0].id, {
        title: 'Project Context',
        content: JSON.stringify(contextData, null, 2),
        metadata: contextData,
      });
    } else {
      // Create new context
      return this.db.createEntry({
        projectId,
        type: 'context',
        title: 'Project Context',
        content: JSON.stringify(contextData, null, 2),
        metadata: contextData,
      });
    }
  }

  async getContext(projectId: string): Promise<MemoryEntry | null> {
    const entries = await this.db.listEntries({
      projectId,
      type: 'context',
      isArchived: false,
    });

    return entries[0] || null;
  }

  // ==================
  // Document Management
  // ==================

  async addDocument(projectId: string, input: DocumentInput): Promise<MemoryEntry> {
    if (!input.title?.trim()) {
      throw new ValidationError('Document title is required');
    }
    if (!input.content?.trim()) {
      throw new ValidationError('Document content is required');
    }

    return this.db.createEntry({
      projectId,
      type: 'document',
      title: input.title.trim(),
      content: input.content.trim(),
      metadata: {
        url: input.url,
        tags: input.tags || [],
      },
    });
  }

  async listDocuments(projectId: string, branch?: string): Promise<MemoryEntry[]> {
    return this.db.listEntries({
      projectId,
      type: 'document',
      branch,
      isArchived: false,
    });
  }

  async getDocument(id: string): Promise<MemoryEntry> {
    const entry = await this.db.getEntry(id);
    if (!entry || entry.type !== 'document') {
      throw new NotFoundError(`Document with id ${id} not found`);
    }
    return entry;
  }

  // ==================
  // Session Management
  // ==================

  async startSession(projectId: string, input: SessionInput): Promise<MemoryEntry> {
    if (!input.feature?.trim()) {
      throw new ValidationError('Session feature is required');
    }

    // Check if there's already an active session
    const active = await this.getActiveSession(projectId);
    if (active) {
      throw new ValidationError(
        'An active session already exists. End it first or use a different branch.'
      );
    }

    return this.db.createEntry({
      projectId,
      type: 'session',
      title: `Session: ${input.feature}`,
      content: input.description || '',
      metadata: {
        feature: input.feature,
        startedAt: new Date().toISOString(),
        endedAt: null,
      },
    });
  }

  async endSession(projectId: string, summary?: string): Promise<MemoryEntry> {
    const active = await this.getActiveSession(projectId);
    if (!active) {
      throw new NotFoundError('No active session found');
    }

    return this.db.updateEntry(active.id, {
      content: summary || active.content,
      metadata: {
        ...active.metadata,
        endedAt: new Date().toISOString(),
      },
    });
  }

  async getActiveSession(projectId: string): Promise<MemoryEntry | null> {
    const sessions = await this.db.listEntries({
      projectId,
      type: 'session',
      isArchived: false,
    });

    return sessions.find((s) => !s.metadata.endedAt) || null;
  }

  async listSessions(projectId: string, branch?: string): Promise<MemoryEntry[]> {
    return this.db.listEntries({
      projectId,
      type: 'session',
      branch,
      isArchived: false,
    });
  }

  // ==================
  // Generic Operations
  // ==================

  async deleteEntry(id: string, hard = false): Promise<void> {
    return this.db.deleteEntry(id, hard);
  }

  async searchEntries(
    projectId: string,
    searchTerm: string,
    options?: { branch?: string; type?: string }
  ): Promise<MemoryEntry[]> {
    return this.db.searchEntries(projectId, searchTerm, options);
  }

  async getAllEntries(query: EntryQuery): Promise<MemoryEntry[]> {
    return this.db.listEntries(query);
  }

  async getEntryCount(projectId: string, branch?: string): Promise<number> {
    return this.db.countEntries({
      projectId,
      branch,
      isArchived: false,
    });
  }
}
