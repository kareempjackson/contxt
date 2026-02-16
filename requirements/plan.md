MemoCore Implementation Plan
Context
What we're building: MemoCore is "GitHub for AI Context" — a CLI-first developer tool that gives AI coding agents persistent, versioned, project-scoped memory. It solves the problem that every AI-assisted development session starts from zero, forcing developers to waste ~40% of their prompts re-explaining architecture, conventions, and past decisions.

Current state: Greenfield project with comprehensive requirements documents but no implementation code.

Why this matters: Instead of dumping everything into prompts (wasting tokens and degrading output), MemoCore intelligently surfaces only what's relevant to the current task. The killer feature is MCP (Model Context Protocol) integration that allows Claude Code and other AI agents to automatically load relevant context without manual intervention.

Timeline: 10-day sprint to ship v1.0 (target: ~Feb 25, 2026)

Scope decisions:

✅ Local-first approach (SQLite before Supabase)
✅ All core features (memory, MCP, semantic search, branching)
❌ Billing/Stripe integration deferred to v2.0
Implementation Approach
Architecture Overview

memocore/ (TypeScript monorepo)
├── packages/
│ ├── core/ (@memocore/core - business logic)
│ │ ├── interfaces/ (ILocalDatabase, IRemoteDatabase, etc.)
│ │ ├── engine/ (MemoryEngine, SyncEngine, RelevanceEngine)
│ │ └── utils/ (tokens, scoring, stack detection)
│ ├── adapters/ (@memocore/adapters)
│ │ ├── sqlite/ (Local storage implementation)
│ │ └── supabase/ (Cloud sync implementation)
│ ├── cli/ (@memocore/cli - npm binary)
│ │ ├── commands/ (30+ command implementations)
│ │ └── bin/memocore.ts (Entry point)
│ └── mcp/ (@memocore/mcp - MCP server)
│ ├── tools/ (8 MCP tools)
│ └── server.ts (stdio transport)
├── supabase/
│ ├── migrations/ (SQL schema files)
│ └── functions/embed/ (Edge Function for embeddings)
└── .memocore/ (Created in user projects)
├── config.json
└── local.db (SQLite database)
Key design principles:

Infrastructure-agnostic core — All database/auth code behind interfaces
Offline-first — SQLite is local source of truth, Supabase syncs later
Adapter pattern — Can swap Supabase for AWS/GCP without changing business logic
Clean boundaries — Each package has single responsibility
10-Day Implementation Sprint
Days 1-2: Foundation & Local Storage
Goal: Get basic project scaffolding and local SQLite storage working

Tasks:

Set up monorepo structure with Turborepo + pnpm
Configure TypeScript build (tsup for bundling)
Define core interfaces in @memocore/core
Implement SQLite adapter with schema
Build basic CLI framework with Commander.js
Implement core memory CRUD commands
Deliverables:

memocore init creates .memocore/ directory with SQLite DB
memocore decision add/list/show works locally
memocore pattern add/list works locally
memocore context set/show works locally
All data persists to SQLite
Critical files:

packages/core/src/interfaces/database.ts (ILocalDatabase contract)
packages/adapters/src/sqlite/database.ts (SQLite implementation)
packages/adapters/src/sqlite/schema.sql (Database schema)
packages/cli/src/commands/init.ts
packages/cli/src/commands/decision.ts
Validation:

memocore init
memocore decision add --title "Use TypeScript" --rationale "Type safety"
memocore decision list

# Should display the decision

Day 3: Complete CLI Commands
Goal: Implement all local memory management commands

Tasks:

Add document management (doc add/list/show)
Add session tracking (session start/end/list)
Implement search command (local full-text search)
Add export/import functionality
Build status command (project summary)
Add configuration management
Deliverables:

All 5 memory types working (decision, pattern, context, document, session)
Local search with SQLite FTS
Export/import for backup
Project status overview
Critical files:

