# MemoCore — System Architecture

**Version:** 1.0 → Scale-Ready
**Date:** February 2026
**Philosophy:** Simple monorepo now. Every seam designed so it splits cleanly later.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  CLI          │  │  MCP Server  │  │  SDK (future)            │  │
│  │  @memocore/cli│  │  stdio       │  │  @memocore/sdk           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                      │                  │
│         └─────────────────┼──────────────────────┘                  │
│                           │                                         │
│                    ┌──────▼───────┐                                  │
│                    │  Core Engine │ ← All business logic lives here │
│                    │  @memocore/  │                                  │
│                    │  core        │                                  │
│                    └──────┬───────┘                                  │
│                           │                                         │
│              ┌────────────┼────────────┐                            │
│              │            │            │                            │
│        ┌─────▼─────┐ ┌───▼────┐ ┌─────▼──────┐                    │
│        │ Local DB   │ │ Auth   │ │ Embeddings │                    │
│        │ SQLite     │ │ Client │ │ Client     │                    │
│        │ (offline)  │ │        │ │            │                    │
│        └────────────┘ └───┬────┘ └─────┬──────┘                    │
└───────────────────────────┼────────────┼────────────────────────────┘
                            │            │
                            ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Supabase (Phase 1)                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────────┐ │    │
│  │  │ Postgres  │  │ Auth     │  │ Storage│  │ Edge         │ │    │
│  │  │ + pgvector│  │ GoTrue   │  │ S3     │  │ Functions    │ │    │
│  │  │          │  │          │  │        │  │ (embeddings) │ │    │
│  │  └──────────┘  └──────────┘  └────────┘  └──────────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AWS/GCP (Phase 2+)                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────────┐ │    │
│  │  │ Aurora /  │  │ Cognito /│  │ S3/GCS │  │ Lambda /     │ │    │
│  │  │ Cloud SQL │  │ Auth0    │  │        │  │ Cloud Run    │ │    │
│  │  │ + pgvector│  │          │  │        │  │              │ │    │
│  │  └──────────┘  └──────────┘  └────────┘  └──────────────┘ │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Core engine is infrastructure-agnostic.** All Supabase-specific code lives behind interfaces. Swap the adapter, keep the logic.
2. **Offline-first, sync-second.** SQLite is the source of truth locally. Cloud is a sync target, not a dependency.
3. **Every table scales horizontally.** Partition keys chosen now, even if partitioning is enabled later.
4. **Auth is pluggable.** Supabase Auth today, any OIDC provider tomorrow.
5. **Monorepo with clean package boundaries.** One repo, multiple internal packages that can become separate services when needed.

---

## 2. Monorepo Structure

