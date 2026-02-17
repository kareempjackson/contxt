/**
 * Pattern commands
 */

import type { PatternInput } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error, formatEntry, formatEntryList, section } from '../utils/output.js';

interface AddOptions {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

interface ListOptions {
  branch?: string;
}

async function add(options: AddOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const input: PatternInput = {
      title: options.title,
      content: options.content,
      category: options.category,
      tags: options.tags,
    };

    const entry = await engine.addPattern(projectId, input);

    success(`Added pattern: ${entry.title}`);
    console.log(`ID: ${entry.id}`);

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function list(options: ListOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const patterns = await engine.listPatterns(projectId, options.branch);

    console.log(section('Patterns'));
    console.log();
    console.log(formatEntryList(patterns));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function show(id: string): Promise<void> {
  try {
    const { engine, db } = await loadProject();

    const pattern = await engine.getPattern(id);

    console.log(formatEntry(pattern));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

export const patternCommand = {
  add,
  list,
  show,
};
