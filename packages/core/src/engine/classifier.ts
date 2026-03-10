/**
 * Entry Classifier — rule-based, zero API dependency
 * Classifies free-form text into decision | pattern | context | document
 */

export interface ClassifiedEntry {
  type: 'decision' | 'pattern' | 'context' | 'document';
  title: string;
  content: string;
}

const DECISION_SIGNALS = [
  'decided', 'we use', "we're using", 'we chose', 'we picked', 'we went with',
  'switched to', 'migrated to', 'going with', 'instead of', 'rationale',
  'trade-off', 'tradeoff', 'we will use', 'chosen', 'opted for', 'selected',
];

const PATTERN_SIGNALS = [
  'always ', 'never ', 'every time', 'convention', 'rule:', 'pattern:',
  'when you', 'best practice', 'make sure to', 'should always', "don't use",
  'do not use', 'standard:', 'guideline', 'must ', 'should ',
];

const CONTEXT_SIGNALS = [
  'working on', 'currently ', 'this sprint', 'blocked by', 'today i',
  'this week', 'in progress', 'implementing', 'building', "i'm working",
  "we're working", 'started on', 'picked up', 'investigating',
];

function extractTitle(text: string): string {
  // Use first sentence or first 80 chars
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  if (firstSentence.length <= 80) return firstSentence;
  return firstSentence.substring(0, 77) + '...';
}

export function classifyEntry(text: string): ClassifiedEntry {
  const lower = text.toLowerCase();

  const type =
    DECISION_SIGNALS.some((s) => lower.includes(s)) ? 'decision'
    : PATTERN_SIGNALS.some((s) => lower.includes(s)) ? 'pattern'
    : CONTEXT_SIGNALS.some((s) => lower.includes(s)) ? 'context'
    : 'document';

  return {
    type,
    title: extractTitle(text),
    content: text,
  };
}
