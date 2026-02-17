/**
 * Decision commands
 */

import type { DecisionInput } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error, formatEntry, formatEntryList, section } from '../utils/output.js';

interface AddOptions {
  title: string;
  rationale: string;
  alternatives?: string[];
  consequences?: string[];
  tags?: string[];
}

interface ListOptions {
  branch?: string;
}

async function add(options: AddOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const input: DecisionInput = {
      title: options.title,
      rationale: options.rationale,
      alternatives: options.alternatives,
      consequences: options.consequences,
      tags: options.tags,
    };

    const entry = await engine.addDecision(projectId, input);

    success(`Added decision: ${entry.title}`);
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

    const decisions = await engine.listDecisions(projectId, options.branch);

    console.log(section('Decisions'));
    console.log();
    console.log(formatEntryList(decisions));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function show(id: string): Promise<void> {
  try {
    const { engine, db } = await loadProject();

    const decision = await engine.getDecision(id);

    console.log(formatEntry(decision));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

export const decisionCommand = {
  add,
  list,
  show,
};
