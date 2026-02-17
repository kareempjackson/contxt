/**
 * prepare-commit-msg hook — inject active context as comments in commit message template
 */

import { readFileSync, writeFileSync } from 'fs';
import { getProjectDb } from '../utils/project.js';

export async function runPrepareCommitMsg(): Promise<void> {
  try {
    // $1 = path to commit message file, $2 = source (message, template, merge, squash, commit)
    const commitMsgFile = process.argv[4];
    const source = process.argv[5]; // e.g. "message", "template"

    // Only inject for interactive commits (not merge, squash, etc.)
    if (source && source !== 'template' && source !== '') return;
    if (!commitMsgFile) return;

    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());
    if (!project) return;

    const branch = await db.getActiveBranch(project.id);
    const entries = await db.listEntries({
      projectId: project.id,
      branch,
    });

    // Get active context
    const context = entries.find((e) => e.type === 'context' && e.status === 'active');
    // Get 3 most recent decisions
    const recentDecisions = entries
      .filter((e) => e.type === 'decision' && e.status === 'active')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    if (!context && recentDecisions.length === 0) {
      await db.close();
      return;
    }

    // Build the comment block
    const lines: string[] = [
      '',
      '# --- Contxt ---',
    ];

    if (context) {
      const feature = context.metadata.feature || context.content.split('\n')[0];
      lines.push(`# Feature: ${feature}`);
      if (context.metadata.blockers?.length) {
        lines.push(`# Blockers: ${context.metadata.blockers.join(', ')}`);
      }
    }

    if (recentDecisions.length > 0) {
      const decisionList = recentDecisions.map((d) => d.title).join(', ');
      lines.push(`# Recent decisions: ${decisionList}`);
    }

    // Draft count
    const draftCount = entries.filter((e) => e.status === 'draft').length;
    if (draftCount > 0) {
      lines.push(`# ${draftCount} drafts pending — run \`contxt review\``);
    }

    lines.push('#');

    // Append to commit message file
    const existing = readFileSync(commitMsgFile, 'utf-8');
    writeFileSync(commitMsgFile, existing + lines.join('\n') + '\n', 'utf-8');

    await db.close();
  } catch {
    // Silent on error — never block a commit
  }
}
