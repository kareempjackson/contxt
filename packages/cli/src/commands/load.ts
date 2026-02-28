/**
 * Load Command - Generate context payload for AI prompts
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { buildContextPayload, buildContextSummary } from '@mycontxt/core';
import { getDbPath } from '../utils/project.js';
import { getSupabaseConfig } from '../config.js';
import { error as outputError, section } from '../utils/output.js';
import chalk from 'chalk';

const MODEL_COSTS_PER_1K: Record<string, number> = {
  'claude-sonnet': 0.003,
  'claude-haiku':  0.00025,
  'claude-opus':   0.015,
  'gpt-4o':        0.0025,
  'gpt-4':         0.03,
  'gpt-3.5':       0.0005,
};
const DEFAULT_MODEL = 'claude-sonnet';

function formatCost(tokens: number, model: string): string {
  const costPerK = MODEL_COSTS_PER_1K[model] ?? MODEL_COSTS_PER_1K[DEFAULT_MODEL];
  const cost = (tokens / 1000) * costPerK;
  return `$${cost.toFixed(4)}`;
}

async function generateQueryEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

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
        outputError('No Contxt project found. Run `contxt init` first.');
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

        console.log(section('Context Summary'));
        console.log('');
        console.log(`Total entries: ${summary.totalEntries}`);
        console.log(`Branch: ${branch}`);
        console.log('');

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

      const totalEntryCount = entries.length;

      // In task mode, try semantic search via remote DB before falling back to keyword scoring
      let resolvedEntries = entries;
      if (mode === 'task' && options.task) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
          try {
            const config = getSupabaseConfig();
            const remoteDb = new SupabaseDatabase(config);
            const embedding = await generateQueryEmbedding(options.task, apiKey);
            if (embedding) {
              const semanticResults = await remoteDb.semanticSearch(project.id, embedding, {
                branch,
                limit: 20,
                minSimilarity: 0.65,
              }).catch(() => []);
              if (semanticResults.length > 0) {
                resolvedEntries = semanticResults;
              }
            }
          } catch {
            // No remote config — use local keyword scoring
          }
        }
      }

      // Build context
      const result = buildContextPayload(resolvedEntries, {
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
      const model = process.env.CONTXT_MODEL ?? DEFAULT_MODEL;
      const totalFiltered = totalEntryCount - result.entriesIncluded;

      if (totalFiltered > 0 && result.tokensSaved > 0) {
        const filteredCost = formatCost(result.tokensUsed, model);
        const fullCost = formatCost(result.tokensUsed + result.tokensSaved, model);
        console.error(
          chalk.dim(
            `\n→ ${result.entriesIncluded} entries loaded · ${result.tokensUsed} tokens · ` +
            `saved ${result.tokensSaved.toLocaleString()} tokens (${totalFiltered} filtered) · ` +
            `~${filteredCost} vs ${fullCost} full load`
          )
        );
      } else {
        console.error(
          chalk.dim(`\n→ ${result.entriesIncluded} entries loaded · ${result.tokensUsed}/${result.budget} tokens`)
        );
      }
    } finally {
      await db.close();
    }
  } catch (err) {
    outputError(`Load failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
