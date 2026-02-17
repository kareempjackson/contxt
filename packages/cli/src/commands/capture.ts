/**
 * Capture command - Extract context from existing project files
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { getProjectDb } from '../utils/project.js';
import type { MemoryEntryType, CreateEntryInput } from '@contxt/core';

interface CaptureOptions {
  source?: 'readme' | 'cursor' | 'claude' | 'adr' | 'commits' | 'package' | 'all';
  dryRun?: boolean;
  autoConfirm?: boolean;
  limit?: number;
}

interface CapturedEntry {
  type: MemoryEntryType;
  title: string;
  content: string;
  metadata: Record<string, any>;
  source: string;
}

export async function captureCommand(options: CaptureOptions = {}) {
  const spinner = ora('Scanning project files...').start();

  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());

    if (!project) {
      spinner.fail('Not a Contxt project. Run `contxt init` first.');
      return;
    }

    const entries: CapturedEntry[] = [];

    // Determine which sources to import
    const sources = options.source === 'all' || !options.source
      ? ['readme', 'cursor', 'claude', 'adr', 'commits', 'package']
      : [options.source];

    // Import from each source
    for (const source of sources) {
      spinner.text = `Importing from ${source}...`;

      switch (source) {
        case 'readme':
          entries.push(...importReadme());
          break;
        case 'cursor':
          entries.push(...importCursor());
          break;
        case 'claude':
          entries.push(...importClaude());
          break;
        case 'adr':
          entries.push(...importADR());
          break;
        case 'commits':
          entries.push(...importCommits(options.limit || 50));
          break;
        case 'package':
          entries.push(...importPackageFiles());
          break;
      }
    }

    spinner.succeed(`Found ${entries.length} entries across ${sources.length} source(s)`);

    if (entries.length === 0) {
      console.log(chalk.gray('\\nNo entries found to import.'));
      return;
    }

    // Display found entries
    console.log('');
    const grouped = groupBy(entries, 'source');
    for (const [source, items] of Object.entries(grouped)) {
      console.log(chalk.bold(`${source.toUpperCase()} (${items.length})`));
      for (const item of items.slice(0, 3)) {
        const icon = getTypeIcon(item.type);
        console.log(`  ${icon} ${chalk.bold(item.title.substring(0, 60))}`);
      }
      if (items.length > 3) {
        console.log(chalk.gray(`  ... and ${items.length - 3} more`));
      }
      console.log('');
    }

    // Handle dry run
    if (options.dryRun) {
      console.log(chalk.yellow('Dry run - no entries saved.'));
      return;
    }

    // Save entries
    const saveSpinner = ora('Saving entries...').start();
    let saved = 0;

    for (const entry of entries) {
      await db.createEntry({
        projectId: project.id,
        type: entry.type,
        title: entry.title,
        content: entry.content,
        metadata: {
          ...entry.metadata,
          source: `import:${entry.source}`,
        },
        status: options.autoConfirm ? 'active' : 'draft',
      });
      saved++;
    }

    saveSpinner.succeed(
      options.autoConfirm
        ? `Saved ${saved} entries.`
        : `${saved} entries saved as drafts.`
    );

    if (!options.autoConfirm) {
      console.log('');
      console.log(chalk.cyan(`Run ${chalk.bold('contxt review')} to confirm drafts.`));
    }

    await db.close();
  } catch (error) {
    spinner.fail('Import failed');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * Import from README.md
 */
function importReadme(): CapturedEntry[] {
  const readmePath = join(process.cwd(), 'README.md');
  if (!existsSync(readmePath)) return [];

  try {
    const content = readFileSync(readmePath, 'utf-8');
    const lines = content.split('\\n');

    const entries: CapturedEntry[] = [];
    let currentSection: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for headings
      const headingMatch = line.match(/^#+\\s+(.+)/);
      if (headingMatch) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          const sectionContent = currentContent.join('\\n').trim();
          if (sectionContent.length > 50) {
            entries.push({
              type: 'document',
              title: `README: ${currentSection}`,
              content: sectionContent,
              metadata: { section: currentSection },
              source: 'readme',
            });
          }
        }

        currentSection = headingMatch[1].trim();
        currentContent = [];
        continue;
      }

      if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection && currentContent.length > 0) {
      const sectionContent = currentContent.join('\\n').trim();
      if (sectionContent.length > 50) {
        entries.push({
          type: 'document',
          title: `README: ${currentSection}`,
          content: sectionContent,
          metadata: { section: currentSection },
          source: 'readme',
        });
      }
    }

    return entries;
  } catch {
    return [];
  }
}

