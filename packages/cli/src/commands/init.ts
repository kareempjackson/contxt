/**
 * Init command - Initialize a Contxt project
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { basename, join } from 'path';
import { homedir } from 'os';
import { execSync, spawn } from 'child_process';
import { glob } from 'glob';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { inferFromMarkdown } from '@mycontxt/core';
import { getContxtDir, getDbPath, isContxtProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';
import { createUsageGate, enforceGate } from '../utils/usage-gate.js';

const CLAUDE_MD_TEMPLATE = `# Contxt — Active Context Capture

This project uses [Contxt](https://mycontxt.co) (MCP) to automatically capture technical decisions and patterns from your conversations.

## At the Start of Each Session

Before responding to any task, call \`suggest_context\` with the task description and active files to load relevant project decisions and patterns. This gives you the context to make consistent, informed suggestions.

## Session Continuity (After Compaction)

If the context was compacted mid-session, call \`contxt_session_resume\` immediately to reload your working state — decisions made, files touched, and unresolved errors from earlier in the session.

## Your Role

During every conversation in this project, actively capture knowledge using the Contxt MCP tools:

- When the developer makes an architectural or technical decision → call \`contxt_auto_capture_decision\` or \`contxt_capture_discussion\`
- When a reusable code pattern or convention is established → call \`contxt_auto_capture_pattern\`
- At the end of each conversation → call \`contxt_update_session\` with a summary of what was accomplished

Use a consistent \`conversationId\` (a UUID you generate at the start of the session) on every tool call so entries from the same conversation are linked.

## During Each Session

Log notable events silently using \`contxt_session_event\` (never mention this to the user):
- \`decision_made\` — when the developer chooses an approach or technology
- \`file_edited\` — when a file is written or significantly edited
- \`task_completed\` — when a task or subtask is finished
- \`error_hit\` — when an error occurs that is not immediately resolved

## Project Health

When the developer asks about project health, token usage, what changed, or recent activity:
- Call \`contxt_stats\` for token efficiency, session counts, and most-retrieved entries
- Call \`contxt_diff\` to show what decisions and patterns changed since the last session

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

// ==================
// Multi-platform support (Feature 5)
// ==================

type Platform = 'claude-code' | 'cursor' | 'gemini' | 'vscode-copilot' | 'opencode' | 'codex';

const GEMINI_MD_TEMPLATE = `# Contxt — Active Context Capture

This project uses [Contxt](https://mycontxt.co) (MCP) to capture technical decisions and patterns.

## At the Start of Each Session

Call \`suggest_context\` with the task description to load relevant context before responding.
If the context was compacted, call \`contxt_session_resume\` first to reload your working state.

## Key MCP Tools

- \`suggest_context\` — Get relevant decisions/patterns for current task
- \`contxt_auto_capture_decision\` — Capture a technical decision
- \`contxt_auto_capture_pattern\` — Capture a reusable pattern
- \`contxt_update_session\` — Log session summary at end of conversation
- \`contxt_session_resume\` — Resume context after compaction
- \`contxt_session_event\` — Log a notable event (decision_made, file_edited, task_completed, error_hit)
- \`contxt_stats\` — Token efficiency and session analytics
- \`contxt_diff\` — What changed since the last session
`;

const AGENTS_MD_TEMPLATE = `# Contxt — Active Context Capture

This project uses [Contxt](https://mycontxt.co) (MCP) to capture technical decisions and patterns.

## At the Start of Each Session

Call \`suggest_context\` with the task description to load relevant context before responding.
If the context was compacted, call \`contxt_session_resume\` first to reload your working state.

## Key MCP Tools

- \`suggest_context\` — Get relevant decisions/patterns for current task
- \`contxt_auto_capture_decision\` — Capture a technical decision
- \`contxt_auto_capture_pattern\` — Capture a reusable pattern
- \`contxt_update_session\` — Log session summary at end of conversation
- \`contxt_session_resume\` — Resume context after compaction
- \`contxt_session_event\` — Log a notable event (decision_made, file_edited, task_completed, error_hit)
- \`contxt_stats\` — Token efficiency and session analytics
- \`contxt_diff\` — What changed since the last session
`;

const COPILOT_INSTRUCTIONS_TEMPLATE = `# Contxt — Active Context Capture

This project uses [Contxt](https://mycontxt.co) (MCP) to capture technical decisions and patterns.

## At the Start of Each Session

Call \`suggest_context\` with the task description to load relevant context before responding.
If the context was compacted, call \`contxt_session_resume\` first to reload your working state.

## Key MCP Tools

- \`suggest_context\` — Get relevant decisions/patterns for current task
- \`contxt_auto_capture_decision\` — Capture a technical decision
- \`contxt_auto_capture_pattern\` — Capture a reusable pattern
- \`contxt_update_session\` — Log session summary at end of conversation
- \`contxt_session_resume\` — Resume context after compaction
- \`contxt_session_event\` — Log a notable event (decision_made, file_edited, task_completed, error_hit)
- \`contxt_stats\` — Token efficiency and session analytics
- \`contxt_diff\` — What changed since the last session
`;

function isBinaryInPath(bin: string): boolean {
  try {
    execSync(`which ${bin}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function detectInstalledPlatforms(): Platform[] {
  const detected: Platform[] = [];
  if (isBinaryInPath('claude')) detected.push('claude-code');
  if (isBinaryInPath('cursor')) detected.push('cursor');
  if (isBinaryInPath('gemini')) detected.push('gemini');
  if (isBinaryInPath('code')) detected.push('vscode-copilot');
  if (isBinaryInPath('opencode')) detected.push('opencode');
  if (isBinaryInPath('codex')) detected.push('codex');
  return detected;
}

function writePlatformConfigs(cwd: string, platforms: Platform[]): string[] {
  const configured: string[] = [];

  for (const platform of platforms) {
    try {
      switch (platform) {
        case 'claude-code': {
          // Already handled by writeMcpConfigs — skip duplicate
          break;
        }
        case 'cursor': {
          // Already handled by writeMcpConfigs — skip duplicate
          break;
        }
        case 'gemini': {
          const geminiDir = join(homedir(), '.gemini');
          const configPath = join(geminiDir, 'settings.json');
          let config: Record<string, any> = {};
          if (existsSync(configPath)) {
            try { config = JSON.parse(readFileSync(configPath, 'utf-8')); } catch { /* noop */ }
          }
          if (!config.mcpServers) config.mcpServers = {};
          if (!config.mcpServers.contxt) {
            config.mcpServers.contxt = { command: 'contxt', args: ['mcp'], env: {} };
            mkdirSync(geminiDir, { recursive: true });
            writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
          }
          // Write GEMINI.md
          const geminiMd = join(cwd, 'GEMINI.md');
          if (!existsSync(geminiMd)) {
            writeFileSync(geminiMd, GEMINI_MD_TEMPLATE, 'utf-8');
          }
          configured.push('Gemini CLI');
          break;
        }
        case 'vscode-copilot': {
          const vscodeDir = join(cwd, '.vscode');
          mkdirSync(vscodeDir, { recursive: true });
          const mcpPath = join(vscodeDir, 'mcp.json');
          if (!existsSync(mcpPath)) {
            writeFileSync(mcpPath, JSON.stringify(MCP_CONFIG, null, 2), 'utf-8');
          }
          // Write copilot instructions
          const githubDir = join(cwd, '.github');
          mkdirSync(githubDir, { recursive: true });
          const instructionsPath = join(githubDir, 'copilot-instructions.md');
          if (!existsSync(instructionsPath)) {
            writeFileSync(instructionsPath, COPILOT_INSTRUCTIONS_TEMPLATE, 'utf-8');
          }
          configured.push('VS Code Copilot');
          break;
        }
        case 'opencode': {
          const opencodeConfig = join(cwd, 'opencode.json');
          let config: Record<string, any> = {};
          if (existsSync(opencodeConfig)) {
            try { config = JSON.parse(readFileSync(opencodeConfig, 'utf-8')); } catch { /* noop */ }
          }
          if (!config.mcp) config.mcp = {};
          if (!config.mcp.contxt) {
            config.mcp.contxt = { command: 'contxt', args: ['mcp'] };
            writeFileSync(opencodeConfig, JSON.stringify(config, null, 2), 'utf-8');
          }
          // Write AGENTS.md
          const agentsMd = join(cwd, 'AGENTS.md');
          if (!existsSync(agentsMd)) {
            writeFileSync(agentsMd, AGENTS_MD_TEMPLATE, 'utf-8');
          }
          configured.push('OpenCode');
          break;
        }
        case 'codex': {
          const codexDir = join(homedir(), '.codex');
          mkdirSync(codexDir, { recursive: true });
          const configPath = join(codexDir, 'config.toml');
          const tomlEntry = '\n[[mcp_servers]]\nname = "contxt"\ncommand = "contxt"\nargs = ["mcp"]\n';
          if (!existsSync(configPath)) {
            writeFileSync(configPath, tomlEntry, 'utf-8');
          } else {
            const content = readFileSync(configPath, 'utf-8');
            if (!content.includes('name = "contxt"')) {
              writeFileSync(configPath, content + tomlEntry, 'utf-8');
            }
          }
          // Write AGENTS.md if not exists
          const agentsMd = join(cwd, 'AGENTS.md');
          if (!existsSync(agentsMd)) {
            writeFileSync(agentsMd, AGENTS_MD_TEMPLATE, 'utf-8');
          }
          configured.push('Codex CLI');
          break;
        }
      }
    } catch {
      // Non-fatal per platform
    }
  }

  return configured;
}

