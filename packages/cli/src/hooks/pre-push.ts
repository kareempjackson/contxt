/**
 * pre-push hook — summarize session and optionally sync to cloud
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getProjectDb } from '../utils/project.js';

export async function runPrePush(): Promise<void> {
  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());
    if (!project) return;

    // Count commits since last push (approximate via unpushed commits)
    let commitCount = 0;
    let changedFiles: string[] = [];

    try {
      const unpushed = execSync('git cherry -v @{upstream} 2>/dev/null || git log --oneline origin/HEAD..HEAD 2>/dev/null', {
        encoding: 'utf-8',
        timeout: 2000,
      }).trim();

      commitCount = unpushed ? unpushed.split('\n').filter(Boolean).length : 0;
    } catch {
      // No upstream or first push
      try {
        commitCount = parseInt(
          execSync('git rev-list --count HEAD', { encoding: 'utf-8', timeout: 1000 }).trim(),
          10
        );
      } catch {
        commitCount = 0;
      }
    }

    try {
      changedFiles = execSync('git diff --name-only @{upstream}..HEAD 2>/dev/null', {
        encoding: 'utf-8',
        timeout: 2000,
      })
        .trim()
        .split('\n')
        .filter(Boolean);
    } catch {
      // Ignore
    }

    // Update context session summary
    const branch = await db.getActiveBranch(project.id);
    const existing = await db.listEntries({
      projectId: project.id,
      branch,
      type: 'context',
    });

    const activeContext = existing.find((e) => e.status === 'active');
    if (activeContext) {
      await db.updateEntry(activeContext.id, {
        metadata: {
          ...activeContext.metadata,
          lastPush: new Date().toISOString(),
          commitsPushed: (activeContext.metadata.commitsPushed || 0) + commitCount,
          filesPushed: changedFiles,
        },
      });
    }

    process.stdout.write(
      `contxt: session updated — ${commitCount} commit${commitCount !== 1 ? 's' : ''}, ${changedFiles.length} files changed\n`
    );

    // Check if auto-push is enabled
    const configPath = join(process.cwd(), '.contxt', 'config.json');
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        if (config.hooks?.auto_push_on_push) {
          process.stdout.write('contxt: syncing to cloud...\n');
          // Sync is async — fire and forget (don't block git push)
          execSync('contxt push --quiet 2>/dev/null', {
            timeout: 10000,
            encoding: 'utf-8',
          });
          process.stdout.write('contxt: ✓ synced\n');
        }
      } catch {
        // Config parse error or push failure — don't block the push
      }
    }

    await db.close();
  } catch {
    // Hooks must be silent on error
  }
}