/**
 * Import from Cursor rules files
 */
function importCursor(): CapturedEntry[] {
  const entries: CapturedEntry[] = [];

  // Check .cursorrules
  const cursorrulesPath = join(process.cwd(), '.cursorrules');
  if (existsSync(cursorrulesPath)) {
    try {
      const content = readFileSync(cursorrulesPath, 'utf-8').trim();
      if (content.length > 0) {
        entries.push({
          type: 'document',
          title: 'Cursor Rules',
          content,
          metadata: { file: '.cursorrules' },
          source: 'cursor',
        });
      }
    } catch {
      // Ignore errors
    }
  }

  // Check .cursor/rules
  const cursorRulesPath = join(process.cwd(), '.cursor', 'rules');
  if (existsSync(cursorRulesPath)) {
    try {
      const content = readFileSync(cursorRulesPath, 'utf-8').trim();
      if (content.length > 0) {
        entries.push({
          type: 'document',
          title: 'Cursor Rules',
          content,
          metadata: { file: '.cursor/rules' },
          source: 'cursor',
        });
      }
    } catch {
      // Ignore errors
    }
  }

  return entries;
}

/**
 * Import from Claude files
 */
function importClaude(): CapturedEntry[] {
  const entries: CapturedEntry[] = [];

  const claudePath = join(process.cwd(), '.claude', 'CLAUDE.md');
  if (existsSync(claudePath)) {
    try {
      const content = readFileSync(claudePath, 'utf-8');
      const lines = content.split('\\n');

      let currentSection: string | null = null;
      let currentContent: string[] = [];

      for (const line of lines) {
        const headingMatch = line.match(/^#+\\s+(.+)/);
        if (headingMatch) {
          // Save previous section
          if (currentSection && currentContent.length > 0) {
            const sectionContent = currentContent.join('\\n').trim();
            if (sectionContent.length > 50) {
              entries.push({
                type: 'document',
                title: `Claude: ${currentSection}`,
                content: sectionContent,
                metadata: { section: currentSection },
                source: 'claude',
              });
            }
          }

          currentSection = headingMatch[1].trim();
          currentContent = [];
          continue;
        }

        if (currentSection) {
          currentContent.push(line);
        }
      }

      // Save last section
      if (currentSection && currentContent.length > 0) {
        const sectionContent = currentContent.join('\\n').trim();
        if (sectionContent.length > 50) {
          entries.push({
            type: 'document',
            title: `Claude: ${currentSection}`,
            content: sectionContent,
            metadata: { section: currentSection },
            source: 'claude',
          });
        }
      }
    } catch {
      // Ignore errors
    }
  }

  return entries;
}

/**
 * Import from Architecture Decision Records
 */
function importADR(): CapturedEntry[] {
  const entries: CapturedEntry[] = [];

  const adrDirs = [
    join(process.cwd(), 'docs', 'adr'),
    join(process.cwd(), 'docs', 'architecture'),
    join(process.cwd(), 'adr'),
  ];

  for (const adrDir of adrDirs) {
    if (!existsSync(adrDir)) continue;

    try {
      const files = readdirSync(adrDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => join(adrDir, f));

      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf-8');
          const title = extractADRTitle(content, basename(file, '.md'));

          entries.push({
            type: 'decision',
            title,
            content: content.trim(),
            metadata: { file: file.replace(process.cwd(), '.') },
            source: 'adr',
          });
        } catch {
          // Ignore individual file errors
        }
      }
    } catch {
      // Ignore directory errors
    }
  }

  return entries;
}

/**
 * Extract title from ADR content
 */
