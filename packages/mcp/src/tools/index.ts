/**
 * MCP Tools - All tool implementations
 */

import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { MemoryEngine } from '@mycontxt/core';
import type { DecisionInput, PatternInput, ContextInput } from '@mycontxt/core';
import { getDbPath } from '../utils/project.js';
import { suggestContext } from './suggest-context.js';
import {
  autoCaptureDecision,
  autoCapturePattern,
  captureDiscussion,
  updateSession,
  getDrafts,
  confirmDraft,
} from './auto-capture.js';

// Export suggest-context
export { suggestContext };

// Export auto-capture tools
export { autoCaptureDecision, autoCapturePattern, captureDiscussion, updateSession, getDrafts, confirmDraft };

/**
 * Get project context - Overview of project
 */
export async function getProjectContext(args: { projectPath?: string }): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);
    const activeBranch = await db.getActiveBranch(project.id);
    const context = await engine.getContext(project.id);
    const decisions = await engine.listDecisions(project.id);
    const patterns = await engine.listPatterns(project.id);

    const lines: string[] = [];
    lines.push(`# Project: ${project.name}`);
    lines.push('');
    lines.push(`**Branch:** ${activeBranch}`);
    lines.push(`**Stack:** ${project.stack?.join(', ') || 'Not specified'}`);
    lines.push('');

    if (context) {
      lines.push('## Current Context');
      if (context.metadata.feature) {
        lines.push(`**Feature:** ${context.metadata.feature}`);
      }
      if (context.metadata.blockers?.length > 0) {
        lines.push(`**Blockers:** ${context.metadata.blockers.join(', ')}`);
      }
      lines.push('');
    }

    lines.push(`## Summary`);
    lines.push(`- ${decisions.length} decisions`);
    lines.push(`- ${patterns.length} patterns`);

    return lines.join('\n');
  } finally {
    await db.close();
  }
}

/**
 * Get decisions
 */
export async function getDecisions(args: {
  projectPath?: string;
  limit?: number;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);
    const decisions = await engine.listDecisions(project.id);

    const limited = args.limit ? decisions.slice(0, args.limit) : decisions;

    if (limited.length === 0) {
      return 'No decisions found.';
    }

    const lines: string[] = [];
    lines.push('# Architectural Decisions');
    lines.push('');

    for (const decision of limited) {
      lines.push(`## ${decision.title}`);
      lines.push('');
      lines.push(decision.content);
      if (decision.metadata.alternatives?.length > 0) {
        lines.push('');
        lines.push(`**Alternatives considered:** ${decision.metadata.alternatives.join(', ')}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  } finally {
    await db.close();
  }
}

/**
 * Get patterns
 */
export async function getPatterns(args: {
  projectPath?: string;
  limit?: number;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);
    const patterns = await engine.listPatterns(project.id);

    const limited = args.limit ? patterns.slice(0, args.limit) : patterns;

    if (limited.length === 0) {
      return 'No patterns found.';
    }

    const lines: string[] = [];
    lines.push('# Code Patterns & Conventions');
    lines.push('');

    for (const pattern of limited) {
      lines.push(`## ${pattern.title}`);
      lines.push('');
      lines.push(pattern.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  } finally {
    await db.close();
  }
}

/**
 * Search memory
 */
export async function searchMemory(args: {
  query: string;
  projectPath?: string;
  limit?: number;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);
    const results = await engine.searchEntries(project.id, args.query);

    const limited = args.limit ? results.slice(0, args.limit) : results;

    if (limited.length === 0) {
      return `No results found for "${args.query}".`;
    }

    const lines: string[] = [];
    lines.push(`# Search Results for "${args.query}"`);
    lines.push('');

    for (const entry of limited) {
      lines.push(`## ${entry.type.toUpperCase()}: ${entry.title}`);
      lines.push('');
      lines.push(entry.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  } finally {
    await db.close();
  }
}

/**
 * Log decision
 */
export async function logDecision(args: {
  title: string;
  rationale: string;
  alternatives?: string[];
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);

    const input: DecisionInput = {
      title: args.title,
      rationale: args.rationale,
      alternatives: args.alternatives,
    };

    const entry = await engine.addDecision(project.id, input);

    return `Decision "${entry.title}" logged successfully.`;
  } finally {
    await db.close();
  }
}

/**
 * Update context
 */
export async function updateContext(args: {
  feature?: string;
  blockers?: string[];
  nextSteps?: string[];
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);

    const input: ContextInput = {
      feature: args.feature,
      blockers: args.blockers,
      nextSteps: args.nextSteps,
    };

    await engine.setContext(project.id, input);

    return 'Project context updated successfully.';
  } finally {
    await db.close();
  }
}

/**
 * Save pattern
 */
export async function savePattern(args: {
  title: string;
  content: string;
  category?: string;
  projectPath?: string;
}): Promise<string> {
  const projectPath = args.projectPath || process.cwd();
  const dbPath = getDbPath(projectPath);

  const db = new SQLiteDatabase(dbPath);
  await db.initialize();

  try {
    const project = await db.getProjectByPath(projectPath);
    if (!project) {
      return 'No MemoCore project found.';
    }

    const engine = new MemoryEngine(db);

    const input: PatternInput = {
      title: args.title,
      content: args.content,
      category: args.category,
    };

    const entry = await engine.addPattern(project.id, input);

    return `Pattern "${entry.title}" saved successfully.`;
  } finally {
    await db.close();
  }
}
