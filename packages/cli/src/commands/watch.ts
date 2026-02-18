/**
 * Watch command — background file watcher for passive context capture
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, relative } from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { parseFile, scanCommentToEntry, SyncEngine } from '@mycontxt/core';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { getProjectDb, getDbPath } from '../utils/project.js';
import { getAccessToken } from './auth.js';
import { getSupabaseConfig } from '../config.js';

const PID_FILE = '.contxt/.watch.pid';
const LOG_FILE = '.contxt/watch.log';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const DEBOUNCE_MS = 30_000; // 30s batch window

interface WatchOptions {
  daemon?: boolean;
}

/**
 * Start the file watcher
 */
export async function startCommand(options: WatchOptions = {}) {
  if (options.daemon) {
    return startDaemon();
  }

  return runWatcher();
}

/**
 * Stop the background daemon
 */
export async function stopCommand() {
  const pidFile = join(process.cwd(), PID_FILE);

  if (!existsSync(pidFile)) {
    console.log(chalk.gray('No watch daemon running.'));
    return;
  }

  const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10);

  try {
    process.kill(pid, 'SIGTERM');
    unlinkSync(pidFile);
    console.log(chalk.green('Watch daemon stopped.'));
  } catch {
    console.log(chalk.yellow('Daemon not found — removing stale PID file.'));
    unlinkSync(pidFile);
  }
}

/**
 * Show daemon status
 */
export async function statusCommand() {
  const pidFile = join(process.cwd(), PID_FILE);

  if (!existsSync(pidFile)) {
    console.log(chalk.gray('Watch daemon: not running'));
    return;
  }

  const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10);

  try {
    process.kill(pid, 0); // Signal 0 just checks if the process exists
    console.log(chalk.green(`Watch daemon: running (PID ${pid})`));
  } catch {
    console.log(chalk.yellow('Watch daemon: stale PID file (process not found)'));
    unlinkSync(pidFile);
  }
}

/**
 * Start as detached background process
 */
function startDaemon() {
  const pidFile = join(process.cwd(), PID_FILE);

  if (existsSync(pidFile)) {
    const pid = parseInt(readFileSync(pidFile, 'utf-8').trim(), 10);
    try {
      process.kill(pid, 0);
      console.log(chalk.yellow(`Watch daemon already running (PID ${pid}).`));
      return;
    } catch {
      // Stale PID — continue starting
    }
  }

  const logPath = join(process.cwd(), LOG_FILE);
  const logStream = require('fs').openSync(logPath, 'a');

  const child = spawn(process.execPath, [process.argv[1], 'watch'], {
    env: { ...process.env, CONTXT_WATCH_DAEMON: '1' },
    detached: true,
    stdio: ['ignore', logStream, logStream],
    cwd: process.cwd(),
  });

  child.unref();
  writeFileSync(pidFile, String(child.pid), 'utf-8');
  console.log(chalk.green(`Watch daemon started (PID ${child.pid}).`));
  console.log(chalk.gray(`Logs: ${logPath}`));
}

/**
 * Main watcher loop
 */
