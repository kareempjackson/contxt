/**
 * Context Builder Engine
 * Intelligently assembles project context for AI agents
 */

import type { MemoryEntry, SuggestOptions, RankedEntry } from '../types.js';
import { rankEntries } from './relevance.js';
import { countTokens, countEntryTokens, fitToBudget, buildContext } from '../utils/tokens.js';

export interface ContextMode {
  type: 'task' | 'files' | 'all';
  taskDescription?: string;
  activeFiles?: string[];
  includeTypes?: string[];
}

export interface ContextBuilderOptions extends ContextMode {
  projectId: string;
  maxTokens?: number;
  minRelevance?: number;
}

export interface ContextResult {
  context: string;
  entriesIncluded: number;
  entriesFiltered: number;
  tokensUsed: number;
  tokensSaved: number;
  budget: number;
}

/**
 * Convert MemoryEntry[] to RankedEntry[] with default scores
 */
function toRankedEntries(entries: MemoryEntry[]): RankedEntry[] {
  return entries.map((entry) => ({
    entry,
    score: 1.0,
    reasons: [],
  }));
}

/**
 * Build intelligent context payload for AI agents
 */
export function buildContextPayload(
  entries: MemoryEntry[],
  options: ContextBuilderOptions
): ContextResult {
  const budget = options.maxTokens || 4000;
  let rankedEntries: RankedEntry[] = [];

  if (options.type === 'task' && options.taskDescription) {
    // Task-based context: rank by relevance
    const suggestOpts: SuggestOptions = {
      projectId: options.projectId,
      taskDescription: options.taskDescription,
      activeFiles: options.activeFiles,
      maxTokens: budget,
    };

    rankedEntries = rankEntries(entries, suggestOpts);
  } else if (options.type === 'files' && options.activeFiles && options.activeFiles.length > 0) {
    // File-based context: filter by file mentions
    const filtered = entries.filter((entry) =>
      options.activeFiles!.some(
        (file) =>
          entry.content.includes(file) || entry.metadata?.files?.includes(file)
      )
    );

    // Sort by recency
    filtered.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    rankedEntries = toRankedEntries(filtered);
  } else {
    // All context: include everything, sorted by recency
    const sorted = [...entries];
    sorted.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );

    rankedEntries = toRankedEntries(sorted);
  }

  // Filter by type if specified
  if (options.includeTypes && options.includeTypes.length > 0) {
    rankedEntries = rankedEntries.filter((ranked) =>
      options.includeTypes!.includes(ranked.entry.type)
    );
  }

  // Compute total tokens of all candidate entries (before budget fitting)
  const totalEntryTokens = rankedEntries.reduce(
    (sum, ranked) => sum + countEntryTokens(ranked.entry),
    0
  );

  // Fit to token budget
  const fitted = fitToBudget(rankedEntries, budget);

  // Build formatted context
  const context = buildContext(fitted);
  const tokensUsed = countTokens(context);

  return {
    context,
    entriesIncluded: fitted.length,
    entriesFiltered: rankedEntries.length - fitted.length,
    tokensUsed,
    tokensSaved: Math.max(0, totalEntryTokens - tokensUsed),
    budget,
  };
}

/**
 * Build a summary of what context is available
 */
export function buildContextSummary(entries: MemoryEntry[]): {
  totalEntries: number;
  byType: Record<string, number>;
  recentActivity: string[];
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  const byType: Record<string, number> = {};
  const recentActivity: string[] = [];

  let oldest: Date | null = null;
  let newest: Date | null = null;

  for (const entry of entries) {
    // Count by type
    byType[entry.type] = (byType[entry.type] || 0) + 1;

    // Track date range
    if (!oldest || entry.createdAt < oldest) {
      oldest = entry.createdAt;
    }
    if (!newest || entry.updatedAt > newest) {
      newest = entry.updatedAt;
    }
  }

  // Get recent activity (last 5 entries)
  const recent = [...entries]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  for (const entry of recent) {
    const age = Date.now() - entry.updatedAt.getTime();
    const daysAgo = Math.floor(age / (1000 * 60 * 60 * 24));

    let timeStr = '';
    if (daysAgo === 0) {
      timeStr = 'today';
    } else if (daysAgo === 1) {
      timeStr = 'yesterday';
    } else if (daysAgo < 7) {
      timeStr = `${daysAgo} days ago`;
    } else {
      timeStr = `${Math.floor(daysAgo / 7)} weeks ago`;
    }

    recentActivity.push(`${entry.type}: ${entry.title} (${timeStr})`);
  }

  return {
    totalEntries: entries.length,
    byType,
    recentActivity,
    oldestEntry: oldest,
    newestEntry: newest,
  };
}
