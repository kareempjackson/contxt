/**
 * Project utilities for MCP server
 */

import { join } from 'path';

/**
 * Get the .memocore directory path
 */
export function getMemocoreDir(cwd: string): string {
  return join(cwd, '.memocore');
}

/**
 * Get the database file path
 */
export function getDbPath(cwd: string): string {
  return join(getMemocoreDir(cwd), 'local.db');
}
