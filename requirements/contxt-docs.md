# Contxt Documentation — Complete Content

> This document contains the full copy for every page in the Contxt docs site.
> Each `## Page:` section maps to a sidebar link. Drop the content into your docs framework (Nextra, Mintlify, Docusaurus, or the custom docs page you built).

---

## Page: Introduction

### GETTING STARTED

# Introduction to Contxt

Give your AI coding agents persistent, versioned, project-scoped memory. Stop repeating yourself — start shipping faster.

---

### What is Contxt?

Contxt is **GitHub for AI context**. It's a CLI-first developer tool that gives AI coding agents like Claude Code, Cursor, and GitHub Copilot persistent memory of your project's architecture, decisions, and patterns.

Every AI session starts from zero. You waste ~40% of your prompts re-explaining your stack, conventions, and past decisions. Contxt solves this by storing your project's context in a versioned, searchable format that AI agents can automatically load.

> **Quick Example**
> Tell Contxt once that you use Prisma for your database. Every AI tool — Claude Code, Cursor, Copilot — will know to generate Prisma queries instead of raw SQL. No more repeating yourself.

### How It Works

Contxt uses a git-like workflow:

```
contxt init                      # Initialize in your project
contxt decision add              # Log an architectural decision
contxt pattern add               # Save a code pattern
contxt push                      # Sync to cloud
contxt suggest --task "add auth" # Get relevant context for a task
```

Your AI tools load this context automatically via MCP (Model Context Protocol), or you can use the REST API.

### Key Concepts

- **Memory entries** — Structured units of context: decisions, patterns, context notes, and documents
- **Projects** — Each codebase gets its own isolated context store
- **Branches** — Context branches that mirror your git branches
- **Smart Suggest** — Relevance-ranked context retrieval that minimizes token usage
- **MCP Native** — Works with any AI tool that supports the Model Context Protocol

### When to Use Contxt

**Use Contxt when you:**

- Switch between AI coding sessions and lose context
- Work on multiple projects and need each AI session to "know" the right codebase
- Want your team's architectural decisions documented and searchable
- Need AI agents to follow your project's specific conventions
- Want to reduce token waste from re-explaining context every session

**You don't need Contxt if:**

- You only use AI for one-off questions (not ongoing development)
- Your project is small enough that you can paste context manually each time

### Architecture Overview

```
┌──────────────────────────────────────┐
│          Your AI Tools               │
│  Claude Code · Cursor · Copilot      │
│          ▲           ▲               │
│          │ MCP       │ REST API      │
│  ┌───────┴───┐ ┌─────┴──────┐       │
│  │ MCP Server│ │ REST API   │       │
│  └───────┬───┘ └─────┬──────┘       │
│          │           │               │
│  ┌───────┴───────────┴──────┐       │
│  │      Contxt Core          │       │
│  │  Memory Engine + Search   │       │
│  └───────────┬──────────────┘       │
│              │                       │
│  ┌───────────┴──────────────┐       │
│  │    Storage Adapters       │       │
│  │  Local (SQLite) · Cloud   │       │
│  │      (Supabase)           │       │
│  └───────────────────────────┘       │
└──────────────────────────────────────┘
```

---

## Page: Installation

# Installation

Install Contxt globally via npm.

### Requirements

- Node.js 18 or higher
- npm, pnpm, or yarn

### Install

```bash
npm install -g @contxt/cli
```

Or with pnpm:

```bash
pnpm add -g @contxt/cli
```

### Verify Installation

```bash
contxt --version
```

You should see the current version number.

### Authentication (Optional)

To sync context to the cloud and use Smart Suggest with semantic search, authenticate with your Contxt account:

```bash
contxt auth login
```

This opens a browser window for GitHub OAuth. Once authenticated, your context syncs across machines and team members.

Local-only usage works without authentication. All CLI commands function offline — cloud sync is additive.

### Updating

```bash
npm update -g @contxt/cli
```

### Uninstall

```bash
npm uninstall -g @contxt/cli
```

This removes the CLI but preserves any `.contxt/` directories in your projects.

---

## Page: Quick Start

# Quick Start

Get Contxt running in your project in under 2 minutes.

