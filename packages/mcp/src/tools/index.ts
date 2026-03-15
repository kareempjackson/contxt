/**
 * MCP Tools - All tool implementations
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { MemoryEngine, rankEntries, fitToBudget, buildContext } from '@mycontxt/core';
import type { DecisionInput, PatternInput, ContextInput, MemoryEntry } from '@mycontxt/core';
import { getDbPath } from '../utils/project.js';
import { suggestContext } from './suggest-context.js';

// ==================
// Token budget helpers (Feature 1)
// ==================

/** Estimate tokens using 1 token per 4 chars heuristic (no tiktoken dep needed) */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatEntryText(entry: MemoryEntry): string {
  const lines: string[] = [];
  lines.push(`## ${entry.type.toUpperCase()}: ${entry.title}`);
  lines.push('');
  lines.push(entry.content);
  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    for (const [key, value] of Object.entries(entry.metadata)) {
      if (Array.isArray(value) && value.length > 0) {
        lines.push(`- ${key}: ${value.join(', ')}`);
      } else if (value && typeof value === 'string' && !key.startsWith('source')) {
        lines.push(`- ${key}: ${value}`);
      }
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

/** Apply token budget: rank top-down, stop when budget exceeded. Returns {fitted, total, tokensUsed} */
function applyTokenBudget(
  entries: MemoryEntry[],
  maxTokens: number
): { fitted: MemoryEntry[]; total: number; tokensUsed: number } {
  const total = entries.length;
  const fitted: MemoryEntry[] = [];
  let tokensUsed = 0;
  for (const entry of entries) {
    const t = estimateTokens(formatEntryText(entry));
    if (tokensUsed + t > maxTokens) break;
    fitted.push(entry);
    tokensUsed += t;
  }
  return { fitted, total, tokensUsed };
}

function buildBudgetFooter(returned: number, total: number, tokensUsed: number): string {
  if (returned === total) return '';
  return `\n--- Returned ${returned} of ${total} matching entries (~${tokensUsed} tokens). Increase max_tokens or narrow query for more.`;
}

function buildBudgetedResponse(
  header: string,
  entries: MemoryEntry[],
  maxTokens: number | undefined,
  renderEntry: (e: MemoryEntry) => string[]
): string {
  if (entries.length === 0) return header + '\nNo entries found.';

  const toRender = maxTokens !== undefined ? applyTokenBudget(entries, maxTokens) : { fitted: entries, total: entries.length, tokensUsed: 0 };
  const lines: string[] = [header, ''];
  for (const entry of toRender.fitted) {
    lines.push(...renderEntry(entry));
  }
  if (maxTokens !== undefined) {
    lines.push(buildBudgetFooter(toRender.fitted.length, toRender.total, toRender.tokensUsed));
  }
  return lines.join('\n');
}
import {
  autoCaptureDecision,
  autoCapturePattern,
  captureDiscussion,
  updateSession,
  getDrafts,
  confirmDraft,
  savePrompt,
} from './auto-capture.js';

// Export suggest-context
export { suggestContext };

// Export auto-capture tools
export { autoCaptureDecision, autoCapturePattern, captureDiscussion, updateSession, getDrafts, confirmDraft, savePrompt };

/**
 * Get project context - Overview of project
 */
export async function getProjectContext(args: { projectPath?: string }): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);
    const activeBranch = await db.getActiveBranch(project.id);
    const context = await engine.getContext(project.id);
    const decisions = await engine.listDecisions(project.id);
    const patterns = await engine.listPatterns(project.id);

    const lines: string[] = [];
    lines.push(`# Project: ${project.name}`);
    lines.push('');
    lines.push(`**Branch:** ${activeBranch}`);
    lines.push(`**Stack:** ${project.stack?.join(', ') || 'Not specified'}`);
    lines.push('');

    if (context) {
      lines.push('## Current Context');
      if (context.metadata.feature) {
        lines.push(`**Feature:** ${context.metadata.feature}`);
      }
      if (context.metadata.blockers?.length > 0) {
        lines.push(`**Blockers:** ${context.metadata.blockers.join(', ')}`);
      }
      lines.push('');
    }

    lines.push(`## Summary`);
    lines.push(`- ${decisions.length} decisions`);
    lines.push(`- ${patterns.length} patterns`);

    return lines.join('\n');
  } finally {
    await db.close();
  }
}

