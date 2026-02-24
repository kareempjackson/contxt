/**
 * Auto-capture tools — AI-driven passive context capture
 *
 * These tools are called by AI agents (Claude Code, etc.) during a conversation
 * to silently capture decisions and patterns the developer makes.
 * All entries are saved as drafts for human review.
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { getDbPath } from '../utils/project.js';
import { checkEntryAllowed } from '../utils/usage-gate.js';

interface AutoCaptureDecisionArgs {
  decision: string;
  rationale: string;
  category?: string;
  alternatives?: string;
  status?: string;
  conversationId?: string;
  projectPath?: string;
}

interface AutoCapturePatternArgs {
  pattern: string;
  description: string;
  category?: string;
  when?: string;
  conversationId?: string;
  projectPath?: string;
}

interface CaptureDiscussionArgs {
  type: 'decision' | 'pattern' | 'context';
  title: string;
  summary: string;
  context: string;
  rejected?: string;
  conversationId?: string;
  projectPath?: string;
}

interface UpdateSessionArgs {
  summary: string;
  filesChanged?: string[];
  decisions?: string[];
  conversationId?: string;
  projectPath?: string;
}

interface GetDraftsArgs {
  source?: string;
  projectPath?: string;
}

interface ConfirmDraftArgs {
  id: string;
  projectPath?: string;
}

/**
 * Auto-capture a decision from conversation.
 * Called by AI when it detects the developer made an architectural decision.
 */
export async function autoCaptureDecision(args: AutoCaptureDecisionArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return JSON.stringify({ status: 'error', message: 'No Contxt project found.' });
    }

    // Check usage limits (graceful degradation - never block the AI)
    const gateCheck = await checkEntryAllowed(db, project.id);
    if (!gateCheck.allowed) {
      return JSON.stringify({
        status: 'limit_reached',
        message: `Decision noted (not saved - usage limit reached).${gateCheck.message}`,
      });
    }

    const entry = await db.createEntry({
      projectId: project.id,
      type: 'decision',
      title: args.decision,
      content: args.rationale,
      metadata: {
        source: 'mcp:auto',
        category: args.category,
        alternatives: args.alternatives,
        decisionStatus: args.status || 'active',
        conversationId: args.conversationId,
        capturedAt: new Date().toISOString(),
      },
      status: 'draft',
    });

    return JSON.stringify({
      status: 'captured',
      id: entry.id,
      message: `Decision captured: ${args.decision} (draft — run \`contxt review\` to confirm)`,
    });
  } finally {
    await db.close();
  }
}

/**
 * Auto-capture a pattern from conversation.
 * Called by AI when it identifies a reusable code pattern.
 */
export async function autoCapturePattern(args: AutoCapturePatternArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return JSON.stringify({ status: 'error', message: 'No Contxt project found.' });
    }

    // Check usage limits (graceful degradation - never block the AI)
    const gateCheck = await checkEntryAllowed(db, project.id);
    if (!gateCheck.allowed) {
      return JSON.stringify({
        status: 'limit_reached',
        message: `Pattern noted (not saved - usage limit reached).${gateCheck.message}`,
      });
    }

    const entry = await db.createEntry({
      projectId: project.id,
      type: 'pattern',
      title: args.pattern,
      content: args.description,
      metadata: {
        source: 'mcp:auto',
        category: args.category,
        when: args.when,
        conversationId: args.conversationId,
        capturedAt: new Date().toISOString(),
      },
      status: 'draft',
    });

    return JSON.stringify({
      status: 'captured',
      id: entry.id,
      message: `Pattern captured: ${args.pattern} (draft — run \`contxt review\` to confirm)`,
    });
  } finally {
    await db.close();
  }
}

/**
 * Capture a discussion outcome — richer alternative to autoCaptureDecision/Pattern.
 * Use when a decision emerged from back-and-forth; captures context, what was
 * rejected, and why, in natural language rather than rigid fields.
 */