### 1. Initialize

Navigate to your project root and run:

```bash
cd my-project
contxt init
```

Contxt creates a `.contxt/` directory in your project root. This is where your local context store lives.

You'll be prompted for basic project info:

```
? Project name: my-saas-app
? Project type: web-app
? Tech stack: Next.js, Prisma, Postgres, Stripe
? Description: B2B SaaS with team billing and SSO
```

### 2. Log Your First Decision

```bash
contxt decision add
```

```
? Decision: Use Stripe for billing
? Category: infrastructure
? Rationale: Better API design, webhook reliability,
  global coverage. Using Checkout links for v1.
? Alternatives considered: Paddle (simpler tax, weaker API),
  LemonSqueezy (good DX, limited enterprise)

✓ Decision logged: dec_a1b2c3d4 (v1)
```

### 3. Add a Code Pattern

```bash
contxt pattern add
```

```
? Pattern name: API route handler
? Category: api
? When to use: Every new API endpoint
? Template: Parse with Zod schema → pass to handler → return typed response

✓ Pattern saved: pat_e5f6g7h8 (v1)
```

### 4. Set Active Context

```bash
contxt context set \
  --feature "user onboarding flow" \
  --status "in-progress" \
  --blockers "Stripe webhook integration"
```

### 5. See What Your AI Will See

```bash
contxt suggest --task "add team billing endpoint"
```

```
Smart Suggest — 4 entries (relevance ≥ 0.60)

 0.94  DECISION  Use Stripe for billing
 0.87  PATTERN   API route handler
 0.72  CONTEXT   Building: user onboarding flow
 0.65  DOCUMENT  API spec v2

Token estimate: 1,240 (vs 5,620 loading all)
Reduction: 78%
```

### 6. Connect to Your AI Tool

For Claude Code (via MCP):

```json
// .claude/mcp.json
{
  "mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp", "serve"]
    }
  }
}
```

Now Claude Code automatically has access to your project's context on every session.

### Next Steps

- Read about [Memory Types](/docs/memory-types) to understand what to store
- Set up [MCP integration](/docs/mcp-setup) for automatic context loading
- Learn about [Branching](/docs/branching) for feature-branch context isolation

---

## Page: Memory Types

### CORE CONCEPTS

# Memory Types

Contxt organizes your project's context into five structured memory types. Each serves a specific purpose and gets its own relevance scoring in Smart Suggest.

### Decisions

Architectural and technical choices with rationale. Decisions are the most valuable memory type — they prevent AI from suggesting approaches you've already evaluated and rejected.

```bash
contxt decision add
```

**What to store:**

- Technology choices (why Prisma over Drizzle, why Stripe over Paddle)
- Architecture decisions (JWT auth strategy, API design patterns)
- Convention choices (file naming, error handling approach)
- Trade-off resolutions (performance vs simplicity, build vs buy)

**Fields:**

- `decision` — What was decided
- `category` — architecture, infrastructure, feature, tooling, deployment
- `rationale` — Why this choice was made
- `alternatives` — What else was considered and why it was rejected
- `status` — active, deprecated, superseded

**Example:**

```
Decision:     Use Prisma over Drizzle
Category:     infrastructure
Rationale:    Better TypeScript support, more mature migration
              system, larger community. Drizzle has better
              raw SQL performance but we don't need it for v1.
Alternatives: Drizzle (faster, less mature), Knex (no TS),
              raw SQL (too much boilerplate)
Status:       active
```

Decisions are versioned. When a decision is updated (e.g., you migrate from Prisma to Drizzle later), the previous version is preserved in history.

### Patterns

Reusable code patterns and conventions. Patterns teach your AI how your codebase works so it generates code that matches your existing style.

```bash
contxt pattern add
```

**What to store:**

- API route structure (how every endpoint should be organized)
- Error handling patterns (centralized handler, retry logic)
- Component patterns (how React components are structured)
- Service patterns (event-driven architecture, repository pattern)
- Testing patterns (how tests are organized and written)

**Fields:**

- `name` — Human-readable pattern name
- `category` — api, component, service, testing, util
- `when_to_use` — When this pattern applies
- `template` — The actual pattern (code snippet, structure description, or file reference)