```
memocore/
├── package.json                    ← Workspace root
├── turbo.json                      ← Turborepo build orchestration
├── tsconfig.base.json
│
├── packages/
│   ├── core/                       ← @memocore/core (business logic)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types.ts            ← All shared types & interfaces
│   │   │   ├── interfaces/
│   │   │   │   ├── database.ts     ← IDatabase interface
│   │   │   │   ├── auth.ts         ← IAuthProvider interface
│   │   │   │   ├── embeddings.ts   ← IEmbeddingProvider interface
│   │   │   │   ├── storage.ts      ← IStorageProvider interface
│   │   │   │   └── billing.ts      ← IBillingProvider interface
│   │   │   ├── engine/
│   │   │   │   ├── memory.ts       ← CRUD operations (provider-agnostic)
│   │   │   │   ├── search.ts       ← Search orchestration
│   │   │   │   ├── relevance.ts    ← Smart suggest scoring engine
│   │   │   │   ├── branch.ts       ← Branch management
│   │   │   │   ├── versioning.ts   ← Time travel logic
│   │   │   │   ├── context.ts      ← Context builder + smart loader
│   │   │   │   ├── sync.ts         ← Push/pull orchestration
│   │   │   │   └── session.ts      ← Session auto-logging
│   │   │   └── utils/
│   │   │       ├── tokens.ts       ← Token counting (tiktoken)
│   │   │       ├── detector.ts     ← Stack auto-detection
│   │   │       └── scoring.ts      ← Relevance score math
│   │   └── tests/
│   │
│   ├── adapters/                   ← @memocore/adapters (infra implementations)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── sqlite/
│   │   │   │   └── database.ts     ← IDatabase → better-sqlite3
│   │   │   ├── supabase/
│   │   │   │   ├── database.ts     ← IDatabase → Supabase Postgres
│   │   │   │   ├── auth.ts         ← IAuthProvider → Supabase Auth
│   │   │   │   ├── storage.ts      ← IStorageProvider → Supabase Storage
│   │   │   │   └── embeddings.ts   ← IEmbeddingProvider → Edge Function
│   │   │   ├── aws/                ← Future: IDatabase → Aurora, etc.
│   │   │   │   └── (placeholder)
│   │   │   └── stripe/
│   │   │       └── billing.ts      ← IBillingProvider → Stripe
│   │   └── tests/
│   │
│   ├── cli/                        ← @memocore/cli (npm binary)
│   │   ├── package.json
│   │   ├── bin/
│   │   │   └── memocore.ts         ← Entry point
│   │   ├── src/
│   │   │   ├── commands/           ← One file per command group
│   │   │   │   ├── init.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── decision.ts
│   │   │   │   ├── pattern.ts
│   │   │   │   ├── context.ts
│   │   │   │   ├── doc.ts
│   │   │   │   ├── session.ts
│   │   │   │   ├── push.ts
│   │   │   │   ├── pull.ts
│   │   │   │   ├── load.ts
│   │   │   │   ├── search.ts
│   │   │   │   ├── branch.ts
│   │   │   │   ├── history.ts
│   │   │   │   ├── status.ts
│   │   │   │   ├── billing.ts
│   │   │   │   ├── export.ts
│   │   │   │   ├── import.ts
│   │   │   │   └── config.ts
│   │   │   ├── output.ts          ← Chalk + Ora formatting
│   │   │   └── prompts.ts         ← Inquirer interactive prompts
│   │   └── tests/
│   │
│   └── mcp/                       ← @memocore/mcp (MCP server)
│       ├── package.json
│       ├── src/
│       │   ├── server.ts           ← MCP server entry
│       │   ├── tools/
│       │   │   ├── suggest-context.ts
│       │   │   ├── get-project.ts
│       │   │   ├── get-decisions.ts
│       │   │   ├── get-patterns.ts
│       │   │   ├── search-memory.ts
│       │   │   ├── log-decision.ts
│       │   │   ├── update-context.ts
│       │   │   └── save-pattern.ts
│       │   └── transport.ts        ← stdio transport
│       └── tests/
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_pgvector.sql
│   │   ├── 00003_rls_policies.sql
│   │   ├── 00004_functions.sql
│   │   ├── 00005_triggers.sql
│   │   ├── 00006_indexes.sql
│   │   └── 00007_partitioning.sql
│   └── functions/
│       └── embed/
│           └── index.ts            ← Edge Function: generate embeddings
│
├── docker/                         ← Self-hosted deployment
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.selfhosted.yml
│
└── docs/
    ├── README.md
    ├── QUICKREF.md
    ├── ARCHITECTURE.md
    └── SELF-HOSTING.md
```

### Why This Structure Scales

| Concern | v1.0 (now) | v2.0+ (later) |
|---------|-----------|---------------|
| **Business logic** | `@memocore/core` | Same — never changes |
| **Database** | SQLite local + Supabase Postgres | Swap adapter → Aurora/Cloud SQL |
| **Auth** | Supabase Auth | Swap adapter → Auth0/Cognito |
| **Embeddings** | Supabase Edge Function | Swap adapter → Lambda + own OpenAI proxy |
| **CLI** | `@memocore/cli` | Same — calls core engine |
| **MCP** | `@memocore/mcp` | Same — calls core engine |
| **API server** | None (CLI-only) | Add `@memocore/api` package, calls same core |
| **Web dashboard** | None | Add `@memocore/web`, calls API |

The core engine never knows what database it's talking to. It calls `IDatabase.query()` and gets rows back. Today that's Supabase. Tomorrow that's Aurora. Zero logic changes.

---

## 3. Interface Contracts

These interfaces are the migration seams. Every infrastructure swap is an adapter change, not a rewrite.

