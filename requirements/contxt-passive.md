# Contxt CLI — Passive Context Capture Enhancement

## Context

The Contxt CLI (`@contxt/cli`) is fully built and working. Core commands exist: `init`, `decision add`, `pattern add`, `context set`, `push`, `pull`, `suggest`, `mcp serve`, `branch`, `search`. The monorepo has packages for `core`, `cli`, `adapters` (Supabase), and `mcp-server`.

The problem: all context entry is manual. Developers have to stop coding, switch to the terminal, and run `contxt decision add` interactively. Nobody does this. Context capture needs to happen **where developers already work** — in their code, their commits, their AI sessions, and their existing project files.

This prompt adds 6 features that make Contxt a passive listener instead of an active form. Implement them in the order listed — each builds on the previous.

Read the entire existing codebase before writing any code. Understand the current data model, storage layer, and command structure. Every new feature must use the existing `MemoryEntry`, `Project`, and `Branch` types from `@contxt/core`. Every new command must follow the existing CLI patterns (Commander.js structure, output formatting, error handling).

---

## Feature 1: `contxt scan` — Code Comment Extraction

### What It Does

Scans the project codebase for tagged comments and creates/updates memory entries from them. Developers annotate decisions, patterns, and context directly in their code using `@decision`, `@pattern`, and `@context` tags.

### Comment Syntax

```typescript
// @decision Use Prisma over Drizzle — better TS support, more mature migrations
// @decision [infrastructure] JWT in httpOnly cookies for auth | rationale: stateless, refresh rotation
// @pattern API route: Zod schema → validate → handler → typed response
// @pattern [api] Error handler with retry | when: transient failures, external API calls
// @context Currently building user onboarding flow, blocked on Stripe webhooks
```

**Parsing rules:**

```
// @decision [optional-category] Title text | key: value | key: value
// @pattern [optional-category] Name | when: usage description | template: code reference
// @context Free-form text about current work
```

- Tag: `@decision`, `@pattern`, `@context` (case-insensitive)
- Category: optional, in square brackets after the tag
- Title/name: everything after the tag (or category) up to the first `|` or end of line
- Fields: pipe-separated `key: value` pairs after the title
- For `@decision`: supported fields are `rationale`, `alternatives`, `status`
- For `@pattern`: supported fields are `when`, `template`, `category`
- For `@context`: the entire text after the tag is the free-form note
- Multi-line: if the next line starts with `//` followed by whitespace (no tag), it continues the previous entry

```typescript
// @decision Use Stripe for billing
//   Better API design, webhook reliability with built-in retry,
//   global coverage (135+ currencies).
//   | alternatives: Paddle (simpler tax, weaker API), LemonSqueezy (good DX, limited enterprise)
```

**Supported comment styles:**

```
// @decision ...          (JS/TS/Go/Rust/C)
# @decision ...           (Python/Ruby/Shell/YAML)
/* @decision ... */       (CSS/C block — single line only)
-- @decision ...          (SQL)
<!-- @decision ... -->    (HTML/XML — single line only)
```

### Source Metadata

Every entry created by `scan` stores the source file path and line number in the entry metadata:

```json
{
  "source": "scan",
  "file": "src/lib/stripe/webhooks.ts",
  "line": 14
}
```

### Deduplication

Scan uses a content hash (of tag + title text) as a stable identifier. On subsequent scans:

- If the hash exists and the content is unchanged → skip
- If the hash exists but content changed → update the entry (new version)
- If a previously scanned entry's source comment is deleted → mark entry as `stale` (don't delete — surface in `contxt review`)
- New hashes → create as drafts

### CLI Interface

```bash
contxt scan                        # Scan current project
contxt scan --path src/            # Scan specific directory
contxt scan --dry-run              # Show what would be captured without saving
contxt scan --auto-confirm         # Skip draft queue, save directly
contxt scan --watch                # Re-scan on file changes (uses chokidar)
```

**Output:**