**Example:**

```
Name:         API route: Zod → handler → response
Category:     api
When to use:  Every new API endpoint
Template:     1. Define Zod schema for request body
              2. Parse and validate in route handler
              3. Pass validated data to service function
              4. Return typed response with status code
              5. Errors caught by centralized error handler
```

### Context

Active working context — what you're building right now. Context entries tell your AI about current state so it can give relevant suggestions without you re-explaining each session.

```bash
contxt context set
```

**What to store:**

- Current feature being built
- Active blockers and dependencies
- Work-in-progress status
- Files currently being modified
- Session notes and next steps

**Fields:**

- `feature` — Current feature name
- `status` — in-progress, blocked, review, complete
- `blockers` — What's blocking progress
- `next_steps` — Planned next actions
- `files` — Currently active files
- `notes` — Free-form session notes

Context entries update frequently. They represent the "hot" state of your work. When a feature is completed, the context entry is archived and its decisions/patterns are preserved.

### Documents

Long-form reference material. Documents are less frequently changed but provide essential background that AI needs for complex tasks.

```bash
contxt doc add
```

**What to store:**

- API specifications and endpoint docs
- Deployment runbooks and procedures
- Database schema documentation
- Third-party integration guides
- Architecture overview documents

**Fields:**

- `title` — Document title
- `category` — spec, runbook, schema, guide, overview
- `content` — Full document content (Markdown supported)
- `tags` — Searchable tags

### Sessions

Automatic snapshots of coding sessions. Sessions capture what was worked on and what was accomplished, creating a timeline of project progress.

Sessions are typically auto-captured when using the MCP server integration. They can also be logged manually:

```bash
contxt session log
```

**What gets captured:**

- Session duration and timestamp
- Files modified during the session
- Decisions made during the session
- Summary of work completed
- Context state at session end

### Memory Type Summary

| Type     | Purpose                    | Update Frequency            | Token Priority         |
| -------- | -------------------------- | --------------------------- | ---------------------- |
| Decision | Why choices were made      | Low (when decisions change) | High                   |
| Pattern  | How code should be written | Medium (as patterns evolve) | High                   |
| Context  | What you're working on now | High (every session)        | Medium                 |
| Document | Reference material         | Low (stable docs)           | Low (loaded on demand) |
| Session  | Work timeline              | Automatic                   | Low (historical)       |

### Smart Suggest Ranking

When you run `contxt suggest`, entries are ranked by relevance to your current task. Decisions and patterns score highest because they directly affect code generation. Context scores medium because it provides situational awareness. Documents and sessions are loaded only when directly relevant.

---

## Page: Branching

# Branching

Contxt supports context branches that mirror your git workflow. Different branches can have different decisions and patterns without conflicting.

### Why Branch Context?

When you're experimenting on a feature branch — say, trying Drizzle instead of Prisma — you don't want that experimental context polluting your main branch. Context branching keeps your experiments isolated.

```bash
# Create a context branch
contxt branch create exp/drizzle

# Switch to it
contxt branch checkout exp/drizzle

# Log decisions on this branch
contxt decision add
# "Use Drizzle ORM" — only exists on exp/drizzle

# Switch back — main still has "Use Prisma"
contxt branch checkout main
```

### Branch Commands

```bash
contxt branch list              # List all branches
contxt branch create <name>     # Create new branch (copies from current)
contxt branch checkout <name>   # Switch active branch
contxt branch merge <source>    # Merge source into current branch
contxt branch delete <name>     # Delete a branch
```

### Auto-Detection

When you have git integration enabled, Contxt automatically detects your current git branch and loads the matching context branch. No manual switching needed.

```bash
git checkout -b feature/auth     # Contxt auto-switches to feature/auth context
git checkout main                # Contxt auto-switches back to main context
```

If a context branch doesn't exist for your git branch, Contxt falls back to `main`.

### Merging Context

When you merge a feature branch in git, merge the context too:

```bash
git merge feature/auth
contxt branch merge feature/auth
```

Merge handles conflicts by keeping the most recent version of each entry. If the same decision was modified on both branches, both versions are preserved in the version history.

