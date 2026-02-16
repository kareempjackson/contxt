/**
 * Status command - Show project overview
 */

import chalk from 'chalk';
import { loadProject } from '../utils/project.js';
import { error, section, divider } from '../utils/output.js';

export async function statusCommand(): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const project = await db.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const activeBranch = await db.getActiveBranch(projectId);
    const branches = await db.listBranches(projectId);

    // Get entry counts by type
    const decisions = await engine.listDecisions(projectId);
    const patterns = await engine.listPatterns(projectId);
    const documents = await engine.listDocuments(projectId);
    const sessions = await engine.listSessions(projectId);
    const context = await engine.getContext(projectId);

    // Get unsynced count
    const unsynced = await db.getUnsyncedEntries(projectId);

    console.log();
    console.log(section('Project Status'));
    console.log();
    console.log(chalk.bold('Name:'), project.name);
    console.log(chalk.bold('Path:'), project.path);
    console.log(chalk.bold('ID:'), project.id);
    console.log();

    console.log(section('Branches'));
    console.log();
    for (const branch of branches) {
      const marker = branch.name === activeBranch ? chalk.green('●') : ' ';
      console.log(`  ${marker} ${branch.name}`);
    }
    console.log();

    console.log(section('Memory Entries'));
    console.log();
    console.log(`  Decisions:  ${decisions.length}`);
    console.log(`  Patterns:   ${patterns.length}`);
    console.log(`  Documents:  ${documents.length}`);
    console.log(`  Sessions:   ${sessions.length}`);
    console.log(`  Total:      ${decisions.length + patterns.length + documents.length + sessions.length}`);
    console.log();

    if (context) {
      console.log(section('Current Context'));
      console.log();
      if (context.metadata.feature) {
        console.log(chalk.bold('Feature:'), context.metadata.feature);
      }
      if (context.metadata.blockers?.length > 0) {
        console.log(chalk.bold('Blockers:'));
        context.metadata.blockers.forEach((b: string) => console.log(`  - ${b}`));
      }
      if (context.metadata.nextSteps?.length > 0) {
        console.log(chalk.bold('Next Steps:'));
        context.metadata.nextSteps.forEach((s: string) => console.log(`  - ${s}`));
      }
      console.log();
    }

    if (unsynced.length > 0) {
      console.log(chalk.yellow(`⚠ ${unsynced.length} unsynced entries`));
      console.log(chalk.dim('  Run "memocore push" to sync'));
      console.log();
    }

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}
