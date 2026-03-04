/**
 * Init command - Initialize a Contxt project
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { basename, join } from 'path';
import { homedir } from 'os';
import { spawn } from 'child_process';
import { glob } from 'glob';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { inferFromMarkdown } from '@mycontxt/core';
import { getContxtDir, getDbPath, isContxtProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';
import { createUsageGate, enforceGate } from '../utils/usage-gate.js';

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

const MCP_CONFIG = {
  mcpServers: {
    contxt: {
      command: 'contxt',
      args: ['mcp'],
      env: {},
    },
  },
};

const CONTXT_BLOCK_START = '# --- contxt hook start ---';
const CONTXT_BLOCK_END = '# --- contxt hook end ---';
const ALL_HOOKS = ['post-commit', 'pre-push', 'post-checkout', 'prepare-commit-msg'] as const;

interface InitOptions {
  name?: string;
}

/**
 * Write .mcp.json for Claude Code + .cursor/mcp.json for Cursor auto-discovery
 */
function writeMcpConfigs(cwd: string): void {
  const mcpJson = JSON.stringify(MCP_CONFIG, null, 2);
  writeFileSync(join(cwd, '.mcp.json'), mcpJson, 'utf-8');

  const cursorDir = join(cwd, '.cursor');
  mkdirSync(cursorDir, { recursive: true });
  writeFileSync(join(cursorDir, 'mcp.json'), mcpJson, 'utf-8');
}

/**
 * Install git hooks silently — same logic as `contxt hook install`
 */
function installGitHooks(cwd: string): boolean {
  const gitDir = join(cwd, '.git');
  if (!existsSync(gitDir)) return false;

  const gitHooksDir = join(gitDir, 'hooks');
  mkdirSync(gitHooksDir, { recursive: true });

  for (const hookName of ALL_HOOKS) {
    const hookPath = join(gitHooksDir, hookName);
    const contxtBlock = `${CONTXT_BLOCK_START}\ncontxt hook run ${hookName} "$@"\n${CONTXT_BLOCK_END}`;

    if (existsSync(hookPath)) {
      const content = readFileSync(hookPath, 'utf-8');
      if (!content.includes(CONTXT_BLOCK_START)) {
        writeFileSync(hookPath, content.trimEnd() + '\n\n' + contxtBlock + '\n', 'utf-8');
      }
    } else {
      writeFileSync(hookPath, `#!/bin/sh\n\n${contxtBlock}\n`, 'utf-8');
    }

    chmodSync(hookPath, '755');
  }

  return true;
}

/**
 * Spawn the watch daemon in the background — auto-captures file changes and auto-syncs
 */
function startWatchDaemon(cwd: string): void {
  const pidFile = join(cwd, '.contxt', '.watch.pid');
  if (existsSync(pidFile)) return; // Already running

  const child = spawn('contxt', ['watch', '--daemon'], {
    detached: true,
    stdio: 'ignore',
    cwd,
  });
  child.unref();
}

/**
 * Register a UserPromptSubmit hook in ~/.claude/settings.json so context
 * is automatically injected before every Claude Code prompt.
 */
function registerClaudeCodeHook(): void {
  const claudeDir = join(homedir(), '.claude');
  const settingsPath = join(claudeDir, 'settings.json');
  const hookCommand =
    "bash -c 'PROMPT=$(cat | jq -r \".prompt // empty\" 2>/dev/null | head -c 300); [ -n \"$PROMPT\" ] && contxt load --task \"$PROMPT\" 2>/dev/null || true'";

  let settings: Record<string, any> = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch {
      // Malformed — start fresh
    }
  }

  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];

  const alreadyRegistered = (settings.hooks.UserPromptSubmit as any[]).some((h: any) =>
    h.hooks?.some((hh: any) => typeof hh.command === 'string' && hh.command.includes('contxt load'))
  );

  if (!alreadyRegistered) {
    settings.hooks.UserPromptSubmit.push({
      matcher: '',
      hooks: [{ type: 'command', command: hookCommand }],
    });
    mkdirSync(claudeDir, { recursive: true });
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  }
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

    // Check usage limits before creating project
    const gate = await createUsageGate(db);
    const result = await gate.checkProjectCreate();
    enforceGate(result);

    // Create project with autoSync enabled by default
    const projectName = options.name || basename(cwd);
    const project = await db.initProject({
      name: projectName,
      path: cwd,
      stack: [],
      config: { autoSync: true },
    });

    // Scan existing .md files and infer decisions/patterns
    let mdDrafts = 0;
    if (process.env.OPENAI_API_KEY) {
      const mdFiles = await glob('**/*.md', {
        cwd,
        ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.next/**'],
        absolute: false,
        nodir: true,
      });

      const branch = await db.getActiveBranch(project.id);

      for (const file of mdFiles) {
        try {
          const content = readFileSync(join(cwd, file), 'utf-8');
          const inferred = await inferFromMarkdown(content, file);
          for (const entry of inferred) {
            await db.createEntry({
              projectId: project.id,
              type: entry.type,
              title: entry.title,
              content: entry.content,
              metadata: { source: 'md:inferred', file: entry.file, hash: entry.hash },
              status: 'draft',
            });
            mdDrafts++;
          }
        } catch {
          // Skip files that fail
        }
      }
    }

    await db.close();

    // Generate MCP configs for Claude Code + Cursor auto-discovery
    writeMcpConfigs(cwd);

    // Install git hooks automatically
    const hooksInstalled = installGitHooks(cwd);

    // Start watch daemon in background (auto-sync enabled)
    startWatchDaemon(cwd);

    // Register Claude Code UserPromptSubmit hook for silent context injection
    registerClaudeCodeHook();

    success(`Initialized Contxt project: ${project.name}`);
    console.log();
    info('✓ MCP server configured (.mcp.json + .cursor/mcp.json)');
    if (hooksInstalled) info('✓ Git hooks installed (post-commit, pre-push, post-checkout)');
    info('✓ Watch daemon started (auto-sync enabled)');
    info('✓ Claude Code context hook registered');
    if (mdDrafts > 0) info(`✓ ${mdDrafts} decision${mdDrafts !== 1 ? 's' : ''}/pattern${mdDrafts !== 1 ? 's' : ''} inferred from existing markdown files`);
    console.log();
    console.log("Contxt is running. You won't need to think about it again.");

  } catch (err) {
    error(`Failed to initialize project: ${(err as Error).message}`);
    process.exit(1);
  }
}
