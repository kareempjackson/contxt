/**
 * Bootstrapper
 * Analyzes an existing codebase to auto-generate initial memory entries.
 * Used by `contxt init` (prompt) and `contxt bootstrap` (standalone command).
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';

export interface BootstrapDecision {
  title: string;
  rationale: string;
  alternatives?: string;
  consequences?: string;
}

export interface BootstrapPattern {
  title: string;
  content: string;
  category?: string;
}

export interface BootstrapResult {
  context: { title: string; content: string };
  decisions: BootstrapDecision[];
  patterns: BootstrapPattern[];
  document?: { title: string; content: string };
}

function readFileSafe(path: string, maxChars = 4000): string {
  try {
    return readFileSync(path, 'utf-8').substring(0, maxChars);
  } catch {
    return '';
  }
}

function gitLog(cwd: string): string {
  try {
    return execSync('git log --oneline -20', {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function discoverProject(cwd: string): string {
  const parts: string[] = [];

  // Package manifest (first one found)
  for (const manifest of ['package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'pubspec.yaml']) {
    const content = readFileSafe(join(cwd, manifest), 3000);
    if (content) {
      parts.push(`## ${manifest}\n${content}`);
      break;
    }
  }

  // README and docs
  for (const doc of ['README.md', 'SETUP.md', 'CONTRIBUTING.md']) {
    const content = readFileSafe(join(cwd, doc), 4000);
    if (content) {
      parts.push(`## ${doc}\n${content}`);
    }
  }

  // Directory structure (top-level only)
  try {
    const entries = readdirSync(cwd, { withFileTypes: true });
    const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', '.next', '__pycache__', 'coverage', '.turbo']);
    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !IGNORED_DIRS.has(e.name))
      .map((e) => e.name);
    const files = entries
      .filter((e) => e.isFile() && !e.name.startsWith('.'))
      .map((e) => e.name);
    parts.push(`## Directory Structure\nFolders: ${dirs.join(', ')}\nRoot files: ${files.join(', ')}`);
  } catch {
    // Non-fatal
  }

  // Config files (code style / compiler / linter)
  const CONFIG_FILES = [
    'tsconfig.json',
    '.eslintrc.json',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.prettierrc',
    '.prettierrc.json',
    'tailwind.config.ts',
    'tailwind.config.js',
    'vite.config.ts',
    'vite.config.js',
    'next.config.ts',
    'next.config.js',
  ];
  for (const cfg of CONFIG_FILES) {
    const content = readFileSafe(join(cwd, cfg), 1000);
    if (content) {
      parts.push(`## ${cfg}\n${content}`);
    }
  }

  // Recent git history
  const log = gitLog(cwd);
  if (log) {
    parts.push(`## Recent Git Commits\n${log}`);
  }

  return parts.join('\n\n');
}

function buildFallback(projectName: string, projectData: string): BootstrapResult {
  return {
    context: {
      title: `${projectName} — Project Overview`,
      content: `Bootstrapped from project discovery (no AI analysis).\n\n${projectData.substring(0, 2000)}`,
    },
    decisions: [],
    patterns: [],
  };
}

/**
 * Analyze an existing codebase and return structured memory entries.
 * Pass `apiKey` (OPENAI_API_KEY) to enable AI-powered analysis.
 * Falls back gracefully if no key or if the API call fails.
 */
export async function runBootstrap(cwd: string, apiKey?: string): Promise<BootstrapResult> {
  const projectData = discoverProject(cwd);
  const projectName = basename(cwd);

  if (!apiKey) {
    return buildFallback(projectName, projectData);
  }

  const prompt = `You are analyzing an existing software project to build a persistent memory store for AI coding agents.

Based on the project data below, extract the most important context so that an AI coding assistant immediately understands this codebase without re-reading everything each session.

Return ONLY valid JSON in this exact shape:
{
  "overview": "2-3 sentence description of what this project does and its current state",
  "stack_summary": "tech stack and key dependencies in 1-2 sentences",
  "decisions": [
    {
      "title": "Short decision title (max 80 chars)",
      "rationale": "Why this choice was made (1-2 sentences)",
      "alternatives": "What was considered but not chosen (optional, 1 sentence)",
      "consequences": "Impact of this decision (optional, 1 sentence)"
    }
  ],
  "patterns": [
    {
      "title": "Short pattern title (max 80 chars)",
      "content": "What to do and how — specific enough to follow (2-3 sentences)",
      "category": "one of: naming, structure, testing, api, state, style, error-handling, other"
    }
  ],
  "architecture_doc": "Markdown overview of the architecture (3-6 sentences covering structure, data flow, key modules)"
}

Rules:
- Max 5 decisions, max 5 patterns
- Only include decisions and patterns that are clearly evident from the data
- Skip generic/obvious patterns like "use git" or "write tests"
- If you cannot infer a decision or pattern confidently, omit it
- Focus on what makes THIS project unique

Project data:
---
${projectData.substring(0, 8000)}
---`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
    });

    if (!response.ok) return buildFallback(projectName, projectData);

    const data = (await response.json()) as any;
    const text: string = data.choices?.[0]?.message?.content ?? '{}';

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return buildFallback(projectName, projectData);
    }

    const overview = parsed.overview || `Project at ${cwd}`;
    const stackSummary = parsed.stack_summary || '';
    const contextContent = [overview, stackSummary].filter(Boolean).join('\n\n');

    return {
      context: {
        title: `${projectName} — Project Overview`,
        content: contextContent,
      },
      decisions: ((parsed.decisions as any[]) || [])
        .slice(0, 5)
        .filter((d: any) => d.title && d.rationale)
        .map((d: any) => ({
          title: String(d.title).substring(0, 80),
          rationale: String(d.rationale),
          alternatives: d.alternatives ? String(d.alternatives) : undefined,
          consequences: d.consequences ? String(d.consequences) : undefined,
        })),
      patterns: ((parsed.patterns as any[]) || [])
        .slice(0, 5)
        .filter((p: any) => p.title && p.content)
        .map((p: any) => ({
          title: String(p.title).substring(0, 80),
          content: String(p.content),
          category: p.category ? String(p.category) : undefined,
        })),
      document: parsed.architecture_doc
        ? {
            title: `${projectName} — Architecture`,
            content: String(parsed.architecture_doc),
          }
        : undefined,
    };
  } catch {
    return buildFallback(projectName, projectData);
  }
}