packages/cli/src/commands/doc.ts
packages/cli/src/commands/session.ts
packages/cli/src/commands/search.ts
packages/cli/src/commands/export.ts
packages/core/src/engine/memory.ts (Core business logic)
Validation:

memocore doc add --title "API Docs" --content "..."
memocore session start --feature "Payment flow"
memocore search "payment"
memocore export > backup.json
Day 4: MCP Server Integration
Goal: Build MCP server so Claude Code can auto-load context

Tasks:

Set up @memocore/mcp package with MCP SDK
Implement 8 MCP tools (suggest_context is primary)
Build relevance scoring engine for smart context retrieval
Add token counting and budget enforcement
Create stdio transport layer
Test integration with Claude Code
Deliverables:

MCP server executable that Claude Code can call
suggest_context tool returns relevant entries based on task signal
Token budgets respected (default 4000 tokens)
Works offline from local SQLite
Critical files:

packages/mcp/src/server.ts (Main MCP server)
packages/mcp/src/tools/suggest-context.ts (Smart retrieval)
packages/core/src/engine/relevance.ts (Scoring algorithm)
packages/core/src/utils/tokens.ts (Token counting with tiktoken)
Relevance scoring algorithm:

Keyword overlap: 40% (since no embeddings locally yet)
Recency boost: 25% (exponential decay)
Type weighting: 20% (context > decisions > patterns)
File match: 15% (boost entries mentioning active files)
Validation:

# Add to ~/.claude/claude_desktop_config.json

memocore mcp install

# Test from Claude Code

"Help me implement payment flow"

# Should auto-load relevant decisions/patterns

Day 5: Supabase Backend & Sync
Goal: Add cloud sync capability with Supabase

Tasks:

Set up Supabase project (database, auth, storage)
Create migrations for all tables
Implement Supabase adapter (IRemoteDatabase)
Build auth flow (GitHub OAuth + magic link)
Implement push/pull sync commands
Add conflict detection (last-write-wins)
Deliverables:

memocore auth login opens browser for GitHub OAuth
memocore push syncs local entries to Supabase
memocore pull fetches remote changes
Row-Level Security policies enforce user isolation
Critical files:

supabase/migrations/00001_initial_schema.sql (Core tables)
supabase/migrations/00002_auth_schema.sql (User profiles)
supabase/migrations/00003_rls_policies.sql (Security)
packages/adapters/src/supabase/database.ts (Cloud adapter)
packages/adapters/src/supabase/auth.ts (Auth implementation)
packages/core/src/engine/sync.ts (Sync logic)
Sync protocol:

Push: Get unsynced local entries → Upsert to Supabase → Mark synced
Pull: Get remote changes since last pull → Upsert to local SQLite
Conflicts: Last-write-wins based on updated_at timestamp
Validation:

memocore auth login
memocore push

# On another machine:

memocore pull

# Should see entries from first machine

Day 6: Semantic Search & Embeddings
Goal: Add intelligent semantic search for better context retrieval

Tasks:

Create Supabase Edge Function for embedding generation
Add pgvector extension and indexes
Implement embedding generation on push
Build semantic search query
Update MCP suggest_context to use embeddings
Add cost controls (batch limits, deduplication)
Deliverables:

memocore search "payment flow" returns semantically similar entries
Embeddings generated server-side via Edge Function
MCP server uses semantic similarity for better context ranking
Cost-efficient batching (max 100 embeddings per push)
Critical files:

supabase/functions/embed/index.ts (OpenAI embedding generation)
supabase/migrations/00004_embeddings.sql (pgvector setup)
packages/adapters/src/supabase/embeddings.ts (Embedding client)
packages/core/src/engine/search.ts (Semantic search logic)
Updated relevance scoring (with embeddings):

Semantic similarity: 40% (cosine similarity from embeddings)
Keyword overlap: 20%
Recency: 15%
Type weighting: 15%
File match: 10%
Validation:

