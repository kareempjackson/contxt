/**
 * Init command - Initialize a Contxt project
 */

import { mkdirSync, existsSync } from 'fs';
import { basename } from 'path';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { getContxtDir, getDbPath, isContxtProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';

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
    console.log();
    console.log('Get started:');
    console.log('  contxt decision add -t "..." -r "..."');
    console.log('  contxt pattern add -t "..." -c "..."');
    console.log('  contxt status');

    await db.close();
  } catch (err) {
    error(`Failed to initialize project: ${(err as Error).message}`);
    process.exit(1);
  }
}
