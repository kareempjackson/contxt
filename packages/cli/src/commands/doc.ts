/**
 * Document commands
 */

import { readFileSync } from 'fs';
import type { DocumentInput } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error, formatEntry, formatEntryList, section } from '../utils/output.js';

interface AddOptions {
  title: string;
  content?: string;
  file?: string;
  url?: string;
  tags?: string[];
}

interface ListOptions {
  branch?: string;
}

async function add(options: AddOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    let content = options.content || '';

    // If file is provided, read it
    if (options.file) {
      try {
        content = readFileSync(options.file, 'utf-8');
      } catch (err) {
        error(`Failed to read file: ${(err as Error).message}`);
        process.exit(1);
      }
    }

    if (!content) {
      error('Either --content or --file is required');
      process.exit(1);
    }

    const input: DocumentInput = {
      title: options.title,
      content,
      url: options.url,
      tags: options.tags,
    };

    const entry = await engine.addDocument(projectId, input);

    success(`Added document: ${entry.title}`);
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

    const documents = await engine.listDocuments(projectId, options.branch);

    console.log(section('Documents'));
    console.log();
    console.log(formatEntryList(documents));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

async function show(id: string): Promise<void> {
  try {
    const { engine, db } = await loadProject();

    const document = await engine.getDocument(id);

    console.log(formatEntry(document));

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

export const docCommand = {
  add,
  list,
  show,
};
