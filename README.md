# MemoCore

**GitHub for AI Context** — Persistent, versioned, project-scoped memory for AI coding agents.

MemoCore solves the problem that every AI-assisted development session starts from zero. Instead of wasting ~40% of your prompts re-explaining architecture and conventions, MemoCore intelligently surfaces only what's relevant to your current task.

## Why MemoCore?

- **🧠 Smart Context Retrieval**: AI agents automatically load relevant decisions, patterns, and context
- **🔄 Version Control**: Git-like branching and time travel for your project memory
- **☁️ Cloud Sync**: Supabase-powered sync across machines and teams
- **🔍 Semantic Search**: pgvector-powered similarity search finds what you need
- **🚀 MCP Integration**: Works seamlessly with Claude Code and other AI agents
- **📦 Offline-First**: SQLite local storage, works without internet

## Quickstart (5 minutes)

### Install

```bash
npm install -g @memocore/cli
```

### Initialize Project

```bash
cd your-project
memocore init
```

### Add Project Memory

```bash
# Log architectural decisions
memocore decision add \
  --title "Use PostgreSQL for main database" \
  --rationale "Need ACID guarantees and relational queries" \
  --alternatives "MongoDB" "DynamoDB"

# Save code patterns
memocore pattern add \
  --title "API Error Handler" \
  --content "Always return { error: string, code: number, details?: any }" \
  --category "API"

# Track current context
memocore context set \
  --feature "Payment integration" \
  --blockers "Need to verify Stripe webhook signatures" \
  --next "Research webhook validation" "Set up test webhooks"
```

### Load Context for AI

```bash
# Task-based (smart relevance ranking)
memocore load --task "implement Stripe webhooks"

# File-based
memocore load --files "src/payments/**"

# Everything
memocore load --all --max-tokens 2000
```

### MCP Integration (Auto-Context for AI Agents)

```bash
# Install MCP server for Claude Code
memocore mcp install

# Restart Claude Code
# Now when you ask "Help me implement Stripe webhooks"
# Claude automatically loads relevant decisions, patterns, and context!
```

## Core Concepts

### Memory Types

1. **Decisions**: Architectural choices with rationale and alternatives
2. **Patterns**: Code conventions, templates, and best practices
3. **Context**: Current working context (feature, blockers, next steps)
4. **Documents**: Reference materials, API docs, onboarding guides
5. **Sessions**: Development session logs with summaries

### Branching

Experiment with different approaches without polluting your main memory:

```bash
# Create experimental branch
memocore branch create experiment/new-approach

# Try something different
memocore decision add --title "Try MongoDB instead" --rationale "..."

# Switch back to main
memocore branch switch main

# Merge if it worked out
memocore branch merge experiment/new-approach
```

### Versioning (Time Travel)

Every change is versioned automatically:

```bash
# View history
memocore history show <entry-id>

# Restore previous version
memocore history restore <entry-id> --version 2
```

### Cloud Sync

```bash
# Authenticate
memocore auth login

# Push local changes
memocore push

# Pull remote changes
memocore pull

# Full bidirectional sync
memocore sync
```

## Command Reference

### Project Management

```bash
memocore init [--name <name>]          # Initialize project
memocore status                         # Show project status
```

### Memory Management

```bash
# Decisions
memocore decision add --title <title> --rationale <rationale>
memocore decision list
memocore decision show <id>

# Patterns
memocore pattern add --title <title> --content <content>
memocore pattern list
memocore pattern show <id>

# Context
memocore context set --feature <feature> --blockers <blockers...>
memocore context show
memocore context clear

# Documents
memocore doc add --title <title> --content <content>
memocore doc add --title <title> --file <path>  # From file
memocore doc list
memocore doc show <id>

# Sessions
memocore session start --feature <feature>
memocore session end [--summary <summary>]
memocore session list
memocore session current
```

### Search & Retrieval

```bash
memocore search <query>                 # Full-text search
memocore load --task <description>      # Smart context loading
memocore load --files <files...>        # File-based context
memocore load --all --max-tokens <n>    # All context
memocore load --summary                 # Context summary
```

### Branching

```bash
memocore branch create <name> [--from <branch>]
memocore branch list
memocore branch switch <name>
memocore branch delete <name>
memocore branch merge <source>
```

### Version History

```bash
memocore history show <entry-id>
memocore history restore <entry-id> --version <n>
```

