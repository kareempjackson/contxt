/**
 * Diff command — Show context changes since last session (Feature 4)
 */

import chalk from 'chalk';
import { loadProject } from '../utils/project.js';
import { error } from '../utils/output.js';
import { formatDate } from '../utils/project.js';

interface DiffOptions {
  since?: string;
  days?: number;
  json?: boolean;
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    decision: chalk.blue('[decision]'),
    pattern: chalk.magenta('[pattern]'),
    context: chalk.cyan('[context]'),
    document: chalk.yellow('[document]'),
  };
  return labels[type] || chalk.dim(`[${type}]`);
}

export async function diffCommand(options: DiffOptions): Promise<void> {
  try {
    const { db, projectId } = await loadProject();
    const cwd = process.cwd();
    const project = await db.getProjectByPath(cwd);

    // Determine since timestamp
    let since = options.since;
    if (!since && options.days) {
      since = new Date(Date.now() - options.days * 24 * 60 * 60 * 1000).toISOString();
    }
    if (!since) {
      since = db.getLastSessionEndedAt(projectId) || undefined;
    }

    if (!since) {
      console.log(chalk.dim('No previous session found. All entries are considered current.'));
      await db.close();
      return;
    }

    const sinceDate = new Date(since);
    const changed = db.getEntriesCreatedOrUpdatedSince(projectId, since);
    const stale = db.getStaleEntries(projectId, 30);

    const newEntries = changed.filter((e) => e.createdAt > sinceDate);
    const updated = changed.filter((e) => e.createdAt <= sinceDate && e.updatedAt > sinceDate);

    await db.close();

    if (options.json) {
      console.log(JSON.stringify({
        project: project?.name,
        since,
        new: newEntries.map((e) => ({ id: e.id, type: e.type, title: e.title, source: e.metadata?.source, createdAt: e.createdAt })),
        updated: updated.map((e) => ({ id: e.id, type: e.type, title: e.title, version: e.version, updatedAt: e.updatedAt })),
        stale: stale.map((e) => ({ id: e.id, type: e.type, title: e.title, lastRetrievedAt: e.metadata?.lastRetrievedAt })),
        summary: `${newEntries.length} new, ${updated.length} updated, ${stale.length} stale`,
      }, null, 2));
      return;
    }

    // Compute how long ago
    const diffMs = Date.now() - sinceDate.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const sinceLabel = diffDays > 0 ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ago` : `${diffHours}h ago`;

    console.log();
    console.log(chalk.bold(`Context changes since your last session (${sinceLabel})`));
    console.log();

    let hasAny = false;

    if (newEntries.length > 0) {
      hasAny = true;
      console.log(chalk.bold.green('  NEW'));
      for (const e of newEntries) {
        const src = e.metadata?.source ? chalk.dim(` (${e.metadata.source}, ${formatDate(e.createdAt)})`) : '';
        console.log(`    ${chalk.green('+')} ${typeLabel(e.type)}  ${e.title}${src}`);
      }
      console.log();
    }

    if (updated.length > 0) {
      hasAny = true;
      console.log(chalk.bold.yellow('  UPDATED'));
      for (const e of updated) {
        const versionLabel = e.version > 1 ? chalk.dim(` (v${e.version - 1} → v${e.version}, ${formatDate(e.updatedAt)})`) : chalk.dim(` (${formatDate(e.updatedAt)})`);
        console.log(`    ${chalk.yellow('~')} ${typeLabel(e.type)}  ${e.title}${versionLabel}`);
      }
      console.log();
    }

    if (stale.length > 0) {
      hasAny = true;
      console.log(chalk.bold.dim('  STALE (not retrieved in 30+ days)'));
      for (const e of stale.slice(0, 5)) {
        const lastSeen = (e as any).last_retrieved_at ? chalk.dim(` (last seen: ${formatDate(new Date((e as any).last_retrieved_at))})`) : '';
        console.log(`    ${chalk.dim('?')} ${typeLabel(e.type)}  ${chalk.dim(e.title)}${lastSeen}`);
      }
      if (stale.length > 5) console.log(chalk.dim(`    ... and ${stale.length - 5} more`));
      console.log();
    }

    if (!hasAny) {
      console.log(chalk.dim('  No changes since last session.'));
      console.log();
      return;
    }

    const parts: string[] = [];
    if (newEntries.length > 0) parts.push(chalk.green(`${newEntries.length} new`));
    if (updated.length > 0) parts.push(chalk.yellow(`${updated.length} updated`));
    if (stale.length > 0) parts.push(chalk.dim(`${stale.length} stale`));
    console.log(`  ${parts.join(', ')}`);
    console.log();

  } catch (err) {
    error(`Diff failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
