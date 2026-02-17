/**
 * Scan command - Extract tagged comments from code
 */

import { readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseFile, scanCommentToEntry, type ScanComment } from '@contxt/core';
import { getProjectDb } from '../utils/project.js';
import { glob } from 'glob';

interface ScanOptions {
  path?: string;
  dryRun?: boolean;
  autoConfirm?: boolean;
  watch?: boolean;
}

export async function scanCommand(options: ScanOptions = {}) {
  const spinner = ora('Scanning project...').start();

  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());

    if (!project) {
      spinner.fail('Not a Contxt project. Run `contxt init` first.');
      return;
    }

    // File patterns to scan
    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.py',
      '**/*.rb',
      '**/*.go',
      '**/*.rs',
      '**/*.sql',
      '**/*.sh',
    ];

    // Ignore patterns
    const ignore = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/*.min.js',
      '**/*.lock',
      '.contxt/**',
    ];

    // Add .contxtignore patterns if file exists
    const contxtIgnorePath = join(process.cwd(), '.contxtignore');
    if (existsSync(contxtIgnorePath)) {
      const contxtIgnore = readFileSync(contxtIgnorePath, 'utf-8')
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'));
      ignore.push(...contxtIgnore);
    }

    // Get files to scan
    const searchPath = options.path || process.cwd();
    const files = await glob(patterns, {
      cwd: searchPath,
      ignore,
      absolute: true,
      nodir: true,
    });

    spinner.text = `Scanning ${files.length} files...`;

    // Parse all files
    const allComments: ScanComment[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const comments = parseFile(content, relative(process.cwd(), file));
      allComments.push(...comments);
    }

    spinner.succeed(`Found ${allComments.length} tagged comments across ${files.length} files`);

    if (allComments.length === 0) {
      console.log(chalk.gray('\nNo tagged comments found. Try adding @decision, @pattern, or @context tags to your code.'));
      return;
    }

    // Load existing scanned entries to detect changes
    const existingEntries = await db.listEntries({
      projectId: project.id,
      branch: await db.getActiveBranch(project.id),
    });

    const existingHashes = new Map(
      existingEntries
        .filter((e) => e.metadata.source === 'scan' && e.metadata.hash)
        .map((e) => [e.metadata.hash, e])
    );

    // Categorize comments
    const newComments: ScanComment[] = [];
    const updatedComments: ScanComment[] = [];
    const unchangedComments: ScanComment[] = [];

    for (const comment of allComments) {
      const existing = existingHashes.get(comment.hash);
      if (!existing) {
        newComments.push(comment);
      } else {
        // Check if content actually changed
        const entry = scanCommentToEntry(comment, project.id);
        if (
          existing.title !== entry.title ||
          existing.content !== entry.content
        ) {
          updatedComments.push(comment);
        } else {
          unchangedComments.push(comment);
        }
        existingHashes.delete(comment.hash); // Mark as still present
      }
    }

    // Remaining hashes are stale (source removed)
    const staleEntries = Array.from(existingHashes.values());

    // Display results
    console.log('');
    if (newComments.length > 0) {
      console.log(chalk.bold('NEW'));
      for (const comment of newComments) {
        const icon = getTypeIcon(comment.tag);
        console.log(
          `  ${chalk.green('+')} ${icon} ${chalk.bold(comment.title.substring(0, 50))}  ${chalk.gray(comment.file + ':' + comment.line)}`
        );
      }
      console.log('');
    }

    if (updatedComments.length > 0) {
      console.log(chalk.bold('UPDATED'));
      for (const comment of updatedComments) {
        const icon = getTypeIcon(comment.tag);
        console.log(
          `  ${chalk.yellow('~')} ${icon} ${chalk.bold(comment.title.substring(0, 50))}  ${chalk.gray(comment.file + ':' + comment.line)}`
        );
      }
      console.log('');
    }

    if (unchangedComments.length > 0) {
      console.log(chalk.bold('UNCHANGED'));
      for (const comment of unchangedComments.slice(0, 3)) {
        const icon = getTypeIcon(comment.tag);
        console.log(
          `  ${chalk.gray('·')} ${icon} ${chalk.gray(comment.title.substring(0, 50))}  ${chalk.gray(comment.file + ':' + comment.line)}`
        );
      }
      if (unchangedComments.length > 3) {
        console.log(chalk.gray(`  ... and ${unchangedComments.length - 3} more`));
      }
      console.log('');
    }

    if (staleEntries.length > 0) {
      console.log(chalk.bold('STALE (source comment removed)'));
      for (const entry of staleEntries) {
        const icon = getTypeIcon(entry.type);
        console.log(
          `  ${chalk.red('?')} ${icon} ${chalk.gray(entry.title.substring(0, 50))}  ${chalk.gray('was: ' + entry.metadata.file + ':' + entry.metadata.line)}`
        );
      }
      console.log('');
    }

    // Handle dry run
    if (options.dryRun) {
      console.log(chalk.yellow('Dry run - no changes saved.'));
      return;
    }

    // Save new and updated entries as drafts
    const toSave = [...newComments, ...updatedComments];
    if (toSave.length > 0) {
      const saveSpinner = ora('Saving entries...').start();

      for (const comment of toSave) {
        const entry = scanCommentToEntry(comment, project.id);
        const existing = existingHashes.get(comment.hash);

        if (existing) {
          // Update existing
          await db.updateEntry(existing.id, {
            title: entry.title,
            content: entry.content,
            metadata: entry.metadata,
          });
        } else {
          // Create new as draft
          await db.createEntry({
            projectId: project.id,
            type: entry.type,
            title: entry.title,
            content: entry.content,
            metadata: entry.metadata,
            status: options.autoConfirm ? 'active' : 'draft',
          });
        }
      }

      saveSpinner.succeed(
        options.autoConfirm
          ? `Saved ${toSave.length} entries.`
          : `${toSave.length} new entries saved as drafts.`
      );
    }

    // Mark stale entries
    if (staleEntries.length > 0) {
      for (const entry of staleEntries) {
        await db.updateEntry(entry.id, { status: 'stale' });
      }
      console.log(chalk.gray(`Marked ${staleEntries.length} entries as stale.`));
    }

    // Show next steps
    if (!options.autoConfirm && toSave.length > 0) {
      console.log('');
      console.log(chalk.cyan(`Run ${chalk.bold('contxt review')} to confirm drafts.`));
    }

    await db.close();
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    decision: chalk.blue('DECISION'),
    pattern: chalk.magenta('PATTERN'),
    context: chalk.green('CONTEXT'),
  };
  return icons[type] || type.toUpperCase();
}
