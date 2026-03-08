/**
 * Decision commands
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import type { DecisionInput } from '@mycontxt/core';
import { loadProject } from '../utils/project.js';
import { success, error, info, formatEntry, formatEntryList, section } from '../utils/output.js';
import { createUsageGate, enforceGate } from '../utils/usage-gate.js';

interface AddOptions {
  title: string;
  rationale?: string;
  alternatives?: string[];
  consequences?: string[];
  tags?: string[];
}

interface ListOptions {
  branch?: string;
}

/**
 * Call OpenAI to infer a rationale for a decision based on the title
 * and existing context entries from the project.
 */
async function inferRationale(title: string, context: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a software architect helping a developer document architectural decisions.

The developer made this decision: "${title}"

${context ? `Here are related decisions already in the project for context:\n${context}\n` : ''}
Write a concise, specific rationale (1–3 sentences) explaining why this decision was likely made. Be direct and technical. Do not repeat the title. Return only the rationale text, no preamble.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as any;
    const text: string = data.choices?.[0]?.message?.content?.trim() ?? '';
    return text || null;
  } catch {
    return null;
  }
}

async function add(options: AddOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    // Check usage limits before creating entry
    const gate = await createUsageGate(db, projectId);
    const result = await gate.checkEntryCreate();
    enforceGate(result);

    let rationale = options.rationale;

    // Infer rationale if not provided
    if (!rationale) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        info('Add OPENAI_API_KEY to enable rationale inference.');
      } else {
        process.stdout.write(chalk.dim('  Inferring rationale... '));

        // Build context from last 5 decisions
        const branch = await db.getActiveBranch(projectId);
        const existing = await db.listEntries({ projectId, branch, type: 'decision', isArchived: false });
        const contextSnippet = existing
          .slice(0, 5)
          .map((e) => `- ${e.title}: ${e.content}`)
          .join('\n');

        const inferred = await inferRationale(options.title, contextSnippet);
        process.stdout.write('\n');

        if (inferred) {
          console.log('');
          console.log(chalk.cyan('  Suggested rationale:'));
          console.log(chalk.white(`  "${inferred}"`));
          console.log('');

          const { choice } = await inquirer.prompt([{
            type: 'list',
            name: 'choice',
            message: 'Use this rationale?',
            choices: [
              { name: 'Yes, use it', value: 'yes' },
              { name: 'No, save without rationale', value: 'no' },
              { name: 'Edit manually', value: 'edit' },
            ],
            default: 'yes',
          }]);

          if (choice === 'yes') {
            rationale = inferred;
          } else if (choice === 'edit') {
            const { manual } = await inquirer.prompt([{
              type: 'input',
              name: 'manual',
              message: 'Enter rationale:',
              default: inferred,
            }]);
            rationale = manual || inferred;
          }
          // 'no' → rationale stays undefined → saved with blank content
        }
      }
    }

    const input: DecisionInput = {
      title: options.title,
      rationale,
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