```typescript
// packages/core/src/interfaces/database.ts

interface IRemoteDatabase {
  // Memory CRUD
  upsertEntries(entries: MemoryEntry[]): Promise<void>;
  getEntries(projectId: string, opts: QueryOpts): Promise<MemoryEntry[]>;
  getEntryById(id: string): Promise<MemoryEntry | null>;
  archiveEntry(id: string): Promise<void>;
  
  // Search
  semanticSearch(embedding: number[], opts: SearchOpts): Promise<SearchResult[]>;
  fullTextSearch(query: string, opts: SearchOpts): Promise<SearchResult[]>;
  
  // Projects
  createProject(project: Project): Promise<Project>;
  getProject(slug: string): Promise<Project | null>;
  listProjects(): Promise<Project[]>;
  
  // Branches
  createBranch(branch: Branch): Promise<Branch>;
  listBranches(projectId: string): Promise<Branch[]>;
  
  // Versions
  getVersions(entryId: string): Promise<MemoryVersion[]>;
  
  // Sync
  getEntriesUpdatedSince(projectId: string, since: Date): Promise<MemoryEntry[]>;
  logSync(log: SyncLog): Promise<void>;
  
  // Billing
  getUserTier(userId: string): Promise<'free' | 'pro' | 'enterprise'>;
  getUsage(userId: string): Promise<UsageStats>;
}

interface ILocalDatabase {
  // Mirror of remote, but operates on local SQLite
  // Same method signatures, different implementation
  upsertEntries(entries: MemoryEntry[]): Promise<void>;
  getEntries(projectId: string, opts: QueryOpts): Promise<MemoryEntry[]>;
  getUnsyncedEntries(projectId: string): Promise<MemoryEntry[]>;
  markSynced(entryIds: string[]): Promise<void>;
  setLastPullTimestamp(projectId: string, timestamp: Date): Promise<void>;
  getLastPullTimestamp(projectId: string): Promise<Date | null>;
  // ... full local operations
}

interface IAuthProvider {
  login(): Promise<AuthSession>;          // Opens browser, returns session
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession>;
  getUser(): Promise<User>;
}

interface IEmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatch(texts: string[]): Promise<number[][]>;
  getDimensions(): number;                // 1536 for text-embedding-3-small
}

interface IStorageProvider {
  upload(path: string, data: Buffer): Promise<string>;  // Returns URL
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
}

interface IBillingProvider {
  getCheckoutUrl(userId: string, plan: string): Promise<string>;
  getPortalUrl(userId: string): Promise<string>;
  getUserPlan(userId: string): Promise<PlanInfo>;
  onPlanChange(callback: (userId: string, plan: string) => void): void;
}
```

### Dependency Injection Pattern

```typescript
// packages/core/src/engine/memory.ts

export class MemoryEngine {
  constructor(
    private local: ILocalDatabase,
    private remote: IRemoteDatabase,
    private embeddings: IEmbeddingProvider,
    private auth: IAuthProvider,
    private billing: IBillingProvider,
  ) {}

  async addDecision(input: DecisionInput): Promise<MemoryEntry> {
    const entry = this.buildEntry('decision', input);
    await this.local.upsertEntries([entry]);
    return entry;
  }

  async push(projectId: string): Promise<SyncResult> {
    const session = await this.auth.getSession();
    if (!session) throw new AuthRequiredError();

    const unsynced = await this.local.getUnsyncedEntries(projectId);
    
    // Check tier for embedding generation
    const tier = await this.billing.getUserPlan(session.userId);
    
    if (tier.plan === 'pro' || tier.plan === 'enterprise') {
      // Generate embeddings for entries missing them
      const needsEmbedding = unsynced.filter(e => !e.embedding);
      if (needsEmbedding.length > 0) {
        const texts = needsEmbedding.map(e => `${e.title} ${e.content}`);
        const embeddings = await this.embeddings.generateBatch(texts);
        needsEmbedding.forEach((e, i) => e.embedding = embeddings[i]);
      }
    }

    await this.remote.upsertEntries(unsynced);
    await this.local.markSynced(unsynced.map(e => e.id));
    
    return { synced: unsynced.length };
  }
}

// packages/cli/src/commands/push.ts — wiring

import { MemoryEngine } from '@memocore/core';
import { SqliteDatabase } from '@memocore/adapters/sqlite';
import { SupabaseDatabase, SupabaseAuth, SupabaseEmbeddings } from '@memocore/adapters/supabase';
import { StripeBilling } from '@memocore/adapters/stripe';

const engine = new MemoryEngine(
  new SqliteDatabase(localDbPath),
  new SupabaseDatabase(supabaseClient),
  new SupabaseEmbeddings(supabaseClient),   // Calls Edge Function
  new SupabaseAuth(supabaseClient),
  new StripeBilling(stripeConfig),
);

await engine.push(projectId);
```

---

## 4. Database Architecture

### 4.1 Schema (Scale-Ready)

