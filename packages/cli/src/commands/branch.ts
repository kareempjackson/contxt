/**
 * Branch Commands - Git-like branching for memory
 */

import { SQLiteDatabase } from '@memocore/adapters/sqlite';
import { getDbPath } from '../utils/project.js';

export const branchCommand = {
  /**
   * Create a new branch
   */
  async create(name: string, options: { from?: string }) {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const cwd = process.cwd();
        const project = await db.getProjectByPath(cwd);

        if (!project) {
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
          process.exit(1);
        }

        const fromBranch = options.from || (await db.getActiveBranch(project.id));

        await db.createBranch(project.id, name, fromBranch);

        console.log(`✅ Created branch '${name}' from '${fromBranch}'`);
      } finally {
        await db.close();
      }
    } catch (error) {
      console.error(
        '❌ Branch create failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },

  /**
   * List all branches
   */
  async list() {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const cwd = process.cwd();
        const project = await db.getProjectByPath(cwd);

        if (!project) {
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
          process.exit(1);
        }

        const branches = await db.listBranches(project.id);
        const activeBranch = await db.getActiveBranch(project.id);

        console.log('Branches:');
        for (const branch of branches) {
          const prefix = branch.name === activeBranch ? '* ' : '  ';
          const parent = branch.parentBranch ? ` (from ${branch.parentBranch})` : '';
          console.log(`${prefix}${branch.name}${parent}`);
        }
      } finally {
        await db.close();
      }
    } catch (error) {
      console.error(
        '❌ Branch list failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },

  /**
   * Switch to a different branch
   */
  async switch(name: string) {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const cwd = process.cwd();
        const project = await db.getProjectByPath(cwd);

        if (!project) {
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
          process.exit(1);
        }

        await db.switchBranch(project.id, name);

        console.log(`✅ Switched to branch '${name}'`);
      } finally {
        await db.close();
      }
    } catch (error) {
      console.error(
        '❌ Branch switch failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },

  /**
   * Delete a branch
   */
  async delete(name: string) {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const cwd = process.cwd();
        const project = await db.getProjectByPath(cwd);

        if (!project) {
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
          process.exit(1);
        }

        const activeBranch = await db.getActiveBranch(project.id);

        if (name === activeBranch) {
          console.error('❌ Cannot delete active branch. Switch to another branch first.');
          process.exit(1);
        }

        if (name === 'main') {
          console.error('❌ Cannot delete main branch.');
          process.exit(1);
        }

        await db.deleteBranch(project.id, name);

        console.log(`✅ Deleted branch '${name}'`);
      } finally {
        await db.close();
      }
    } catch (error) {
      console.error(
        '❌ Branch delete failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },

  /**
   * Merge a branch into current branch
   */
  async merge(sourceBranch: string) {
    try {
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      try {
        const cwd = process.cwd();
        const project = await db.getProjectByPath(cwd);

        if (!project) {
          console.error('❌ No MemoCore project found. Run `memocore init` first.');
          process.exit(1);
        }

        const targetBranch = await db.getActiveBranch(project.id);

        if (sourceBranch === targetBranch) {
          console.error('❌ Cannot merge a branch into itself.');
          process.exit(1);
        }

        // Get entries from source branch
        const sourceEntries = await db.listEntries({
          projectId: project.id,
          branch: sourceBranch,
          isArchived: false,
        });

        if (sourceEntries.length === 0) {
          console.log(`No entries to merge from '${sourceBranch}'.`);
          process.exit(0);
        }

        // Copy entries to target branch (last-write-wins)
        let merged = 0;
        for (const entry of sourceEntries) {
          // Check if entry exists in target branch
          const existing = await db.getEntry(entry.id);

          if (!existing || existing.branch !== targetBranch) {
            // Create new entry in target branch
            await db.createEntry({
              id: entry.id,
              projectId: entry.projectId,
              type: entry.type,
              title: entry.title,
              content: entry.content,
              metadata: entry.metadata,
              branch: targetBranch,
            });
            merged++;
          } else if (entry.updatedAt > existing.updatedAt) {
            // Update existing entry if source is newer
            await db.updateEntry(entry.id, {
              title: entry.title,
              content: entry.content,
              metadata: entry.metadata,
              updatedAt: entry.updatedAt,
            });
            merged++;
          }
        }

        console.log(
          `✅ Merged ${merged} entries from '${sourceBranch}' into '${targetBranch}'`
        );
      } finally {
        await db.close();
      }
    } catch (error) {
      console.error(
        '❌ Branch merge failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },
};
