/**
 * Sync Engine - Handles push/pull synchronization
 * Coordinates between local and remote databases
 */

import type { ILocalDatabase, IRemoteDatabase } from '../interfaces/database.js';
import type { MemoryEntry, Project, SyncResult } from '../types.js';

export interface SyncOptions {
  /**
   * Force push even if conflicts exist (last-write-wins)
   */
  force?: boolean;

  /**
   * Dry run - don't actually sync, just report what would happen
   */
  dryRun?: boolean;
}

export class SyncEngine {
  constructor(
    private local: ILocalDatabase,
    private remote: IRemoteDatabase
  ) {}

  /**
   * Push local changes to remote
   */
  async push(projectId: string, options: SyncOptions = {}): Promise<SyncResult> {
    const result: SyncResult = {
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Get project from local
      const project = await this.local.getProject(projectId);
      if (!project) {
        throw new Error('Project not found locally');
      }

      // Sync project metadata
      if (!options.dryRun) {
        await this.remote.upsertProject(project);
      }

      // Get unsynced entries
      const unsyncedEntries = await this.local.getUnsyncedEntries(projectId);

      if (unsyncedEntries.length === 0) {
        return result;
      }

      // Check for conflicts (entries modified both locally and remotely)
      const conflicts: MemoryEntry[] = [];
      if (!options.force) {
        const lastPull = await this.local.getLastPull(projectId);
        if (lastPull) {
          const remoteChanges = await this.remote.pullEntries(projectId, lastPull);
          const unsyncedIds = new Set(unsyncedEntries.map((e) => e.id));

          // Find entries that changed both locally and remotely
          for (const remoteEntry of remoteChanges) {
            if (unsyncedIds.has(remoteEntry.id)) {
              const localEntry = unsyncedEntries.find((e) => e.id === remoteEntry.id);
              if (
                localEntry &&
                localEntry.updatedAt.getTime() !== remoteEntry.updatedAt.getTime()
              ) {
                conflicts.push(localEntry);
              }
            }
          }
        }
      }

      if (conflicts.length > 0 && !options.force) {
        result.conflicts = conflicts.length;
        result.errors.push(
          `${conflicts.length} conflict(s) found. Use --force to push anyway (last-write-wins).`
        );
        return result;
      }

      // Push entries to remote
      if (!options.dryRun) {
        await this.remote.pushEntries(unsyncedEntries);

        // Trigger embedding generation for pushed entries (non-blocking)
        const pushedIds = unsyncedEntries.map((e) => e.id);
        if (typeof (this.remote as any).generateEmbeddings === 'function') {
          (this.remote as any).generateEmbeddings(pushedIds).catch(() => {});
        }

        // Mark entries as synced locally
        await this.local.markSynced(unsyncedEntries.map((e) => e.id));
      }

      result.pushed = unsyncedEntries.length;

      // Sync branches
      const branches = await this.local.listBranches(projectId);
      for (const branch of branches) {
        if (!options.dryRun) {
          await this.remote.upsertBranch(branch);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error during push'
      );
      return result;
    }
  }

  /**
   * Pull remote changes to local
   */
  async pull(projectId: string, options: SyncOptions = {}): Promise<SyncResult> {
    const result: SyncResult = {
      pushed: 0,
      pulled: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Get project from local
      const project = await this.local.getProject(projectId);
      if (!project) {
        throw new Error('Project not found locally');
      }

      // Get last pull timestamp
      const lastPull = await this.local.getLastPull(projectId);
      const since = lastPull || new Date(0); // Pull all if first time

      // Pull entries from remote
      const remoteEntries = await this.remote.pullEntries(projectId, since);

      if (remoteEntries.length === 0) {
        return result;
      }

      // Check for conflicts (entries modified locally that also changed remotely)
      const unsyncedEntries = await this.local.getUnsyncedEntries(projectId);
      const unsyncedIds = new Set(unsyncedEntries.map((e) => e.id));

      const conflicts: MemoryEntry[] = [];
      for (const remoteEntry of remoteEntries) {
        if (unsyncedIds.has(remoteEntry.id)) {
          const localEntry = unsyncedEntries.find((e) => e.id === remoteEntry.id);
          if (
            localEntry &&
            localEntry.updatedAt.getTime() !== remoteEntry.updatedAt.getTime()
          ) {
            conflicts.push(remoteEntry);
          }
        }
      }

      if (conflicts.length > 0 && !options.force) {
        result.conflicts = conflicts.length;
        result.errors.push(
          `${conflicts.length} conflict(s) found. Use --force to pull anyway (last-write-wins).`
        );
        return result;
      }

      // Upsert remote entries into local database
      // Last-write-wins: remote entries with newer updatedAt override local
      if (!options.dryRun) {
        for (const entry of remoteEntries) {
          const localEntry = await this.local.getEntry(entry.id);

          if (entry.isArchived) {
            // Entry was deleted/archived remotely — mirror locally
            if (localEntry && !localEntry.isArchived) {
              await this.local.deleteEntry(entry.id); // soft delete
            }
          } else if (!localEntry) {
            // New entry - create it
            await this.local.createEntry({
              id: entry.id,
              projectId: entry.projectId,
              type: entry.type,
              title: entry.title,
              content: entry.content,
              metadata: entry.metadata,
              branch: entry.branch,
            });
          } else if (entry.updatedAt > localEntry.updatedAt || options.force) {
            // Remote is newer or force flag - update local
            await this.local.updateEntry(entry.id, {
              title: entry.title,
              content: entry.content,
              metadata: entry.metadata,
              updatedAt: entry.updatedAt,
              isSynced: true,
            });
          }
        }

        // Update last pull timestamp
        await this.local.updateLastPull(projectId, new Date());
      }

      result.pulled = remoteEntries.length;

      return result;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown error during pull'
      );
      return result;
    }
  }

  /**
   * Full bidirectional sync (pull then push)
   */
  async sync(projectId: string, options: SyncOptions = {}): Promise<SyncResult> {
    // First pull remote changes
    const pullResult = await this.pull(projectId, options);

    if (pullResult.errors.length > 0) {
      return pullResult;
    }

    // Then push local changes
    const pushResult = await this.push(projectId, options);

    // Combine results
    return {
      pushed: pushResult.pushed,
      pulled: pullResult.pulled,
      conflicts: pullResult.conflicts + pushResult.conflicts,
      errors: [...pullResult.errors, ...pushResult.errors],
    };
  }
}