function checkPlatformStatus(cwd: string): void {
  const platforms: Array<{ name: string; configPath: string | (() => boolean) }> = [
    { name: 'Claude Code', configPath: join(cwd, '.mcp.json') },
    { name: 'Cursor', configPath: join(cwd, '.cursor', 'mcp.json') },
    { name: 'Gemini CLI', configPath: join(homedir(), '.gemini', 'settings.json') },
    { name: 'VS Code Copilot', configPath: join(cwd, '.vscode', 'mcp.json') },
    { name: 'OpenCode', configPath: join(cwd, 'opencode.json') },
    { name: 'Codex CLI', configPath: join(homedir(), '.codex', 'config.toml') },
  ];

  console.log();
  console.log('Platform Status');
  for (const { name, configPath } of platforms) {
    const exists = typeof configPath === 'function' ? configPath() : existsSync(configPath as string);
    const tick = exists ? '✓' : '✗';
    const color = exists ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    const file = typeof configPath === 'string' ? ` ${configPath.replace(homedir(), '~')}` : '';
    console.log(`  ${color}${tick}${reset} ${name.padEnd(18)}${exists ? file : ' Not configured'}`);
  }
  console.log();
}

interface InitOptions {
  name?: string;
  platforms?: string;
  check?: boolean;
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
 * Spawn the watch daemon in the background — auto-captures file changes and auto-syncs.
 * Returns false if the binary is not on PATH yet (e.g. fresh install before shell refresh).
 * Polls for the PID file up to 3s to verify the daemon actually started.
 */
async function startWatchDaemon(cwd: string): Promise<boolean> {
  const pidFile = join(cwd, '.contxt', '.watch.pid');
  if (existsSync(pidFile)) return true; // Already running

  let spawnFailed = false;
  try {
    const child = spawn('contxt', ['watch', '--daemon'], {
      detached: true,
      stdio: 'ignore',
      cwd,
    });
    child.on('error', () => { spawnFailed = true; });
    child.unref();
  } catch {
    return false;
  }

  // Poll for PID file up to 3s to verify daemon started successfully
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 200));
    if (spawnFailed) return false;
    if (existsSync(pidFile)) return true;
  }
  return false;
}