/**
 * Get decisions
 */
export async function getDecisions(args: {
  projectPath?: string;
  limit?: number;
  max_tokens?: number;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);
    const all = await engine.listDecisions(project.id);
    const decisions = args.limit ? all.slice(0, args.limit) : all;

    if (decisions.length === 0) {
      return 'No decisions found.';
    }

    return buildBudgetedResponse(
      '# Architectural Decisions',
      decisions,
      args.max_tokens,
      (d) => {
        const lines: string[] = [];
        lines.push(`## ${d.title}`);
        lines.push('');
        lines.push(d.content);
        if (d.metadata.alternatives?.length > 0) {
          lines.push('');
          lines.push(`**Alternatives considered:** ${d.metadata.alternatives.join(', ')}`);
        }
        lines.push('');
        lines.push('---');
        lines.push('');
        return lines;
      }
    );
  } finally {
    await db.close();
  }
}

/**
 * Get patterns
 */
export async function getPatterns(args: {
  projectPath?: string;
  limit?: number;
  max_tokens?: number;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);
    const all = await engine.listPatterns(project.id);
    const patterns = args.limit ? all.slice(0, args.limit) : all;

    if (patterns.length === 0) {
      return 'No patterns found.';
    }

    return buildBudgetedResponse(
      '# Code Patterns & Conventions',
      patterns,
      args.max_tokens,
      (p) => [`## ${p.title}`, '', p.content, '', '---', '']
    );
  } finally {
    await db.close();
  }
}

/**
 * Search memory
 */
export async function searchMemory(args: {
  query: string;
  projectPath?: string;
  limit?: number;
  max_tokens?: number;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);
    const results = await engine.searchEntries(project.id, args.query);
    const entries = args.limit ? results.slice(0, args.limit) : results;

    if (entries.length === 0) {
      return `No results found for "${args.query}".`;
    }

    return buildBudgetedResponse(
      `# Search Results for "${args.query}"`,
      entries,
      args.max_tokens,
      (e) => [`## ${e.type.toUpperCase()}: ${e.title}`, '', e.content, '', '---', '']
    );
  } finally {
    await db.close();
  }
}

/**
 * Log decision
 */
export async function logDecision(args: {
  title: string;
  rationale: string;
  alternatives?: string[];
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);

    const input: DecisionInput = {
      title: args.title,
      rationale: args.rationale,
      alternatives: args.alternatives,
    };

    const entry = await engine.addDecision(project.id, input);

    return `Decision "${entry.title}" logged successfully.`;
  } finally {
    await db.close();
  }
}

/**
 * Update context
 */
export async function updateContext(args: {
  feature?: string;
  blockers?: string[];
  nextSteps?: string[];
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);

    const input: ContextInput = {
      feature: args.feature,
      blockers: args.blockers,
      nextSteps: args.nextSteps,
    };

    await engine.setContext(project.id, input);

    return 'Project context updated successfully.';
  } finally {
    await db.close();
  }
}

/**
 * Save pattern
 */
export async function savePattern(args: {
  title: string;
  content: string;
  category?: string;
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found.';
    }

    const engine = new MemoryEngine(db);

    const input: PatternInput = {
      title: args.title,
      content: args.content,
      category: args.category,
    };

    const entry = await engine.addPattern(project.id, input);

    return `Pattern "${entry.title}" saved successfully.`;
  } finally {
    await db.close();
  }
}

// ==================
// Feature 2: Session Events, Snapshot, Resume
// ==================

/**
 * Log a session event (decision made, file edited, error hit, task completed)
 */
