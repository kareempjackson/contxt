/**
 * Relevance Engine - Smart context retrieval scoring
 */

import type { MemoryEntry, SuggestOptions, RankedEntry } from '../types.js';

/**
 * Calculate relevance score for a memory entry
 *
 * Scoring breakdown (when no embeddings available):
 * - Keyword overlap: 40%
 * - Recency: 25%
 * - Type priority: 20%
 * - File match: 15%
 *
 * Total: 1.0 (100%)
 */
export function calculateRelevance(
  entry: MemoryEntry,
  options: SuggestOptions
): number {
  let score = 0;

  // 1. Keyword overlap (40%)
  if (options.taskDescription) {
    score += keywordOverlap(entry, options.taskDescription) * 0.4;
  }

  // 2. Recency boost (25%) - exponential decay over 30 days
  const daysOld = (Date.now() - entry.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.exp(-daysOld / 30); // Exponential decay
  score += recencyScore * 0.25;

  // 3. Type priority (20%)
  const typePriority = getTypePriority(entry.type);
  score += typePriority * 0.2;

  // 4. File match boost (15%)
  if (options.activeFiles && options.activeFiles.length > 0) {
    const hasFileMatch = options.activeFiles.some(file =>
      entry.content.toLowerCase().includes(file.toLowerCase()) ||
      entry.title.toLowerCase().includes(file.toLowerCase())
    );
    if (hasFileMatch) {
      score += 0.15;
    }
  }

  return Math.min(score, 1.0);
}

/**
 * Calculate keyword overlap between entry and search query
 */
function keywordOverlap(entry: MemoryEntry, query: string): number {
  const entryText = `${entry.title} ${entry.content}`.toLowerCase();
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  if (queryWords.length === 0) return 0;

  const matchCount = queryWords.filter(word => entryText.includes(word)).length;
  return matchCount / queryWords.length;
}

/**
 * Get priority score for entry type
 */
function getTypePriority(type: string): number {
  const priorities: Record<string, number> = {
    context: 1.0,   // Highest priority
    decision: 0.8,
    pattern: 0.8,
    session: 0.5,
    document: 0.3,  // Lowest priority
  };

  return priorities[type] || 0.5;
}

/**
 * Generate match reasons for transparency
 */
export function getMatchReasons(
  entry: MemoryEntry,
  options: SuggestOptions
): string[] {
  const reasons: string[] = [];

  // Check keyword matches
  if (options.taskDescription) {
    const overlap = keywordOverlap(entry, options.taskDescription);
    if (overlap > 0.3) {
      reasons.push(`${Math.round(overlap * 100)}% keyword match`);
    }
  }

  // Check recency
  const daysOld = (Date.now() - entry.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) {
    reasons.push('Recently updated');
  }

  // Check type
  if (entry.type === 'context') {
    reasons.push('Current context');
  }

  // Check file matches
  if (options.activeFiles) {
    const matchedFiles = options.activeFiles.filter(file =>
      entry.content.toLowerCase().includes(file.toLowerCase())
    );
    if (matchedFiles.length > 0) {
      reasons.push(`References ${matchedFiles.join(', ')}`);
    }
  }

  return reasons;
}

/**
 * Rank and filter entries by relevance
 */
export function rankEntries(
  entries: MemoryEntry[],
  options: SuggestOptions
): RankedEntry[] {
  const minRelevance = options.minRelevance || 0.3;

  return entries
    .map(entry => ({
      entry,
      score: calculateRelevance(entry, options),
      reasons: getMatchReasons(entry, options),
    }))
    .filter(ranked => ranked.score >= minRelevance)
    .sort((a, b) => b.score - a.score);
}
