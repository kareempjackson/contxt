/**
 * post-commit hook — scan commit message for decisions / context signals
 * Must complete in <200ms. No network. Local DB only.
 */

import { execSync } from 'child_process';
import { getProjectDb } from '../utils/project.js';

const DECISION_KEYWORDS = [
  'decided',
  'decision',
  'switched to',
  'migrated to',
  'migrated from',
  'replaced',
  'chose',
  'using .+ instead of',
  'instead of',
  'over .+ because',
  'picked',
];

const DECISION_PATTERN = new RegExp(DECISION_KEYWORDS.join('|'), 'i');

const CONTEXT_PREFIXES = ['feat', 'fix', 'refactor', 'arch', 'build', 'ci', 'chore'];
const CONTEXT_PATTERN = new RegExp(`^(${CONTEXT_PREFIXES.join('|')})(\\(.+\\))?:`, 'i');

export async function runPostCommit(): Promise<void> {
  try {
    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());
    if (!project) return;

    // Get the latest commit message
    const message = execSync('git log -1 --pretty=%B', {
      encoding: 'utf-8',
      timeout: 1000,
    }).trim();

    if (!message) return;

    const firstLine = message.split('\n')[0].trim();

    // Get changed files
    let changedFiles: string[] = [];
    try {
      changedFiles = execSync('git diff-tree --no-commit-id -r --name-only HEAD', {
        encoding: 'utf-8',
        timeout: 1000,
      })
        .trim()
        .split('\n')
        .filter(Boolean);
    } catch {
      // Ignore if git command fails
    }

    const commitHash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf-8',
      timeout: 1000,
    }).trim();

    const branch = await db.getActiveBranch(project.id);

    if (DECISION_PATTERN.test(firstLine)) {
      // Looks like a decision commit — save as draft
      await db.createEntry({
        projectId: project.id,
        type: 'decision',
        title: stripConventionalPrefix(firstLine),
        content: message,
        metadata: {
          source: 'hooks:post-commit',
          commit: commitHash,
          files: changedFiles,
        },
        status: 'draft',
      });
      process.stdout.write(`contxt: draft saved — "${firstLine}" (decision)\n`);
    } else if (CONTEXT_PATTERN.test(firstLine)) {
      // Conventional commit — update context files
      const existing = await db.listEntries({
        projectId: project.id,
        branch,
        type: 'context',
      });

      const activeContext = existing.find((e) => e.status === 'active');
      if (activeContext && changedFiles.length > 0) {
        const currentFiles: string[] = activeContext.metadata.files || [];
        const mergedFiles = Array.from(new Set([...currentFiles, ...changedFiles])).slice(0, 20);

        await db.updateEntry(activeContext.id, {
          metadata: {
            ...activeContext.metadata,
            files: mergedFiles,
            lastCommit: commitHash,
          },
        });
      }
    }

    await db.close();
  } catch {
    // Hooks must be silent on error
  }
}

function stripConventionalPrefix(msg: string): string {
  return msg.replace(/^(feat|fix|refactor|arch|build|ci|chore)(\(.+\))?:\s*/i, '').trim();
}
