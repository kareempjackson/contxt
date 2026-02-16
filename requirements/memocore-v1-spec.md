# MemoCore v1.0 — Product Specification

**GitHub for AI Context**
Version 1.0 · February 2026
Author: Kareem (Ghost Savvy Studios)

---

## Executive Summary

MemoCore is a developer tool that gives AI coding agents persistent, versioned, project-scoped memory. It solves the #1 frustration with AI-assisted development: every session starts from zero. Developers waste ~40% of their prompts re-explaining architecture, conventions, and decisions that should already be known.

MemoCore provides a CLI-first workflow (init → push → pull → load) backed by Supabase cloud sync, with native MCP server integration so agents like Claude Code auto-load context without manual intervention.

**5 core features scoped:** CLI tool, cloud sync, semantic search, intelligent context retrieval (smart suggest), branching/time-travel, and MCP integration. No web dashboard. No team collaboration (v2.0). Single-player, CLI-first.

**Key insight:** Most memory tools dump everything into the prompt. MemoCore does the opposite — it understands what you're working on right now and surfaces only the relevant slices of memory. Less noise, fewer tokens, better output.

**Stack:** TypeScript/Node · Supabase (Postgres + Auth + Storage) · MCP Protocol
**Timeline:** 10 days (Claude Code sprint — target ship: ~Feb 25, 2026)
**Build approach:** Solo build via Claude Code

---

## Product Vision

**Positioning:** GitHub for AI Context
**One-liner:** Store, version, and share the memory your AI coding tools forget.
**Category:** Developer Infrastructure / AI Tooling

**Why now:**
- AI coding tools (Claude Code, Cursor, Copilot) are mainstream but stateless
- MCP protocol is gaining adoption, creating a standard integration layer
- No incumbent owns this layer — memory is an unsolved infrastructure gap
- The developer who controls context controls the agent's output quality
- Long prompts are killing performance — context windows are big but unfocused context degrades output. Smart retrieval > brute-force dumping.

**Competitive landscape:**
- `.cursorrules` / `.clinerules` — Static config files. No versioning, no sync, no semantic retrieval.
- Vector DBs (Pinecone, Weaviate) — Generic infrastructure. Not built for agent memory use cases.
- Context7 / mem0 — Early movers but focused on RAG, not structured project memory.
- MemoCore differentiator: Structured memory (decisions + patterns + context) with git-like versioning AND intelligent retrieval — surfaces only what's relevant to the current task instead of dumping everything into the prompt. Not just storage, but a relevance engine.

---

## Target User

**Primary:** Solo developers and indie hackers using AI coding tools daily.
**Secondary:** Small engineering teams (2–5) who want shared project context (v2.0).
**Tertiary:** Agencies managing multiple client projects with AI tools.

**User persona (v1.0):**
- Uses Claude Code, Cursor, or Copilot as primary coding companion
- Works on 2–5 projects simultaneously
- Frustrated by repeating context every session
- Comfortable with CLI tools and terminal workflows
- Values speed, simplicity, and developer ergonomics

---

## Core Concepts & Data Model

### Memory Types

| Type | Description | Example |
|------|-------------|---------|
| **Decision** | Architectural choice + rationale | "Use Prisma over Drizzle — better TS support, more mature migrations" |
| **Pattern** | Reusable code template or convention | "All API routes follow /api/v1/{resource} with Zod validation" |
| **Context** | Active working state | "Currently building: user onboarding flow. Blocker: Stripe webhook setup" |
| **Document** | Reference material | "API spec v2, architecture diagram notes, deployment runbook" |
| **Session** | Auto-logged session summary | "Feb 14: Implemented auth flow, decided on JWT + httpOnly cookies" |

### Data Model (Supabase / Postgres)

