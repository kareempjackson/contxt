# Contxt

**GitHub for AI Context** — Persistent, versioned, project-scoped memory for AI coding agents.

Contxt solves the problem that every AI-assisted development session starts from zero. Instead of wasting ~40% of your prompts re-explaining architecture and conventions, Contxt intelligently surfaces only what's relevant to your current task.

## Why Contxt?

- **Smart Context Retrieval**: AI agents automatically load relevant decisions, patterns, and context
- **Version Control**: Git-like branching and time travel for your project memory
- **Cloud Sync**: Supabase-powered sync across machines and teams
- **Semantic Search**: pgvector-powered similarity search finds what you need
- **MCP Integration**: Works seamlessly with Claude Code and Cursor — zero configuration
- **Offline-First**: SQLite local storage, works without internet

## Quickstart (5 minutes)

### Install

```bash
npm install -g @mycontxt/cli
```

### Initialize Project

```bash
cd your-project
contxt init
```

This sets up:
- `.contxt/` directory with a local SQLite database
- `.mcp.json` + `.cursor/mcp.json` for Claude Code / Cursor auto-discovery
- Git hooks for automatic context capture on commit
- Claude Code context injection hook (silently injects context before every prompt)

### Add Project Memory

```bash
# Log architectural decisions
contxt decision add \
  --title "Use PostgreSQL for main database" \
  --rationale "Need ACID guarantees and relational queries" \
  --alternatives "MongoDB" "DynamoDB"

# Save code patterns
contxt pattern add \
  --title "API Error Handler" \
  --content "Always return { error: string, code: number, details?: any }" \
  --category "API"

# Track current context
contxt context set \
  --feature "Payment integration" \
  --blockers "Need to verify Stripe webhook signatures" \
  --next "Research webhook validation" "Set up test webhooks"
```

### Load Context for AI

```bash
# Task-based (smart relevance ranking)
contxt load --task "implement Stripe webhooks"

# File-based
contxt load --files "src/payments/**"

# Everything
contxt load --all --max-tokens 2000
```

### Review Captured Drafts

Contxt auto-captures decisions and patterns during your AI sessions. Review and confirm them:

```bash
contxt review
```

## Core Concepts

### Memory Types

1. **Decisions**: Architectural choices with rationale and alternatives considered
2. **Patterns**: Code conventions, templates, and best practices
3. **Context**: Current working context (feature, blockers, next steps)
4. **Documents**: Reference materials, API docs, onboarding guides
5. **Sessions**: Development session logs with summaries

### Branching

Experiment with different approaches without polluting your main memory:

```bash
# Create experimental branch
contxt branch create experiment/new-approach

# Try something different
contxt decision add --title "Try MongoDB instead" --rationale "..."

# Switch back to main
contxt branch switch main

# Merge if it worked out
contxt branch merge experiment/new-approach
```

### Versioning (Time Travel)

Every change is versioned automatically:

```bash
# View history
contxt history show <entry-id>

# Restore previous version
contxt history restore <entry-id> --version 2
```

### Cloud Sync

```bash
# Authenticate
contxt auth login

# Push local changes
contxt push

# Pull remote changes
contxt pull

# Full bidirectional sync
contxt sync
```

## Command Reference

### Project Management

```bash
contxt init [--name <name>]                                     # Initialize project
contxt init --platforms claude-code,gemini,vscode-copilot,codex # Configure specific platforms
contxt init --check                                             # Show platform configuration status
contxt status                                                   # Show project status
```

### Memory Management

```bash
# Decisions
contxt decision add --title <title> --rationale <rationale>
contxt decision list
contxt decision show <id>

# Patterns
contxt pattern add --title <title> --content <content>
contxt pattern list
contxt pattern show <id>

# Context
contxt context set --feature <feature> --blockers <blockers...>
contxt context show
contxt context clear

# Documents
contxt doc add --title <title> --content <content>
contxt doc add --title <title> --file <path>  # From file
contxt doc list
contxt doc show <id>

# Sessions
contxt session start --feature <feature>
contxt session end [--summary <summary>]
contxt session list
contxt session current

# Session history & compaction survival
contxt sessions                          # List recent sessions with event counts
contxt sessions show <session-id>        # Show events for a session
contxt sessions resume                   # Print resume snapshot for the last session
```

### Search & Retrieval

```bash
contxt search <query>                 # Full-text search
contxt load --task <description>      # Smart context loading
contxt load --files <files...>        # File-based context
contxt load --all --max-tokens <n>    # All context
contxt load --summary                 # Context summary
```

### Capture & Review

```bash
contxt capture                        # Manually trigger a capture
contxt scan                           # Scan project for patterns
contxt review                         # Review and confirm captured drafts
```

### Branching

```bash
contxt branch create <name> [--from <branch>]
contxt branch list
contxt branch switch <name>
contxt branch delete <name>
contxt branch merge <source>
```

### Version History

