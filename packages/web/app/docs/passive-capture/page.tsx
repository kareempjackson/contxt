import { FadeUp } from '../../components/FadeUp';

export default function PassiveCapturePage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Zero-Friction Context Capture
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Contxt captures context where you already work — in code, git, and your editor. No terminal. No forms.
            No friction.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          The Problem
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Manual memory tools fail because the moment you make a decision — choosing Prisma over Drizzle, adopting
          a retry pattern, switching to a new architecture — you're deep in code. Stopping to open a terminal and
          type a command breaks flow and rarely happens.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Passive capture means context accumulates in the background. Annotations live next to the code they
          describe. Commit messages capture decisions as they're made. The file watcher sees your editor activity.
          Your AI session records what was discussed. Nothing requires you to remember to log it later.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          Capture Methods
        </h2>
        <div className="space-y-4 mb-12">
          <div className="border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">
                  Code Comment Annotations
                </h3>
                <p className="text-[15px] text-text-2 leading-[1.7] mb-3">
                  Add{' '}
                  <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">@decision</code>,{' '}
                  <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">@pattern</code>, or{' '}
                  <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">@context</code> tags to
                  any code comment. The watcher or{' '}
                  <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">contxt scan</code> picks
                  them up and creates draft entries automatically.
                </p>
                <div className="bg-bg-dark rounded-lg p-3 overflow-x-auto">
                  <pre className="font-mono text-[12.5px] leading-[1.8]">
                    <code className="text-white/40">{'// '}</code>
                    <code className="text-[#C4B5FD]">{'@decision'}</code>
                    <code className="text-white/75">{' Use Prisma for ORM | rationale: type-safe queries'}</code>
                  </pre>
                </div>
                <a href="/docs/scan" className="inline-block mt-3 text-[13px] text-violet hover:underline">
                  Full annotation syntax →
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">
                  Rules File (.contxt/rules.md)
                </h3>
                <p className="text-[15px] text-text-2 leading-[1.7]">
                  A human-readable markdown file that mirrors your memory store. Edit it in your IDE and changes sync
                  to memory automatically when the watcher is running. Generate it from memory, or sync from it after
                  manual edits.
                </p>
                <a href="/docs/rules-sync" className="inline-block mt-3 text-[13px] text-violet hover:underline">
                  Rules file format →
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">
                  Import Sources
                </h3>
                <p className="text-[15px] text-text-2 leading-[1.7]">
                  One-time import from files that already contain structured knowledge: README, Cursor rules,
                  CLAUDE.md, ADR directories, recent git commit history, and package.json metadata. A fast way to
                  seed memory on an existing project.
                </p>
                <a href="/docs/capture" className="inline-block mt-3 text-[13px] text-violet hover:underline">
                  Import sources reference →
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">
                  Git Hooks
                </h3>
                <p className="text-[15px] text-text-2 leading-[1.7]">
                  Install once, capture forever. The post-commit hook detects decisions in commit messages. The
                  post-checkout hook keeps your memory branch in sync with your git branch. The prepare-commit-msg
                  hook injects active context into the commit editor.
                </p>
                <a href="/docs/git-hooks" className="inline-block mt-3 text-[13px] text-violet hover:underline">
                  Hook installation guide →
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">
                  File Watcher
                </h3>
                <p className="text-[15px] text-text-2 leading-[1.7]">
                  Run{' '}
                  <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">contxt watch --daemon</code>{' '}
                  once and leave it. The daemon monitors file changes, rules.md edits, git HEAD changes, and session
                  timing — all without any manual commands after startup.
                </p>
                <a href="/docs/watch" className="inline-block mt-3 text-[13px] text-violet hover:underline">
                  Watch daemon setup →
                </a>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">
                  MCP Auto-Capture
                </h3>
                <p className="text-[15px] text-text-2 leading-[1.7]">
                  When Contxt is connected as an MCP server to Claude Code or Cursor, your AI silently captures
                  context during the natural flow of conversation. Decisions made mid-session, patterns discussed
                  while debugging, and implementation choices are all drafted into your context store without
                  interrupting the session.
                </p>
                <a href="/docs/mcp" className="inline-block mt-3 text-[13px] text-violet hover:underline">
                  MCP setup guide →
                </a>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Draft Review Queue
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          All passive sources write entries as <strong className="text-text-0 font-semibold">drafts</strong>, never
          confirmed records. This is intentional: passive capture is optimistic by design, and not every annotation
          or commit message maps to a genuine architectural decision. The draft queue gives you a lightweight
          checkpoint before anything enters your permanent context store.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Run{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt review</code> at any
          point to step through pending drafts. For each one you can confirm, edit before confirming, or discard.
          The process takes seconds per entry.
        </p>
        <div className="bg-blue-bg border border-blue/20 rounded-xl p-6 mb-12">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-semibold text-text-0 mb-1">Auto-confirm mode</div>
              <div className="text-[15px] text-text-1 leading-[1.7]">
                Pass{' '}
                <code className="font-mono text-[13px] bg-white/60 px-1.5 py-0.5 rounded">--auto-confirm</code>{' '}
                to any capture command to skip the review queue entirely. Useful in CI pipelines or personal projects
                where you trust the source implicitly.
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Quick Start
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Enable git hooks and background watching in two commands:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.8]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt hook install</code>
            {'\n'}
            <code className="text-[#6EE7B7]">{'✓ Installed post-commit, pre-push, post-checkout hooks\n'}</code>
            {'\n'}
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt watch --daemon</code>
            {'\n'}
            <code className="text-[#6EE7B7]">{'✓ Watcher started (PID 48291) — monitoring src/'}</code>
          </pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Then annotate decisions directly in your code:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.8]">
            <code className="text-white/40">{'// src/lib/db.ts\n'}</code>
            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@decision'}</code>
            <code className="text-white/75">{' Use Prisma for database'}</code>
            <code className="text-white/40">{' | '}</code>
            <code className="text-[#C4B5FD]">{'rationale:'}</code>
            <code className="text-white/75">{' type-safe queries\n'}</code>
            <code className="text-white/90">{"import { PrismaClient } from '@prisma/client';\n"}</code>
            {'\n'}
            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@pattern'}</code>
            <code className="text-white/75">{' Always use db.$transaction for multi-step writes\n'}</code>
            <code className="text-white/90">{'export const db = new PrismaClient();'}</code>
          </pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-12">
          Save the file. The watcher picks up the change and creates draft entries automatically. Run{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt review</code> to confirm.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/scan"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">contxt scan</div>
                <div className="text-sm text-text-2">Full reference for comment annotation syntax and CLI flags</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          <a
            href="/docs/mcp"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">MCP Integration</div>
                <div className="text-sm text-text-2">Connect Contxt to Claude Code, Cursor, and other AI tools</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          <a
            href="/docs/memory-types"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Memory Types</div>
                <div className="text-sm text-text-2">Understand decisions, patterns, context, documents, and sessions</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