```
projects
├── id (uuid, PK)
├── name (text)
├── slug (text, unique per user)
├── stack (jsonb) — {language, framework, database, etc.}
├── config (jsonb) — project-level settings
├── created_at (timestamptz)
├── updated_at (timestamptz)
└── user_id (uuid, FK → auth.users)

memory_entries
├── id (uuid, PK)
├── project_id (uuid, FK → projects)
├── type (enum: decision, pattern, context, document, session)
├── title (text)
├── content (text) — main body
├── metadata (jsonb) — type-specific fields
│   ├── decisions: {category, alternatives, status}
│   ├── patterns: {language, tags, usage_count}
│   ├── context: {feature, blockers, next_steps, files}
│   ├── documents: {doc_type, source}
│   └── sessions: {duration, files_touched, summary}
├── embedding (vector(1536)) — for semantic search
├── branch (text, default: 'main')
├── version (integer)
├── is_archived (boolean, default: false)
├── created_at (timestamptz)
├── updated_at (timestamptz)
└── user_id (uuid, FK → auth.users)

memory_versions (time travel)
├── id (uuid, PK)
├── entry_id (uuid, FK → memory_entries)
├── version (integer)
├── content_snapshot (jsonb) — full entry state at this version
├── change_type (enum: created, updated, archived, restored)
├── created_at (timestamptz)
└── user_id (uuid, FK → auth.users)

branches
├── id (uuid, PK)
├── project_id (uuid, FK → projects)
├── name (text)
├── parent_branch (text, nullable)
├── created_from_version (integer, nullable)
├── status (enum: active, merged, abandoned)
├── created_at (timestamptz)
└── user_id (uuid, FK → auth.users)

sync_log
├── id (uuid, PK)
├── project_id (uuid, FK → projects)
├── action (enum: push, pull)
├── entries_synced (integer)
├── branch (text)
├── created_at (timestamptz)
└── user_id (uuid, FK → auth.users)
```

### Embedding Strategy

- Use OpenAI `text-embedding-3-small` (1536 dimensions) for v1.0
- Generate embeddings on `title + content` concatenation
- Store in Supabase `pgvector` extension
- Cosine similarity for semantic search with threshold filtering
- **Embeddings proxied through MemoCore's OpenAI account** via Supabase Edge Function — users never need their own API key
- **Free tier:** Full-text search only (Postgres GIN index, no embedding cost)
- **Pro tier:** Semantic search included — embedding cost absorbed into $29/seat/mo pricing
- Cost per embedding: ~$0.00002/entry (text-embedding-3-small). At 50K entries = ~$1.00 total. Margins are safe.
- Edge Function generates embedding on push, stores in pgvector, returns to client

---

## Feature Specification

### F1: CLI Tool

**Package:** `@memocore/cli` (npm global install)
**Binary:** `memocore` or `mc` (alias)

#### Commands

```
memocore init [--name] [--stack]
  Initialize MemoCore in current directory.
  Creates .memocore/ directory with local config.
  Auto-detects stack from package.json, Cargo.toml, etc.
  Prompts for project name if not provided.
  Output: .memocore/config.json, .memocore/local.db (SQLite)

memocore auth login
  Opens browser for Supabase auth (magic link or GitHub OAuth).
  Stores session token in ~/.memocore/credentials.json

memocore auth logout
  Clears stored credentials.

memocore auth status
  Shows current auth state and user info.

memocore decision add --title "..." --rationale "..." [--category] [--alternatives]
  Log an architectural decision.
  Stores locally, marks as unsynced.

memocore decision list [--category] [--search]
  List decisions for current project.

memocore decision show <id>
  Show full decision with rationale and version history.

memocore pattern add --title "..." --content "..." [--language] [--tags]
  Save a code pattern or convention.

memocore pattern list [--language] [--tags]
  List patterns, optionally filtered.

memocore context set --feature "..." [--blockers] [--next-steps] [--files]
  Set or update active working context.
  Only one active context per project at a time.

memocore context show
  Display current active context.

memocore doc add --title "..." --content "..." [--type]
  Add reference documentation.

memocore doc add --file <path>
  Import a file as documentation (reads content, stores text).

memocore session start [--description]
  Start a new session log. Auto-captures timestamp.

memocore session end [--summary]
  End current session. Auto-generates summary if not provided.

memocore session list [--last N]
  Show recent sessions.

memocore push [--branch] [--message]
  Sync all unsynced local entries to Supabase remote.
  Generates embeddings for new/updated entries.
  Records in sync_log.
  Output: "✓ Synced 14 decisions · 8 patterns · active context"

memocore pull [--branch]
  Pull latest remote state to local SQLite.
  Resolves conflicts with last-write-wins (v1.0).

memocore load [--agent <name>] [--format <format>] [--max-tokens <N>]
  Generate context payload for an AI agent.
  Formats: markdown (default), json, xml
  Agent presets: claude-code, cursor, copilot (adjusts format/structure)
  Token budget: respects --max-tokens, prioritizes by recency and type.
  Output: prints to stdout (pipe-friendly) or copies to clipboard with --copy

memocore search <query>
  Semantic search across all memory types.
  Uses embedding similarity + full-text fallback.
  Returns ranked results with relevance scores.

memocore status
  Show project summary: counts by type, sync status, active branch, last session.

memocore branch create <name>
  Create a new branch from current state.

memocore branch list
  List all branches with status.

memocore branch switch <name>
  Switch active branch. Local state updates to branch entries.

memocore branch merge <source> [--into <target>]
  Merge source branch into target (default: main).
  v1.0: Simple merge (no conflict resolution UI — last-write-wins).

memocore history [--entry <id>] [--last N]
  Show version history for a specific entry or project-wide changelog.

memocore history restore <entry-id> --version <N>
  Restore an entry to a previous version. Creates new version entry.

memocore export [--format json|markdown] [--output <path>]
  Export all project memory to a file.

memocore import <path>
  Import memory from a JSON export file.

memocore config [key] [value]
  Get or set project config values.
  Keys: default_agent, max_tokens, auto_session, embedding_model
```