memocore decision add --title "Use Stripe for payments" --rationale "..."
memocore push # Generates embedding
memocore search "payment processing"

# Should return Stripe decision even without exact keyword match

Day 7: Branching & Versioning
Goal: Add Git-like branching and time travel

Tasks:

Implement branch CRUD (create, list, switch, delete)
Build branch-scoped queries
Implement automatic versioning on entry updates
Create merge logic (last-write-wins)
Add history and restore commands
Update all commands to respect active branch
Deliverables:

memocore branch create feature/new-approach creates isolated memory
memocore branch switch main changes active context
memocore branch merge feature/new-approach folds changes back
memocore history <entry-id> shows version timeline
All entry updates auto-create version snapshots
Critical files:

supabase/migrations/00005_branching.sql (branches table)
supabase/migrations/00006_versioning.sql (memory_versions + trigger)
packages/core/src/engine/branch.ts (Branching logic)
packages/core/src/engine/version.ts (Version history)
packages/cli/src/commands/branch.ts
packages/cli/src/commands/history.ts
Branching model:

Lightweight branches (entries reference branch, not duplicated)
Merge applies entries from source to target branch
Conflicts resolved by last-write-wins
Version history preserved across branches
Validation:

memocore branch create experiment
memocore decision add --title "Try approach B" --rationale "..."
memocore branch switch main
memocore decision list # Should NOT show "Try approach B"
memocore branch merge experiment
memocore decision list # Now shows merged decision
Day 8: Context Builder & Smart Load
Goal: Intelligent context payload generation for AI agents

Tasks:

Build context builder with multiple modes (task, files, all)
Implement token budget enforcement
Add relevance filtering and ranking
Create formatted output (markdown with metadata)
Add --max-tokens flag support
Optimize MCP suggest_context to use builder
Deliverables:

memocore load --task "build payment flow" returns targeted context
memocore load --files src/payments/\*\* returns file-aware context
memocore load --all dumps everything (with token limit)
Output respects --max-tokens budget
Formatted for easy copy-paste into AI prompts
Critical files:

packages/core/src/engine/context-builder.ts (Context assembly)
packages/cli/src/commands/load.ts (Load command)
packages/core/src/utils/formatter.ts (Markdown output)
Context builder logic:

Extract task signal (query, active files, recent sessions)
Score all entries by relevance
Sort by score descending
Take top-K entries that fit within token budget
Format as structured markdown
Validation:

memocore load --task "implement Stripe webhooks" --max-tokens 2000

# Should return only most relevant entries within budget

# Output includes: decisions, patterns, context, file paths

Days 9-10: Polish, Testing & Documentation
Goal: Production-ready release

Tasks:

Error handling and edge case coverage
Input validation and helpful error messages
Performance optimization (caching, indexes)
Comprehensive testing (unit + integration)
Write README with quickstart
Create reference documentation
Publish to npm as @memocore/cli
Deploy Supabase project to production
Deliverables:

Zero crashes on invalid input
Clear, actionable error messages
All commands <2s response time
80% test coverage on core engine
Professional README with examples
npm package published
Production Supabase instance live
Testing priorities:

Unit tests (Vitest):

MemoryEngine CRUD operations
SyncEngine push/pull logic
RelevanceEngine scoring algorithm
BranchEngine merge conflicts
ContextBuilder token budgets
Integration tests:

Init → Add → Export → Import (data integrity)
Create branch → Add entry → Merge → Verify
Push → Pull roundtrip (requires Supabase)
MCP server call from Claude Code
Manual smoke tests:

Quickstart from README works
Offline mode (disable network, verify local ops)
Error handling (invalid inputs)
Performance (100 entries, <2s per command)
Documentation structure:

README.md
├── What is MemoCore?
├── Quickstart (5 minutes)
├── Installation
├── Core Concepts
├── Command Reference
├── MCP Integration Guide
└── Architecture Overview
Validation:

