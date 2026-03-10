/**
 * `contxt add` — single smart capture command
 * Classifies free-form text into the right entry type automatically.
 */

import { classifyEntry } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error } from '../utils/output.js';
import readline from 'readline';

interface AddOptions {
  type?: 'decision' | 'pattern' | 'context' | 'document';
  tags?: string[];
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function pickType(): Promise<'decision' | 'pattern' | 'context' | 'document'> {
  const types = ['decision', 'pattern', 'context', 'document'] as const;
  console.log('');
  console.log('  Pick a type:');
  types.forEach((t, i) => console.log(`    ${i + 1}. ${t}`));
  const answer = await prompt('\n  › ');
  const index = parseInt(answer, 10) - 1;
  if (index >= 0 && index < types.length) return types[index];
  // try matching by name
  const match = types.find((t) => t.startsWith(answer.toLowerCase()));
  return match || 'document';
}

export async function addCommand(text: string, options: AddOptions): Promise<void> {
  if (!text?.trim()) {
    error('Please provide text to capture.');
    process.exit(1);
  }

  try {
    const { engine, projectId, db } = await loadProject();

    // Determine type
    let classified = classifyEntry(text);
    let entryType: 'decision' | 'pattern' | 'context' | 'document' = classified.type;
    let title = classified.title;
    let content = classified.content;

    if (options.type) {
      // --type flag bypasses classification entirely
      entryType = options.type;
    } else {
      // Show classification and ask user to confirm
      console.log('');
      console.log(`  Classified as: ${entryType}`);
      const answer = await prompt(`  Save as ${entryType}? (Y/n/type) › `);

      if (answer.toLowerCase() === 'n') {
        console.log('  Discarded.');
        await db.close();
        return;
      }

      if (answer.toLowerCase() === 'type') {
        entryType = await pickType();
      }
      // Y or empty = accept as-is
    }

    // Route to the right engine method
    let entry;
    if (entryType === 'decision') {
      entry = await engine.addDecision(projectId, {
        title,
        rationale: content,
        tags: options.tags,
      });
    } else if (entryType === 'pattern') {
      entry = await engine.addPattern(projectId, {
        title,
        content,
        tags: options.tags,
      });
    } else if (entryType === 'context') {
      entry = await engine.setContext(projectId, { feature: title });
    } else {
      entry = await engine.addDocument(projectId, {
        title,
        content,
        tags: options.tags,
      });
    }

    console.log('');
    success(`${entryType.charAt(0).toUpperCase() + entryType.slice(1)} saved: "${entry.title}"`);

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}