### Default Branch

Every project starts with a `main` branch. This is the default context branch and the one that gets loaded when no specific branch is matched.

---

## Page: Sync & Cloud

# Sync & Cloud

Contxt works locally by default. Cloud sync adds cross-machine access, team collaboration, and semantic search via embeddings.

### Local Mode

By default, all context is stored in `.contxt/` inside your project directory. This includes a local SQLite database and configuration files. No account required.

```
my-project/
├── .contxt/
│   ├── config.json       # Project configuration
│   ├── memory.db         # SQLite database
│   └── .gitignore        # Excludes db from version control
├── src/
└── ...
```

### Cloud Sync

Authenticate to enable cloud sync:

```bash
contxt auth login
```

Once authenticated, push and pull context between local and cloud:

```bash
contxt push        # Upload local changes to cloud
contxt pull        # Download cloud changes to local
```

Sync is explicit — Contxt never pushes automatically. You control when context syncs.

### What Syncs

- All memory entries (decisions, patterns, context, documents, sessions)
- Branch structure and history
- Version history for each entry
- Project metadata and configuration

### What Doesn't Sync

- Local-only configuration (editor preferences, file paths)
- The SQLite database file itself (entries are synced, not the raw db)

### Cloud Features

These features require cloud sync:

- **Semantic Search** — Embeddings-powered search across all entries (local search uses full-text only)
- **Smart Suggest** — Relevance scoring with embeddings requires cloud
- **Team Access** — Multiple team members accessing the same project context
- **Dashboard** — Web-based context browser at mycontxt.ai
- **Cross-Machine Sync** — Same context on your laptop and desktop

### Backend

Contxt Cloud runs on Supabase (PostgreSQL + pgvector). Embeddings are generated using `text-embedding-3-small` for semantic search. All data is encrypted in transit and at rest.

### Offline Support

Contxt is fully functional offline. Work locally, then push when you're back online. The sync protocol handles conflict resolution automatically using last-write-wins with version history preservation.

---

## Page: init

### CLI REFERENCE

# contxt init

Initialize Contxt in your project directory.

### Usage

```bash
contxt init [options]
```

### What It Does

1. Creates a `.contxt/` directory in the current folder
2. Initializes a local SQLite database
3. Creates a `main` context branch
4. Prompts for project metadata (name, type, stack, description)
5. Generates a `.contxt/.gitignore` to exclude the database from version control

### Options

| Flag                   | Description                                       | Default        |
| ---------------------- | ------------------------------------------------- | -------------- |
| `--name <name>`        | Project name                                      | Directory name |
| `--type <type>`        | Project type (web-app, api, cli, library, mobile) | Prompted       |
| `--stack <stack>`      | Comma-separated tech stack                        | Prompted       |
| `--description <desc>` | Project description                               | Prompted       |
| `--no-prompt`          | Skip interactive prompts, use defaults            | false          |

### Examples

Interactive:

```bash
contxt init
```

Non-interactive:

```bash
contxt init \
  --name my-saas-app \
  --type web-app \
  --stack "Next.js, Prisma, Postgres" \
  --description "B2B SaaS with team billing" \
  --no-prompt
```

### Project Structure

After init:

```
.contxt/
├── config.json    # Project config and metadata
├── memory.db      # Local SQLite database
└── .gitignore     # Excludes memory.db
```

### Notes

- Run `contxt init` from your project root (same level as `.git/` if using git)
- Safe to re-run — it won't overwrite existing configuration
- The `.contxt/` directory should be committed to version control (minus the db file)

---

## Page: decision

# contxt decision

Manage architectural and technical decisions.

### Commands

```bash
contxt decision add       # Log a new decision
contxt decision list      # List all decisions
contxt decision show <id> # Show decision detail with version history
contxt decision edit <id> # Edit an existing decision (creates new version)
contxt decision archive <id>  # Archive a decision
```

### contxt decision add

Interactive prompt to log a new decision.

```bash
contxt decision add
```

```
? Decision: Use Stripe for billing
? Category: infrastructure
? Rationale: Better API, webhook reliability, global coverage
? Alternatives: Paddle, LemonSqueezy, self-built
? Status: active

✓ Decision logged: dec_a1b2c3d4 (v1)
```