```
Scanning project...

  Found 8 tagged comments across 5 files

  NEW
  + DECISION  Use Stripe for billing                    src/lib/stripe/webhooks.ts:14
  + PATTERN   API route: Zod → handler → response       src/app/api/route.ts:3
  + CONTEXT   Building user onboarding flow              src/app/onboarding/page.tsx:8

  UPDATED
  ~ DECISION  JWT + httpOnly cookies for auth            src/middleware.ts:22  (rationale changed)

  UNCHANGED
  · PATTERN   Error handler with retry logic             src/lib/errors.ts:5
  · DECISION  Use Prisma over Drizzle                    src/lib/db/client.ts:1

  STALE (source comment removed)
  ? DECISION  Use Redis for caching                      was: src/lib/cache.ts:3

  3 new entries saved as drafts. Run `contxt review` to confirm.
```

### File Ignore

Respect `.gitignore` + a `.contxtignore` file (same syntax). Always ignore: `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `*.min.js`, `*.lock`, binary files.

### Implementation

- Add `scan` command group to the CLI
- Create `packages/core/src/scanner.ts` — the comment parser and file walker
- Use `fast-glob` for file discovery, respect ignore patterns
- Use a streaming line reader (not full file load) for large codebases
- Parser is a state machine: detect comment prefix → detect tag → extract category → extract title → extract fields → handle continuation lines
- Store scan results in the local database with `source: "scan"` metadata
- New entries from scan are saved with `status: "draft"` unless `--auto-confirm` is passed

---

## Feature 2: `contxt rules` — Rules File Sync

### What It Does

Syncs a human-readable `.contxt/rules.md` file with the structured memory store. Developers edit the markdown file in their IDE like any other project file. Contxt parses it into structured entries.

### File Format

`.contxt/rules.md`:

```markdown
# Stack

- Next.js 14, App Router
- Prisma + Postgres
- Supabase Auth
- Stripe Billing
- Vercel deployment

# Decisions

- Use Prisma for ORM (better TS support than Drizzle, more mature migrations)
- JWT in httpOnly cookies for auth (stateless, refresh token rotation)
- Stripe for billing (API quality, webhook reliability, global coverage)
- Zod for all runtime validation (shared schemas between client and server)

# Patterns

- API routes: Zod schema → validate → handler → typed response
- Error handling: centralized handler with exponential backoff, max 3 retries
- Services communicate via typed EventBus (async dispatch)
- Components: server components by default, client only when state/interactivity needed

# Context

Currently building user onboarding flow. Multi-step wizard with
Stripe subscription creation at the end. Blocked on webhook
integration for subscription.created event.

Next steps:

- Implement webhook handlers
- Add email verification
- Write onboarding e2e tests
```

### Parsing Rules

- `# Stack` → stored as a project metadata update (stack field)
- `# Decisions` → each list item becomes a decision entry. Text in parentheses is the rationale.
- `# Patterns` → each list item becomes a pattern entry. Text before the colon is the name, after is the template/description.
- `# Context` → the entire block (until the next heading) becomes the active context entry
- Additional headings like `# Conventions`, `# Notes`, `# Architecture` → stored as document entries
- Headings are case-insensitive

### Bidirectional Sync

```bash
contxt rules sync          # Parse rules.md → update memory store
contxt rules generate      # Generate rules.md from current memory store
contxt rules diff          # Show differences between file and store
```

`contxt rules generate` is useful for bootstrapping — if a developer already has entries from `scan` or manual input, they can generate the rules file and maintain it from there.

`contxt rules sync` diffs the file against stored entries and only updates what changed. It uses the entry title as the stable key for matching.

### Auto-Sync

When `contxt watch` is running (Feature 5), changes to `.contxt/rules.md` are automatically detected and synced. No manual command needed.

### Implementation