```sql
-- ============================================================
-- USERS & BILLING
-- ============================================================

-- Extends Supabase auth.users with app-specific data
create table public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  tier            text not null default 'free'
                    check (tier in ('free', 'pro', 'enterprise')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  entry_count     integer not null default 0,
  project_count   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- ORGANIZATIONS (v2.0 — schema ready, logic deferred)
-- ============================================================

create table public.organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  owner_id        uuid not null references auth.users(id),
  tier            text not null default 'free'
                    check (tier in ('free', 'pro', 'enterprise')),
  stripe_customer_id text unique,
  created_at      timestamptz not null default now()
);

create table public.org_members (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member'
                    check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at      timestamptz not null default now(),
  unique(org_id, user_id)
);

-- ============================================================
-- PROJECTS
-- ============================================================

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  org_id          uuid references organizations(id) on delete cascade,  -- null = personal
  name            text not null,
  slug            text not null,
  stack           jsonb not null default '{}',
  config          jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  
  unique(user_id, slug)   -- unique per user
);

create index idx_projects_user on projects(user_id);
create index idx_projects_org on projects(org_id) where org_id is not null;

-- ============================================================
-- MEMORY ENTRIES (partitioned by project for scale)
-- ============================================================

create table public.memory_entries (
  id              uuid not null default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  user_id         uuid not null references auth.users(id),
  type            text not null
                    check (type in ('decision', 'pattern', 'context', 'document', 'session')),
  title           text not null,
  content         text not null default '',
  metadata        jsonb not null default '{}',
  embedding       vector(1536),
  branch          text not null default 'main',
  version         integer not null default 1,
  is_archived     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  
  primary key (project_id, id)  -- composite PK for partition-readiness
);

-- Partition-ready: composite PK on (project_id, id)
-- Phase 1: single table (sufficient to ~500K rows)
-- Phase 2: partition by hash(project_id) into N partitions
-- Phase 3: partition by range(created_at) for time-series queries

-- Performance indexes
create index idx_entries_project_branch
  on memory_entries(project_id, branch, is_archived)
  where is_archived = false;

create index idx_entries_type
  on memory_entries(project_id, type)
  where is_archived = false;

create index idx_entries_updated
  on memory_entries(project_id, updated_at desc);

create index idx_entries_user
  on memory_entries(user_id);

-- Semantic search (IVFFlat for scale, exact for small datasets)
-- Phase 1: exact search (small dataset, fast enough)
-- Phase 2: IVFFlat index when > 100K entries
-- Phase 3: HNSW index for sub-10ms at millions of entries
create index idx_entries_embedding
  on memory_entries
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Full-text search
create index idx_entries_fts
  on memory_entries
  using gin(to_tsvector('english', title || ' ' || content));

-- ============================================================
-- VERSIONS (time travel)
-- ============================================================

create table public.memory_versions (
  id              uuid primary key default gen_random_uuid(),
  entry_id        uuid not null,
  project_id      uuid not null,
  version         integer not null,
  content_snapshot jsonb not null,
  change_type     text not null
                    check (change_type in ('created', 'updated', 'archived', 'restored')),
  user_id         uuid not null references auth.users(id),
  created_at      timestamptz not null default now(),

  foreign key (project_id, entry_id) references memory_entries(project_id, id) on delete cascade
);

create index idx_versions_entry on memory_versions(entry_id, version desc);

-- ============================================================
-- BRANCHES
-- ============================================================

create table public.branches (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  name            text not null,
  parent_branch   text,
  status          text not null default 'active'
                    check (status in ('active', 'merged', 'abandoned')),
  created_at      timestamptz not null default now(),
  user_id         uuid not null references auth.users(id),

  unique(project_id, name)
);

-- ============================================================
-- SYNC LOG
-- ============================================================

create table public.sync_log (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references projects(id) on delete cascade,
  user_id         uuid not null references auth.users(id),
  action          text not null check (action in ('push', 'pull')),
  entries_synced  integer not null default 0,
  branch          text not null default 'main',
  created_at      timestamptz not null default now()
);

create index idx_sync_project on sync_log(project_id, created_at desc);

-- ============================================================
-- API KEYS (for future SDK/API access)
-- ============================================================

create table public.api_keys (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  key_hash        text not null unique,  -- SHA-256 of the key, never store raw
  prefix          text not null,         -- First 8 chars for display: "mc_live_abc..."
  scopes          text[] not null default '{"read", "write"}',
  last_used_at    timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_api_keys_hash on api_keys(key_hash);
```

### 4.2 Row-Level Security