```bash
contxt history show <entry-id>
contxt history restore <entry-id> --version <n>
```

### Cloud Sync & Auth

```bash
contxt auth login [--email <email>]   # GitHub OAuth or magic link
contxt auth logout
contxt auth status

contxt push [--force] [--dry-run]
contxt pull [--force] [--dry-run]
contxt sync [--force] [--dry-run]
```

### Analytics & Diagnostics

```bash
contxt stats [--days <n>] [--export json]   # Token efficiency, sessions, most retrieved, stale entries
contxt diff [--since <timestamp>] [--days <n>] [--json]  # Context changes since last session
```

### Export / Import

```bash
contxt export [--output <file>] [--branch <branch>]
contxt import --file <file> [--merge]
```

## MCP Integration

Contxt exposes tools to AI agents via the Model Context Protocol. These are automatically configured when you run `contxt init`.

**Retrieval**

| Tool | Description |
|---|---|
| `suggest_context` | Smart relevance-ranked context retrieval. Accepts `max_tokens` to limit response size. |
| `get_decisions` | Get architectural decisions. Accepts `max_tokens`. |
| `get_patterns` | Get code patterns and conventions. Accepts `max_tokens`. |
| `search_memory` | Full-text search across all entries. Accepts `max_tokens`. |
| `get_project_context` | Project overview with stack, config, and entry counts. |

**Capture**

| Tool | Description |
|---|---|
| `contxt_auto_capture_decision` | Capture an architectural decision |
| `contxt_auto_capture_pattern` | Capture a reusable code pattern |
| `contxt_capture_discussion` | Capture a decision with full discussion context |
| `contxt_update_session` | Update the current session summary |
| `contxt_get_drafts` | List all pending draft captures for review |
| `contxt_confirm_draft` | Confirm and promote a draft to memory |

**Session Continuity (compaction survival)**

| Tool | Description |
|---|---|
| `contxt_session_event` | Log a notable event (decision_made, file_edited, task_completed, error_hit) |
| `contxt_session_snapshot` | Build a compact resume of the current session state |
| `contxt_session_resume` | Resume context after compaction — loads the latest snapshot |

**Analytics**

| Tool | Description |
|---|---|
| `contxt_stats` | Token efficiency, session counts, most retrieved entries, stale entries |
| `contxt_diff` | What decisions and patterns changed since the last session |

### How It Works

`contxt init` writes `.mcp.json` to your project root, which Claude Code and Cursor pick up automatically:

```json
{
  "mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp"]
    }
  }
}
```

When you ask Claude Code: "Help me implement payment webhooks" — Claude automatically calls `contxt_auto_capture_decision` and receives relevant decisions, patterns, and context without you doing anything.

## Architecture

```
contxt/
├── packages/
│   ├── core/           # Business logic (infrastructure-agnostic)
│   ├── adapters/       # SQLite & Supabase implementations
│   ├── cli/            # Command-line interface (`contxt` binary)
│   ├── mcp/            # MCP server for AI agents
│   └── web/            # Dashboard UI (Next.js)
├── supabase/
│   ├── migrations/     # Database schema
│   └── functions/      # Edge Functions (embeddings)
└── .contxt/            # Created in user projects
    └── local.db        # SQLite database
```

### Design Principles

1. **Offline-First**: SQLite is source of truth, Supabase syncs later
2. **Infrastructure-Agnostic**: Core logic behind interfaces
3. **Adapter Pattern**: Swap Supabase for any backend without changing business logic
4. **Zero Config**: `contxt init` handles all editor/agent setup automatically

## Configuration

### Environment Variables

```bash
# Supabase (required for cloud sync)
CONTXT_SUPABASE_URL=https://your-project.supabase.co
CONTXT_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (required for semantic search)
OPENAI_API_KEY=sk-...

# Local dev: bypass billing gates (never use in production)
CONTXT_PLAN=pro
```

### Project Config

`.contxt/` is created in your project root on `contxt init`. Per-project config is stored in the local SQLite database.

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Development mode (watch)
pnpm dev
```

### Local Dev Without Billing Gates

Set `CONTXT_PLAN=pro` to bypass plan enforcement locally:

```bash
CONTXT_PLAN=pro contxt init
```

Or add it to your `.env` file (never commit to production).

### Testing the MCP Server

```bash
cd test-project
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | contxt mcp
```

### Supabase Setup

1. Create a Supabase project
2. Run migrations:
   ```bash
   supabase migration up
   ```
3. Enable the `pgvector` extension
4. Deploy the embedding Edge Function:
   ```bash
   supabase functions deploy embed --no-verify-jwt
   ```
5. Set environment variables in your Supabase dashboard

## Support

- **Issues**: [GitHub Issues](https://github.com/ghostsavvy/contxt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ghostsavvy/contxt/discussions)
- **Email**: support@mycontxt.co

---

**Built for developers who are tired of re-explaining their codebase to AI agents.**
