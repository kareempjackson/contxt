/**
 * Bootstrap command - Learn an existing codebase and generate initial memory entries.
 * Can also be re-run with --force to refresh bootstrap entries.
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { runBootstrap } from '@mycontxt/core';
import { getDbPath, isContxtProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';

interface BootstrapOptions {
  force?: boolean;
  dryRun?: boolean;
}

export async function bootstrapCommand(options: BootstrapOptions): Promise<void> {
  const cwd = process.cwd();

  if (!isContxtProject(cwd)) {
    error('Not a Contxt project. Run `contxt init` first.');
    process.exit(1);
  }

  const db = new SQLiteDatabase(getDbPath(cwd));
  await db.initialize();

  try {
    const project = await db.getProjectByPath(cwd);
    if (!project) {
      error('Could not find project in database. Run `contxt init` first.');
      process.exit(1);
    }

    // --force: remove existing bootstrap entries before regenerating
    if (options.force) {
      const all = await db.listEntries({ projectId: project.id });
      const bootstrapped = all.filter((e) => (e.metadata as any)?.source === 'bootstrap');
      if (bootstrapped.length > 0) {
        info(`Removing ${bootstrapped.length} existing bootstrap entries...`);
        for (const entry of bootstrapped) {
          await db.deleteEntry(entry.id, true);
        }
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      info('No OPENAI_API_KEY found — running in basic mode (no AI analysis)');
    }

    info('Analyzing codebase...');
    const result = await runBootstrap(cwd, apiKey);

    if (options.dryRun) {
      console.log('\nBootstrap preview (--dry-run, nothing saved):\n');
      console.log(`  context:   ${result.context.title}`);
      for (const d of result.decisions) console.log(`  decision:  ${d.title}`);
      for (const p of result.patterns) console.log(`  pattern:   ${p.title}`);
      if (result.document) console.log(`  doc:       ${result.document.title}`);
      console.log();
      return;
    }

    const meta = { source: 'bootstrap' };
    let saved = 0;

    await db.createEntry({
      projectId: project.id,
      type: 'context',
      title: result.context.title,
      content: result.context.content,
      metadata: meta,
      status: 'active',
    });
    saved++;

    for (const d of result.decisions) {
      const content = [
        d.rationale,
        d.alternatives ? `\nAlternatives: ${d.alternatives}` : '',
        d.consequences ? `\nConsequences: ${d.consequences}` : '',
      ]
        .filter(Boolean)
        .join('');
      await db.createEntry({
        projectId: project.id,
        type: 'decision',
        title: d.title,
        content,
        metadata: meta,
        status: 'active',
      });
      saved++;
    }

    for (const p of result.patterns) {
      await db.createEntry({
        projectId: project.id,
        type: 'pattern',
        title: p.title,
        content: p.content,
        metadata: { ...meta, category: p.category },
        status: 'active',
      });
      saved++;
    }

    if (result.document) {
      await db.createEntry({
        projectId: project.id,
        type: 'document',
        title: result.document.title,
        content: result.document.content,
        metadata: meta,
        status: 'active',
      });
      saved++;
    }

    success(`Bootstrap complete: ${saved} entr${saved !== 1 ? 'ies' : 'y'} saved`);
    info(`  context:   1`);
    if (result.decisions.length) info(`  decisions: ${result.decisions.length}`);
    if (result.patterns.length) info(`  patterns:  ${result.patterns.length}`);
    if (result.document) info(`  docs:      1`);
    console.log();
    info('Run `contxt load --all` to see your new context, or open Claude Code to start a session.');
  } finally {
    await db.close();
  }
}