async function runWatcher() {
  const cwd = process.cwd();
  const isDaemon = process.env.CONTXT_WATCH_DAEMON === '1';

  const db = await getProjectDb(cwd);
  const project = await db.getProjectByPath(cwd);

  if (!project) {
    if (!isDaemon) console.error(chalk.red('Not a Contxt project.'));
    return;
  }

  const branch = await db.getActiveBranch(project.id);

  if (!isDaemon) {
    console.log(chalk.bold(`contxt watch`) + ` — monitoring ${project.name} (${branch})`);
    console.log('');
  }

  // Pending file batches
  const pendingFiles = new Set<string>();
  let flushTimer: NodeJS.Timeout | null = null;
  let sessionStart: Date | null = null;
  let lastActivityAt: Date | null = null;
  let sessionTimer: NodeJS.Timeout | null = null;

  // File patterns to watch
  const watchPatterns = [
    '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx',
    '**/*.py', '**/*.rb', '**/*.go', '**/*.rs', '**/*.sql',
  ];

  const ignored = [
    /(^|[/\\])\../,       // dotfiles
    /node_modules/,
    /\.contxt/,
    /dist/,
    /build/,
    /\.next/,
    /\.min\.js$/,
  ];

  const watcher = chokidar.watch(watchPatterns, {
    cwd,
    ignored,
    ignoreInitial: true,
    persistent: true,
    usePolling: false,
    interval: 1000,
  });

  // Watch .contxt/rules.md for auto-sync
  const rulesPath = join(cwd, '.contxt', 'rules.md');
  const rulesWatcher = chokidar.watch(rulesPath, { ignoreInitial: true });

  // Watch .git/HEAD for branch changes
  const gitHeadPath = join(cwd, '.git', 'HEAD');
  const gitWatcher = chokidar.watch(gitHeadPath, { ignoreInitial: true });

  // Source file change
  watcher.on('change', (filePath: string) => {
    pendingFiles.add(filePath);
    touchSession();
    scheduleFlush();
  });

  watcher.on('add', (filePath: string) => {
    pendingFiles.add(filePath);
    touchSession();
    scheduleFlush();
  });

  // rules.md changed — auto-sync
  rulesWatcher.on('change', async () => {
    log('rules', 'rules.md changed — syncing...');
    try {
      const { parseRulesFile } = await import('@mycontxt/core');
      const content = readFileSync(rulesPath, 'utf-8');
      const parsed = parseRulesFile(content);
      let synced = 0;

      const existing = await db.listEntries({ projectId: project.id, branch });
      const byTitle = new Map(existing.map((e) => [e.title, e]));

      for (const decision of parsed.decisions) {
        const ex = byTitle.get(decision.title);
        if (!ex) {
          await db.createEntry({ projectId: project.id, type: 'decision', title: decision.title, content: decision.content, metadata: decision.metadata, status: 'active' });
          synced++;
        } else if (ex.content !== decision.content) {
          await db.updateEntry(ex.id, { content: decision.content });
          synced++;
        }
      }

      log('rules', `synced ${synced} update${synced !== 1 ? 's' : ''}`);
    } catch {
      log('rules', 'sync failed');
    }
  });

  // .git/HEAD changed — branch switch
  gitWatcher.on('change', async () => {
    try {
      const headContent = readFileSync(gitHeadPath, 'utf-8').trim();
      const branchMatch = headContent.match(/^ref: refs\/heads\/(.+)$/);
      if (!branchMatch) return;

      const newBranch = branchMatch[1];
      const currentBranch = await db.getActiveBranch(project.id);
      if (newBranch === currentBranch) return;

      const branches = await db.listBranches(project.id);
      const has = branches.some((b) => b.name === newBranch);

      if (has) {
        await db.switchBranch(project.id, newBranch);
        const count = await db.countEntries({ projectId: project.id, branch: newBranch });
        log('branch', `switched to ${newBranch} (${count} entries)`);
      }
    } catch {
      // Ignore
    }
  });

  // Flush pending files — update context + scan for tags
  async function flush() {
    if (pendingFiles.size === 0) return;

    const files = Array.from(pendingFiles);
    pendingFiles.clear();

    // Update context files
    try {
      const entries = await db.listEntries({ projectId: project.id, branch, type: 'context' });
      const activeCtx = entries.find((e) => e.status === 'active');
      if (activeCtx) {
        const currentFiles: string[] = activeCtx.metadata.files || [];
        const relFiles = files.map((f) => relative(cwd, join(cwd, f)));
        const merged = Array.from(new Set([...currentFiles, ...relFiles])).slice(0, 30);
        await db.updateEntry(activeCtx.id, { metadata: { ...activeCtx.metadata, files: merged } });
      }
    } catch {
      // Ignore
    }

    // Incremental scan — check each changed file for tags
    let newDrafts = 0;
    for (const file of files) {
      try {
        const absPath = join(cwd, file);
        if (!existsSync(absPath)) continue;
        const content = readFileSync(absPath, 'utf-8');
        const comments = parseFile(content, file);
        if (comments.length === 0) continue;

        const existing = await db.listEntries({ projectId: project.id, branch });
        const hashes = new Set(existing.filter((e) => e.metadata.hash).map((e) => e.metadata.hash));

        for (const comment of comments) {
          if (!hashes.has(comment.hash)) {
            const entry = scanCommentToEntry(comment, project.id);
            await db.createEntry({ projectId: project.id, type: entry.type, title: entry.title, content: entry.content, metadata: entry.metadata, status: 'draft' });
            newDrafts++;
          }
        }
      } catch {
        // Skip bad files
      }
    }

    log('files', `${files.length} file${files.length !== 1 ? 's' : ''} ${newDrafts > 0 ? `· +${newDrafts} draft${newDrafts !== 1 ? 's' : ''}` : ''}`);

    // Auto-sync push — re-read project config in case settings changed via web UI
    try {
      const freshProject = await db.getProjectByPath(cwd);
      if (freshProject?.config.autoSync) {
        const accessToken = getAccessToken();
        if (accessToken) {
          const supabaseConfig = getSupabaseConfig();
          const dbPath = getDbPath();
          const localDb = new SQLiteDatabase(dbPath);
          await localDb.initialize();
          const remoteDb = new SupabaseDatabase({ ...supabaseConfig, accessToken });
          await remoteDb.initialize();
          const syncEngine = new SyncEngine(localDb, remoteDb);
          const result = await syncEngine.push(freshProject.id, {});
          await localDb.close();
          log('sync', `pushed ${result.pushed} entr${result.pushed !== 1 ? 'ies' : 'y'} to cloud`);
        }
      }
    } catch {
      // Never crash the watcher on sync errors — they'll retry on next flush
    }
  }

  function scheduleFlush() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, DEBOUNCE_MS);
  }

  function touchSession() {
    const now = new Date();
    lastActivityAt = now;

    if (!sessionStart) {
      sessionStart = now;
      log('session', `started`);
    }

    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(endSession, SESSION_TIMEOUT_MS);
  }

  function endSession() {
    if (!sessionStart || !lastActivityAt) return;
    const durationMin = Math.round((lastActivityAt.getTime() - sessionStart.getTime()) / 60000);
    log('session', `ended — ${durationMin} min`);
    sessionStart = null;
    lastActivityAt = null;
  }

  function log(type: string, message: string) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const line = `${time}  ${type.padEnd(8)} ${message}`;
    if (!isDaemon) {
      console.log(`  ${chalk.gray(time)}  ${chalk.cyan(type.padEnd(8))} ${message}`);
    } else {
      try {
        require('fs').appendFileSync(join(cwd, LOG_FILE), line + '\n');
      } catch {
        // Ignore log write errors
      }
    }
  }

  // Graceful shutdown
  const shutdown = async () => {
    if (flushTimer) clearTimeout(flushTimer);
    await flush();
    watcher.close();
    rulesWatcher.close();
    gitWatcher.close();
    await db.close();

    const pidFile = join(cwd, PID_FILE);
    if (existsSync(pidFile)) unlinkSync(pidFile);

    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  if (!isDaemon) {
    console.log(chalk.gray('Watching for file changes. Ctrl+C to stop.\n'));
  }
}

export const watchCommand = {
  start: startCommand,
  stop: stopCommand,
  status: statusCommand,
};