**Non-interactive:**

```bash
contxt decision add \
  --decision "Use Stripe for billing" \
  --category infrastructure \
  --rationale "Better API, webhook reliability" \
  --alternatives "Paddle, LemonSqueezy" \
  --status active
```

### contxt decision list

```bash
contxt decision list
contxt decision list --category infrastructure
contxt decision list --status active
```

```
ID            Category        Decision                  Version  Updated
dec_a1b2c3d4  infrastructure  Use Stripe for billing    v3       2h ago
dec_e5f6g7h8  infrastructure  Use Prisma over Drizzle   v1       5d ago
dec_i9j0k1l2  architecture    JWT + httpOnly cookies     v3       1d ago
```

### contxt decision show

```bash
contxt decision show dec_a1b2c3d4
```

Displays the full decision with rationale, alternatives, and version history.

### contxt decision edit

```bash
contxt decision edit dec_a1b2c3d4
```

Opens an interactive editor to modify the decision. Creates a new version — previous versions are preserved.

### Categories

`architecture` · `infrastructure` · `feature` · `tooling` · `deployment` · `security` · `other`

---

## Page: pattern

# contxt pattern

Manage reusable code patterns and conventions.

### Commands

```bash
contxt pattern add        # Save a new pattern
contxt pattern list       # List all patterns
contxt pattern show <id>  # Show pattern detail
contxt pattern edit <id>  # Edit a pattern
contxt pattern archive <id>   # Archive a pattern
```

### contxt pattern add

```bash
contxt pattern add
```

```
? Pattern name: API route: Zod → handler → response
? Category: api
? When to use: Every new API endpoint
? Template: Parse with Zod → validate → pass to service → return typed response

✓ Pattern saved: pat_a1b2c3d4 (v1)
```

**Non-interactive:**

```bash
contxt pattern add \
  --name "API route handler" \
  --category api \
  --when "Every new API endpoint" \
  --template "Zod schema → validate → service → typed response"
```

### contxt pattern list

```bash
contxt pattern list
contxt pattern list --category api
```

```
Name                              Category  When to Use                    Version
API route: Zod → handler          api       Every new API endpoint         v2
Error handler with retry           api       Transient failure handling     v1
Event-driven service pattern       service   Inter-service communication    v1
```

### Categories

`api` · `component` · `service` · `testing` · `util` · `database` · `auth` · `other`

---

## Page: context

# contxt context

Manage active working context — what you're building right now.

### Commands

```bash
contxt context set         # Set or update active context
contxt context show        # Show current context
contxt context clear       # Clear active context
contxt context add-blocker <text>  # Add a blocker
contxt context add-step <text>     # Add a next step
```

### contxt context set

```bash
contxt context set \
  --feature "user onboarding flow" \
  --status in-progress \
  --blockers "Stripe webhook integration" \
  --next-steps "Implement webhook handlers, add email verification"
```

Or interactive:

```bash
contxt context set
```

```
? Current feature: user onboarding flow
? Status: in-progress
? Blockers: Stripe webhook integration
? Next steps: Implement webhook handlers

✓ Context updated
```

### contxt context show

```bash
contxt context show
```

```
Active Context — my-saas-app (main)

Feature:    user onboarding flow
Status:     in-progress
Updated:    2 hours ago

Blockers:
  • Stripe webhook integration

Next Steps:
  • Implement webhook handlers
  • Add email verification
  • Write onboarding tests

Files:
  • src/app/onboarding/page.tsx
  • src/lib/stripe/webhooks.ts
```

### Status Values

`in-progress` · `blocked` · `review` · `complete`

---

## Page: push / pull

# contxt push / pull

Sync context between local and cloud.

### contxt push

Upload local context changes to Contxt Cloud.

```bash
contxt push
```

```
Pushing to contxt cloud...

  ↑ 3 new entries
  ↑ 2 updated entries
  ↑ 1 new branch

✓ Pushed to my-saas-app (main)
  Remote: https://mycontxt.ai/projects/my-saas-app
```

**Options:**

