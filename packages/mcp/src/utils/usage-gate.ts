/**
 * Usage gate utilities for MCP server
 * MCP MUST NEVER throw errors - always degrade gracefully
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { UsageGate, type UsageCounts } from '@mycontxt/core/engine/usage';
import { resolveUserPlan } from '@mycontxt/core/engine/plan-resolver';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';

const AUTH_FILE = join(homedir(), '.contxt', 'auth.json');

interface AuthData {
  accessToken: string;
  userId: string;
  email: string;
}

/**
 * Get current authenticated user ID
 */
function getCurrentUserId(): string | null {
  if (!existsSync(AUTH_FILE)) return null;

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
 */
function getRemoteDb(): SupabaseDatabase | null {
  if (!existsSync(AUTH_FILE)) return null;

  try {
    const content = readFileSync(AUTH_FILE, 'utf-8');
    const auth: AuthData = JSON.parse(content);

    return new SupabaseDatabase({
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
      accessToken: auth.accessToken,
    });
  } catch {
    return null;
  }
}

/**
 * Get usage counts for gate enforcement
 */
async function getUsageCounts(
  localDb: any,
  userId: string | null,
  projectId?: string
): Promise<UsageCounts> {
  const projectCountQuery = 'SELECT COUNT(*) as count FROM projects';
  const projectRow = localDb.db.prepare(projectCountQuery).get() as any;
  const totalProjects = projectRow.count;

  const totalEntriesQuery = 'SELECT COUNT(*) as count FROM memory_entries WHERE is_archived = 0';
  const totalEntriesRow = localDb.db.prepare(totalEntriesQuery).get() as any;
  const totalEntries = totalEntriesRow.count;

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
    totalSeats: 1,
  };
}

/**
 * Check if entry creation is allowed
 * Returns { allowed: true } or { allowed: false, message: string }
 */
export async function checkEntryAllowed(
  localDb: any,
  projectId?: string
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const userId = getCurrentUserId();
    const remoteDb = getRemoteDb();

    const planId = await resolveUserPlan(localDb, remoteDb, userId);
    const gate = new UsageGate(planId, () => getUsageCounts(localDb, userId, projectId));

    const result = await gate.checkEntryCreate();

    if (!result.allowed) {
      return {
        allowed: false,
        message: `\n\n---\n💡 ${result.reason}\n${result.upgradeHint}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    // On error, allow the operation (fail open)
    console.error('Usage gate error:', error);
    return { allowed: true };
  }
}

/**
 * Check if a feature is enabled
 * Returns { allowed: true } or { allowed: false, message: string }
 */
export async function checkFeatureAllowed(
  localDb: any,
  feature: 'semanticSearchEnabled' | 'smartSuggestEnabled' | 'branchingEnabled'
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const userId = getCurrentUserId();
    const remoteDb = getRemoteDb();

    const planId = await resolveUserPlan(localDb, remoteDb, userId);
    const gate = new UsageGate(planId, () => getUsageCounts(localDb, userId));

    const result = gate.checkFeature(feature);

    if (!result.allowed) {
      return {
        allowed: false,
        message: `\n\n---\n💡 ${result.reason}\n${result.upgradeHint}`,
      };
    }

    return { allowed: true };
  } catch (error) {
    // On error, allow the operation (fail open)
    console.error('Feature gate error:', error);
    return { allowed: true };
  }
}
