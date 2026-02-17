/**
 * Suggest Context Tool - Smart context retrieval
 * This is the killer feature of MemoCore
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { rankEntries, fitToBudget, buildContext } from '@mycontxt/core';
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
      return 'No MemoCore project found. Run `memocore init` to initialize.';
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
    const fitted = fitToBudget(ranked, options.maxTokens);

    // Build formatted context
    const context = buildContext(fitted, {
      includeReasons: true,
      includeStats: true,
    });

    return context;
  } finally {
    await db.close();
  }
}