```bash
contxt push --branch main          # Push specific branch only
contxt push --all                  # Push all branches
contxt push --force                # Overwrite remote (destructive)
```

### contxt pull

Download context changes from cloud to local.

```bash
contxt pull
```

```
Pulling from contxt cloud...

  ↓ 5 new entries (from team)
  ↓ 1 updated entry

✓ Pulled to my-saas-app (main)
  Local is up to date.
```

**Options:**

```bash
contxt pull --branch main          # Pull specific branch only
contxt pull --all                  # Pull all branches
```

### Conflict Resolution

Contxt uses last-write-wins for sync conflicts. When the same entry is modified both locally and remotely, the most recent version wins. Both versions are preserved in the version history so nothing is lost.

### Auth Required

Push and pull require authentication. Run `contxt auth login` first.

---

## Page: suggest

# contxt suggest

Get relevance-ranked context for a specific task. Smart Suggest returns only the entries that matter for what you're about to do, minimizing token usage.

### Usage

```bash
contxt suggest --task "add team billing endpoint"
```

### Output

```
Smart Suggest — 4 entries (relevance ≥ 0.60)

 SCORE  TYPE      ENTRY
 0.94   DECISION  Use Stripe for billing
 0.87   PATTERN   API route: Zod → handler → response
 0.72   CONTEXT   Building: user onboarding flow
 0.65   DOCUMENT  API spec v2 — endpoints & auth

Token estimate: 1,240 (vs 5,620 loading all)
Reduction: 78%
```

### Options

```bash
contxt suggest --task "description"  # Required: what you're about to work on
contxt suggest --threshold 0.5       # Minimum relevance score (default: 0.6)
contxt suggest --limit 10            # Max entries to return (default: 5)
contxt suggest --format json         # Output as JSON (for piping)
contxt suggest --format markdown     # Output as Markdown (for pasting)
```

### How Scoring Works

Smart Suggest uses embeddings to compute semantic similarity between your task description and each memory entry. Scores range from 0 to 1:

