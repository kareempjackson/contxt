/**
 * Markdown Inferrer
 * Uses OpenAI to extract decisions and patterns from markdown files
 * without requiring the developer to add any special tags.
 */

import { createHash } from 'crypto';

export interface InferredEntry {
  type: 'decision' | 'pattern';
  title: string;
  content: string;
  hash: string;
  file: string;
}

/**
 * Infer decisions and patterns from a markdown file using OpenAI.
 * Returns an empty array if OPENAI_API_KEY is not set or the call fails.
 */
export async function inferFromMarkdown(
  content: string,
  filePath: string,
): Promise<InferredEntry[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !content.trim()) return [];

  const prompt = `You are analyzing a markdown document from a software project to extract architectural decisions and code patterns.

Extract only clear, meaningful entries:
- **decision**: an architectural choice, technology selection, or approach the team has settled on
- **pattern**: a reusable code convention, structure, or rule that will be repeated in the codebase

Return JSON in this exact shape:
{ "entries": [ { "type": "decision"|"pattern", "title": "concise title (max 80 chars)", "content": "rationale or description (1-3 sentences)" } ] }

Rules:
- Skip generic instructions, prompts to an AI, or prose that isn't a decision/pattern
- Skip anything too vague to be actionable
- If nothing qualifies, return { "entries": [] }

Document (${filePath}):
---
${content.substring(0, 6000)}
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
        max_tokens: 1000,
      }),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as any;
    const text: string = data.choices?.[0]?.message?.content ?? '{"entries":[]}';

    let parsed: any[];
    try {
      const obj = JSON.parse(text);
      parsed = Array.isArray(obj) ? obj : (obj.entries ?? []);
    } catch {
      return [];
    }

    return parsed
      .filter((e: any) => (e.type === 'decision' || e.type === 'pattern') && e.title && e.content)
      .map((e: any) => {
        const hash = createHash('sha256')
          .update(`md:${e.type}:${e.title}:${filePath}`)
          .digest('hex')
          .substring(0, 16);
        return {
          type: e.type as 'decision' | 'pattern',
          title: String(e.title).substring(0, 80),
          content: String(e.content),
          hash,
          file: filePath,
        };
      });
  } catch {
    return [];
  }
}
