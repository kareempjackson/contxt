/**
 * Init command - Initialize a Contxt project
 */

import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { getContxtDir, getDbPath, isContxtProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';

const CLAUDE_MD_TEMPLATE = `# Contxt — Active Context Capture

This project uses [Contxt](https://mycontxt.co) (MCP) to automatically capture technical decisions and patterns from your conversations.

## Your Role

During every conversation in this project, actively capture knowledge using the Contxt MCP tools:

- When the developer makes an architectural or technical decision → call \`contxt_auto_capture_decision\` or \`contxt_capture_discussion\`
- When a reusable code pattern or convention is established → call \`contxt_auto_capture_pattern\`
- At the end of each conversation → call \`contxt_update_session\` with a summary of what was accomplished

Use a consistent \`conversationId\` (a UUID you generate at the start of the session) on every tool call so entries from the same conversation are linked.

## When to Capture a Decision

Capture a **decision** when the developer (or you together):
- Chooses one technology, library, or approach over alternatives
- Establishes a project structure, naming convention, or architectural boundary
- Resolves a tradeoff (e.g. performance vs. simplicity, SQL vs. NoSQL)
- Says "let's use X", "we'll go with Y", or "we decided to Z"

Use \`contxt_capture_discussion\` when the decision came out of back-and-forth so you can capture the context and what was rejected.

## When to Capture a Pattern

Capture a **pattern** when:
- A code shape is established that will be repeated (component structure, API format, hook convention, etc.)
- A rule is set about how something should always be done in this project

## What NOT to Capture

- One-off debugging steps or experiments
- Trivial implementation details (e.g. "added a console.log")
- Things the developer explicitly says to ignore

## After Capture

All entries are saved as **drafts**. The developer reviews and confirms them with:
\`\`\`
contxt review
\`\`\`
`;

interface InitOptions {
  name?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    const cwd = process.cwd();

    // Check if already initialized
    if (isContxtProject(cwd)) {
      error('This directory is already a Contxt project');
      process.exit(1);
    }

    // Create .contxt directory
    const contxtDir = getContxtDir(cwd);
    mkdirSync(contxtDir, { recursive: true });

    // Write CLAUDE.md instruction template
    const claudeMdPath = join(contxtDir, 'CLAUDE.md');
    writeFileSync(claudeMdPath, CLAUDE_MD_TEMPLATE, 'utf-8');

    // Initialize database
    const dbPath = getDbPath(cwd);
    const db = new SQLiteDatabase(dbPath);
    await db.initialize();

    // Create project
    const projectName = options.name || basename(cwd);
    const project = await db.initProject({
      name: projectName,
      path: cwd,
      stack: [], // TODO: Auto-detect stack
    });

    success(`Initialized Contxt project: ${project.name}`);
    info(`Project ID: ${project.id}`);
    info(`Database: ${dbPath}`);
    info(`CLAUDE.md: ${claudeMdPath}`);
    console.log();
    console.log('Get started:');
    console.log('  contxt decision add -t "..." -r "..."');
    console.log('  contxt pattern add -t "..." -c "..."');
    console.log('  contxt hook install');
    console.log('  contxt status');

    await db.close();
  } catch (err) {
    error(`Failed to initialize project: ${(err as Error).message}`);
    process.exit(1);
  }
}
