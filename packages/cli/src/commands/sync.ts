/**
 * Sync Commands - Push/pull memory to/from cloud
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { SyncEngine } from '@mycontxt/core';
import { getDbPath } from '../utils/project.js';
import { getAccessToken } from './auth.js';
import { getSupabaseConfig } from '../config.js';
import { success, error as outputError, warn, loading, dryRun, conflict } from '../utils/output.js';

export const syncCommand = {
  /**
   * Push local changes to cloud
   */
  async push(options: { force?: boolean; dryRun?: boolean }) {
    try {
      // Check authentication
      const accessToken = getAccessToken();
      if (!accessToken) {
        outputError('Not authenticated. Run `contxt auth login` first.');
        process.exit(1);
      }

      // Get local database
      const dbPath = getDbPath();
      const localDb = new SQLiteDatabase(dbPath);
      await localDb.initialize();

      try {
        // Get project
        const cwd = process.cwd();
        const project = await localDb.getProjectByPath(cwd);

        if (!project) {
          outputError('No Contxt project found. Run `contxt init` first.');
          process.exit(1);
        }

        // Initialize remote database
        const supabaseConfig = getSupabaseConfig();
        const remoteDb = new SupabaseDatabase({
          ...supabaseConfig,
          accessToken,
        });
        await remoteDb.initialize();

        // Create sync engine
        const syncEngine = new SyncEngine(localDb, remoteDb);

        loading('Pushing local changes to cloud...');
        console.log('');

        // Push changes
        const result = await syncEngine.push(project.id, {
          force: options.force,
          dryRun: options.dryRun,
        });

        if (result.errors.length > 0) {
          outputError('Push failed:');
          result.errors.forEach((err) => console.error(`   ${err}`));
          process.exit(1);
        }

        if (options.dryRun) {
          dryRun(`Dry run — would push ${result.pushed} entries`);
        } else {
          success(`Pushed ${result.pushed} entries`);
        }

        if (result.conflicts > 0) {
          conflict(`${result.conflicts} conflict(s) detected. Use --force to override.`);
        }

        await remoteDb.close();
      } finally {
        await localDb.close();
      }
    } catch (err) {
      outputError(`Push failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },

  /**
   * Pull remote changes to local
   */
  async pull(options: { force?: boolean; dryRun?: boolean }) {
    try {
      // Check authentication
      const accessToken = getAccessToken();
      if (!accessToken) {
        outputError('Not authenticated. Run `contxt auth login` first.');
        process.exit(1);
      }

      // Get local database
      const dbPath = getDbPath();
      const localDb = new SQLiteDatabase(dbPath);
      await localDb.initialize();

      try {
        // Get project
        const cwd = process.cwd();
        const project = await localDb.getProjectByPath(cwd);

        if (!project) {
          outputError('No Contxt project found. Run `contxt init` first.');
          process.exit(1);
        }

        // Initialize remote database
        const supabaseConfig = getSupabaseConfig();
        const remoteDb = new SupabaseDatabase({
          ...supabaseConfig,
          accessToken,
        });
        await remoteDb.initialize();

        // Create sync engine
        const syncEngine = new SyncEngine(localDb, remoteDb);

        loading('Pulling remote changes to local...');
        console.log('');

        // Pull changes
        const result = await syncEngine.pull(project.id, {
          force: options.force,
          dryRun: options.dryRun,
        });

        if (result.errors.length > 0) {
          outputError('Pull failed:');
          result.errors.forEach((err) => console.error(`   ${err}`));
          process.exit(1);
        }

        if (options.dryRun) {
          dryRun(`Dry run — would pull ${result.pulled} entries`);
        } else {
          success(`Pulled ${result.pulled} entries`);
        }

        if (result.conflicts > 0) {
          conflict(`${result.conflicts} conflict(s) detected. Use --force to override.`);
        }

        await remoteDb.close();
      } finally {
        await localDb.close();
      }
    } catch (err) {
      outputError(`Pull failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },

  /**
   * Full bidirectional sync
   */
  async sync(options: { force?: boolean; dryRun?: boolean }) {
    try {
      // Check authentication
      const accessToken = getAccessToken();
      if (!accessToken) {
        outputError('Not authenticated. Run `contxt auth login` first.');
        process.exit(1);
      }

      // Get local database
      const dbPath = getDbPath();
      const localDb = new SQLiteDatabase(dbPath);
      await localDb.initialize();

      try {
        // Get project
        const cwd = process.cwd();
        const project = await localDb.getProjectByPath(cwd);

        if (!project) {
          outputError('No Contxt project found. Run `contxt init` first.');
          process.exit(1);
        }

        // Initialize remote database
        const supabaseConfig = getSupabaseConfig();
        const remoteDb = new SupabaseDatabase({
          ...supabaseConfig,
          accessToken,
        });
        await remoteDb.initialize();

        // Create sync engine
        const syncEngine = new SyncEngine(localDb, remoteDb);

        loading('Syncing with cloud (pull + push)...');
        console.log('');

        // Full sync
        const result = await syncEngine.sync(project.id, {
          force: options.force,
          dryRun: options.dryRun,
        });

        if (result.errors.length > 0) {
          outputError('Sync failed:');
          result.errors.forEach((err) => console.error(`   ${err}`));
          process.exit(1);
        }

        if (options.dryRun) {
          dryRun(`Dry run — would pull ${result.pulled} and push ${result.pushed} entries`);
        } else {
          success('Synced successfully');
          console.log(`   Pulled: ${result.pulled} entries`);
          console.log(`   Pushed: ${result.pushed} entries`);
        }

        if (result.conflicts > 0) {
          conflict(`${result.conflicts} conflict(s) detected. Use --force to override.`);
        }

        await remoteDb.close();
      } finally {
        await localDb.close();
      }
    } catch (err) {
      outputError(`Sync failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },
};
