/**
 * Output formatting utilities
 */

import chalk from 'chalk';
import type { MemoryEntry } from '@mycontxt/core';
import { formatDate } from './project.js';

/**
 * Log success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Log error message
 */
export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

/**
 * Log info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Log warning message
 */
export function warn(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Format entry for display
 */
export function formatEntry(entry: MemoryEntry): string {
  const lines: string[] = [];

  // Header
  lines.push(chalk.bold(entry.title));
  lines.push(
    chalk.dim(
      `${entry.type} • ${entry.id.substring(0, 8)} • ${formatDate(entry.updatedAt)}`
    )
  );
  lines.push('');

  // Content
  if (entry.content?.trim()) {
    lines.push(entry.content);
  } else {
    lines.push(chalk.dim('No rationale provided.'));
  }

  // Metadata
  if (Object.keys(entry.metadata).length > 0) {
    lines.push('');
    lines.push(chalk.dim('Metadata:'));
    for (const [key, value] of Object.entries(entry.metadata)) {
      if (Array.isArray(value) && value.length > 0) {
        lines.push(chalk.dim(`  ${key}: ${value.join(', ')}`));
      } else if (value) {
        lines.push(chalk.dim(`  ${key}: ${value}`));
      }
    }
  }

  return lines.join('\n');
}

/**
 * Format entry list for display
 */
export function formatEntryList(entries: MemoryEntry[]): string {
  if (entries.length === 0) {
    return chalk.dim('No entries found');
  }

  return entries
    .map((entry) => {
      const id = chalk.dim(entry.id.substring(0, 8));
      const time = chalk.dim(formatDate(entry.updatedAt));
      const title = entry.title;
      return `  ${id}  ${title} ${time}`;
    })
    .join('\n');
}

/**
 * Log loading/progress message
 */
export function loading(message: string): void {
  console.log(chalk.cyan('~'), message);
}

/**
 * Log dry-run message
 */
export function dryRun(message: string): void {
  console.log(chalk.dim('→'), chalk.dim(message));
}

/**
 * Log conflict message
 */
export function conflict(message: string): void {
  console.log(chalk.yellow('!'), message);
}

/**
 * Print a section header
 */
export function header(title: string): void {
  console.log(chalk.bold.cyan('›'), chalk.bold(title));
}

/**
 * Create a section header
 */
export function section(title: string): string {
  return chalk.bold.underline(title);
}

/**
 * Create a divider
 */
export function divider(): string {
  return chalk.dim('─'.repeat(60));
}