- **0.9+** — Directly relevant (this entry is about exactly what you're doing)
- **0.7–0.9** — Related (useful context for the task)
- **0.5–0.7** — Loosely related (may provide background)
- **Below 0.5** — Not relevant (excluded by default)

The default threshold of 0.6 typically captures the entries that matter without noise.

### Cloud Required

Smart Suggest with semantic scoring requires cloud sync (embeddings are generated server-side). In local-only mode, suggest falls back to keyword matching.

---

## Page: MCP Setup

### INTEGRATIONS

# MCP Setup

Contxt includes a built-in MCP (Model Context Protocol) server. This lets AI tools load your project's context automatically — no copy-pasting, no manual prompts.

### What is MCP?

MCP is an open protocol that lets AI applications access external tools and data sources. Contxt implements an MCP server that exposes your project's memory as tools the AI can call.

### Available MCP Tools

When connected via MCP, your AI tool gets access to these tools:

| Tool                    | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `contxt_suggest`        | Get relevant context for a task (Smart Suggest) |
| `contxt_search`         | Search across all memory entries                |
| `contxt_get_context`    | Load current active context                     |
| `contxt_get_decisions`  | List decisions (with optional filters)          |
| `contxt_get_patterns`   | List patterns (with optional filters)           |
| `contxt_log_decision`   | Log a new decision from the AI session          |
| `contxt_log_pattern`    | Save a new pattern from the AI session          |
| `contxt_update_context` | Update active working context                   |
| `contxt_end_session`    | End and log the current session                 |

### Generic MCP Configuration

For any MCP-compatible client, add Contxt as a server:

```json
{
  "mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp", "serve"],
      "env": {
        "CONTXT_PROJECT": "/path/to/your/project"
      }
    }
  }
}
```

The `CONTXT_PROJECT` environment variable tells the MCP server which project to load. If omitted, it uses the current working directory.

### Starting the MCP Server Manually

```bash
contxt mcp serve
```

This starts the MCP server on stdio (standard input/output), which is the transport most AI tools expect.

```bash
contxt mcp serve --port 3100
```

Start on HTTP for tools that use HTTP transport.

### Verifying the Connection

Once configured, ask your AI tool: "What decisions have been made in this project?" If Contxt is connected, it will call `contxt_get_decisions` and return your logged decisions.

---

## Page: Claude Code

# Claude Code Integration

Claude Code supports MCP natively. Contxt integrates in one step.

### Setup

Create or edit `.claude/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp", "serve"]
    }
  }
}
```

That's it. Claude Code will automatically start the Contxt MCP server when you open the project.

### What Claude Code Gets

With Contxt connected, Claude Code can:

- **Load relevant context** before generating code (via `contxt_suggest`)
- **Check existing decisions** before proposing new architecture (via `contxt_get_decisions`)
- **Follow your patterns** when writing new code (via `contxt_get_patterns`)
- **Know what you're working on** to give contextual help (via `contxt_get_context`)
- **Log new decisions** as you make them during the session (via `contxt_log_decision`)
- **Save patterns** it discovers in your codebase (via `contxt_log_pattern`)

### Example Session

```
You: Add a new API endpoint for team invitations

Claude Code:
  [calls contxt_suggest with "team invitation API endpoint"]
  [receives: Stripe billing decision, API route pattern, auth pattern]

  Based on your project's patterns, I'll create this endpoint
  following your Zod → handler → response structure, using
  your JWT + httpOnly cookie auth approach...
```

### Tips

- Run `contxt push` before starting a Claude Code session to ensure your AI has the latest context
- After a productive session where decisions were made, check `contxt decision list` to see what was auto-logged
- Use `contxt context set` before starting work to give Claude Code situational awareness

---

## Page: Cursor

# Cursor Integration

Cursor supports MCP through its settings. Connect Contxt to give Cursor persistent project memory.

### Setup

Open Cursor Settings → MCP → Add Server:

```json
{
  "mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp", "serve"]
    }
  }
}
```

Alternatively, create `.cursor/mcp.json` in your project root with the same configuration.

### What Cursor Gets

With Contxt connected, Cursor's AI features (Cmd+K, Chat, Composer) can:

- Load project-specific context before generating code
- Follow your established patterns and conventions
- Reference your architectural decisions
- Understand your current work-in-progress

### Usage Tips

- Cursor may not automatically invoke MCP tools. You can prompt it by saying "check my project's decisions about..." or "use my established patterns for..."
- For Composer sessions, start with "Load my project context" to prime the session
- Contxt works alongside Cursor's built-in codebase indexing — they complement each other. Cursor indexes your code, Contxt stores your reasoning.

---

## Page: Copilot & Other Tools

# Other Integrations

Contxt works with any tool that supports MCP, plus a REST API for everything else.

### GitHub Copilot

Copilot MCP support varies by environment. Check GitHub's latest docs for MCP configuration in your specific setup (VS Code, JetBrains, Neovim).

The MCP server configuration is the same:

```json
{
  "command": "contxt",
  "args": ["mcp", "serve"]
}
```

### Windsurf

Windsurf (Codeium) supports MCP servers. Add Contxt through Windsurf's MCP configuration settings using the same server config.

### REST API

For tools that don't support MCP, or for custom integrations, use the REST API:

```bash
# Get relevant context for a task
curl -X POST https://api.mycontxt.ai/v1/suggest \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"project": "my-saas-app", "task": "add billing endpoint"}'

# List decisions
curl https://api.mycontxt.ai/v1/projects/my-saas-app/decisions \
  -H "Authorization: Bearer YOUR_API_KEY"

# Log a decision
curl -X POST https://api.mycontxt.ai/v1/projects/my-saas-app/decisions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"decision": "Use Redis for caching", "category": "infrastructure", "rationale": "..."}'
```

### API Keys

Generate API keys in the dashboard at mycontxt.ai or via CLI:

```bash
contxt auth create-key --name "ci-pipeline"
```

### Custom Integrations

Contxt is designed to be embedded. Common integration patterns:

- **CI/CD pipelines** — Auto-log deployment decisions from your pipeline
- **PR templates** — Pull in relevant decisions for PR review context
- **Onboarding scripts** — Load project context for new team members
- **Custom IDE extensions** — Use the REST API to build context panels