```sql
-- Every table locked to user's own data
-- Org-aware policies ready for v2.0

alter table user_profiles enable row level security;
alter table projects enable row level security;
alter table memory_entries enable row level security;
alter table memory_versions enable row level security;
alter table branches enable row level security;
alter table sync_log enable row level security;
alter table api_keys enable row level security;

-- user_profiles
create policy "Users see own profile"
  on user_profiles for select using (id = auth.uid());
create policy "Users update own profile"
  on user_profiles for update using (id = auth.uid());

-- projects: own projects + org projects (v2.0 ready)
create policy "Users see own or org projects"
  on projects for select using (
    user_id = auth.uid()
    or org_id in (
      select org_id from org_members where user_id = auth.uid()
    )
  );
create policy "Users create own projects"
  on projects for insert with check (user_id = auth.uid());
create policy "Users update own projects"
  on projects for update using (user_id = auth.uid());
create policy "Users delete own projects"
  on projects for delete using (user_id = auth.uid());

-- memory_entries: own entries + org project entries (v2.0 ready)
create policy "Users see own or org entries"
  on memory_entries for select using (
    user_id = auth.uid()
    or project_id in (
      select p.id from projects p
      join org_members om on om.org_id = p.org_id
      where om.user_id = auth.uid()
    )
  );
create policy "Users create own entries"
  on memory_entries for insert with check (user_id = auth.uid());
create policy "Users update own entries"
  on memory_entries for update using (user_id = auth.uid());
create policy "Users delete own entries"
  on memory_entries for delete using (user_id = auth.uid());

-- memory_versions: same as entries
create policy "Users see own versions"
  on memory_versions for select using (user_id = auth.uid());

-- branches
create policy "Users see project branches"
  on branches for select using (user_id = auth.uid());
create policy "Users manage own branches"
  on branches for all using (user_id = auth.uid());

-- sync_log
create policy "Users see own sync logs"
  on sync_log for select using (user_id = auth.uid());
create policy "Users write own sync logs"
  on sync_log for insert with check (user_id = auth.uid());

-- api_keys
create policy "Users manage own keys"
  on api_keys for all using (user_id = auth.uid());
```

### 4.3 Database Functions