function extractADRTitle(content: string, fallback: string): string {
  // Try to find # Title
  const titleMatch = content.match(/^#\\s+(.+)/m);
  if (titleMatch) return titleMatch[1].trim();

  // Try to find Title: line
  const titleLineMatch = content.match(/^Title:\\s+(.+)/m);
  if (titleLineMatch) return titleLineMatch[1].trim();

  // Use filename as fallback
  return fallback
    .replace(/^\\d+-/, '') // Remove number prefix
    .replace(/-/g, ' ')
    .replace(/\\b\\w/g, (l) => l.toUpperCase());
}

/**
 * Import from git commits
 */
function importCommits(limit: number): CapturedEntry[] {
  try {
    const { execSync } = require('child_process');

    // Get recent commits
    const output = execSync(
      `git log --pretty=format:"%H|%an|%ai|%s|%b" -n ${limit}`,
      { cwd: process.cwd(), encoding: 'utf-8' }
    ).trim();

    if (!output) return [];

    const entries: CapturedEntry[] = [];
    const commits = output.split('\\n');

    for (const commit of commits) {
      const [hash, author, date, subject, body] = commit.split('|');

      // Skip merge commits and trivial commits
      if (subject.startsWith('Merge ') || subject.length < 10) continue;

      // Look for significant commits
      const keywords = ['feat', 'feature', 'add', 'implement', 'refactor', 'breaking', 'major'];
      const isSignificant = keywords.some((kw) =>
        subject.toLowerCase().includes(kw)
      );

      if (isSignificant) {
        entries.push({
          type: 'session',
          title: subject.trim(),
          content: body?.trim() || subject.trim(),
          metadata: {
            commit: hash.substring(0, 8),
            author,
            date,
          },
          source: 'commits',
        });
      }
    }

    return entries;
  } catch {
    return [];
  }
}

/**
 * Import from package files
 */
function importPackageFiles(): CapturedEntry[] {
  const entries: CapturedEntry[] = [];

  // package.json
  const packagePath = join(process.cwd(), 'package.json');
  if (existsSync(packagePath)) {
    try {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));

      if (pkg.description) {
        entries.push({
          type: 'document',
          title: 'Project Description',
          content: pkg.description,
          metadata: { source_file: 'package.json' },
          source: 'package',
        });
      }

      // Extract major dependencies as context
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const majorDeps = Object.keys(deps).filter((dep) =>
        ['react', 'vue', 'angular', 'express', 'fastify', 'next', 'nuxt'].includes(dep)
      );

      if (majorDeps.length > 0) {
        entries.push({
          type: 'context',
          title: 'Tech Stack',
          content: `Using: ${majorDeps.join(', ')}`,
          metadata: { dependencies: majorDeps },
          source: 'package',
        });
      }
    } catch {
      // Ignore errors
    }
  }

  // requirements.txt (Python)
  const requirementsPath = join(process.cwd(), 'requirements.txt');
  if (existsSync(requirementsPath)) {
    try {
      const content = readFileSync(requirementsPath, 'utf-8');
      const packages = content
        .split('\\n')
        .filter((line) => line.trim() && !line.startsWith('#'))
        .map((line) => line.split('==')[0].split('>=')[0].trim());

      if (packages.length > 0) {
        entries.push({
          type: 'context',
          title: 'Python Dependencies',
          content: `Python packages: ${packages.slice(0, 10).join(', ')}${packages.length > 10 ? '...' : ''}`,
          metadata: { packages: packages.slice(0, 20) },
          source: 'package',
        });
      }
    } catch {
      // Ignore errors
    }
  }

  // Cargo.toml (Rust)
  const cargoPath = join(process.cwd(), 'Cargo.toml');
  if (existsSync(cargoPath)) {
    try {
      const content = readFileSync(cargoPath, 'utf-8');
      const nameMatch = content.match(/name\\s*=\\s*"([^"]+)"/);
      const descMatch = content.match(/description\\s*=\\s*"([^"]+)"/);

      if (descMatch) {
        entries.push({
          type: 'document',
          title: `Rust Project: ${nameMatch?.[1] || 'Unknown'}`,
          content: descMatch[1],
          metadata: { source_file: 'Cargo.toml' },
          source: 'package',
        });
      }
    } catch {
      // Ignore errors
    }
  }

  return entries;
}

/**
 * Helper: Group array by key
 */
function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Helper: Get type icon
 */
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    decision: chalk.blue('DECISION'),
    pattern: chalk.magenta('PATTERN'),
    context: chalk.green('CONTEXT'),
    document: chalk.cyan('DOCUMENT'),
    session: chalk.yellow('SESSION'),
  };
  return icons[type] || type.toUpperCase();
}
