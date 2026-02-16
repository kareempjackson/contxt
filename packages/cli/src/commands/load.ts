/**
 * Load Command - Generate context payload for AI prompts
 */

import { SQLiteDatabase } from '@memocore/adapters/sqlite';
import { buildContextPayload, buildContextSummary } from '@memocore/core';
import { getDbPath } from '../utils/project.js';

interface LoadOptions {
  task?: string;
  files?: string[];
  all?: boolean;
  maxTokens?: number;
  type?: string;
  summary?: boolean;
}

export async function loadCommand(options: LoadOptions) {
  try {
    const dbPath = getDbPath();
    const db = new SQLiteDatabase(dbPath);
    await db.initialize();

    try {
      const cwd = process.cwd();
      const project = await db.getProjectByPath(cwd);

      if (!project) {
        console.error('❌ No MemoCore project found. Run `memocore init` first.');
        process.exit(1);
      }

      // Get active branch
      const branch = await db.getActiveBranch(project.id);

      // Fetch all non-archived entries for current branch
      const entries = await db.listEntries({
        projectId: project.id,
        branch,
        isArchived: false,
      });

      if (entries.length === 0) {
        console.log('No memory entries found. Add some context first!');
        process.exit(0);
      }

      // Summary mode
      if (options.summary) {
        const summary = buildContextSummary(entries);

        console.log(`📊 Context Summary\n`);
        console.log(`Total entries: ${summary.totalEntries}`);
        console.log(`Branch: ${branch}\n`);

        console.log('By type:');
        for (const [type, count] of Object.entries(summary.byType)) {
          console.log(`  ${type}: ${count}`);
        }

        if (summary.recentActivity.length > 0) {
          console.log(`\nRecent activity:`);
          summary.recentActivity.forEach((activity) => {
            console.log(`  • ${activity}`);
          });
        }

        if (summary.oldestEntry && summary.newestEntry) {
          console.log(
            `\nDate range: ${summary.oldestEntry.toLocaleDateString()} - ${summary.newestEntry.toLocaleDateString()}`
          );
        }

        process.exit(0);
      }

      // Determine context mode
      let mode: 'task' | 'files' | 'all' = 'all';
      if (options.task) {
        mode = 'task';
      } else if (options.files && options.files.length > 0) {
        mode = 'files';
      } else if (options.all) {
        mode = 'all';
      }

      // Build context
      const result = buildContextPayload(entries, {
        projectId: project.id,
        type: mode,
        taskDescription: options.task,
        activeFiles: options.files,
        maxTokens: options.maxTokens || 4000,
        includeTypes: options.type ? [options.type] : undefined,
      });

      // Output context
      console.log(result.context);

      // Print stats to stderr so they don't pollute the context
      console.error(
        `\n📦 Context: ${result.entriesIncluded} entries, ${result.tokensUsed}/${result.budget} tokens`
      );
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error(
      '❌ Load failed:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}