```sql
-- ============================================================
-- SEMANTIC SEARCH (Pro tier)
-- ============================================================

create or replace function search_memory_semantic(
  query_embedding vector(1536),
  p_project_id uuid,
  p_branch text default 'main',
  match_threshold float default 0.3,
  match_count int default 10
)
returns table (
  id uuid,
  type text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    me.id, me.type, me.title, me.content, me.metadata,
    1 - (me.embedding <=> query_embedding) as similarity
  from memory_entries me
  where me.user_id = auth.uid()
    and me.project_id = p_project_id
    and me.branch = p_branch
    and me.is_archived = false
    and me.embedding is not null
    and 1 - (me.embedding <=> query_embedding) > match_threshold
  order by me.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ============================================================
-- SMART SUGGEST (relevance scoring)
-- ============================================================

create or replace function suggest_context(
  query_embedding vector(1536),
  p_project_id uuid,
  p_branch text default 'main',
  p_keywords text[] default '{}',
  p_file_paths text[] default '{}',
  p_max_results int default 10,
  p_min_relevance float default 0.3
)
returns table (
  id uuid,
  type text,
  title text,
  content text,
  metadata jsonb,
  relevance_score float,
  match_reasons text[]
)
language plpgsql
security definer
as $$
begin
  return query
  with scored as (
    select
      me.id, me.type, me.title, me.content, me.metadata,
      -- Semantic similarity (weight: 0.40)
      coalesce(1 - (me.embedding <=> query_embedding), 0) * 0.40
      -- Keyword overlap (weight: 0.20)
      + case when array_length(p_keywords, 1) > 0 then
          (select count(*)::float / array_length(p_keywords, 1)
           from unnest(p_keywords) k
           where me.title ilike '%' || k || '%'
              or me.content ilike '%' || k || '%') * 0.20
        else 0 end
      -- Recency boost (weight: 0.15) — exponential decay over 30 days
      + greatest(0, 1.0 - extract(epoch from (now() - me.updated_at)) / (30 * 86400)) * 0.15
      -- Type weight (weight: 0.15)
      + case me.type
          when 'context' then 1.0
          when 'decision' then 0.8
          when 'pattern' then 0.7
          when 'session' then 0.5
          when 'document' then 0.4
        end * 0.15
      -- File path match (weight: 0.10)
      + case when array_length(p_file_paths, 1) > 0 then
          (select count(*)::float / array_length(p_file_paths, 1)
           from unnest(p_file_paths) f
           where me.metadata::text ilike '%' || f || '%'
              or me.content ilike '%' || f || '%') * 0.10
        else 0 end
      as relevance,
      -- Track why this entry matched
      array_remove(array[
        case when coalesce(1 - (me.embedding <=> query_embedding), 0) > 0.5
          then 'semantic' end,
        case when exists (
          select 1 from unnest(p_keywords) k
          where me.title ilike '%' || k || '%' or me.content ilike '%' || k || '%')
          then 'keyword' end,
        case when me.updated_at > now() - interval '7 days'
          then 'recent' end,
        case when array_length(p_file_paths, 1) > 0 and exists (
          select 1 from unnest(p_file_paths) f
          where me.metadata::text ilike '%' || f || '%')
          then 'file_match' end
      ], null) as reasons
    from memory_entries me
    where me.user_id = auth.uid()
      and me.project_id = p_project_id
      and me.branch = p_branch
      and me.is_archived = false
  )
  select
    scored.id, scored.type, scored.title, scored.content, scored.metadata,
    scored.relevance as relevance_score,
    scored.reasons as match_reasons
  from scored
  where scored.relevance >= p_min_relevance
  order by scored.relevance desc
  limit p_max_results;
end;
$$;

-- ============================================================
-- AUTO-VERSIONING TRIGGER
-- ============================================================

create or replace function log_memory_version()
returns trigger as $$
begin
  insert into memory_versions (entry_id, project_id, version, content_snapshot, change_type, user_id)
  values (
    NEW.id,
    NEW.project_id,
    NEW.version,
    jsonb_build_object(
      'type', NEW.type,
      'title', NEW.title,
      'content', NEW.content,
      'metadata', NEW.metadata,
      'branch', NEW.branch
    ),
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
$$ language plpgsql security definer;

create trigger memory_version_trigger
  after insert or update on memory_entries
  for each row execute function log_memory_version();

-- ============================================================
-- USAGE COUNTER TRIGGERS
-- ============================================================

create or replace function update_user_entry_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update user_profiles set entry_count = entry_count + 1 where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update user_profiles set entry_count = entry_count - 1 where id = OLD.user_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger entry_count_trigger
  after insert or delete on memory_entries
  for each row execute function update_user_entry_count();

create or replace function update_user_project_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update user_profiles set project_count = project_count + 1 where id = NEW.user_id;
  elsif TG_OP = 'DELETE' then
    update user_profiles set project_count = project_count - 1 where id = OLD.user_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql security definer;

create trigger project_count_trigger
  after insert or delete on projects
  for each row execute function update_user_project_count();

-- ============================================================
-- TIER ENFORCEMENT FUNCTION
-- ============================================================

create or replace function check_tier_limits()
returns trigger as $$
declare
  user_tier text;
  current_entries integer;
  current_projects integer;
  max_entries integer;
  max_projects integer;
begin
  select tier, entry_count, project_count
  into user_tier, current_entries, current_projects
  from user_profiles where id = NEW.user_id;

  -- Tier limits
  if user_tier = 'free' then
    max_entries := 1000;
    max_projects := 3;
  elsif user_tier = 'pro' then
    max_entries := 50000;
    max_projects := -1; -- unlimited
  else
    max_entries := -1;
    max_projects := -1;
  end if;

  -- Check entry limit
  if TG_TABLE_NAME = 'memory_entries' and max_entries > 0 and current_entries >= max_entries then
    raise exception 'Entry limit reached for % tier (% / %)', user_tier, current_entries, max_entries;
  end if;

  -- Check project limit
  if TG_TABLE_NAME = 'projects' and max_projects > 0 and current_projects >= max_projects then
    raise exception 'Project limit reached for % tier (% / %)', user_tier, current_projects, max_projects;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger check_entry_limits
  before insert on memory_entries
  for each row execute function check_tier_limits();

create trigger check_project_limits
  before insert on projects
  for each row execute function check_tier_limits();
```

### 4.4 Edge Functions

```typescript
// supabase/functions/embed/index.ts
// Generates embeddings using MemoCore's OpenAI account

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  const { texts, project_id } = await req.json();

  // Verify auth
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Check tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  if (profile?.tier === 'free') {
    return new Response(
      JSON.stringify({ error: 'Semantic search requires Pro tier' }),
      { status: 403 }
    );
  }

  // Generate embeddings (batch)
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    }),
  });

  const data = await response.json();
  const embeddings = data.data.map((d: any) => d.embedding);

  return new Response(JSON.stringify({ embeddings }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 5. Scaling Roadmap

### Phase 1: Supabase (0 → 10K users)

```
Users: 0–10K
Projects: 0–100K
Entries: 0–5M
Infra: Single Supabase project (Pro plan)
Cost: ~$25/mo Supabase + ~$100/mo embeddings
```

**What works at this scale:**
- Single Postgres instance handles 5M rows easily
- pgvector IVFFlat index handles semantic search to ~1M entries
- Edge Functions handle embedding generation
- RLS handles multi-tenancy
- No caching needed — Postgres is fast enough

**Scaling levers if needed:**
- Connection pooling (Supabase has PgBouncer built in)
- Read replicas for search-heavy queries
- Larger compute instance for Postgres

### Phase 2: Supabase Stretched (10K → 50K users)

```
Users: 10K–50K
Projects: 100K–500K
Entries: 5M–25M
Infra: Supabase Pro/Enterprise + optimizations
Cost: ~$100/mo Supabase + ~$500/mo embeddings
```

**Optimizations to apply:**
- Partition `memory_entries` by `hash(project_id)` into 16 partitions
- Upgrade pgvector index to HNSW for sub-10ms search at millions of entries
- Add Redis cache (Upstash) for hot project metadata
- Move embedding generation to a dedicated worker (avoid Edge Function cold starts)
- Implement batch embedding queue (process on push, not per-entry)

```sql
-- Partitioning memory_entries (migration)
alter table memory_entries rename to memory_entries_old;