- Add `rules` command group to the CLI
- Create `packages/core/src/rules-parser.ts` — markdown parser that extracts structured entries
- Use a simple markdown parser (don't pull in a full AST library — heading detection + list item extraction is sufficient with regex)
- `sync` command: parse file → diff against store → create/update/mark-stale → report
- `generate` command: query all entries → format as markdown → write to `.contxt/rules.md`
- `diff` command: parse file + query store → show additions, changes, removals
- Store entries with `source: "rules"` metadata

---

## Feature 3: `contxt import` — One-Command Import from Existing Sources

### What It Does

Imports context from files that already exist in most projects. This is the onboarding hook — a developer installs Contxt and immediately populates it from what they already have.

### Supported Sources

```bash
contxt import README.md                    # Parse README for stack, architecture, decisions
contxt import .cursor/rules                # Import Cursor rules as patterns
contxt import .cursorrules                 # Alternative Cursor rules location
contxt import .claude/CLAUDE.md            # Import Claude Code context file
contxt import .claude/settings.json        # Import Claude Code project settings
contxt import .github/copilot-instructions.md  # Import Copilot instructions
contxt import .windsurfrules               # Import Windsurf rules
contxt import docs/adr/                    # Import Architecture Decision Records directory
contxt import --from-commits 30            # Scan last 30 git commits for decisions
contxt import --from-package               # Extract stack from package.json/requirements.txt/Cargo.toml
```

### Import Logic per Source

**README.md / markdown files:**

- Extract headings as section markers
- Look for "Stack", "Tech Stack", "Built With", "Architecture", "Getting Started" sections
- Lists under tech/stack headings → stack entries
- Paragraphs describing architecture → document entries
- Parse badge images (shields.io) for technology detection

**Cursor rules (`.cursor/rules`, `.cursorrules`):**

- These are plain text files with coding instructions
- Each paragraph or rule block → pattern entry
- Category auto-detected from keywords (api, component, testing, etc.)

**Claude Code context (`.claude/CLAUDE.md`):**

- Markdown file — parse same as rules.md format
- Headings map to entry types
- Often contains project overview, conventions, and active context

**ADR directory (`docs/adr/`):**

- Architecture Decision Records are markdown files with a standard format
- Parse: Title → decision name, Status → status, Context → rationale, Decision → decision text, Consequences → stored in metadata
- Each ADR file → one decision entry

**Git commits (`--from-commits N`):**

- Scan last N commit messages
- Filter for conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `arch:`, `build:`, `ci:`
- Look for decision keywords: "decided", "switched to", "replaced", "migrated", "chose", "using X instead of Y"
- Each qualifying commit → draft decision entry with commit hash in metadata
- Group related commits (same file area or same day) to avoid duplicates

**Package files (`--from-package`):**

- `package.json` → extract dependencies as stack (framework detection: next, express, fastify, prisma, etc.)
- `requirements.txt` / `pyproject.toml` → Python stack
- `Cargo.toml` → Rust stack
- `go.mod` → Go stack
- `Gemfile` → Ruby stack
- Maps known packages to human-readable stack items (e.g., `next` → "Next.js", `prisma` → "Prisma ORM")

### CLI Interface

```bash
contxt import <source> [options]
```

```bash
contxt import README.md

  Importing from README.md...

  Detected:
  + STACK     Next.js 14, Prisma, Postgres, Stripe, Vercel
  + DOCUMENT  Project overview                         (from ## About section)
  + DOCUMENT  API architecture                         (from ## Architecture section)
  + PATTERN   3 conventions detected                   (from ## Development section)

  Import 6 entries? (Y/n)
```

**Options:**

```bash
contxt import <source> --dry-run        # Preview without saving
contxt import <source> --auto-confirm   # Skip confirmation prompt
contxt import <source> --as-drafts      # Save as drafts for review
```

### Implementation

- Add `import` command to the CLI
- Create `packages/core/src/importers/` directory with one file per source type:
  - `readme.ts` — markdown file parser
  - `cursor-rules.ts` — Cursor rules parser
  - `claude-context.ts` — Claude Code file parser
  - `adr.ts` — ADR directory parser
  - `git-commits.ts` — git log parser (uses `child_process.execSync` for `git log`)
  - `package-detector.ts` — package file stack extractor
- Each importer exports a function: `(filePath: string) => ImportResult[]`
- `ImportResult` has: `type`, `title`, `content`, `category`, `metadata`, `confidence` (0-1)
- The import command auto-detects the source type from the file path/extension, or the user can specify `--type`
- All imports default to interactive confirmation. `--auto-confirm` skips it. `--as-drafts` saves to review queue.
- Store entries with `source: "import:<type>"` metadata (e.g., `source: "import:cursor-rules"`)

---

## Feature 4: `contxt hook` — Git Hook Integration

### What It Does

Installs git hooks that automatically capture context from your git workflow. No manual commands needed after installation.

### Installation

```bash
contxt hook install          # Install all hooks
contxt hook install --hooks post-commit,pre-push    # Install specific hooks
contxt hook uninstall        # Remove all Contxt hooks
contxt hook status           # Show installed hooks
```

Hooks are installed by adding a Contxt block to existing hook files (doesn't overwrite other hooks like Husky/lint-staged). Uses the `#!/usr/bin/env contxt-hook <type>` approach — installs thin shell scripts that call the Contxt CLI.

### Hook: post-commit

Runs after every commit. Scans the commit message for context signals.

**What it does:**

1. Read the commit message
2. Check for conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `arch:`, `build:`)
3. Check for decision keywords ("decided", "switched to", "replaced", "migrated", "chose")
4. If a signal is detected, create a **draft** entry with:
   - Type: decision (for choice keywords), context (for feat/fix/refactor)
   - Title: extracted from commit message
   - Metadata: commit hash, author, files changed
5. Update active context: add changed files to `context.files`
6. Print a one-line summary (non-blocking — the hook must be fast)

**Speed requirement:** The post-commit hook must complete in under 200ms. No network calls. No embedding generation. Just local database writes. Parse the commit message with regex, not AI.

**Output (inline, non-blocking):**

```
contxt: draft saved — "Migrate from Express to Fastify" (decision)
```

Or if nothing detected, silent. No output.

### Hook: pre-push

Runs before `git push`. Summarizes the session and updates context.

**What it does:**

1. Count commits being pushed
2. Summarize files changed across all commits in the push
3. Update active context with a session summary
4. If the user has `auto_push` enabled in config, also run `contxt push` to sync to cloud

**Output:**

```
contxt: session updated — 5 commits, 12 files changed
contxt: syncing to cloud... ✓
```

### Hook: post-checkout

Runs when switching branches.

**What it does:**

1. Detect the new branch name
2. Switch the Contxt context branch to match (or fall back to main)
3. Print the active context for the new branch

**Output:**

```
contxt: switched to branch feature/auth (14 entries)
```

### Hook: prepare-commit-msg

Optional. Appends active context as a comment in the commit message template.

**What it does:**

1. Read the current active context
2. Append as a comment block (lines starting with `#`) at the bottom of the commit message template
3. Developer sees it while writing the commit but it's stripped from the final message

```
# --- Contxt ---
# Feature: user onboarding flow (in-progress)
# Blockers: Stripe webhook integration
# Recent decisions: Use Stripe for billing (v3), JWT auth (v3)
```

### Implementation

- Add `hook` command group to the CLI
- Create `packages/cli/src/commands/hook.ts` — install/uninstall/status subcommands
- Create `packages/cli/src/hooks/` directory:
  - `post-commit.ts` — commit message parser + draft entry creator
  - `pre-push.ts` — session summarizer + optional cloud sync
  - `post-checkout.ts` — branch switcher
  - `prepare-commit-msg.ts` — context comment injector
- Hook installer writes shell scripts to `.git/hooks/` that call `contxt hook run <type>`
- The shell scripts are thin wrappers: `#!/bin/sh\ncontxt hook run post-commit "$@"`
- If a hook file already exists, append the Contxt call (don't overwrite)
- All hooks must be non-blocking and fast (<200ms). No network. No AI. Local only.
- Configuration in `.contxt/config.json`:

```json
{
  "hooks": {
    "post_commit": true,
    "pre_push": true,
    "post_checkout": true,
    "prepare_commit_msg": false,
    "auto_push_on_push": false
  }
}
```

---

## Feature 5: `contxt watch` — Background File Watcher

### What It Does

Runs a lightweight background daemon that monitors your project and keeps context warm.

### What It Monitors

1. **File changes** — tracks which files you're editing, updates `context.files` every 30 seconds (debounced)
2. **`.contxt/rules.md` changes** — auto-runs `contxt rules sync` when the file is saved
3. **Branch switches** — detects `.git/HEAD` changes, switches context branch
4. **Session timing** — logs session start when first file change is detected, session end after 30 minutes of inactivity
5. **Comment tag changes** — re-scans modified files for `@decision`/`@pattern`/`@context` tags (incremental, not full-project scan)

### CLI Interface

```bash
contxt watch                  # Start watcher in foreground
contxt watch --daemon         # Start as background process
contxt watch stop             # Stop the background daemon
contxt watch status           # Check if watcher is running
```

**Foreground output:**

```
contxt watch — monitoring my-saas-app (main)

  14:32  files    src/app/api/billing/route.ts, src/lib/stripe.ts
  14:35  scan     + DECISION "Use Stripe Connect for marketplace" (draft)
  14:41  files    src/app/onboarding/page.tsx
  14:52  context  session active — 20 min, 4 files
  15:22  session  ended — 50 min, 6 files touched
  15:22  rules    rules.md changed — syncing 2 updates
```

### Daemon Mode

`contxt watch --daemon` starts the watcher as a detached process. It writes its PID to `.contxt/.watch.pid`. Logs go to `.contxt/watch.log`. The daemon auto-stops if the terminal session that started it ends, or when `contxt watch stop` is called.

### Resource Constraints

- Use `chokidar` for file watching with `ignoreInitial: true`
- Only watch files matching the project's language (detect from package.json/config)
- Debounce all writes to the database (batch updates every 30 seconds)
- Memory ceiling: the watcher should use <50MB RSS
- CPU: polling interval of 1000ms, not continuous
- Ignore `node_modules`, `.git`, `dist`, `build`, `.next`, and all `.contxtignore` patterns

### Implementation

- Add `watch` command to the CLI
- Create `packages/cli/src/commands/watch.ts` — the watcher orchestrator
- Create `packages/core/src/watcher.ts` — the file monitoring engine
- Use `chokidar` for cross-platform file watching
- Session detection: track first file change timestamp + last file change timestamp. If gap > 30 min, end session.
- Daemon mode: use `child_process.spawn` with `detached: true` + `unref()`. Write PID file. `stop` command reads PID and sends SIGTERM.
- Incremental scan: when a file changes, check if it contains `@decision`/`@pattern`/`@context` tags. If yes, parse only that file and diff against existing scanned entries from that file.
- Rules sync: watch `.contxt/rules.md` specifically. On change, run the rules parser and diff.
- Branch detection: watch `.git/HEAD`. On change, parse the new branch name and switch.

---

## Feature 6: MCP Auto-Capture

### What It Does

Enhances the existing MCP server so that AI tools can automatically capture decisions, patterns, and context during a conversation — without the developer explicitly asking.

### New MCP Tools

Add these tools to the existing MCP server:

```
contxt_auto_capture_decision    — AI calls this when it detects a decision in the conversation
contxt_auto_capture_pattern     — AI calls this when it recognizes a reusable pattern
contxt_update_session           — AI calls this to log what was worked on
contxt_get_drafts               — AI calls this to show pending drafts for review
contxt_confirm_draft            — AI calls this when user approves a draft
```

### System Instruction Injection

When the MCP server starts, it provides a system-level instruction to the AI tool (via MCP resource or tool description) that says:

```
You have access to Contxt, a project memory system. During this conversation:

1. When the developer makes an architectural decision (technology choice, design pattern selection,
   convention establishment), call contxt_auto_capture_decision with the decision details.

2. When you identify a reusable code pattern that should be followed across the project,
   call contxt_auto_capture_pattern with the pattern details.

3. At the end of the session, call contxt_update_session with a summary of what was accomplished.

Capture decisions and patterns silently — don't ask for permission each time. The developer
will see a brief confirmation and can review/edit later with `contxt review`.

Only capture genuine decisions (choosing X over Y) and reusable patterns (do this every time).
Don't capture one-off implementation details or temporary fixes.
```

### Auto-Capture Flow

1. Developer is chatting with Claude Code about implementing billing
2. Developer says: "Let's use Stripe Connect instead of standard Stripe — we need marketplace payouts"
3. Claude Code recognizes this as a decision, calls `contxt_auto_capture_decision`:

```json
{
  "decision": "Use Stripe Connect for marketplace billing",
  "category": "infrastructure",
  "rationale": "Need marketplace payout functionality for vendor payments. Standard Stripe doesn't support multi-party payments.",
  "alternatives": "Standard Stripe (no marketplace support), PayPal Commerce Platform (weaker API)",
  "status": "active"
}
```

4. Contxt saves it as a draft and returns confirmation:

```json
{
  "status": "captured",
  "id": "dec_x1y2z3w4",
  "message": "Decision captured: Use Stripe Connect for marketplace billing (draft — run `contxt review` to confirm)"
}
```

5. Claude Code shows the user a subtle confirmation inline in the conversation

### Draft Review

All auto-captured entries are drafts by default. Developers review them:

```bash
contxt review
```

```
3 drafts pending review

  1. DECISION  Use Stripe Connect for marketplace billing
     Source: mcp-auto (Claude Code session, 14:32)
     [confirm] [edit] [discard]

  2. PATTERN   Webhook handler: verify signature → parse event → route to handler
     Source: mcp-auto (Claude Code session, 14:45)
     [confirm] [edit] [discard]

  3. DECISION  Use Bull for job queue over pg-boss
     Source: post-commit (commit a3f2b1c)
     [confirm] [edit] [discard]

  Action: (a)ll confirm, (r)eview each, (d)iscard all?
```

### Auto-Confirm Setting

For developers who trust the auto-capture:

```json
// .contxt/config.json
{
  "auto_capture": {
    "enabled": true,
    "auto_confirm_after": "24h",
    "sources": ["mcp", "hooks", "scan"]
  }
}
```

Drafts auto-confirm after the specified duration unless manually discarded.

### Implementation

- Modify `packages/mcp-server/src/tools.ts` to add the new auto-capture tools
- Add draft status field to the `MemoryEntry` type in `@contxt/core` (`status: "active" | "draft" | "archived" | "stale"`)
- Add `review` command to the CLI: `packages/cli/src/commands/review.ts`
- Review command is interactive (use `inquirer` or `@clack/prompts`): shows each draft with options to confirm, edit (opens in $EDITOR or inline prompt), or discard
- `contxt review --confirm-all` for bulk confirmation
- MCP tools should be fast — just a local database insert. No network calls during auto-capture.
- The system instruction text is stored as an MCP resource that AI tools can read, not hardcoded into tool descriptions

---

## Feature 7: `contxt review` — Draft Review Queue

This was referenced in features 1, 4, and 6 but needs its own dedicated implementation.

### What It Does

Unified review interface for all draft entries, regardless of source (scan, hooks, mcp-auto, import).

### CLI Interface

```bash
contxt review                     # Interactive review of all drafts
contxt review --source scan       # Only drafts from code scanning
contxt review --source hooks      # Only drafts from git hooks
contxt review --source mcp        # Only drafts from MCP auto-capture
contxt review --confirm-all       # Confirm all pending drafts
contxt review --discard-all       # Discard all pending drafts
contxt review --count             # Just show the count
```

### Interactive Mode

Uses `@clack/prompts` for the interactive UI (matches the style of the existing CLI prompts):

```
┌  contxt review
│
◇  3 drafts pending
│
│  ┌─────────────────────────────────────────────────┐
│  │  DECISION  Use Stripe Connect for marketplace    │
│  │  Source:   mcp-auto · Claude Code · 2h ago       │
│  │  Rationale: Need marketplace payout...           │
│  └─────────────────────────────────────────────────┘
│
◆  Action?
│  ● Confirm
│  ○ Edit then confirm
│  ○ Discard
│  ○ Skip (review later)
└
```

### Edit Mode

When "Edit then confirm" is selected:

- If `$EDITOR` is set → open the entry as a temporary markdown file in the user's editor
- If not → inline prompts for each field (decision text, category, rationale, etc.)
- After editing, save as confirmed

### Status Bar Integration

Add a draft count to relevant commands:

```bash
contxt status

  my-saas-app (main) · 29 entries · synced 2m ago
  ⚑ 3 drafts pending review — run `contxt review`
```

The draft count also shows in `contxt suggest` output and `contxt context show` as a subtle reminder.

### Implementation

- Create `packages/cli/src/commands/review.ts`
- Query all entries with `status: "draft"` from the local database
- Group by source for the `--source` filter
- Interactive mode: iterate through drafts one by one with action selection
- On confirm: update `status` from `"draft"` to `"active"`, remove draft metadata
- On discard: delete the entry from the database
- On skip: leave as draft, move to next
- On edit: create temp file at `.contxt/.draft-edit.md`, open in `$EDITOR`, parse back on save, then confirm
- Add draft count query to `status`, `suggest`, and `context show` commands

---

## Configuration

All new features are configured in `.contxt/config.json`. Add these fields to the existing config schema:

```json
{
  "scan": {
    "enabled": true,
    "tags": ["@decision", "@pattern", "@context"],
    "ignore": ["*.test.ts", "*.spec.ts", "__tests__/**"],
    "auto_confirm": false
  },
  "rules": {
    "auto_sync": true,
    "file": ".contxt/rules.md"
  },
  "hooks": {
    "post_commit": true,
    "pre_push": true,
    "post_checkout": true,
    "prepare_commit_msg": false,
    "auto_push_on_push": false
  },
  "watch": {
    "debounce_ms": 30000,
    "session_timeout_min": 30,
    "incremental_scan": true
  },
  "auto_capture": {
    "enabled": true,
    "auto_confirm_after": "24h",
    "sources": ["mcp", "hooks", "scan"]
  }
}
```

All features are **opt-in** except `scan` (which is a manual command) and `import` (which is always manual). The `contxt init` wizard should ask whether to enable hooks, watch, and auto-capture.

---

## Implementation Order

**Phase 1:** `scan` command + `review` command (these are the foundation — everything else produces drafts that `review` processes)

**Phase 2:** `rules` sync + `import` command (onboarding: get existing context in fast)

**Phase 3:** `hook install` + all 4 git hooks (automatic capture from git workflow)

**Phase 4:** `watch` daemon (passive monitoring)

**Phase 5:** MCP auto-capture tools (AI-driven capture)

Each phase should be a working increment. Don't build Phase 3 until Phase 1 and 2 are tested and working. Each feature must have: the command implementation, unit tests for the parser/logic, and an update to the `--help` text.

---

## Testing

For each feature, write tests covering:

**Scan:**

- Parsing all comment styles (JS, Python, SQL, HTML)
- Multi-line continuation
- Category extraction
- Field extraction (pipe-separated key:value)
- Deduplication (same comment scanned twice)
- Stale detection (comment removed between scans)
- Ignore patterns respected

**Rules:**

- Parse all section types (Stack, Decisions, Patterns, Context)
- Bidirectional: generate → parse → compare = identical
- Diff detection: added, changed, removed entries
- Edge cases: empty sections, missing sections, extra headings

**Import:**

- Each importer with a fixture file
- Cursor rules parsing
- README stack detection
- ADR format parsing
- Git commit message parsing with conventional commits
- Package.json → stack extraction

**Hooks:**

- Post-commit: conventional commit parsing
- Post-commit: decision keyword detection
- Post-checkout: branch switch
- Speed: hook execution under 200ms

**Watch:**

- File change detection triggers context update
- Rules.md change triggers sync
- Session timeout detection
- Debouncing (multiple rapid changes = one update)

**MCP Auto-Capture:**

- Tool registration in MCP server
- Draft entry creation from tool call
- Review flow: confirm, edit, discard

---

## Start

Read the full existing codebase. Understand the data model, storage layer, and command structure. Then build Phase 1: the `scan` command (with comment parser) and the `review` command (with interactive draft queue). Test both thoroughly before moving to Phase 2.
