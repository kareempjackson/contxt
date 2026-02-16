/**
 * Token counting utilities using tiktoken
 */

import { get_encoding } from 'tiktoken';
import type { MemoryEntry, RankedEntry } from '../types.js';

// Use cl100k_base encoding (GPT-4/Claude compatible)
const encoding = get_encoding('cl100k_base');

/**
 * Count tokens in a text string
 */
export function countTokens(text: string): number {
  const tokens = encoding.encode(text);
  return tokens.length;
}

/**
 * Count tokens in a memory entry
 */
export function countEntryTokens(entry: MemoryEntry): number {
  const text = formatEntryForContext(entry);
  return countTokens(text);
}

/**
 * Format entry for context (how it will appear in the prompt)
 */
export function formatEntryForContext(entry: MemoryEntry): string {
  const lines: string[] = [];

  lines.push(`## ${entry.type.toUpperCase()}: ${entry.title}`);
  lines.push('');
  lines.push(entry.content);

  // Add relevant metadata
  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    lines.push('');
    lines.push('**Metadata:**');
    for (const [key, value] of Object.entries(entry.metadata)) {
      if (Array.isArray(value) && value.length > 0) {
        lines.push(`- ${key}: ${value.join(', ')}`);
      } else if (value && typeof value === 'string') {
        lines.push(`- ${key}: ${value}`);
      }
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * Fit ranked entries within a token budget
 */
export function fitToBudget(
  rankedEntries: RankedEntry[],
  maxTokens: number
): RankedEntry[] {
  const result: RankedEntry[] = [];
  let currentTokens = 0;

  // Reserve tokens for header/footer
  const headerTokens = countTokens('# MemoCore Context\n\n');
  currentTokens += headerTokens;

  for (const ranked of rankedEntries) {
    const entryTokens = countEntryTokens(ranked.entry);

    if (currentTokens + entryTokens <= maxTokens) {
      result.push(ranked);
      currentTokens += entryTokens;
    } else {
      // Budget exceeded, stop adding
      break;
    }
  }

  return result;
}

/**
 * Build formatted context from ranked entries
 */
export function buildContext(
  rankedEntries: RankedEntry[],
  options?: {
    includeReasons?: boolean;
    includeStats?: boolean;
  }
): string {
  const lines: string[] = [];

  lines.push('# MemoCore Context');
  lines.push('');

  if (options?.includeStats) {
    lines.push(`Found ${rankedEntries.length} relevant entries:`);
    lines.push('');
  }

  for (const ranked of rankedEntries) {
    if (options?.includeReasons && ranked.reasons.length > 0) {
      lines.push(`<!-- Match reasons: ${ranked.reasons.join(', ')} -->`);
    }

    lines.push(formatEntryForContext(ranked.entry));
  }

  return lines.join('\n');
}

/**
 * Free tiktoken resources (call on cleanup)
 */
export function cleanup(): void {
  encoding.free();
}
