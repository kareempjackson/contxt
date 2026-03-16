/**
 * Context commands
 */

import type { ContextInput } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error, formatEntry, info } from '../utils/output.js';

interface SetOptions {
  feature?: string;
  blockers?: string[];
  next?: string[];
  files?: string[];
}

async function set(featureArg: string | undefined, options: SetOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const input: ContextInput = {
      feature: featureArg || options.feature,
      blockers: options.blockers,
      nextSteps: options.next,
      activeFiles: options.files,
    };

    const entry = await engine.setContext(projectId, input);

    success('Updated project context');

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function show(): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const context = await engine.getContext(projectId);

    if (!context) {
      info('No context set. Use "contxt context set" to set context.');
      await db.close();
      return;
    }

    console.log(formatEntry(context));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function clear(): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const context = await engine.getContext(projectId);

    if (context) {
      await engine.deleteEntry(context.id);
      success('Cleared project context');
    } else {
      info('No context to clear');
    }

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

export const contextCommand = {
  set,
  show,
  clear,
};
