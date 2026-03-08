/**
 * Scan command - Extract tagged comments from code
 */

import { readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseFile, scanCommentToEntry, inferFromMarkdown, type ScanComment } from '@mycontxt/core';
import type { InferredEntry } from '@mycontxt/core';
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
      '**/*.md',
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

    // Parse all files — code files use tag scanning, .md files use AI inference
    const allComments: ScanComment[] = [];
    const allInferred: InferredEntry[] = [];

    for (const file of files) {
      const relPath = relative(process.cwd(), file);
      const content = readFileSync(file, 'utf-8');

      if (relPath.endsWith('.md')) {
        // Skip rules.md — managed separately
        if (relPath === '.contxt/rules.md') continue;
        const inferred = await inferFromMarkdown(content, relPath);
        allInferred.push(...inferred);
      } else {
        const comments = parseFile(content, relPath);
        allComments.push(...comments);
      }
    }

    const totalFound = allComments.length + allInferred.length;
    spinner.succeed(`Found ${allComments.length} tagged comments + ${allInferred.length} inferred from markdown across ${files.length} files`);

    if (totalFound === 0) {
      console.log(chalk.gray('\nNo decisions or patterns found. Add @decision/@pattern tags to code, or ensure OPENAI_API_KEY is set for markdown inference.'));
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

    // Save new and updated code-scanned entries as drafts
    const toSave = [...newComments, ...updatedComments];
    if (toSave.length > 0) {
      const saveSpinner = ora('Saving entries...').start();

      for (const comment of toSave) {
        const entry = scanCommentToEntry(comment, project.id);
        const existing = existingHashes.get(comment.hash);

        if (existing) {
          await db.updateEntry(existing.id, {
            title: entry.title,
            content: entry.content,
            metadata: entry.metadata,
          });
        } else {
          await db.createEntry({
            projectId: project.id,
            type: entry.type,
            title: entry.title,
            content: entry.content,
            metadata: entry.metadata,
            status: 'active',
          });
        }
      }

      saveSpinner.succeed(`Saved ${toSave.length} entries.`);
    }

    // Save new inferred entries from markdown
    const newInferred = allInferred.filter((e) => !existingHashes.has(e.hash));
    if (newInferred.length > 0) {
      const inferSpinner = ora('Saving inferred markdown entries...').start();
      for (const entry of newInferred) {
        await db.createEntry({
          projectId: project.id,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          metadata: { source: 'md:inferred', file: entry.file, hash: entry.hash },
          status: options.autoConfirm ? 'active' : 'draft',
        });
      }
      inferSpinner.succeed(
        options.autoConfirm
          ? `Saved ${newInferred.length} inferred entries.`
          : `${newInferred.length} inferred entries saved as drafts.`
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