export async function sessionEvent(args: {
  event_type: string;
  summary: string;
  related_entry_ids?: string[];
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const db = new SQLiteDatabase(getDbPath(projectPath));
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) return JSON.stringify({ status: 'no_project' });

    // Find active session
    const engine = new MemoryEngine(db);
    const activeSession = await engine.getActiveSession(project.id);
    const sessionId = activeSession?.id || 'no_session';

    db.insertSessionEvent({
      sessionId,
      eventType: args.event_type,
      summary: args.summary,
      relatedEntryIds: args.related_entry_ids,
    });

    // Rolling snapshot every 10 events
    if (activeSession) {
      const count = db.countSessionEvents(sessionId);
      if (count % 10 === 0) {
        const snapshot = await buildSnapshot(db, project, engine, activeSession);
        await db.updateEntry(activeSession.id, {
          metadata: { ...activeSession.metadata, latestSnapshot: snapshot, snapshotAt: new Date().toISOString() },
        });
      }
    }

    return JSON.stringify({ status: 'ok', sessionId });
  } finally {
    await db.close();
  }
}

async function buildSnapshot(db: SQLiteDatabase, project: any, engine: MemoryEngine, session: any): Promise<string> {
  const events = db.getSessionEvents(session.id);
  const activeBranch = await db.getActiveBranch(project.id);
  const context = await engine.getContext(project.id);

  const decisions = events.filter((e) => e.eventType === 'decision_made').map((e) => `- ${e.summary}`);
  const files = events.filter((e) => e.eventType === 'file_edited').map((e) => `- ${e.summary}`);
  const errors = events.filter((e) => e.eventType === 'error_hit');
  const completed = events.filter((e) => e.eventType === 'task_completed').map((e) => e.summary);
  const unresolvedErrors = errors.filter((e) => !completed.some((c) => c.includes(e.summary.slice(0, 20))));

  const lines: string[] = [
    `## Session Resume — ${project.name} / ${activeBranch}`,
    `### Last task: ${context?.metadata?.feature || session.metadata?.feature || 'Unknown'}`,
  ];
  if (decisions.length > 0) {
    lines.push(`### Decisions this session:`);
    lines.push(...decisions.slice(0, 10));
  }
  if (files.length > 0) {
    lines.push(`### Files touched:`);
    lines.push(...[...new Set(files)].slice(0, 10));
  }
  if (unresolvedErrors.length > 0) {
    lines.push(`### Errors unresolved:`);
    lines.push(...unresolvedErrors.slice(0, 5).map((e) => `- ${e.summary}`));
  }

  return lines.join('\n');
}

/**
 * Build a compact session snapshot (called before compaction or on demand)
 */
export async function sessionSnapshot(args: { projectPath?: string }): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const db = new SQLiteDatabase(getDbPath(projectPath));
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) return 'No Contxt project found.';

    const engine = new MemoryEngine(db);
    const activeSession = await engine.getActiveSession(project.id);
    if (!activeSession) return 'No active session. Start one with `contxt session start`.';

    const snapshot = await buildSnapshot(db, project, engine, activeSession);

    // Store snapshot
    await db.updateEntry(activeSession.id, {
      metadata: { ...activeSession.metadata, latestSnapshot: snapshot, snapshotAt: new Date().toISOString() },
    });

    return snapshot;
  } finally {
    await db.close();
  }
}

/**
 * Resume a session after compaction — loads the latest snapshot
 */
export async function sessionResume(args: { projectPath?: string }): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const db = new SQLiteDatabase(getDbPath(projectPath));
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) return 'No Contxt project found.';

    const engine = new MemoryEngine(db);

    // Try active session first
    let session = await engine.getActiveSession(project.id);

    // Fall back to most recent session
    if (!session) {
      const sessions = await engine.listSessions(project.id);
      session = sessions[0] || null;
    }

    if (session?.metadata?.latestSnapshot) {
      return session.metadata.latestSnapshot as string;
    }

    // No snapshot — fall back to fresh suggest
    const entries = await db.listEntries({ projectId: project.id, isArchived: false });
    const ranked = rankEntries(entries, { projectId: project.id });
    const fitted = fitToBudget(ranked, 2000);
    const ctx = buildContext(fitted, { includeStats: true });
    return `## Session Resume (no snapshot found — fresh context)\n\n${ctx}`;
  } finally {
    await db.close();
  }
}

// ==================
// Feature 3: Stats MCP tool
// ==================

/**
 * Get usage analytics and benchmarks
 */