create table memory_entries (
  like memory_entries_old including all
) partition by hash (project_id);

-- Create 16 partitions
create table memory_entries_p0 partition of memory_entries
  for values with (modulus 16, remainder 0);
create table memory_entries_p1 partition of memory_entries
  for values with (modulus 16, remainder 1);
-- ... p2 through p15

-- Migrate data
insert into memory_entries select * from memory_entries_old;
drop table memory_entries_old;
```

### Phase 3: AWS/GCP Migration (50K+ users)

```
Users: 50K+
Projects: 500K+
Entries: 25M+
Infra: AWS or GCP managed services
```

**Migration path (adapter swap):**

| Component | Supabase | AWS | GCP |
|-----------|----------|-----|-----|
| Database | Postgres | Aurora PostgreSQL | Cloud SQL |
| Vector search | pgvector | pgvector on Aurora OR OpenSearch | pgvector on Cloud SQL OR Vertex AI |
| Auth | GoTrue | Cognito | Firebase Auth |
| Storage | Supabase Storage | S3 | Cloud Storage |
| Embeddings | Edge Functions | Lambda | Cloud Run |
| Caching | — | ElastiCache (Redis) | Memorystore |
| Queue | — | SQS | Cloud Tasks |
| CDN | — | CloudFront | Cloud CDN |

**Why this works:** Every Supabase component has a 1:1 equivalent. The adapter pattern means we write `new AuroraDatabase()` instead of `new SupabaseDatabase()` and everything else stays the same.

**Multi-region setup (Phase 3+):**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  US-East     │    │  EU-West     │    │  AP-Southeast│
│  Primary     │    │  Read Replica │    │  Read Replica│
│  Aurora      │◄──►│  Aurora      │◄──►│  Aurora      │
│  Write/Read  │    │  Read-only    │    │  Read-only   │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                  ▲                   ▲
       │                  │                   │
  US users           EU users            APAC users
  (write here)       (read local,        (read local,
                      write to US)        write to US)
```

### Phase 4: Self-Hosted / On-Prem (Enterprise)

```
Target: Enterprise customers who can't use cloud
Approach: Docker Compose + Helm chart
```

