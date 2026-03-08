/**
 * Top-level list and delete commands
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { loadProject } from '../utils/project.js';
import { success, error } from '../utils/output.js';
import type { MemoryEntryType } from '@mycontxt/core';

const TYPE_ICONS: Record<string, string> = {
  decision: '◆',
  pattern:  '◈',
  context:  '◉',
  doc:      '◎',
  session:  '◷',
};

const TITLE_MAX = 60;

function truncateTitle(s: string, full: boolean): string {
  if (full || s.length <= TITLE_MAX) return s;
  const cut = s.lastIndexOf(' ', TITLE_MAX);
  return (cut > 20 ? s.substring(0, cut) : s.substring(0, TITLE_MAX)) + '...';
}

interface ListOptions {
  type?: string;
  branch?: string;
  full?: boolean;
}

interface DeleteOptions {
  force?: boolean;
}

export async function listCommand(options: ListOptions = {}): Promise<void> {
  try {
    const { db, projectId } = await loadProject();

    const branch = options.branch || (await db.getActiveBranch(projectId));

    const query: any = { projectId, branch, isArchived: false };
    if (options.type) query.type = options.type as MemoryEntryType;

    const entries = await db.listEntries(query);

    if (entries.length === 0) {
      console.log(chalk.dim(options.type ? `No ${options.type} entries found.` : 'No entries found.'));
      await db.close();
      return;
    }

    // Group by type
    const grouped = entries.reduce<Record<string, typeof entries>>((acc, e) => {
      (acc[e.type] = acc[e.type] || []).push(e);
      return acc;
    }, {});

    for (const [type, items] of Object.entries(grouped)) {
      const icon = TYPE_ICONS[type] || '·';
      console.log('');
      console.log(chalk.bold(`${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}s`) + chalk.dim(` (${items.length})`));

      for (const entry of items) {
        const shortId = chalk.dim(entry.id.substring(0, 8));
        const title = truncateTitle(entry.title, options.full ?? false);
        console.log(`  ${shortId}  ${title}`);
      }
    }

    console.log('');
    console.log(chalk.dim(`${entries.length} total entries  •  branch: ${branch}`));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

export async function deleteCommand(id: string, options: DeleteOptions = {}): Promise<void> {
  try {
    const { db } = await loadProject();

    const entry = await db.getEntry(id);
    if (!entry) {
      error(`Entry not found: ${id}`);
      await db.close();
      process.exit(1);
    }

    if (!options.force) {
      const { confirmed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmed',
        message: `Delete "${entry.title}"?`,
        default: false,
      }]);
      if (!confirmed) {
        console.log(chalk.dim('Cancelled.'));
        await db.close();
        return;
      }
    }

    await db.deleteEntry(entry.id);
    success(`Deleted: ${entry.title}`);

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}
