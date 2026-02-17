/**
 * Rules File Parser
 * Parses .contxt/rules.md file into structured memory entries
 */

import type { MemoryEntryType } from './types.js';

export interface RulesEntry {
  type: MemoryEntryType;
  title: string;
  content: string;
  metadata: Record<string, any>;
}

export interface ParsedRules {
  stack: string[];
  decisions: RulesEntry[];
  patterns: RulesEntry[];
  context: RulesEntry | null;
  documents: RulesEntry[];
}

/**
 * Parse rules.md file into structured entries
 */
export function parseRulesFile(content: string): ParsedRules {
  const lines = content.split('\n');
  const result: ParsedRules = {
    stack: [],
    decisions: [],
    patterns: [],
    context: null,
    documents: [],
  };

  let currentSection: string | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for heading
    const headingMatch = line.match(/^#+\s+(.+)/);
    if (headingMatch) {
      // Process previous section
      if (currentSection && currentContent.length > 0) {
        processSection(currentSection, currentContent.join('\n'), result);
      }

      // Start new section
      currentSection = headingMatch[1].trim();
      currentContent = [];
      continue;
    }

    // Add line to current section
    if (currentSection && line.trim()) {
      currentContent.push(line);
    }
  }

  // Process final section
  if (currentSection && currentContent.length > 0) {
    processSection(currentSection, currentContent.join('\n'), result);
  }

  return result;
}

/**
 * Process a section based on its heading
 */
function processSection(heading: string, content: string, result: ParsedRules): void {
  const headingLower = heading.toLowerCase();

  if (headingLower === 'stack' || headingLower === 'tech stack') {
    result.stack = parseListItems(content);
  } else if (headingLower === 'decisions') {
    result.decisions = parseDecisions(content);
  } else if (headingLower === 'patterns') {
    result.patterns = parsePatterns(content);
  } else if (headingLower === 'context') {
    result.context = parseContext(content);
  } else {
    // Any other heading becomes a document
    result.documents.push({
      type: 'document',
      title: heading,
      content: content.trim(),
      metadata: { source: 'rules', section: heading },
    });
  }
}

/**
 * Parse list items from markdown content
 */
function parseListItems(content: string): string[] {
  const items: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^[-*]\s+(.+)/);
    if (match) {
      items.push(match[1].trim());
    }
  }

  return items;
}

/**
 * Parse decisions from list items
 * Format: - Title (rationale text)
 */
function parseDecisions(content: string): RulesEntry[] {
  const decisions: RulesEntry[] = [];
  const items = parseListItems(content);

  for (const item of items) {
    // Try to extract rationale in parentheses
    const match = item.match(/^(.+?)\s*\(([^)]+)\)\s*$/);

    if (match) {
      const title = match[1].trim();
      const rationale = match[2].trim();
      decisions.push({
        type: 'decision',
        title,
        content: rationale,
        metadata: {
          source: 'rules',
          rationale,
        },
      });
    } else {
      // No parentheses, use the whole item as title and content
      decisions.push({
        type: 'decision',
        title: item,
        content: item,
        metadata: { source: 'rules' },
      });
    }
  }

  return decisions;
}

/**
 * Parse patterns from list items
 * Format: - Name: description/template
 */
function parsePatterns(content: string): RulesEntry[] {
  const patterns: RulesEntry[] = [];
  const items = parseListItems(content);

  for (const item of items) {
    // Try to extract pattern name and description
    const colonIndex = item.indexOf(':');

    if (colonIndex >= 0) {
      const name = item.substring(0, colonIndex).trim();
      const description = item.substring(colonIndex + 1).trim();
      patterns.push({
        type: 'pattern',
        title: name,
        content: description,
        metadata: { source: 'rules' },
      });
    } else {
      // No colon, use the whole item
      patterns.push({
        type: 'pattern',
        title: item,
        content: item,
        metadata: { source: 'rules' },
      });
    }
  }

  return patterns;
}

/**
 * Parse context from free-form text
 */
function parseContext(content: string): RulesEntry {
  return {
    type: 'context',
    title: 'Active Context',
    content: content.trim(),
    metadata: { source: 'rules' },
  };
}

/**
 * Generate rules.md file from memory entries
 */
export function generateRulesFile(entries: {
  stack: string[];
  decisions: Array<{ title: string; content: string; metadata: any }>;
  patterns: Array<{ title: string; content: string; metadata: any }>;
  context: Array<{ content: string }>;
  documents: Array<{ title: string; content: string }>;
}): string {
  const sections: string[] = [];

  // Stack section
  if (entries.stack.length > 0) {
    sections.push('# Stack\n');
    for (const item of entries.stack) {
      sections.push(`- ${item}`);
    }
    sections.push('');
  }

  // Decisions section
  if (entries.decisions.length > 0) {
    sections.push('# Decisions\n');
    for (const decision of entries.decisions) {
      const rationale = decision.metadata.rationale || decision.content;
      sections.push(`- ${decision.title} (${rationale})`);
    }
    sections.push('');
  }

  // Patterns section
  if (entries.patterns.length > 0) {
    sections.push('# Patterns\n');
    for (const pattern of entries.patterns) {
      sections.push(`- ${pattern.title}: ${pattern.content}`);
    }
    sections.push('');
  }

  // Context section
  if (entries.context.length > 0) {
    sections.push('# Context\n');
    sections.push(entries.context[0].content);
    sections.push('');
  }

  // Document sections
  for (const doc of entries.documents) {
    sections.push(`# ${doc.title}\n`);
    sections.push(doc.content);
    sections.push('');
  }

  return sections.join('\n');
}
