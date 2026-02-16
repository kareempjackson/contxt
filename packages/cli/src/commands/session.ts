/**
 * Session commands
 */

import type { SessionInput } from '@memocore/core';
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
    info('Run "memocore session end" when done');

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function end(options: EndOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const session = await engine.endSession(projectId, options.summary);

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

export const sessionCommand = {
  start,
  end,
  list,
  current,
};