export async function captureDiscussion(args: CaptureDiscussionArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return JSON.stringify({ status: 'error', message: 'No Contxt project found.' });
    }

    // Check usage limits (graceful degradation - never block the AI)
    const gateCheck = await checkEntryAllowed(db, project.id);
    if (!gateCheck.allowed) {
      return JSON.stringify({
        status: 'limit_reached',
        message: `Discussion noted (not saved - usage limit reached).${gateCheck.message}`,
      });
    }

    const content = [
      args.summary,
      '',
      `**Context:** ${args.context}`,
      args.rejected ? `**Rejected:** ${args.rejected}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const entry = await db.createEntry({
      projectId: project.id,
      type: args.type,
      title: args.title,
      content,
      metadata: {
        source: 'mcp:discussion',
        context: args.context,
        rejected: args.rejected,
        conversationId: args.conversationId,
        capturedAt: new Date().toISOString(),
      },
      status: 'draft',
    });

    return JSON.stringify({
      status: 'captured',
      id: entry.id,
      message: `Discussion captured: ${args.title} (draft — run \`contxt review\` to confirm)`,
    });
  } finally {
    await db.close();
  }
}

/**
 * Update the active session summary.
 * Called by AI at the end of a conversation to log what was accomplished.
 */
export async function updateSession(args: UpdateSessionArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return JSON.stringify({ status: 'error', message: 'No Contxt project found.' });
    }

    const branch = await db.getActiveBranch(project.id);
    const entries = await db.listEntries({
      projectId: project.id,
      branch,
      type: 'context',
    });

    const activeContext = entries.find((e) => e.status === 'active');

    if (activeContext) {
      await db.updateEntry(activeContext.id, {
        metadata: {
          ...activeContext.metadata,
          lastSessionSummary: args.summary,
          lastSessionFiles: args.filesChanged,
          lastSessionDecisions: args.decisions,
          lastSessionAt: new Date().toISOString(),
        },
      });
    } else {
      // Check usage limits before creating new session entry
      const gateCheck = await checkEntryAllowed(db, project.id);
      if (!gateCheck.allowed) {
        return JSON.stringify({
          status: 'limit_reached',
          message: `Session noted (not saved - usage limit reached).${gateCheck.message}`,
        });
      }

      // Create a session entry as draft — consistent with all other auto-captures
      await db.createEntry({
        projectId: project.id,
        type: 'session',
        title: `Session: ${new Date().toLocaleDateString()}`,
        content: args.summary,
        metadata: {
          source: 'mcp:auto',
          filesChanged: args.filesChanged,
          decisions: args.decisions,
          conversationId: args.conversationId,
          startedAt: new Date().toISOString(),
        },
        status: 'draft',
      });
    }

    return JSON.stringify({
      status: 'updated',
      message: 'Session summary updated.',
    });
  } finally {
    await db.close();
  }
}

/**
 * Get all draft entries pending review.
 * Called by AI to surface pending drafts for the developer.
 */
export async function getDrafts(args: GetDraftsArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return JSON.stringify({ status: 'error', message: 'No Contxt project found.' });
    }

    const branch = await db.getActiveBranch(project.id);
    const allEntries = await db.listEntries({ projectId: project.id, branch });
    let drafts = allEntries.filter((e) => e.status === 'draft');

    if (args.source) {
      const sourceFilter = `mcp:${args.source}`;
      drafts = drafts.filter((e) => e.metadata.source?.includes(sourceFilter));
    }

    if (drafts.length === 0) {
      return JSON.stringify({ status: 'ok', count: 0, message: 'No drafts pending review.' });
    }

    const summary = drafts.map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      source: d.metadata.source,
      conversationId: d.metadata.conversationId,
      capturedAt: d.metadata.capturedAt || d.createdAt,
    }));

    return JSON.stringify({
      status: 'ok',
      count: drafts.length,
      drafts: summary,
      message: `${drafts.length} draft${drafts.length !== 1 ? 's' : ''} pending. Run \`contxt review\` to confirm them.`,
    });
  } finally {
    await db.close();
  }
}

/**
 * Confirm a draft entry.
 * Called by AI when the developer explicitly approves a captured draft.
 */
export async function confirmDraft(args: ConfirmDraftArgs): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const entry = await db.getEntry(args.id);
    if (!entry) {
      return JSON.stringify({ status: 'error', message: `Draft ${args.id} not found.` });
    }

    if (entry.status !== 'draft') {
      return JSON.stringify({ status: 'error', message: `Entry ${args.id} is not a draft.` });
    }

    await db.updateEntry(args.id, { status: 'active' });

    return JSON.stringify({
      status: 'confirmed',
      id: args.id,
      message: `"${entry.title}" confirmed and added to memory.`,
    });
  } finally {
    await db.close();
  }
}
