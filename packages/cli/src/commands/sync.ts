/**
 * Sync Commands - Push/pull memory to/from cloud
 */

import { SQLiteDatabase } from '@memocore/adapters/sqlite';
import { SupabaseDatabase } from '@memocore/adapters/supabase';
import { SyncEngine } from '@memocore/core';
import { getDbPath } from '../utils/project.js';
import { getAccessToken } from './auth.js';

/**
 * Get Supabase config from environment
 */
function getSupabaseConfig() {
  const url = process.env.MEMOCORE_SUPABASE_URL;
  const anonKey = process.env.MEMOCORE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase configuration missing. Set MEMOCORE_SUPABASE_URL and MEMOCORE_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return { url, anonKey };
}

export const syncCommand = {
  /**
   * Push local changes to cloud
   */
  async push(options: { force?: boolean; dryRun?: boolean }) {
    try {
      // Check authentication
      const accessToken = getAccessToken();
      if (!accessToken) {
        console.error('❌ Not authenticated. Run `memocore auth login` first.');
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
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
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

        console.log('🔄 Pushing local changes to cloud...\n');

        // Push changes
        const result = await syncEngine.push(project.id, {
          force: options.force,
          dryRun: options.dryRun,
        });

        if (result.errors.length > 0) {
          console.error('❌ Push failed:');
          result.errors.forEach((err) => console.error(`   ${err}`));
          process.exit(1);
        }

        if (options.dryRun) {
          console.log(`📋 Dry run - would push ${result.pushed} entries`);
        } else {
          console.log(`✅ Successfully pushed ${result.pushed} entries`);
        }

        if (result.conflicts > 0) {
          console.log(
            `⚠️  ${result.conflicts} conflict(s) detected. Use --force to override.`
          );
        }

        await remoteDb.close();
      } finally {
        await localDb.close();
      }
    } catch (error) {
      console.error(
        '❌ Push failed:',
        error instanceof Error ? error.message : error
      );
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
        console.error('❌ Not authenticated. Run `memocore auth login` first.');
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
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
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

        console.log('🔄 Pulling remote changes to local...\n');

        // Pull changes
        const result = await syncEngine.pull(project.id, {
          force: options.force,
          dryRun: options.dryRun,
        });

        if (result.errors.length > 0) {
          console.error('❌ Pull failed:');
          result.errors.forEach((err) => console.error(`   ${err}`));
          process.exit(1);
        }

        if (options.dryRun) {
          console.log(`📋 Dry run - would pull ${result.pulled} entries`);
        } else {
          console.log(`✅ Successfully pulled ${result.pulled} entries`);
        }

        if (result.conflicts > 0) {
          console.log(
            `⚠️  ${result.conflicts} conflict(s) detected. Use --force to override.`
          );
        }

        await remoteDb.close();
      } finally {
        await localDb.close();
      }
    } catch (error) {
      console.error(
        '❌ Pull failed:',
        error instanceof Error ? error.message : error
      );
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
        console.error('❌ Not authenticated. Run `memocore auth login` first.');
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
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
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

        console.log('🔄 Syncing with cloud (pull + push)...\n');

        // Full sync
        const result = await syncEngine.sync(project.id, {
          force: options.force,
          dryRun: options.dryRun,
        });

        if (result.errors.length > 0) {
          console.error('❌ Sync failed:');
          result.errors.forEach((err) => console.error(`   ${err}`));
          process.exit(1);
        }

        if (options.dryRun) {
          console.log(
            `📋 Dry run - would pull ${result.pulled} and push ${result.pushed} entries`
          );
        } else {
          console.log(`✅ Successfully synced`);
          console.log(`   Pulled: ${result.pulled} entries`);
          console.log(`   Pushed: ${result.pushed} entries`);
        }

        if (result.conflicts > 0) {
          console.log(
            `⚠️  ${result.conflicts} conflict(s) detected. Use --force to override.`
          );
        }

        await remoteDb.close();
      } finally {
        await localDb.close();
      }
    } catch (error) {
      console.error(
        '❌ Sync failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },
};
