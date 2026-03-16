/**
 * Suggest Context Tool - Smart context retrieval
 * This is the killer feature of Contxt
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { rankEntries, fitToBudget, buildContext, countEntryTokens } from '@mycontxt/core';
import type { SuggestOptions } from '@mycontxt/core';
import { getDbPath } from '../utils/project.js';

interface SuggestContextArgs {
  taskDescription?: string;
  activeFiles?: string[];
  maxTokens?: number;
  minRelevance?: number;
  projectPath?: string;
}

export async function suggestContext(args: SuggestContextArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    // Get project
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No Contxt project found. Run `contxt init` to initialize.';
    }

    // Get active branch
    const activeBranch = await db.getActiveBranch(project.id);

    // Get all non-archived entries
    const entries = await db.listEntries({
      projectId: project.id,
      branch: activeBranch,
      isArchived: false,
    });

    if (entries.length === 0) {
      return 'No memory entries found. Add some decisions, patterns, or context to get started.';
    }

    // Build suggest options
    const options: SuggestOptions = {
      projectId: project.id,
      taskDescription: args.taskDescription,
      activeFiles: args.activeFiles,
      maxTokens: args.maxTokens || 4000,
      minRelevance: args.minRelevance || 0.3,
    };

    // Rank entries by relevance
    const ranked = rankEntries(entries, options);

    if (ranked.length === 0) {
      return 'No relevant entries found for the given task.';
    }

    // Fit within token budget
    const fitted = fitToBudget(ranked, options.maxTokens!);

    // Record retrieval counts for analytics
    try {
      db.recordRetrievals(fitted.map((r) => r.entry.id));
    } catch {
      // Non-critical — don't block response
    }

    // Record metrics for contxt stats
    try {
      const totalTokens = ranked.reduce((s, r) => s + countEntryTokens(r.entry), 0);
      const returnedTokens = fitted.reduce((s, r) => s + countEntryTokens(r.entry), 0);
      db.insertMetric('suggest', {
        totalEntries: ranked.length,
        returnedEntries: fitted.length,
        totalTokens,
        returnedTokens,
        tokenSavingsPct: totalTokens > 0 ? Math.round((1 - returnedTokens / totalTokens) * 100) : 0,
      });
    } catch {
      // Non-critical
    }

    // Build formatted context
    const context = buildContext(fitted, {
      includeReasons: true,
      includeStats: true,
    });

    // Append footer if budget was applied and entries were trimmed
    if (args.maxTokens !== undefined && fitted.length < ranked.length) {
      const totalTokens = ranked.reduce((s, r) => s + countEntryTokens(r.entry), 0);
      const returnedTokens = fitted.reduce((s, r) => s + countEntryTokens(r.entry), 0);
      return context + `\n--- Returned ${fitted.length} of ${ranked.length} matching entries (~${returnedTokens} tokens). Increase max_tokens or narrow query for more.`;
    }

    return context;
  } finally {
    await db.close();
  }
}
