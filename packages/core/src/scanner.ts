/**
 * Code Comment Scanner
 * Extracts @decision, @pattern, and @context tags from code comments
 */

import { createHash } from 'crypto';
import type { MemoryEntryType } from './types.js';

export interface ScanComment {
  tag: 'decision' | 'pattern' | 'context';
  category?: string;
  title: string;
  content: string;
  fields: Record<string, string>;
  file: string;
  line: number;
  hash: string;
}

export interface ScanResult {
  found: ScanComment[];
  errors: Array<{ file: string; line: number; error: string }>;
}

/**
 * Comment patterns for different languages
 */
const COMMENT_PATTERNS = [
  // Single line comments: // @tag
  { pattern: /^(\s*)\/\/\s*/, continuation: /^(\s*)\/\/\s+(?!@)/ },
  // Python/Ruby/Shell: # @tag
  { pattern: /^(\s*)#\s*/, continuation: /^(\s*)#\s+(?!@)/ },
  // SQL: -- @tag
  { pattern: /^(\s*)--\s*/, continuation: /^(\s*)--\s+(?!@)/ },
];

/**
 * Tag detection pattern
 */
const TAG_PATTERN = /@(decision|pattern|context)\s*/i;

/**
 * Category pattern: [@decision [category] title]
 */
const CATEGORY_PATTERN = /^\[([^\]]+)\]\s*/;

/**
 * Field pattern: | key: value
 */
const FIELD_PATTERN = /\|\s*(\w+):\s*([^|]+)/g;

/**
 * Parse a single file for tagged comments
 */
export function parseFile(content: string, filePath: string): ScanComment[] {
  const lines = content.split('\n');
  const comments: ScanComment[] = [];
  let currentComment: Partial<ScanComment> | null = null;
  let currentIndent: string = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for tag start
    const tagMatch = detectTag(line);
    if (tagMatch) {
      // Save previous comment if exists
      if (currentComment && currentComment.title) {
        comments.push(finalizeComment(currentComment, filePath));
      }

      // Start new comment
      const { tag, content, category } = tagMatch;
      const { title, fields } = extractTitleAndFields(content);

      currentComment = {
        tag,
        category,
        title,
        content: title,
        fields,
        file: filePath,
        line: lineNum,
      };

      currentIndent = getIndent(line);
      continue;
    }

    // Check for continuation line
    if (currentComment && isContinuationLine(line, currentIndent)) {
      const continuationText = extractContinuationText(line);
      if (continuationText) {
        currentComment.content += ' ' + continuationText;

        // Check for fields in continuation
        const moreFields = extractFields(continuationText);
        Object.assign(currentComment.fields!, moreFields);
      }
      continue;
    }

    // If we hit a non-continuation line, finalize current comment
    if (currentComment && currentComment.title) {
      comments.push(finalizeComment(currentComment, filePath));
      currentComment = null;
    }
  }

  // Finalize last comment if exists
  if (currentComment && currentComment.title) {
    comments.push(finalizeComment(currentComment, filePath));
  }

  return comments;
}

/**
 * Detect if a line contains a tag
 */
function detectTag(line: string): { tag: 'decision' | 'pattern' | 'context'; content: string; category?: string } | null {
  // Check if line has a comment marker
  let commentContent: string | null = null;
  for (const { pattern } of COMMENT_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      commentContent = line.substring(match[0].length);
      break;
    }
  }

  if (!commentContent) return null;

  // Check for tag
  const tagMatch = commentContent.match(TAG_PATTERN);
  if (!tagMatch) return null;

  const tag = tagMatch[1].toLowerCase() as 'decision' | 'pattern' | 'context';
  let content = commentContent.substring(tagMatch[0].length).trim();

  // Extract category if present
  let category: string | undefined;
  const categoryMatch = content.match(CATEGORY_PATTERN);
  if (categoryMatch) {
    category = categoryMatch[1];
    content = content.substring(categoryMatch[0].length).trim();
  }

  return { tag, content, category };
}

/**
 * Check if line is a continuation of current comment
 */
function isContinuationLine(line: string, expectedIndent: string): boolean {
  for (const { continuation } of COMMENT_PATTERNS) {
    const match = line.match(continuation);
    if (match && match[1] === expectedIndent) {
      return true;
    }
  }
  return false;
}

/**
 * Extract text from continuation line
 */
function extractContinuationText(line: string): string | null {
  for (const { continuation } of COMMENT_PATTERNS) {
    const match = line.match(continuation);
    if (match) {
      return line.substring(match[0].length).trim();
    }
  }
  return null;
}

/**
 * Get indentation of a line
 */
function getIndent(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Extract title and fields from content
 */
function extractTitleAndFields(content: string): { title: string; fields: Record<string, string> } {
  const fields = extractFields(content);

  // Title is everything before the first |
  const pipeIndex = content.indexOf('|');
  const title = pipeIndex >= 0 ? content.substring(0, pipeIndex).trim() : content.trim();

  return { title, fields };
}

/**
 * Extract key:value fields from content
 */
function extractFields(content: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let match;

  FIELD_PATTERN.lastIndex = 0; // Reset regex state
  while ((match = FIELD_PATTERN.exec(content)) !== null) {
    const key = match[1];
    const value = match[2].trim();
    fields[key] = value;
  }

  return fields;
}

/**
 * Finalize a comment by adding hash
 */
function finalizeComment(partial: Partial<ScanComment>, filePath: string): ScanComment {
  const content = partial.content || partial.title || '';
  const hash = createContentHash(partial.tag!, partial.title!, content);

  return {
    tag: partial.tag!,
    category: partial.category,
    title: partial.title!,
    content,
    fields: partial.fields || {},
    file: filePath,
    line: partial.line!,
    hash,
  };
}

/**
 * Create a stable hash for deduplication
 */
function createContentHash(tag: string, title: string, content: string): string {
  const normalized = `${tag}:${title}:${content}`.toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

/**
 * Convert scan comment to memory entry type
 */
export function scanCommentToEntry(comment: ScanComment, projectId: string): {
  type: MemoryEntryType;
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const metadata: Record<string, any> = {
    source: 'scan',
    file: comment.file,
    line: comment.line,
    hash: comment.hash,
    category: comment.category,
    ...comment.fields,
  };

  // Map decision fields
  if (comment.tag === 'decision') {
    return {
      type: 'decision',
      title: comment.title,
      content: comment.fields.rationale || (comment.content !== comment.title ? comment.content : ''),
      metadata: {
        ...metadata,
        alternatives: comment.fields.alternatives,
        consequences: comment.fields.consequences,
        status: comment.fields.status || 'active',
      },
    };
  }

  // Map pattern fields
  if (comment.tag === 'pattern') {
    return {
      type: 'pattern',
      title: comment.title,
      content: comment.fields.template || (comment.content !== comment.title ? comment.content : ''),
      metadata: {
        ...metadata,
        when: comment.fields.when,
      },
    };
  }

  // Context is free-form
  return {
    type: 'context',
    title: 'Active Context',
    content: comment.content,
    metadata,
  };
}
