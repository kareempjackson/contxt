/**
 * Init command - Initialize a MemoCore project
 */

import { mkdirSync, existsSync } from 'fs';
import { basename } from 'path';
import { SQLiteDatabase } from '@memocore/adapters/sqlite';
import { getMemocoreDir, getDbPath, isMemocoreProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';

interface InitOptions {
  name?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    const cwd = process.cwd();

    // Check if already initialized
    if (isMemocoreProject(cwd)) {
      error('This directory is already a MemoCore project');
      process.exit(1);
    }

    // Create .memocore directory
    const memocoreDir = getMemocoreDir(cwd);
    mkdirSync(memocoreDir, { recursive: true });

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

    success(`Initialized MemoCore project: ${project.name}`);
    info(`Project ID: ${project.id}`);
    info(`Database: ${dbPath}`);
    console.log();
    console.log('Get started:');
    console.log('  memocore decision add -t "..." -r "..."');
    console.log('  memocore pattern add -t "..." -c "..."');
    console.log('  memocore status');

    await db.close();
  } catch (err) {
    error(`Failed to initialize project: ${(err as Error).message}`);
    process.exit(1);
  }
}
