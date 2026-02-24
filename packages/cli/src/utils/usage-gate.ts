/**
 * Usage gate utilities for CLI
 * Enforces plan limits on CLI operations
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { UsageGate, type UsageCounts } from '@mycontxt/core/engine/usage';
import { resolveUserPlan, type PlanId } from '@mycontxt/core/engine/plan-resolver';
import type { ILocalDatabase, IRemoteDatabase } from '@mycontxt/core';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { getSupabaseConfig } from '../config.js';

const AUTH_FILE = join(homedir(), '.contxt', 'auth.json');

interface AuthData {
  accessToken: string;
  userId: string;
  email: string;
  githubUsername?: string;
  expiresAt?: string;
}

/**
 * Get current authenticated user ID
 * Returns null if not authenticated
 */
export function getCurrentUserId(): string | null {
  if (!existsSync(AUTH_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(AUTH_FILE, 'utf-8');
    const auth: AuthData = JSON.parse(content);
    return auth.userId;
  } catch {
    return null;
  }
}

/**
 * Get authenticated Supabase database instance
 * Returns null if not authenticated
 */
export function getRemoteDb(): IRemoteDatabase | null {
  if (!existsSync(AUTH_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(AUTH_FILE, 'utf-8');
    const auth: AuthData = JSON.parse(content);
    const config = getSupabaseConfig();

    return new SupabaseDatabase({
      url: config.url,
      anonKey: config.anonKey,
      accessToken: auth.accessToken,
    });
  } catch {
    return null;
  }
}

/**
 * Get usage counts for gate enforcement
 * Note: For SQLite, we count all local data since user_id is optional
 * For accurate cloud limits, use the remote database
 */
export async function getUsageCounts(
  localDb: any, // SQLiteDatabase with direct db access
  userId: string | null,
  projectId?: string
): Promise<UsageCounts> {
  // Count total projects (all local projects)
  const projectCountQuery = 'SELECT COUNT(*) as count FROM projects';
  const projectRow = localDb.db.prepare(projectCountQuery).get() as any;
  const totalProjects = projectRow.count;

  // Count total entries across all projects
  const totalEntriesQuery = 'SELECT COUNT(*) as count FROM memory_entries WHERE is_archived = 0';
  const totalEntriesRow = localDb.db.prepare(totalEntriesQuery).get() as any;
  const totalEntries = totalEntriesRow.count;

  // Count entries in current project (if specified)
  let entriesInProject = 0;
  if (projectId) {
    const projectEntriesQuery = 'SELECT COUNT(*) as count FROM memory_entries WHERE project_id = ? AND is_archived = 0';
    const projectEntriesRow = localDb.db.prepare(projectEntriesQuery).get(projectId) as any;
    entriesInProject = projectEntriesRow.count;
  }

  return {
    totalProjects,
    totalEntries,
    entriesInProject,
    totalSeats: 1, // Single user for now
  };
}

/**
 * Create a usage gate with current user's plan
 */
export async function createUsageGate(
  localDb: any, // SQLiteDatabase instance
  projectId?: string
): Promise<UsageGate> {
  const userId = getCurrentUserId();
  const remoteDb = getRemoteDb();

  const planId = await resolveUserPlan(localDb, remoteDb, userId);

  return new UsageGate(planId, () => getUsageCounts(localDb, userId, projectId));
}

/**
 * Check a gate result and exit with error if blocked
 * @param result The gate check result
 */
export function enforceGate(result: { allowed: true } | { allowed: false; reason: string; limit: number | null; current: number; upgradeHint: string }): void {
  if (!result.allowed) {
    console.error(chalk.red(`\n✖ ${result.reason}`));
    console.error(chalk.dim(`  Current: ${result.current} / Limit: ${result.limit === null ? '∞' : result.limit}`));
    console.error(chalk.cyan(`\n  ${result.upgradeHint}\n`));
    process.exit(1);
  }
}