npm install -g @memocore/cli
memocore init

# Follow quickstart exactly as written

# Should work without issues

Critical Files to Implement

1. Core Interface Contract
   Path: packages/core/src/interfaces/database.ts

Why critical: Defines the adapter contract between business logic and infrastructure. Getting this wrong means refactoring everything later.

Must include:

export interface ILocalDatabase {
// Project management
initProject(config: ProjectConfig): Promise<Project>;
getProject(projectId: string): Promise<Project | null>;

// Memory CRUD
createEntry(entry: CreateEntryInput): Promise<MemoryEntry>;
getEntry(id: string): Promise<MemoryEntry | null>;
updateEntry(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry>;
deleteEntry(id: string): Promise<void>;
listEntries(query: EntryQuery): Promise<MemoryEntry[]>;

// Sync tracking
getUnsyncedEntries(projectId: string): Promise<MemoryEntry[]>;
markSynced(ids: string[]): Promise<void>;
getEntriesUpdatedSince(timestamp: Date): Promise<MemoryEntry[]>;

// Branching
createBranch(name: string, fromBranch: string): Promise<Branch>;
switchBranch(name: string): Promise<void>;

// Versioning
createVersion(entryId: string, snapshot: MemoryEntry): Promise<void>;
getVersionHistory(entryId: string): Promise<MemoryEntry[]>;
}

export interface IRemoteDatabase {
// Same methods but for cloud
// Enables adapter swapping
} 2. SQLite Adapter
Path: packages/adapters/src/sqlite/database.ts

Why critical: Local source of truth. Must be bulletproof.

Key responsibilities:

Implement ILocalDatabase interface
Schema initialization from schema.sql
Transaction support for multi-entry operations
Auto-versioning on updates
Sync state tracking
Must get right:

export class SQLiteDatabase implements ILocalDatabase {
private db: Database;

constructor(dbPath: string) {
this.db = new Database(dbPath);
this.db.pragma('foreign_keys = ON');
this.initSchema();
}

async createEntry(input: CreateEntryInput): Promise<MemoryEntry> {
// CRITICAL: Use transactions for atomicity
return this.db.transaction(() => {
const entry = this.db.prepare(`         INSERT INTO memory_entries (id, project_id, type, title, content, ...)
        VALUES (?, ?, ?, ?, ?, ...)
      `).run(...);

      // Auto-create first version
      this.createVersion(entry.id, entry);

      return entry;
    })();

}
} 3. Supabase Schema
Path: supabase/migrations/00001_initial_schema.sql

Why critical: Authoritative schema. SQLite mirrors this, not vice versa.

Must include:

-- Core tables
CREATE TABLE user_profiles (
id UUID PRIMARY KEY REFERENCES auth.users(id),
tier TEXT NOT NULL DEFAULT 'free',
created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
name TEXT NOT NULL,
stack JSONB,
config JSONB,
created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memory_entries (
id UUID,
project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
type TEXT NOT NULL CHECK (type IN ('decision', 'pattern', 'context', 'document', 'session')),
title TEXT NOT NULL,
content TEXT,
metadata JSONB,
embedding vector(1536), -- pgvector for semantic search
branch TEXT NOT NULL DEFAULT 'main',
version INTEGER NOT NULL DEFAULT 1,
is_synced BOOLEAN DEFAULT TRUE,
is_archived BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
PRIMARY KEY (project_id, id) -- Composite PK for future partitioning
);

-- Indexes
CREATE INDEX idx_entries_project_branch ON memory_entries(project_id, branch);
CREATE INDEX idx_entries_type ON memory_entries(type);
CREATE INDEX idx_entries_embedding ON memory_entries USING ivfflat(embedding vector_cosine_ops);
CREATE INDEX idx_entries_metadata ON memory_entries USING gin(metadata); 4. Memory Engine
Path: packages/core/src/engine/memory.ts

Why critical: Core business logic. All CLI commands route through here.

Key pattern:

export class MemoryEngine {
constructor(
private local: ILocalDatabase,
private remote?: IRemoteDatabase,
private embeddings?: IEmbeddingProvider,
) {}

async addDecision(projectId: string, input: DecisionInput): Promise<MemoryEntry> {
// Validate input
if (!input.title || !input.rationale) {
throw new ValidationError('Title and rationale required');
}

    // Create entry (local first)
    const entry = await this.local.createEntry({
      projectId,
      type: 'decision',
      title: input.title,
      content: input.rationale,
      metadata: {
        alternatives: input.alternatives,
        consequences: input.consequences,
      },
    });

    return entry;

}

// Never directly reference SQLite or Supabase
// Always go through interfaces
} 5. MCP Suggest Context Tool
Path: packages/mcp/src/tools/suggest-context.ts

Why critical: Killer feature. Smart retrieval is the differentiator.

Key algorithm:

export async function suggestContext(
opts: SuggestOptions
): Promise<RankedEntry[]> {
// 1. Get all non-archived entries
const entries = await db.listEntries({
projectId: opts.projectId,
branch: opts.branch || 'main',
isArchived: false,
});

// 2. Score each entry
const scored = entries.map(entry => ({
entry,
score: calculateRelevance(entry, opts),
reasons: getMatchReasons(entry, opts),
}));

// 3. Filter, sort, limit
const ranked = scored
.filter(s => s.score >= opts.minRelevance || 0.3)
.sort((a, b) => b.score - a.score)
.slice(0, opts.maxResults || 10);

// 4. Respect token budget
return fitToBudget(ranked, opts.maxTokens || 4000);
}

function calculateRelevance(
entry: MemoryEntry,
opts: SuggestOptions
): number {
let score = 0;

// Semantic similarity (if embeddings available)
if (opts.taskEmbedding && entry.embedding) {
score += cosineSimilarity(opts.taskEmbedding, entry.embedding) _ 0.4;
} else {
// Fallback: keyword overlap
score += keywordOverlap(entry, opts.taskDescription) _ 0.4;
}

// Recency boost (exponential decay over 30 days)
const daysOld = (Date.now() - entry.updated_at.getTime()) / (1000 _ 60 _ 60 _ 24);
score += Math.exp(-daysOld / 30) _ 0.25;

// Type priority
const typeWeights = { context: 0.20, decision: 0.15, pattern: 0.15, session: 0.10, document: 0.05 };
score += typeWeights[entry.type] || 0;

// File match boost
if (opts.activeFiles?.some(f => entry.content.includes(f))) {
score += 0.15;
}

return Math.min(score, 1.0);
}
Verification & Testing
End-to-End Validation
After Day 10, this complete workflow should work:

# 1. Install

npm install -g @memocore/cli

# 2. Initialize project

cd my-project
memocore init

# 3. Add project memory

memocore decision add \
 --title "Use Postgres for main DB" \
 --rationale "Need ACID guarantees and relational queries"

memocore pattern add \
 --title "API Error Handler" \
 --content "Always return { error: string, code: number }"

memocore context set \
 --feature "Payment integration" \
 --blockers "Need to verify Stripe webhook signatures"

# 4. Authenticate and sync

memocore auth login
memocore push

# 5. Search memory

memocore search "database"

# Returns "Use Postgres..." decision

# 6. Load context for AI

memocore load --task "implement payment webhooks"

# Returns relevant decisions + patterns within token budget

# 7. MCP integration (from Claude Code)

# User: "Help me add Stripe webhook handling"

# Claude Code calls suggest_context tool

# Gets: payment context, API error pattern, Stripe decision

# Provides better answer because it knows project conventions

# 8. Branching

memocore branch create experiment/new-db
memocore decision add --title "Try MongoDB instead" --rationale "..."
memocore branch switch main

# Back to original context

# 9. Time travel

memocore history <decision-id>

# Shows all versions with timestamps

memocore history restore <decision-id> --version 1

# Reverts to earlier version

# 10. Export for backup

memocore export > backup.json
Performance Benchmarks
Targets:

memocore status: <200ms
memocore decision list (1000 entries): <500ms
memocore search (10K entries): <2s
memocore push (100 entries): <5s
memocore load: <1s
Test with:

# Generate test data

for i in {1..1000}; do
memocore decision add --title "Decision $i" --rationale "Test"
done

# Measure performance

time memocore decision list
time memocore search "test"
Error Handling Validation
Test all these scenarios work gracefully:

# Invalid input

memocore decision add # Missing required fields

# Should show: "Error: --title and --rationale required"

# Offline mode

# Disable network

memocore decision add --title "Test" --rationale "Works offline"

# Should succeed locally

memocore push

# Should show: "No internet connection. Entries queued for next push."

# Empty project

memocore load

# Should show helpful message, not error

# Auth expiration

# Wait for token to expire

memocore push

# Should auto-refresh token transparently

# Large file import

memocore doc add --file huge-file.md # >1MB

# Should show: "File too large (2.3MB). Max size: 1MB"

Success Criteria
Functional Requirements
✅ All 30+ CLI commands work as documented
✅ Local SQLite storage works offline
✅ Supabase sync works bidirectionally (push/pull)
✅ Semantic search returns relevant results
✅ MCP server callable from Claude Code
✅ Branching and time travel work correctly
✅ No billing/Stripe integration (deferred to v2)
Quality Requirements
✅ Zero crashes on invalid input (graceful errors)
✅ Clear, actionable error messages
✅ Works offline for all local operations
✅ No data loss on crashes (SQLite transactions)
✅ 80% test coverage on core engine
Performance Requirements
✅ All commands respond in <2s
✅ Search handles 10K+ entries efficiently
✅ Token budgets respected precisely
Deliverables
✅ Published to npm as @memocore/cli
✅ README with quickstart + full reference
✅ GitHub repo with MIT license
✅ Supabase project deployed to production
✅ MCP server installable via memocore mcp install
Post-Sprint Improvements (Future)
After the 10-day sprint ships, these can be added:

Week 2-4:

Billing integration (Stripe + tier enforcement)
Better UX (progress bars, colors, interactive prompts)
GitHub integration (import issues as context)
memocore doctor health check command
Month 2-3 (v1.1):

Team collaboration (organizations table)
Web dashboard (view/edit memory in browser)
Real-time sync (not just explicit push/pull)
Advanced conflict resolution UI
Month 4+ (v2.0):

Self-hosted Docker deployment
Plugin system for custom memory types
VS Code extension (inline context)
Mobile app for on-the-go context
Risk Mitigation
Risk: SQLite/Postgres schema drift

Mitigation: Generate SQLite schema from Postgres (single source of truth)
Automated test comparing schemas
Risk: MCP protocol changes

Mitigation: Pin SDK version, wrap in adapter layer
Test with real Claude Code, not just docs
Risk: Embedding cost explosion

Mitigation: Track embeddings in DB, rate limit to 100/push
Skip billing enforcement means no cost concerns for v1
Risk: Auth flow fails on headless machines

Mitigation: Support device code flow fallback
Document MEMOCORE_TOKEN env var for CI/CD
Risk: 10-day timeline too aggressive

Mitigation: Local-first approach provides MVP by Day 4 (MCP working)
Cloud sync, search, branching are enhancements, not blockers
Can ship Day 4 state if needed, polish later
Next Steps
Scaffold monorepo (Turborepo + pnpm + TypeScript)
Define interfaces in @memocore/core
Implement SQLite adapter with schema
Build basic CLI with first commands
Follow 10-day sprint plan sequentially
The plan is ambitious but achievable with focused execution. Local-first approach provides safety net — if cloud features take longer, we still have a working local tool.