#### Local Storage

- `.memocore/` directory in project root (add to .gitignore)
- `config.json` — project config, remote URL, default settings
- `local.db` — SQLite database (mirror of remote state + unsynced entries)
- SQLite enables offline-first usage, fast reads, no network dependency for `load`

#### Global Config

- `~/.memocore/credentials.json` — auth tokens
- `~/.memocore/config.json` — global defaults (default agent, embedding API key)

### F2: Cloud Sync (Supabase)

#### Architecture

```
CLI (local SQLite) ←→ Supabase (Postgres + pgvector)
                           ↑
                     Auth (GitHub OAuth / Magic Link)
                     Storage (large documents, exports)
                     RLS (row-level security per user)
```

#### Supabase Setup

- **Auth:** GitHub OAuth (primary), Magic Link (fallback)
- **Database:** Postgres with pgvector extension enabled
- **RLS Policies:** All tables filtered by `user_id = auth.uid()`
- **Storage:** `exports` bucket for large file exports
- **Edge Functions:** Optional — embedding generation fallback if client-side isn't viable

#### Sync Protocol (v1.0)

1. **Push:** CLI reads all entries with `synced = false` from local SQLite → upserts to Supabase → marks local entries as synced
2. **Pull:** CLI fetches all remote entries for project (filtered by branch) with `updated_at > last_pull_at` → upserts to local SQLite
3. **Conflict resolution:** Last-write-wins based on `updated_at` timestamp (v1.0 simplicity — single player, so conflicts are rare)
4. **Offline-first:** All commands work locally. Push/pull are explicit. No background sync.

### F3: Semantic Search

#### How It Works

1. On `memocore push`, CLI sends entries to Supabase; a Supabase Edge Function generates embeddings server-side using MemoCore's OpenAI account (Pro tier only)
2. Embedding = `text-embedding-3-small(title + " " + content)`
3. Stored in `embedding` column (vector(1536)) via pgvector
4. On `memocore search <query>`:
   - **Pro tier:** Query sent to Edge Function → embedding generated → cosine similarity search via RPC → ranked results
   - **Free tier:** Postgres full-text search (GIN index) — still useful, just not semantic
   - Return top 10 results with relevance scores
5. Cost: ~$0.00002 per entry. At 50K entries (Pro tier max) = ~$1.00. Absorbed into $29/mo pricing.

#### Supabase RPC Function

```sql
create or replace function search_memory(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 10,
  p_project_id uuid default null
)
returns table (
  id uuid,
  type text,
  title text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    me.id, me.type, me.title, me.content,
    1 - (me.embedding <=> query_embedding) as similarity
  from memory_entries me
  where me.user_id = auth.uid()
    and (p_project_id is null or me.project_id = p_project_id)
    and me.is_archived = false
    and 1 - (me.embedding <=> query_embedding) > match_threshold
  order by me.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

#### Fallback: Full-Text Search (Free Tier)

```sql
-- GIN index on title + content for full-text search
create index idx_memory_fts on memory_entries
  using gin(to_tsvector('english', title || ' ' || content));