**Self-hosted bundle includes:**
- Postgres + pgvector (official Docker image)
- MemoCore API server (Node.js container)
- Embedding proxy (routes to customer's own OpenAI account or local model)
- Optional: Redis for caching

```yaml
# docker/docker-compose.selfhosted.yml

version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: memocore
      POSTGRES_USER: memocore
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  memocore-api:
    build: .
    environment:
      DATABASE_URL: postgres://memocore:${DB_PASSWORD}@postgres:5432/memocore
      OPENAI_API_KEY: ${OPENAI_API_KEY}  # Customer provides their own
      AUTH_MODE: local  # Uses local auth, not Supabase
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

**Auth in self-hosted mode:**
- No Supabase Auth dependency
- Local JWT-based auth (`IAuthProvider` → `LocalAuth` adapter)
- Or customer plugs in their own OIDC (Auth0, Okta, Azure AD)

---

## 6. Team & Multi-Seat Architecture (v2.0 Ready)

The schema already has `organizations` and `org_members` tables. Here's how team access works when activated:

```
Organization (Ghost Savvy Studios)
├── Owner: Kareem
├── Admin: Dev Lead
├── Members: Dev 1, Dev 2, Dev 3
│
├── Project: client-app (shared)
│   ├── Memory entries visible to all members
│   ├── RLS policy: org_members.org_id = project.org_id
│   └── Billing: org-level, not per-user
│
└── Project: kareem-sandbox (personal)
    ├── Only Kareem sees this
    └── RLS policy: user_id = auth.uid()
```

**What to build for v2.0:**
- Org CRUD commands (`memocore org create/invite/members`)
- Org-level billing (Stripe per-seat)
- Shared project memory with role-based access
- Activity feed (who changed what)
- Conflict resolution for concurrent edits (CRDT or operational transform)

**What's already done (v1.0 schema):**
- Tables exist
- RLS policies include org membership checks
- Project has `org_id` field
- Just need to wire up the CLI commands and billing

---

## 7. Security Architecture

### Data at Rest
- Supabase Postgres: encrypted at rest (AES-256, managed by Supabase/AWS)
- Local SQLite: unencrypted (user's machine, their responsibility)
- Future: option for client-side encryption of entry content before push

### Data in Transit
- All Supabase connections over TLS 1.3
- CLI → Supabase: HTTPS
- MCP Server → Local SQLite: localhost only (no network exposure)

### Authentication
- Supabase Auth (GoTrue) with GitHub OAuth
- Session tokens stored in `~/.memocore/credentials.json` (chmod 600)
- Tokens auto-refresh, expire after 1 hour
- No API keys stored in project directory

### API Keys (future SDK access)
- Keys hashed with SHA-256 before storage
- Only prefix shown in UI (`mc_live_abc12345...`)
- Scoped: read-only, read-write, admin
- Expiration support

### Row-Level Security
- Every table has RLS enabled
- All queries filtered by `auth.uid()`
- Org-aware policies ready for v2.0
- `security definer` on functions that need cross-user access (triggers, billing checks)

### Rate Limiting
- Supabase built-in rate limiting on auth endpoints
- Edge Function: 100 req/min per user (embedding generation)
- Future: Redis-based rate limiting on API server

---

## 8. Observability (Production Readiness)

### Phase 1 (Launch)
- Supabase Dashboard: query performance, auth logs, storage usage
- Sentry: error tracking in CLI + Edge Functions
- Simple health check endpoint on Edge Function

### Phase 2 (Growth)
- PostHog or Mixpanel: CLI command analytics (opt-in)
  - Which commands used most
  - Push/pull frequency
  - Search query patterns
  - MCP tool call frequency
- Supabase Log Drain → Datadog/Grafana
- PgHero for slow query detection

### Key Metrics to Track
| Metric | Alert Threshold |
|--------|----------------|
| Embedding Edge Function p95 latency | > 2s |
| Push/pull sync failure rate | > 5% |
| Postgres connection pool saturation | > 80% |
| Storage usage per user (avg) | Trending > 100MB |
| Daily active projects | Track growth curve |

---

## 9. Migration Cheat Sheet

When it's time to leave Supabase, here's the exact playbook:

| Step | Action | Risk |
|------|--------|------|
| 1 | Stand up Aurora/Cloud SQL with pgvector | Low — same Postgres |
| 2 | Write `AuroraDatabase` adapter implementing `IRemoteDatabase` | Low — interface already defined |
| 3 | `pg_dump` Supabase → `pg_restore` to Aurora | Medium — test RLS migration |
| 4 | Write `CognitoAuth` adapter implementing `IAuthProvider` | Low — OAuth flow is standard |
| 5 | Deploy embedding function to Lambda/Cloud Run | Low — same code, different runtime |
| 6 | Update CLI config to point to new endpoints | Low — config change only |
| 7 | Run parallel for 2 weeks, dual-write | Medium — sync verification |
| 8 | Cut over, deprecate Supabase | Low — after validation |

**Total estimated migration effort:** 2–3 weeks with Claude Code.

---

## 10. Cost Projections

| Scale | Users | Supabase | OpenAI | Stripe | Total | Revenue |
|-------|-------|----------|--------|--------|-------|---------|
| Launch | 100 | $25/mo | $2/mo | $0 | $27/mo | $0–$290/mo |
| 6 months | 1K | $75/mo | $20/mo | $30/mo | $125/mo | $2,900/mo |
| 12 months | 5K | $200/mo | $100/mo | $150/mo | $450/mo | $14,500/mo |
| 18 months | 10K | $500/mo | $250/mo | $300/mo | $1,050/mo | $29,000/mo |
| 24 months | 25K+ | Migrate to AWS | $600/mo | $750/mo | ~$3K/mo | $72,500/mo |

Assumptions: 10% paid conversion, $29/mo Pro tier, ~50 entries/user average.

**Supabase exit trigger:** When Supabase bill exceeds ~$500/mo OR when multi-region becomes necessary (whichever comes first). At that point, AWS/GCP migration saves ~40% on compute at scale.
