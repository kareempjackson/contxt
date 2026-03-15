/**
 * Session commands
 */

import inquirer from 'inquirer';
import type { SessionInput } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error, info, formatEntry, formatEntryList, section } from '../utils/output.js';

interface StartOptions {
  feature: string;
  description?: string;
}

interface EndOptions {
  summary?: string;
}

interface ListOptions {
  branch?: string;
}

async function start(options: StartOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const input: SessionInput = {
      feature: options.feature,
      description: options.description,
    };

    const session = await engine.startSession(projectId, input);

    success(`Started session: ${session.title}`);
    console.log(`ID: ${session.id}`);
    info('Run "contxt session end" when done');

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function end(options: EndOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    let summary = options.summary;
    if (!summary) {
      const { input } = await inquirer.prompt([{
        type: 'input',
        name: 'input',
        message: 'Session summary (optional — press Enter to skip):',
      }]);
      summary = input.trim() || undefined;
    }

    const session = await engine.endSession(projectId, summary);

    success(`Ended session: ${session.title}`);

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function list(options: ListOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const sessions = await engine.listSessions(projectId, options.branch);

    console.log(section('Sessions'));
    console.log();
    console.log(formatEntryList(sessions));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function current(): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const session = await engine.getActiveSession(projectId);

    if (!session) {
      info('No active session');
      await db.close();
      return;
    }

    console.log(formatEntry(session));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

interface EventOptions {
  type: string;
  summary: string;
}

async function event(options: EventOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const activeSession = await engine.getActiveSession(projectId);
    const sessionId = activeSession?.id || 'no_session';

    db.insertSessionEvent({
      sessionId,
      eventType: options.type,
      summary: options.summary,
    });

    // Rolling snapshot every 10 events
    if (activeSession) {
      const count = db.countSessionEvents(sessionId);
      if (count % 10 === 0) {
        // Trigger snapshot update silently
        const events = db.getSessionEvents(sessionId);
        const decisions = events.filter((e: any) => e.eventType === 'decision_made').map((e: any) => `- ${e.summary}`);
        const files = events.filter((e: any) => e.eventType === 'file_edited').map((e: any) => `- ${e.summary}`);
        const snapshot = [
          `## Session Resume — ${activeSession.title}`,
          decisions.length > 0 ? `### Decisions:\n${decisions.slice(0, 10).join('\n')}` : '',
          files.length > 0 ? `### Files touched:\n${[...new Set(files)].slice(0, 10).join('\n')}` : '',
        ].filter(Boolean).join('\n');
        await db.updateEntry(activeSession.id, {
          metadata: { ...activeSession.metadata, latestSnapshot: snapshot, snapshotAt: new Date().toISOString() },
        });
      }
    }

    await db.close();
  } catch {
    // Silent — called from hooks, must never crash
    process.exit(0);
  }
}

export const sessionCommand = {
  start,
  end,
  list,
  current,
  event,
};
