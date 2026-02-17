/**
 * Project utilities
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { MemoryEngine } from '@mycontxt/core';

export interface ProjectContext {
  db: SQLiteDatabase;
  engine: MemoryEngine;
  projectId: string;
  projectPath: string;
}

/**
 * Get the .contxt directory path
 */
export function getContxtDir(cwd: string = process.cwd()): string {
  return join(cwd, '.contxt');
}

/**
 * Get the database file path
 */
export function getDbPath(cwd: string = process.cwd()): string {
  return join(getContxtDir(cwd), 'local.db');
}

/**
 * Check if current directory is a Contxt project
 */
export function isContxtProject(cwd: string = process.cwd()): boolean {
  const dbPath = getDbPath(cwd);
  return existsSync(dbPath);
}

/**
 * Load project context
 */
export async function loadProject(cwd: string = process.cwd()): Promise<ProjectContext> {
  if (!isContxtProject(cwd)) {
    throw new Error(
      'Not a Contxt project. Run "contxt init" to initialize.'
    );
  }

  const dbPath = getDbPath(cwd);
  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  const project = await db.getProjectByPath(cwd);
  if (!project) {
    throw new Error('Project not found in database');
  }

  const engine = new MemoryEngine(db);

  return {
    db,
    engine,
    projectId: project.id,
    projectPath: cwd,
  };
}

/**
 * Get project database instance
 */
export async function getProjectDb(cwd: string = process.cwd()): Promise<SQLiteDatabase> {
  if (!isContxtProject(cwd)) {
    throw new Error(
      'Not a Contxt project. Run "contxt init" to initialize.'
    );
  }

  const dbPath = getDbPath(cwd);
  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  return db;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