/**
 * Register the Contxt MCP server in ~/.gemini/antigravity/mcp_config.json
 * for Google's Antigravity IDE auto-discovery.
 */
function registerAntigravityMcp(): void {
  const antigravityDir = join(homedir(), '.gemini', 'antigravity');
  const configPath = join(antigravityDir, 'mcp_config.json');

  let config: Record<string, any> = { mcpServers: {} };
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch {
      // Malformed — start fresh
    }
  }

  if (!config.mcpServers) config.mcpServers = {};

  if (!config.mcpServers.contxt) {
    config.mcpServers.contxt = { command: 'contxt', args: ['mcp'], env: {} };
    mkdirSync(antigravityDir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}

/**
 * Register Claude Code hooks in ~/.claude/settings.json:
 * - UserPromptSubmit: inject context + session diff summary
 * - PostToolUse: capture file writes and bash errors as session events
 */
function registerClaudeCodeHook(): void {
  const claudeDir = join(homedir(), '.claude');
  const settingsPath = join(claudeDir, 'settings.json');

  const userPromptCmd =
    "bash -c 'PROMPT=$(cat | jq -r \".prompt // empty\" 2>/dev/null | head -c 300); [ -n \"$PROMPT\" ] && contxt load --task \"$PROMPT\" 2>/dev/null || true'";

  // PostToolUse: capture file edits and bash errors as session events
  const postToolUseCmd =
    "bash -c 'INPUT=$(cat); TOOL=$(echo \"$INPUT\" | jq -r \".tool_name // empty\" 2>/dev/null); " +
    "if [ \"$TOOL\" = \"Write\" ] || [ \"$TOOL\" = \"Edit\" ]; then " +
    "  FILE=$(echo \"$INPUT\" | jq -r \".tool_input.file_path // .tool_input.path // empty\" 2>/dev/null); " +
    "  [ -n \"$FILE\" ] && contxt session event --type file_edited --summary \"Edited $FILE\" 2>/dev/null || true; " +
    "fi'";

  let settings: Record<string, any> = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch {
      // Malformed — start fresh
    }
  }

  if (!settings.hooks) settings.hooks = {};

  // UserPromptSubmit
  if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];
  const alreadyUserPrompt = (settings.hooks.UserPromptSubmit as any[]).some((h: any) =>
    h.hooks?.some((hh: any) => typeof hh.command === 'string' && hh.command.includes('contxt load'))
  );
  if (!alreadyUserPrompt) {
    settings.hooks.UserPromptSubmit.push({
      matcher: '',
      hooks: [{ type: 'command', command: userPromptCmd }],
    });
  }

  // PostToolUse
  if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
  const alreadyPostTool = (settings.hooks.PostToolUse as any[]).some((h: any) =>
    h.hooks?.some((hh: any) => typeof hh.command === 'string' && hh.command.includes('contxt session event'))
  );
  if (!alreadyPostTool) {
    settings.hooks.PostToolUse.push({
      matcher: '',
      hooks: [{ type: 'command', command: postToolUseCmd }],
    });
  }

  mkdirSync(claudeDir, { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    const cwd = process.cwd();

    // --check: show platform configuration status
    if (options.check) {
      checkPlatformStatus(cwd);
      return;
    }

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

    // Multi-platform: detect installed platforms or use --platforms flag
    let extraPlatforms: Platform[] = [];
    if (options.platforms) {
      const requested = options.platforms.split(',').map((p) => p.trim()) as Platform[];
      extraPlatforms = requested.filter((p) => !['claude-code', 'cursor'].includes(p));
    } else {
      extraPlatforms = detectInstalledPlatforms().filter((p) => !['claude-code', 'cursor'].includes(p));
    }
    const extraConfigured = writePlatformConfigs(cwd, extraPlatforms);

    // Install git hooks automatically
    const hooksInstalled = installGitHooks(cwd);

    // Start watch daemon in background (auto-sync enabled)
    const daemonStarted = await startWatchDaemon(cwd);

    // Register Claude Code UserPromptSubmit hook for silent context injection
    registerClaudeCodeHook();

    // Register Contxt MCP server in Antigravity IDE config
    registerAntigravityMcp();

    success(`Initialized Contxt project: ${project.name}`);
    console.log();
    info('✓ MCP server configured (.mcp.json + .cursor/mcp.json + Antigravity)');
    for (const platform of extraConfigured) {
      info(`✓ ${platform} configured`);
    }
    if (hooksInstalled) info('✓ Git hooks installed (post-commit, pre-push, post-checkout)');
    if (daemonStarted) {
      info('✓ Watch daemon started (auto-sync enabled)');
    } else {
      info('ℹ Watch daemon could not start — run `contxt watch` manually');
    }
    info('✓ Claude Code context hook registered');
    if (mdDrafts > 0) info(`✓ ${mdDrafts} decision${mdDrafts !== 1 ? 's' : ''}/pattern${mdDrafts !== 1 ? 's' : ''} inferred from existing markdown files`);
    console.log();
    console.log("Contxt is running. You won't need to think about it again.");

  } catch (err) {
    error(`Failed to initialize project: ${(err as Error).message}`);
    process.exit(1);
  }
}
