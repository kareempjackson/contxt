/**
 * Stats command — Usage analytics and benchmarks (Feature 3)
 */

import chalk from 'chalk';
import { loadProject } from '../utils/project.js';
import { error } from '../utils/output.js';

interface StatsOptions {
  days?: number;
  export?: string;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(width - filled));
}

export async function statsCommand(options: StatsOptions): Promise<void> {
  try {
    const { db, engine, projectId } = await loadProject();
    const days = options.days || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const activeBranch = await db.getActiveBranch(projectId);
    const project = await db.getProjectByPath(process.cwd());

    // Memory counts
    const decisions = await db.countEntries({ projectId, type: 'decision', isArchived: false });
    const patterns = await db.countEntries({ projectId, type: 'pattern', isArchived: false });
    const documents = await db.countEntries({ projectId, type: 'document', isArchived: false });
    const total = decisions + patterns + documents;

    // Metrics
    const allMetrics = db.getMetrics({ since });
    const suggestMetrics = allMetrics.filter((m) => m.metricType === 'suggest');
    const sessionMetrics = allMetrics.filter((m) => m.metricType === 'session');

    const avgReturned = suggestMetrics.length > 0
      ? Math.round(suggestMetrics.reduce((s, m) => s + (m.data.returnedTokens || 0), 0) / suggestMetrics.length)
      : 0;
    const avgAvailable = suggestMetrics.length > 0
      ? Math.round(suggestMetrics.reduce((s, m) => s + (m.data.totalTokens || 0), 0) / suggestMetrics.length)
      : 0;
    const totalSaved = suggestMetrics.reduce((s, m) => s + ((m.data.totalTokens || 0) - (m.data.returnedTokens || 0)), 0);
    const avgReduction = avgAvailable > 0 ? Math.round((1 - avgReturned / avgAvailable) * 100) : 0;
    const costSaved = (totalSaved / 1_000_000 * 5).toFixed(2);

    const totalSessions = sessionMetrics.length;
    const avgDuration = totalSessions > 0
      ? Math.round(sessionMetrics.reduce((s, m) => s + (m.data.durationMinutes || 0), 0) / totalSessions)
      : 0;
    const decisionsAutoCaptured = sessionMetrics.reduce((s, m) => s + (m.data.decisionsAutoCaptured || 0), 0);
    const patternsAutoCaptured = sessionMetrics.reduce((s, m) => s + (m.data.patternsAutoCaptured || 0), 0);

    const mostRetrieved = db.getMostRetrieved(projectId, 3);
    const stale = db.getStaleEntries(projectId, days);

    await db.close();

    // JSON export
    if (options.export === 'json') {
      console.log(JSON.stringify({
        project: project?.name,
        branch: activeBranch,
        period: `last ${days} days`,
        memory: { decisions, patterns, documents, total },
        tokenEfficiency: { avgReturned, avgAvailable, avgReduction: `${avgReduction}%`, totalSaved, costSaved: `~$${costSaved}` },
        sessions: { total: totalSessions, avgDurationMinutes: avgDuration, decisionsAutoCaptured, patternsAutoCaptured },
        mostRetrieved: mostRetrieved.map((e) => ({ title: e.title, type: e.type })),
        stale: stale.length,
      }, null, 2));
      return;
    }

    // Display
    console.log();
    console.log(chalk.bold(`Contxt Stats — ${project?.name || 'project'} (last ${days} days)`));
    console.log();

    // Memory
    console.log(chalk.bold.underline('Memory'));
    console.log(`  Decisions: ${chalk.cyan(fmt(decisions))} | Patterns: ${chalk.cyan(fmt(patterns))} | Documents: ${chalk.cyan(fmt(documents))}`);
    console.log(`  Total entries: ${chalk.cyan(fmt(total))} | Active branch: ${chalk.cyan(activeBranch)}`);
    console.log();

    // Token efficiency
    console.log(chalk.bold.underline('Token Efficiency'));
    if (suggestMetrics.length === 0) {
      console.log(chalk.dim('  No suggest calls recorded yet. Use suggest_context via MCP to start tracking.'));
    } else {
      console.log(`  Avg suggest call: ${chalk.cyan(fmt(avgReturned))} tokens returned / ${chalk.cyan(fmt(avgAvailable))} available`);
      console.log(`  Avg reduction:    ${bar(avgReduction)} ${chalk.green(avgReduction + '%')}`);
      console.log(`  Est. tokens saved (${days}d): ${chalk.cyan(fmt(totalSaved))}`);
      console.log(`  Est. cost saved:  ${chalk.green(`~$${costSaved}`)} ${chalk.dim('(at $5/MTok)')}`);
    }
    console.log();

    // Sessions
    console.log(chalk.bold.underline('Sessions'));
    if (totalSessions === 0) {
      console.log(chalk.dim('  No sessions recorded yet.'));
    } else {
      const h = Math.floor(avgDuration / 60);
      const m = avgDuration % 60;
      console.log(`  Total: ${chalk.cyan(totalSessions)} | Avg duration: ${chalk.cyan(h > 0 ? `${h}h ${m}m` : `${m}m`)}`);
      console.log(`  Decisions auto-captured: ${chalk.cyan(decisionsAutoCaptured)}`);
      console.log(`  Patterns auto-captured:  ${chalk.cyan(patternsAutoCaptured)}`);
    }
    console.log();

    // Most retrieved
    if (mostRetrieved.length > 0) {
      console.log(chalk.bold.underline('Most Retrieved'));
      mostRetrieved.forEach((e, i) => {
        console.log(`  ${i + 1}. ${chalk.cyan(`"${e.title}"`)} — retrieved ${chalk.yellow((e as any).retrieve_count || '?')} times`);
      });
      console.log();
    }

    // Stale
    if (stale.length > 0) {
      console.log(chalk.bold.underline(`Stale (not retrieved in ${days}+ days): ${chalk.yellow(stale.length)} entries`));
      console.log(chalk.dim(`  Run ${chalk.white('contxt review --stale')} to clean up.`));
      console.log();
    }

  } catch (err) {
    error(`Stats failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
