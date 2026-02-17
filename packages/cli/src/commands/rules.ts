/**
 * Rules command - Bidirectional sync with .contxt/rules.md
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { parseRulesFile, generateRulesFile } from '@mycontxt/core';
import { getProjectDb } from '../utils/project.js';
import type { MemoryEntry } from '@mycontxt/core';

interface RulesOptions {
  force?: boolean;
  dryRun?: boolean;
}

/**
 * Sync rules.md into memory store
 */
export async function syncCommand(options: RulesOptions = {}) {
  const spinner = ora('Reading rules.md...').start();

  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());

    if (!project) {
      spinner.fail('Not a Contxt project. Run `contxt init` first.');
      return;
    }

    const rulesPath = join(process.cwd(), '.contxt', 'rules.md');
    if (!existsSync(rulesPath)) {
      spinner.fail('No rules.md file found. Run `contxt rules generate` to create one.');
      return;
    }

    const content = readFileSync(rulesPath, 'utf-8');
    const parsed = parseRulesFile(content);

    spinner.text = 'Processing entries...';

    let added = 0;
    let updated = 0;
    let unchanged = 0;

    // Get existing entries
    const existingEntries = await db.listEntries({
      projectId: project.id,
      branch: await db.getActiveBranch(project.id),
    });

    const existingByTitle = new Map(
      existingEntries.map((e) => [e.title, e])
    );

    // Process decisions
    for (const decision of parsed.decisions) {
      const existing = existingByTitle.get(decision.title);

      if (!existing) {
        if (!options.dryRun) {
          await db.createEntry({
            projectId: project.id,
            type: 'decision',
            title: decision.title,
            content: decision.content,
            metadata: decision.metadata,
            status: 'active',
          });
        }
        added++;
      } else if (existing.content !== decision.content) {
        if (!options.dryRun) {
          await db.updateEntry(existing.id, {
            content: decision.content,
            metadata: decision.metadata,
          });
        }
        updated++;
      } else {
        unchanged++;
      }
    }

    // Process patterns
    for (const pattern of parsed.patterns) {
      const existing = existingByTitle.get(pattern.title);

      if (!existing) {
        if (!options.dryRun) {
          await db.createEntry({
            projectId: project.id,
            type: 'pattern',
            title: pattern.title,
            content: pattern.content,
            metadata: pattern.metadata,
            status: 'active',
          });
        }
        added++;
      } else if (existing.content !== pattern.content) {
        if (!options.dryRun) {
          await db.updateEntry(existing.id, {
            content: pattern.content,
            metadata: pattern.metadata,
          });
        }
        updated++;
      } else {
        unchanged++;
      }
    }

    // Process context
    if (parsed.context) {
      const existing = existingEntries.find((e) => e.type === 'context' && e.metadata.source === 'rules');

      if (!existing) {
        if (!options.dryRun) {
          await db.createEntry({
            projectId: project.id,
            type: 'context',
            title: parsed.context.title,
            content: parsed.context.content,
            metadata: parsed.context.metadata,
            status: 'active',
          });
        }
        added++;
      } else if (existing.content !== parsed.context.content) {
        if (!options.dryRun) {
          await db.updateEntry(existing.id, {
            content: parsed.context.content,
          });
        }
        updated++;
      } else {
        unchanged++;
      }
    }

    // Process documents
    for (const doc of parsed.documents) {
      const existing = existingByTitle.get(doc.title);

      if (!existing) {
        if (!options.dryRun) {
          await db.createEntry({
            projectId: project.id,
            type: 'document',
            title: doc.title,
            content: doc.content,
            metadata: doc.metadata,
            status: 'active',
          });
        }
        added++;
      } else if (existing.content !== doc.content) {
        if (!options.dryRun) {
          await db.updateEntry(existing.id, {
            content: doc.content,
            metadata: doc.metadata,
          });
        }
        updated++;
      } else {
        unchanged++;
      }
    }

    // Update stack in project config
    if (parsed.stack.length > 0 && !options.dryRun) {
      // Store stack in project metadata
      await db.updateProject(project.id, {
        stack: parsed.stack,
      });
    }

    spinner.succeed(
      options.dryRun
        ? `Dry run: Would add ${added}, update ${updated}, leave ${unchanged} unchanged`
        : `Synced rules.md: ${added} added, ${updated} updated, ${unchanged} unchanged`
    );

    await db.close();
  } catch (error) {
    spinner.fail('Sync failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Generate rules.md from memory store
 */
export async function generateCommand(options: RulesOptions = {}) {
  const spinner = ora('Loading memory entries...').start();

  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());

    if (!project) {
      spinner.fail('Not a Contxt project. Run `contxt init` first.');
      return;
    }

    const rulesPath = join(process.cwd(), '.contxt', 'rules.md');

    if (existsSync(rulesPath) && !options.force) {
      spinner.fail('rules.md already exists. Use --force to overwrite.');
      return;
    }

    const branch = await db.getActiveBranch(project.id);
    const allEntries = await db.listEntries({
      projectId: project.id,
      branch,
    });

    // Group entries by type
    const decisions = allEntries.filter((e) => e.type === 'decision' && e.status === 'active');
    const patterns = allEntries.filter((e) => e.type === 'pattern' && e.status === 'active');
    const context = allEntries.filter((e) => e.type === 'context' && e.status === 'active');
    const documents = allEntries.filter((e) => e.type === 'document' && e.status === 'active');

    spinner.text = 'Generating rules.md...';

    const rulesContent = generateRulesFile({
      stack: project.stack || [],
      decisions: decisions.map((d) => ({
        title: d.title,
        content: d.content,
        metadata: d.metadata,
      })),
      patterns: patterns.map((p) => ({
        title: p.title,
        content: p.content,
        metadata: p.metadata,
      })),
      context: context.map((c) => ({
        content: c.content,
      })),
      documents: documents.map((d) => ({
        title: d.title,
        content: d.content,
      })),
    });

    if (options.dryRun) {
      spinner.succeed('Generated rules.md (dry run):');
      console.log('');
      console.log(chalk.gray(rulesContent));
    } else {
      writeFileSync(rulesPath, rulesContent, 'utf-8');
      spinner.succeed(`Generated ${rulesPath}`);
    }

    await db.close();
  } catch (error) {
    spinner.fail('Generate failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Show diff between rules.md and memory store
 */
export async function diffCommand() {
  const spinner = ora('Comparing rules.md with memory...').start();

  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());

    if (!project) {
      spinner.fail('Not a Contxt project. Run `contxt init` first.');
      return;
    }

    const rulesPath = join(process.cwd(), '.contxt', 'rules.md');
    if (!existsSync(rulesPath)) {
      spinner.fail('No rules.md file found.');
      return;
    }

    // Parse rules.md
    const content = readFileSync(rulesPath, 'utf-8');
    const parsed = parseRulesFile(content);

    // Get memory entries
    const branch = await db.getActiveBranch(project.id);
    const allEntries = await db.listEntries({
      projectId: project.id,
      branch,
    });

    const existingByTitle = new Map<string, MemoryEntry>(
      allEntries.map((e) => [e.title, e])
    );

    spinner.stop();

    // Compare
    const toAdd: string[] = [];
    const toUpdate: string[] = [];
    const inSync: string[] = [];

    // Check decisions
    for (const decision of parsed.decisions) {
      const existing = existingByTitle.get(decision.title);
      if (!existing) {
        toAdd.push(`${chalk.blue('DECISION')} ${decision.title}`);
      } else if (existing.content !== decision.content) {
        toUpdate.push(`${chalk.blue('DECISION')} ${decision.title}`);
      } else {
        inSync.push(`${chalk.blue('DECISION')} ${decision.title}`);
      }
    }

    // Check patterns
    for (const pattern of parsed.patterns) {
      const existing = existingByTitle.get(pattern.title);
      if (!existing) {
        toAdd.push(`${chalk.magenta('PATTERN')} ${pattern.title}`);
      } else if (existing.content !== pattern.content) {
        toUpdate.push(`${chalk.magenta('PATTERN')} ${pattern.title}`);
      } else {
        inSync.push(`${chalk.magenta('PATTERN')} ${pattern.title}`);
      }
    }

    // Check documents
    for (const doc of parsed.documents) {
      const existing = existingByTitle.get(doc.title);
      if (!existing) {
        toAdd.push(`${chalk.cyan('DOCUMENT')} ${doc.title}`);
      } else if (existing.content !== doc.content) {
        toUpdate.push(`${chalk.cyan('DOCUMENT')} ${doc.title}`);
      } else {
        inSync.push(`${chalk.cyan('DOCUMENT')} ${doc.title}`);
      }
    }

    // Display results
    console.log('');
    if (toAdd.length > 0) {
      console.log(chalk.bold('TO ADD (in rules.md, not in memory):'));
      for (const item of toAdd) {
        console.log(`  ${chalk.green('+')} ${item}`);
      }
      console.log('');
    }

    if (toUpdate.length > 0) {
      console.log(chalk.bold('TO UPDATE (content differs):'));
      for (const item of toUpdate) {
        console.log(`  ${chalk.yellow('~')} ${item}`);
      }
      console.log('');
    }

    if (inSync.length > 0) {
      console.log(chalk.bold('IN SYNC:'));
      for (const item of inSync.slice(0, 5)) {
        console.log(`  ${chalk.gray('·')} ${chalk.gray(item)}`);
      }
      if (inSync.length > 5) {
        console.log(chalk.gray(`  ... and ${inSync.length - 5} more`));
      }
      console.log('');
    }

    if (toAdd.length > 0 || toUpdate.length > 0) {
      console.log(chalk.cyan(`Run ${chalk.bold('contxt rules sync')} to apply changes.`));
    } else {
      console.log(chalk.green('✓ Everything in sync!'));
    }

    await db.close();
  } catch (error) {
    spinner.fail('Diff failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

export const rulesCommand = {
  sync: syncCommand,
  generate: generateCommand,
  diff: diffCommand,
};