export async function getStats(args: { projectPath?: string }): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const db = new SQLiteDatabase(getDbPath(projectPath));
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) return JSON.stringify({ error: 'No Contxt project found.' });

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const decisions = await db.countEntries({ projectId: project.id, type: 'decision', isArchived: false });
    const patterns = await db.countEntries({ projectId: project.id, type: 'pattern', isArchived: false });
    const documents = await db.countEntries({ projectId: project.id, type: 'document', isArchived: false });
    const total = decisions + patterns + documents;
    const activeBranch = await db.getActiveBranch(project.id);

    const metrics = db.getMetrics({ since: since30d });
    const suggestMetrics = metrics.filter((m) => m.metricType === 'suggest');
    const avgReturned = suggestMetrics.length > 0
      ? Math.round(suggestMetrics.reduce((s, m) => s + (m.data.returnedTokens || 0), 0) / suggestMetrics.length)
      : 0;
    const avgAvailable = suggestMetrics.length > 0
      ? Math.round(suggestMetrics.reduce((s, m) => s + (m.data.totalTokens || 0), 0) / suggestMetrics.length)
      : 0;
    const totalSaved = suggestMetrics.reduce((s, m) => s + ((m.data.totalTokens || 0) - (m.data.returnedTokens || 0)), 0);
    const avgReduction = avgAvailable > 0 ? Math.round((1 - avgReturned / avgAvailable) * 100) : 0;
    const costSaved = (totalSaved / 1_000_000 * 5).toFixed(2);

    const sessionMetrics = metrics.filter((m) => m.metricType === 'session');
    const totalSessions = sessionMetrics.length;
    const avgDuration = totalSessions > 0
      ? Math.round(sessionMetrics.reduce((s, m) => s + (m.data.durationMinutes || 0), 0) / totalSessions)
      : 0;
    const decisionsAutoCaptured = sessionMetrics.reduce((s, m) => s + (m.data.decisionsAutoCaptured || 0), 0);
    const patternsAutoCaptured = sessionMetrics.reduce((s, m) => s + (m.data.patternsAutoCaptured || 0), 0);

    const mostRetrieved = db.getMostRetrieved(project.id, 3);
    const stale = db.getStaleEntries(project.id, 30);

    return JSON.stringify({
      project: project.name,
      branch: activeBranch,
      period: 'last 30 days',
      memory: { decisions, patterns, documents, total },
      tokenEfficiency: {
        avgSuggestReturned: avgReturned,
        avgSuggestAvailable: avgAvailable,
        avgReduction: `${avgReduction}%`,
        estimatedTokensSaved: totalSaved,
        estimatedCostSaved: `~$${costSaved} (at $5/MTok)`,
      },
      sessions: {
        total: totalSessions,
        avgDurationMinutes: avgDuration,
        decisionsAutoCaptured,
        patternsAutoCaptured,
      },
      mostRetrieved: mostRetrieved.map((e) => ({ title: e.title, type: e.type, count: (e as any).retrieve_count || 0 })),
      stale: stale.length,
    });
  } finally {
    await db.close();
  }
}

// ==================
// Feature 4: Context Diff MCP tool
// ==================

/**
 * Show what changed in project context since the last session
 */
export async function getContextDiff(args: { projectPath?: string; since?: string }): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const db = new SQLiteDatabase(getDbPath(projectPath));
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) return JSON.stringify({ error: 'No Contxt project found.' });

    const since = args.since || db.getLastSessionEndedAt(project.id);
    if (!since) {
      return JSON.stringify({ message: 'No previous session found. All entries are considered new.' });
    }

    const changed = db.getEntriesCreatedOrUpdatedSince(project.id, since);
    const stale = db.getStaleEntries(project.id, 30);

    const newEntries = changed.filter((e) => e.createdAt > new Date(since));
    const updated = changed.filter((e) => e.createdAt <= new Date(since));

    return JSON.stringify({
      since,
      new: newEntries.map((e) => ({ id: e.id, type: e.type, title: e.title, createdAt: e.createdAt })),
      updated: updated.map((e) => ({ id: e.id, type: e.type, title: e.title, updatedAt: e.updatedAt })),
      stale: stale.map((e) => ({ id: e.id, type: e.type, title: e.title })),
      summary: `${newEntries.length} new, ${updated.length} updated, ${stale.length} stale`,
    });
  } finally {
    await db.close();
  }
}
