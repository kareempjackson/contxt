/**
 * Review command - Interactive draft review queue
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { getProjectDb } from '../utils/project.js';
import type { MemoryEntry } from '@mycontxt/core';

interface ReviewOptions {
  source?: string;
  confirmAll?: boolean;
  discardAll?: boolean;
  count?: boolean;
}

export async function reviewCommand(options: ReviewOptions = {}) {
  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());

    if (!project) {
      console.log(chalk.red('Not a Contxt project. Run `contxt init` first.'));
      return;
    }

    // Get all draft entries
    let drafts = await db.listEntries({
      projectId: project.id,
      branch: await db.getActiveBranch(project.id),
    });

    drafts = drafts.filter((e) => e.status === 'draft');

    // Filter by source if specified
    if (options.source) {
      drafts = drafts.filter((e) => {
        const source = e.metadata.source || '';
        return source.includes(options.source!);
      });
    }

    if (drafts.length === 0) {
      console.log(chalk.green('✓ No drafts pending review'));
      return;
    }

    // Show count only
    if (options.count) {
      console.log(`${drafts.length} drafts pending review`);
      return;
    }

    console.log(chalk.bold(`\n${drafts.length} drafts pending review\n`));

    // Confirm all
    if (options.confirmAll) {
      const spinner = ora('Confirming all drafts...').start();
      for (const draft of drafts) {
        await db.updateEntry(draft.id, { status: 'active' });
      }
      spinner.succeed(`Confirmed ${drafts.length} drafts`);
      await db.close();
      return;
    }

    // Discard all
    if (options.discardAll) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Discard all ${drafts.length} drafts?`,
          default: false,
        },
      ]);

      if (confirm) {
        const spinner = ora('Discarding all drafts...').start();
        for (const draft of drafts) {
          await db.deleteEntry(draft.id);
        }
        spinner.succeed(`Discarded ${drafts.length} drafts`);
      }
      await db.close();
      return;
    }

    // Interactive review
    let confirmed = 0;
    let discarded = 0;
    let skipped = 0;

    for (const draft of drafts) {
      console.log(chalk.gray('─'.repeat(50)));
      console.log('');
      displayDraft(draft);
      console.log('');

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Action?',
          choices: [
            { name: 'Confirm', value: 'confirm' },
            { name: 'Edit then confirm', value: 'edit' },
            { name: 'Discard', value: 'discard' },
            { name: 'Skip (review later)', value: 'skip' },
          ],
        },
      ]);

      if (action === 'confirm') {
        await db.updateEntry(draft.id, { status: 'active' });
        console.log(chalk.green('✓ Confirmed'));
        confirmed++;
      } else if (action === 'edit') {
        const edited = await editDraft(draft);
        await db.updateEntry(draft.id, {
          title: edited.title,
          content: edited.content,
          metadata: edited.metadata,
          status: 'active',
        });
        console.log(chalk.green('✓ Edited and confirmed'));
        confirmed++;
      } else if (action === 'discard') {
        await db.deleteEntry(draft.id);
        console.log(chalk.red('✗ Discarded'));
        discarded++;
      } else {
        console.log(chalk.gray('○ Skipped'));
        skipped++;
      }

      console.log('');
    }

    console.log(chalk.gray('─'.repeat(50)));
    console.log('');
    console.log(chalk.bold('Review complete'));
    console.log(`  ${chalk.green(confirmed)} confirmed`);
    console.log(`  ${chalk.red(discarded)} discarded`);
    console.log(`  ${chalk.gray(skipped)} skipped`);
    console.log('');

    await db.close();
  } catch (error) {
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

function displayDraft(draft: MemoryEntry) {
  const icon = getTypeIcon(draft.type);
  const source = draft.metadata.source || 'unknown';
  const file = draft.metadata.file ? ` · ${draft.metadata.file}:${draft.metadata.line}` : '';
  const timeAgo = getTimeAgo(draft.createdAt);

  console.log(`  ${icon}  ${chalk.bold(draft.title)}`);
  console.log(`  ${chalk.gray(`Source: ${source}${file} · ${timeAgo}`)}`);

  // Show content preview
  const contentPreview = draft.content.split('\n')[0].substring(0, 80);
  if (contentPreview) {
    console.log(`  ${chalk.gray(contentPreview)}${draft.content.length > 80 ? '...' : ''}`);
  }

  // Show additional metadata
  if (draft.type === 'decision') {
    if (draft.metadata.rationale) {
      console.log(`  ${chalk.dim('Rationale:')} ${draft.metadata.rationale.substring(0, 60)}...`);
    }
    if (draft.metadata.alternatives) {
      console.log(`  ${chalk.dim('Alternatives:')} ${draft.metadata.alternatives}`);
    }
  }

  if (draft.type === 'pattern') {
    if (draft.metadata.when) {
      console.log(`  ${chalk.dim('When:')} ${draft.metadata.when}`);
    }
  }
}

async function editDraft(draft: MemoryEntry): Promise<Partial<MemoryEntry>> {
  console.log(chalk.cyan('\nEdit mode (press Enter to keep current value):\n'));

  const { title, content } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Title:',
      default: draft.title,
    },
    {
      type: 'input',
      name: 'content',
      message: 'Content:',
      default: draft.content,
    },
  ]);

  return {
    title: title || draft.title,
    content: content || draft.content,
    metadata: draft.metadata,
  };
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    decision: chalk.blue('DECISION'),
    pattern: chalk.magenta('PATTERN'),
    context: chalk.green('CONTEXT'),
    document: chalk.yellow('DOCUMENT'),
    session: chalk.cyan('SESSION'),
  };
  return icons[type] || type.toUpperCase();
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
