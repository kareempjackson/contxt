/**
 * History Commands - Version history and time travel
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { getDbPath } from '../utils/project.js';
import { success, error as outputError, section } from '../utils/output.js';

export const historyCommand = {
  /**
   * Show version history for an entry
   */
  async show(entryId: string) {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const entry = await db.getEntry(entryId);

        if (!entry) {
          outputError('Entry not found.');
          process.exit(1);
        }

        const versions = await db.getVersionHistory(entryId);

        console.log(section(`Version History: ${entry.title}`));
        console.log('');
        console.log(`Current (v${entry.version}):`);
        console.log(`  Updated: ${entry.updatedAt.toLocaleString()}`);
        console.log(`  Title: ${entry.title}`);
        console.log(`  Content: ${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}`);
        console.log('');

        if (versions.length > 0) {
          console.log('Previous versions:');
          for (const version of versions) {
            console.log(`\nv${version.version}:`);
            console.log(`  Updated: ${version.updatedAt.toLocaleString()}`);
            console.log(`  Title: ${version.title}`);
            console.log(
              `  Content: ${version.content.substring(0, 100)}${version.content.length > 100 ? '...' : ''}`
            );
          }
        } else {
          console.log('No previous versions.');
        }
      } finally {
        await db.close();
      }
    } catch (err) {
      outputError(`History failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },

  /**
   * Restore an entry to a previous version
   */
  async restore(entryId: string, options: { version: number }) {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const restored = await db.restoreVersion(entryId, options.version);

        success(`Restored '${restored.title}' to version ${options.version}`);
        console.log(`   Current version is now: v${restored.version}`);
      } finally {
        await db.close();
      }
    } catch (err) {
      outputError(`Restore failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },
};