```

### F4: Branching & Time Travel

#### Branching

- Every entry has a `branch` field (default: `main`)
- `memocore branch create <name>` copies current branch state pointers
- Entries are branch-scoped: `load`, `list`, `search` filter by active branch
- `memocore branch merge` applies source entries to target, last-write-wins on conflicts
- Branches are lightweight — no full data duplication, entries reference their branch

#### Time Travel

- Every update to a `memory_entry` creates a row in `memory_versions`
- `content_snapshot` stores the full entry state as JSON at that version
- `memocore history --entry <id>` shows all versions with timestamps and change types
- `memocore history restore <id> --version <N>` creates a new version with the old state
- Supabase trigger auto-creates version rows on UPDATE

```sql
create or replace function log_memory_version()
returns trigger as $$
begin
  insert into memory_versions (entry_id, version, content_snapshot, change_type, user_id)
  values (
    NEW.id,
    NEW.version,
    to_jsonb(NEW),
    case
      when TG_OP = 'INSERT' then 'created'
      when OLD.is_archived = false and NEW.is_archived = true then 'archived'
      when OLD.is_archived = true and NEW.is_archived = false then 'restored'
      else 'updated'
    end,
    NEW.user_id
  );
  return NEW;
end;
$$ language plpgsql;

create trigger memory_version_trigger
  after insert or update on memory_entries
  for each row execute function log_memory_version();