### Cloud Sync

```bash
memocore auth login [--email <email>]   # GitHub OAuth or magic link
memocore auth logout
memocore auth status

memocore push [--force] [--dry-run]
memocore pull [--force] [--dry-run]
memocore sync [--force] [--dry-run]
```

### Export/Import

```bash
memocore export [--output <file>] [--branch <branch>]
memocore import --file <file> [--merge]
```

## MCP Integration

MemoCore exposes 8 tools to AI agents via Model Context Protocol:

1. **suggest_context** - Smart context retrieval (primary tool)
2. **get_project_context** - Project overview
3. **get_decisions** - List decisions
4. **get_patterns** - List patterns
5. **search_memory** - Full-text search
6. **log_decision** - Create decision
7. **update_context** - Update working context
8. **save_pattern** - Save pattern

### Configuration

MemoCore is configured in `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "memocore": {
      "command": "node",
      "args": ["/path/to/memocore/packages/mcp/dist/server.js"]
    }
  }
}
```

### Example Usage

When you ask Claude Code: "Help me implement payment webhooks"

Claude automatically calls `suggest_context` with:
- Task description: "implement payment webhooks"
- Active files: Current editor files
- Token budget: 4000 tokens

It receives:
- Relevant decisions (e.g., "Use Stripe for payments")
- Code patterns (e.g., "API error handling")
- Current context (e.g., "Working on payment integration")
- File paths and next steps

This enables Claude to provide contextually-aware answers without you manually copying/pasting context!

## Architecture

```
memocore/
├── packages/
│   ├── core/           # Business logic (infrastructure-agnostic)
│   ├── adapters/       # SQLite & Supabase implementations
│   ├── cli/            # Command-line interface
│   └── mcp/            # MCP server for AI agents
├── supabase/
│   ├── migrations/     # Database schema
│   └── functions/      # Edge Functions (embeddings)
└── .memocore/          # Created in user projects
    ├── config.json
    └── local.db        # SQLite database
```

### Design Principles

1. **Offline-First**: SQLite is source of truth, Supabase syncs later
2. **Infrastructure-Agnostic**: Core logic behind interfaces
3. **Adapter Pattern**: Swap Supabase for AWS/GCP without changing business logic
4. **Clean Boundaries**: Each package has single responsibility

## Configuration

### Environment Variables

```bash
# Supabase (required for cloud sync)
MEMOCORE_SUPABASE_URL=https://your-project.supabase.co
MEMOCORE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (required for semantic search)
OPENAI_API_KEY=sk-...
```

### Project Config

`.memocore/config.json`:

```json
{
  "version": "0.1.0",
  "project": {
    "name": "my-project",
    "stack": ["typescript", "react", "postgresql"]
  },
  "sync": {
    "enabled": true,
    "autoPush": false
  }
}
```

## Deployment

### Supabase Setup

1. Create Supabase project
2. Run migrations:
   ```bash
   supabase migration up
   ```
3. Enable pgvector extension
4. Deploy Edge Function:
   ```bash
   supabase functions deploy embed --no-verify-jwt
   ```
5. Set environment variables in Supabase dashboard

### Self-Hosting

MemoCore can run entirely self-hosted:

1. Deploy PostgreSQL with pgvector
2. Run migrations from `supabase/migrations/`
3. Deploy embedding function (Deno Deploy, AWS Lambda, etc.)
4. Update adapter to point to your infrastructure

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

### Testing

```bash
# Unit tests
pnpm test

# Integration tests (requires Supabase)
SUPABASE_URL=... SUPABASE_ANON_KEY=... pnpm test:integration

# MCP server test
cd test-project
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node ../packages/mcp/dist/server.js
```

## Roadmap

### v1.1 (Month 2-3)
- [ ] Team collaboration (organizations)
- [ ] Web dashboard for viewing/editing memory
- [ ] Real-time sync (not just manual push/pull)
- [ ] Advanced conflict resolution UI

### v2.0 (Month 4+)
- [ ] Self-hosted Docker deployment
- [ ] Plugin system for custom memory types
- [ ] VS Code extension (inline context)
- [ ] Mobile app for on-the-go context

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/memocore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/memocore/discussions)
- **Email**: support@memocore.dev

---

**Built with ❤️ for developers who are tired of re-explaining their codebase to AI agents.**
