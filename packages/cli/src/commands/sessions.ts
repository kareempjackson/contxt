/**
 * Sessions command — List sessions, show events, resume (Feature 2d)
 */

import chalk from 'chalk';
import { loadProject } from '../utils/project.js';
import { error } from '../utils/output.js';
import { formatDate } from '../utils/project.js';

export const sessionsCommand = {
  async list(): Promise<void> {
    try {
      const { db, projectId } = await loadProject();
      const rows = db.getRecentSessionsWithEventCounts(projectId, 20);
      await db.close();

      if (rows.length === 0) {
        console.log(chalk.dim('No sessions found.'));
        return;
      }

      console.log();
      console.log(chalk.bold('Recent Sessions'));
      console.log();

      for (const { session, eventCount } of rows) {
        const meta = session.metadata || {};
        const status = meta.endedAt ? chalk.dim('ended') : chalk.green('active');
        const duration = meta.endedAt && meta.startedAt
          ? durationLabel(new Date(meta.startedAt), new Date(meta.endedAt))
          : meta.startedAt ? chalk.yellow('ongoing') : '';
        const snapshot = meta.latestSnapshot ? chalk.green(' [snapshot]') : '';

        console.log(
          `  ${chalk.dim(session.id.substring(0, 8))}  ${chalk.bold(session.title.replace('Session: ', ''))}  ${status}  ${duration}  ${chalk.dim(eventCount + ' events')}${snapshot}`
        );
        console.log(`          ${chalk.dim(formatDate(session.createdAt))}`);
      }
      console.log();
    } catch (err) {
      error(`Sessions failed: ${(err as Error).message}`);
      process.exit(1);
    }
  },

  async show(sessionId: string): Promise<void> {
    try {
      const { db } = await loadProject();

      // Support short ID prefix
      const entry = await db.getEntry(sessionId);
      if (!entry || entry.type !== 'session') {
        error(`Session ${sessionId} not found`);
        await db.close();
        process.exit(1);
        return;
      }

      const events = db.getSessionEvents(entry.id);
      await db.close();

      const meta = entry.metadata || {};
      console.log();
      console.log(chalk.bold(entry.title));
      console.log(chalk.dim(`Started: ${meta.startedAt || formatDate(entry.createdAt)}`));
      if (meta.endedAt) console.log(chalk.dim(`Ended:   ${meta.endedAt}`));
      console.log();

      if (events.length === 0) {
        console.log(chalk.dim('  No events recorded for this session.'));
      } else {
        console.log(chalk.bold.underline('Events'));
        for (const ev of events) {
          const icon = eventIcon(ev.eventType);
          console.log(`  ${icon} ${chalk.dim(ev.timestamp.split('T')[1].slice(0, 5))}  ${ev.summary}`);
        }
      }

      if (meta.latestSnapshot) {
        console.log();
        console.log(chalk.bold.underline('Latest Snapshot'));
        console.log(chalk.dim(meta.latestSnapshot as string));
      }
      console.log();
    } catch (err) {
      error(`Sessions show failed: ${(err as Error).message}`);
      process.exit(1);
    }
  },

  async resume(): Promise<void> {
    try {
      const { db, engine, projectId } = await loadProject();
      const project = await db.getProjectByPath(process.cwd());

      // Try active session first
      let session = await engine.getActiveSession(projectId);

      // Fall back to most recent ended session
      if (!session) {
        const all = await engine.listSessions(projectId);
        session = all[0] || null;
      }

      if (!session) {
        console.log(chalk.dim('No sessions found. Start one with `contxt session start`.'));
        await db.close();
        return;
      }

      const meta = session.metadata || {};

      if (meta.latestSnapshot) {
        console.log();
        console.log(chalk.bold('Session Resume'));
        console.log();
        console.log(meta.latestSnapshot as string);
        console.log();
      } else {
        console.log();
        console.log(chalk.dim('No snapshot found for the last session.'));
        console.log(chalk.dim('Snapshots are built every 10 session events via contxt_session_snapshot.'));
        console.log();
      }

      await db.close();
    } catch (err) {
      error(`Sessions resume failed: ${(err as Error).message}`);
      process.exit(1);
    }
  },
};

function durationLabel(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return chalk.dim(`${minutes}m`);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return chalk.dim(`${h}h ${m}m`);
}

function eventIcon(eventType: string): string {
  const icons: Record<string, string> = {
    decision_made: chalk.blue('●'),
    file_edited: chalk.yellow('✎'),
    error_hit: chalk.red('✗'),
    task_completed: chalk.green('✓'),
    context_loaded: chalk.cyan('◈'),
  };
  return icons[eventType] || chalk.dim('·');
}
