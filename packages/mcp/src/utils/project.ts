/**
 * Project utilities for MCP server
 */

import { join } from 'path';

/**
 * Get the .contxt directory path
 */
export function getContxtDir(cwd: string): string {
  return join(cwd, '.contxt');
}

/**
 * Get the database file path
 */
export function getDbPath(cwd: string): string {
  return join(getContxtDir(cwd), 'local.db');
}