```

### F5: MCP Server

#### Overview

MemoCore ships a built-in MCP server that AI agents connect to via the MCP protocol. When an agent starts a session, it can query project memory without the developer manually running `memocore load`.

#### MCP Tools Exposed

```json
{
  "tools": [
    {
      "name": "suggest_context",
      "description": "Given a task or prompt, return only the most relevant memory entries. Use this INSTEAD of loading all project memory. Reduces token usage and improves output quality.",
      "input_schema": {
        "type": "object",
        "properties": {
          "task_signal": { "type": "string", "description": "The user's current prompt or task description" },
          "active_files": { "type": "array", "items": { "type": "string" }, "description": "Files currently being worked on" },
          "max_tokens": { "type": "number", "default": 2000 },
          "min_relevance": { "type": "number", "default": 0.3 }
        },
        "required": ["task_signal"]
      }
    },
    {
      "name": "get_project_context",
      "description": "Get current project overview: stack, config, active context, recent decisions",
      "input_schema": {
        "type": "object",
        "properties": {
          "max_tokens": { "type": "number", "default": 2000 }
        }
      }
    },
    {
      "name": "get_decisions",
      "description": "Get architectural decisions, optionally filtered by category",
      "input_schema": {
        "type": "object",
        "properties": {
          "category": { "type": "string" },
          "limit": { "type": "number", "default": 10 }
        }
      }
    },
    {
      "name": "get_patterns",
      "description": "Get code patterns and conventions",
      "input_schema": {
        "type": "object",
        "properties": {
          "language": { "type": "string" },
          "tags": { "type": "array", "items": { "type": "string" } },
          "limit": { "type": "number", "default": 10 }
        }
      }
    },
    {
      "name": "search_memory",
      "description": "Semantic search across all project memory",
      "input_schema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "type": { "type": "string", "enum": ["decision", "pattern", "context", "document", "session"] },
          "limit": { "type": "number", "default": 5 }
        },
        "required": ["query"]
      }
    },
    {
      "name": "log_decision",
      "description": "Log a new architectural decision with rationale",
      "input_schema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "rationale": { "type": "string" },
          "category": { "type": "string" },
          "alternatives": { "type": "string" }
        },
        "required": ["title", "rationale"]
      }
    },
    {
      "name": "update_context",
      "description": "Update the active working context",
      "input_schema": {
        "type": "object",
        "properties": {
          "feature": { "type": "string" },
          "blockers": { "type": "array", "items": { "type": "string" } },
          "next_steps": { "type": "array", "items": { "type": "string" } },
          "files": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    {
      "name": "save_pattern",
      "description": "Save a new code pattern or convention",
      "input_schema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "content": { "type": "string" },
          "language": { "type": "string" },
          "tags": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["title", "content"]
      }
    }
  ]
}
```

#### MCP Server Config

The MCP server reads from the local `.memocore/` directory (SQLite + config). It runs as a stdio transport process.

**Claude Code integration (`~/.claude/claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "memocore": {
      "command": "memocore",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

**Cursor integration (`.cursor/mcp.json`):**
```json
{
  "mcpServers": {
    "memocore": {
      "command": "memocore",
      "args": ["mcp", "serve"]
    }
  }
}
```

#### MCP Behavior

- Server auto-detects project by walking up directory tree for `.memocore/`
- Reads from local SQLite (fast, offline-capable)
- Write operations (log_decision, update_context, save_pattern) write to local DB and mark as unsynced
- Developer runs `memocore push` to sync writes to remote

---

## Technical Architecture

### Project Structure

```
memocore/
├── package.json
├── tsconfig.json
├── src/
│   ├── cli/
│   │   ├── index.ts          — CLI entry point (commander.js)
│   │   ├── commands/
│   │   │   ├── init.ts
│   │   │   ├── auth.ts
│   │   │   ├── decision.ts
│   │   │   ├── pattern.ts
│   │   │   ├── context.ts
│   │   │   ├── doc.ts
│   │   │   ├── session.ts
│   │   │   ├── push.ts
│   │   │   ├── pull.ts
│   │   │   ├── load.ts
│   │   │   ├── search.ts
│   │   │   ├── branch.ts
│   │   │   ├── history.ts
│   │   │   ├── status.ts
│   │   │   ├── export.ts
│   │   │   ├── import.ts
│   │   │   └── config.ts
│   │   └── utils/
│   │       ├── output.ts      — Formatted terminal output
│   │       ├── prompts.ts     — Interactive prompts (inquirer)
│   │       └── detector.ts    — Stack auto-detection
│   ├── core/
│   │   ├── database.ts        — SQLite operations (better-sqlite3)
│   │   ├── supabase.ts        — Supabase client & sync logic
│   │   ├── embeddings.ts      — Embedding generation (via Edge Function)
│   │   ├── search.ts          — Semantic + full-text search
│   │   ├── relevance.ts       — Smart suggest relevance scoring engine
│   │   ├── branch.ts          — Branch management logic
│   │   ├── versioning.ts      — Time travel / version logic
│   │   ├── context-builder.ts — Token-aware context assembly (load --all)
│   │   ├── smart-loader.ts    — Task-scoped & file-aware retrieval (load --task/--files)
│   │   └── types.ts           — Shared TypeScript types
│   ├── mcp/
│   │   ├── server.ts          — MCP server entry point
│   │   ├── tools.ts           — Tool definitions & handlers
│   │   └── transport.ts       — stdio transport
│   └── index.ts               — Main export
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_pgvector.sql
│   │   ├── 003_rls_policies.sql
│   │   ├── 004_functions.sql
│   │   └── 005_triggers.sql
│   └── config.toml
├── tests/
│   ├── cli/
│   ├── core/
│   └── mcp/
└── README.md
```

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `commander` | CLI framework |
| `better-sqlite3` | Local SQLite database |
| `@supabase/supabase-js` | Supabase client |
| `@modelcontextprotocol/sdk` | MCP server SDK |
| `openai` | Embedding generation |
| `inquirer` | Interactive prompts |
| `chalk` | Terminal styling |
| `ora` | Spinners |
| `clipboardy` | Clipboard copy for `load --copy` |
| `tiktoken` | Token counting for context budgets |
| `vitest` | Testing |
| `tsup` | Build/bundle |

### Context Builder Logic

The `load` command assembles a context payload within a token budget:

```
Priority order (highest → lowest):
1. Project config (stack, name) — ~100 tokens
2. Active context (current feature, blockers, next steps) — ~200 tokens
3. Recent decisions (last 10, sorted by recency) — ~150 tokens each
4. Active patterns (sorted by usage_count) — ~100 tokens each
5. Recent sessions (last 3) — ~200 tokens each
6. Documents (sorted by recency) — variable

Algorithm:
1. Start with budget (default: 4000 tokens)
2. Always include #1 and #2
3. Fill remaining budget with #3–#6 using priority weights
4. Truncate individual entries if needed to fit budget
5. Format for target agent (markdown/json/xml)
```

### F6: Intelligent Context Retrieval (Smart Suggest)

**The problem this solves:** Developers either dump their entire memory into the prompt (wasting tokens, adding noise, degrading output quality) or manually pick what to include (tedious, error-prone). Neither scales.

**MemoCore's approach:** Analyze the current task signal — the user's prompt, active files, current context — and retrieve only the memory entries that are relevant. The agent gets a surgically precise context window instead of a firehose.

#### How It Works

```
┌──────────────────────────────┐
│  Signal Sources              │
│  ─────────────────           │
│  • User's current prompt     │
│  • Active context (feature,  │
│    blockers, files)          │
│  • Open files / git diff     │
│  • Recent session history    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Relevance Engine            │
│  ─────────────────           │
│  1. Extract task keywords    │
│  2. Embed task signal        │
│  3. Cosine similarity vs     │
│     all memory entries       │
│  4. Boost by type weights    │
│     & recency decay          │
│  5. Deduplicate & rank       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Smart Context Payload       │
│  ─────────────────           │
│  Only top-K relevant entries │
│  within token budget         │
│  Formatted for target agent  │
└──────────────────────────────┘
```

#### Relevance Scoring Algorithm

Each memory entry gets a relevance score (0–1) based on:

```
score = (w1 × semantic_similarity)     // cosine similarity of task signal vs entry embedding
      + (w2 × keyword_overlap)         // exact keyword match ratio (files, tech, concepts)
      + (w3 × recency_boost)           // exponential decay: newer = more relevant
      + (w4 × type_weight)             // context > decisions > patterns > sessions > docs
      + (w5 × usage_frequency)         // patterns used often rank higher

Weights (tunable via config):
  w1 = 0.40  (semantic is primary signal)
  w2 = 0.20  (keyword catches what embeddings miss)
  w3 = 0.15  (recency matters)
  w4 = 0.15  (type priority)
  w5 = 0.10  (usage patterns)
```

#### Retrieval Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Auto** | MCP `get_project_context` | Analyzes agent's first message, retrieves top-K relevant entries. Default mode. |
| **Task-scoped** | `memocore load --task "build payment flow"` | Explicit task description → targeted retrieval |
| **File-aware** | `memocore load --files src/payments/**` | Matches memory entries tagged with or mentioning those file paths |
| **Full dump** | `memocore load --all` | Legacy behavior — dumps everything within token budget (no filtering) |

#### MCP Integration (Key Differentiator)

The MCP server exposes a `suggest_context` tool that agents call automatically:

```json
{
  "name": "suggest_context",
  "description": "Given a task description or user prompt, return only the memory entries most relevant to the current work. Use this instead of loading all project memory.",
  "input_schema": {
    "type": "object",
    "properties": {
      "task_signal": {
        "type": "string",
        "description": "The user's current prompt, question, or task description"
      },
      "active_files": {
        "type": "array",
        "items": { "type": "string" },
        "description": "File paths currently open or being worked on"
      },
      "max_tokens": {
        "type": "number",
        "default": 2000,
        "description": "Maximum token budget for returned context"
      },
      "min_relevance": {
        "type": "number",
        "default": 0.3,
        "description": "Minimum relevance score (0-1) to include an entry"
      }
    },
    "required": ["task_signal"]
  }
}
```

**Example flow in Claude Code:**

```
User: "I need to add Stripe webhook handling for subscription events"

Claude Code → MCP suggest_context({
  task_signal: "add Stripe webhook handling for subscription events",
  active_files: ["src/api/webhooks.ts", "src/services/billing.ts"]
})

MemoCore returns (ranked by relevance):
  1. Decision: "Use Stripe for billing" (0.92 relevance)
  2. Pattern: "API error handler with retry" (0.78 relevance)
  3. Decision: "Webhook signature verification required" (0.75 relevance)
  4. Context: "Currently building payment flow" (0.71 relevance)
  5. Pattern: "Event-driven service pattern" (0.65 relevance)

NOT returned (below threshold):
  - Decision: "Use Prisma over Drizzle" (0.18 relevance)
  - Pattern: "Auth middleware" (0.22 relevance)
  - Document: "Deployment runbook" (0.12 relevance)
```

The agent gets 5 targeted entries (~800 tokens) instead of 29 entries (~4,200 tokens). Better context, better output, lower cost.

#### CLI Usage

```bash
# Task-scoped retrieval
memocore load --task "implement webhook handlers for Stripe"
# Returns only entries relevant to webhooks, Stripe, payment patterns

# File-aware retrieval
memocore load --files src/api/payments.ts src/services/billing.ts
# Returns entries that reference these files or related concepts

# Combine both
memocore load --task "add error handling" --files src/api/** --max-tokens 2000

# Still available: full dump mode
memocore load --all --agent claude-code
```

#### Smart Suggest vs Full Load — When Each Is Used

| Scenario | Method | Why |
|----------|--------|-----|
| Starting a new feature | `suggest_context` with task description | Only need relevant decisions and patterns |
| Onboarding to a project | `load --all` | Need the full picture once |
| Debugging a specific file | `suggest_context` with file paths | Need patterns and decisions for that area |
| Resuming after a break | `suggest_context` with active context | Surface recent sessions + current blockers |
| Code review | `suggest_context` with diff content | Match decisions and patterns against changes |

---



---

## Delivery Plan — 10 Days (Claude Code Sprint)

Building with Claude Code as primary dev tool. Each day = one focused sprint. No fluff, no buffer.

### Day 1: Scaffold + Local DB + Core CLI

- [ ] Project scaffolding (tsconfig, package.json, tsup, bin config)
- [ ] SQLite database layer (better-sqlite3, full schema, CRUD)
- [ ] `memocore init` with stack auto-detection + auto-add `.memocore/` to .gitignore
- [ ] `memocore status`, `memocore config`
- [ ] Terminal output (chalk + ora)

**Ship:** CLI installs globally, init works, local DB reads/writes.

### Day 2: All Memory CRUD

- [ ] `decision add/list/show`
- [ ] `pattern add/list`
- [ ] `context set/show`
- [ ] `doc add/list` (including `--file` import)
- [ ] `session start/end/list` with auto-logging hooks
- [ ] `export/import` (JSON format)
- [ ] Local versioning (version increment on every update)

**Ship:** Full local memory management working.

### Day 3: Supabase Backend + Auth

- [ ] Supabase project creation (Postgres + pgvector + Storage)
- [ ] All migrations (tables, indexes, RLS policies, triggers, functions)
- [ ] `memocore auth login/logout/status` (GitHub OAuth browser flow)
- [ ] Supabase client wrapper
- [ ] Credential storage (~/.memocore/credentials.json)

**Ship:** Auth flow complete, Supabase schema live.

### Day 4: Push / Pull Sync

- [ ] `memocore push` — local → Supabase upsert, sync state tracking
- [ ] `memocore pull` — Supabase → local, last-write-wins
- [ ] Network error handling, auth expiry refresh
- [ ] Sync log recording

**Ship:** Full offline-first sync loop working.

### Day 5: Semantic Search

- [ ] Supabase Edge Function for embedding generation (MemoCore's OpenAI key, server-side)
- [ ] Push triggers Edge Function → generates embedding → stores in pgvector
- [ ] Supabase RPC function for cosine similarity search
- [ ] `memocore search <query>` — sends query to Edge Function for embedding, then RPC search
- [ ] Free tier: full-text search only (GIN index, no embeddings)
- [ ] Pro tier: semantic search included (embeddings generated server-side)
- [ ] Tier check on push — skip embedding call for free users

**Ship:** `memocore search "why did we pick postgres"` returns semantically ranked results for Pro users.

### Day 6: Branching + Time Travel

- [ ] `branch create/list/switch/merge`
- [ ] Branch-scoped queries across all commands
- [ ] Supabase trigger for auto-versioning (memory_versions table)
- [ ] `memocore history --entry <id>`
- [ ] `memocore history restore <id> --version <N>`
- [ ] Merge logic (last-write-wins)

**Ship:** Full branching and version history working.

### Day 7: MCP Server + Smart Suggest

- [ ] MCP server (stdio transport, @modelcontextprotocol/sdk)
- [ ] All 8 tools implemented (including `suggest_context` as primary retrieval tool)
- [ ] `memocore mcp serve` command
- [ ] Relevance scoring engine (semantic similarity + keyword overlap + recency + type weights)
- [ ] `suggest_context` tool: task signal → embed → cosine similarity → ranked retrieval
- [ ] Auto-session logging via MCP (create session entry on first tool call per session)
- [ ] Config generation helpers for Claude Code + Cursor

**Ship:** Claude Code calls `suggest_context` and gets surgically relevant memory instead of everything.

### Day 8: Context Builder + Smart Load CLI

- [ ] `memocore load --task "..."` — task-scoped retrieval via relevance engine
- [ ] `memocore load --files src/**` — file-aware retrieval (matches entries referencing those paths)
- [ ] `memocore load --all` — full dump mode (legacy, within token budget)
- [ ] Combined mode: `--task` + `--files` + `--max-tokens`
- [ ] Priority-weighted full-dump builder (config → context → decisions → patterns → sessions → docs)
- [ ] Agent format presets (claude-code, cursor, copilot)
- [ ] `--max-tokens`, `--format`, `--copy` flags
- [ ] tiktoken integration for accurate token counting

**Ship:** `memocore load --task "add Stripe webhooks" --copy` returns only relevant context, not everything.

### Day 9: Pricing + Polish

- [ ] Stripe integration for Pro tier ($29/seat/mo) — live from day one
- [ ] Free tier enforcement (3 projects, 1,000 entries)
- [ ] Pro tier unlocks (unlimited projects, semantic search, branching, 50K entries)
- [ ] `memocore billing` command (status, upgrade link, usage)
- [ ] Comprehensive error messages across all commands
- [ ] Edge case handling (empty projects, large files, bad input)

**Ship:** Paid tier live. Usage limits enforced.

### Day 10: Docs + Launch

- [ ] README.md (installation, quickstart, full reference)
- [ ] QUICKREF.md (cheat sheet)
- [ ] npm publish as `@memocore/cli`
- [ ] GitHub repo (MIT license, contributing guide, issue templates)
- [ ] Landing page live at memocore.dev
- [ ] Launch post drafts (HN, Reddit r/programming, Twitter/X)
- [ ] End-to-end smoke test: init → CRUD → push → search → MCP → load

**Ship:** Live on npm. Docs shipped. Launch posts queued.

---

## Success Metrics (First 90 Days)

| Metric | Target |
|--------|--------|
| npm installs (week 1) | 500+ |
| GitHub stars (month 1) | 200+ |
| Weekly active projects (month 1) | 50+ |
| Paid conversions — Pro tier (month 1) | 10+ ($290/mo MRR) |
| Paid conversions — Pro tier (month 3) | 50+ ($1,450/mo MRR) |
| Average entries per project | 15+ |
| MCP tool calls per session | 3+ (validates agent adoption) |

---

## Out of Scope (v1.0)

Deferred to v2.0+:

- **Web dashboard** — all interaction via CLI and MCP
- **Team collaboration** — single-player only, no shared projects
- **Real-time sync** — explicit push/pull, no background sync
- **Conflict resolution UI** — last-write-wins only
- **Custom embedding models** — OpenAI text-embedding-3-small only for v1.0
- **Plugin system** — hardcoded integrations only
- **Mobile/desktop app** — CLI and MCP only

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MCP adoption stalls | Low agent integration | CLI `load` command works independently of MCP |
| Embedding costs at scale | Margin pressure at high volume | $0.00002/entry — 50K entries = $1. Safe at $29/mo. Monitor and cap if needed |
| Supabase free tier limits | Growth ceiling | Monitor usage, upgrade plan at ~100 users |
| npm scope `@memocore/cli` taken | Branding | Check availability immediately, fallback to `@ghostsavvy/memocore` |
| Stripe integration complexity | Day 9 overrun | Use Stripe Checkout links (no custom UI), CLI just opens browser |

---

## Decisions Log

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Pricing activation | Immediate — paid tiers live from launch day |
| 2 | Embedding API key | MemoCore proxies via own OpenAI account — no BYOK. Cost absorbed into Pro pricing ($0.00002/entry, margins are safe). Free tier = full-text search only. |
| 3 | .memocore in .gitignore | Auto-add on `memocore init` |
| 4 | Session auto-logging | Auto-log via MCP on first tool call per session |
| 5 | npm scope | `@memocore/cli` (namespace protected) |
| 6 | Timeline | 10-day Claude Code sprint |
| 7 | Context retrieval | Smart suggest over full dump — relevance engine scores entries against current task signal. `suggest_context` is the primary MCP tool agents should call. `load --all` kept as fallback. |
