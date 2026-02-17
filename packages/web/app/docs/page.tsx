import { FadeUp } from '../components/FadeUp';

export default function DocsIntroduction() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Documentation
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Introduction to Contxt
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Give your AI coding agents persistent, versioned, project-scoped memory. Stop repeating yourself—start
            shipping faster.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          What is Contxt?
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Contxt is <strong className="font-semibold text-text-0">GitHub for AI context</strong>. It's a CLI-first
          developer tool that gives AI coding agents like Claude Code, Cursor, and GitHub Copilot persistent memory of
          your project's architecture, decisions, and patterns.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Every AI session starts from zero. You waste ~40% of your prompts re-explaining your stack, conventions, and
          past decisions. Contxt solves this by storing your project's context in a versioned, searchable format that
          AI agents can automatically load.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <div className="bg-blue-bg border border-blue/20 rounded-xl p-6 my-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-semibold text-text-0 mb-1">Quick Example</div>
              <div className="text-[15px] text-text-1 leading-[1.7]">
                Tell Contxt once that you use Prisma for your database. Every AI tool—Claude Code, Cursor, Copilot—will
                know to generate Prisma queries instead of raw SQL. No more repeating yourself.
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Quick Start
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Get started with Contxt in less than 5 minutes:
        </p>

        <div className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-0 text-[17px] mb-2">Install Contxt</h3>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <code className="font-mono text-[13.5px] text-green">npm install -g @mycontxt/cli</code>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-0 text-[17px] mb-2">Initialize your project</h3>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8]">
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">cd my-project</code>
                  {'\n'}
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">contxt init</code>
                  {'\n'}
                  <code className="text-green">✓ Initialized in ./my-project</code>
                  {'\n'}
                  <code className="text-white/25">Stack detected: Next.js · Prisma · Postgres</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-0 text-[17px] mb-2">Add your first decision</h3>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8]">
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">contxt decision add \</code>
                  {'\n  '}
                  <code className="text-[#C4B5FD]">--title</code>{' '}
                  <code className="text-[#FCA5A5]">"Use Prisma for database"</code> \{'\n  '}
                  <code className="text-[#C4B5FD]">--rationale</code>{' '}
                  <code className="text-[#FCA5A5]">"Type-safe queries, great DX"</code>
                  {'\n'}
                  <code className="text-green">✓ Decision added</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-0 text-[17px] mb-2">Set up MCP integration</h3>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8]">
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">contxt mcp install</code>
                  {'\n'}
                  <code className="text-green">✓ Added to Claude Code config</code>
                  {'\n'}
                  <code className="text-white/25">Restart Claude Code to enable</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="bg-amber-bg border border-amber/20 rounded-xl p-6 my-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-semibold text-text-0 mb-1">That's it!</div>
              <div className="text-[15px] text-text-1 leading-[1.7]">
                Now when you ask Claude Code "Help me build a feature," it will automatically know you're using Prisma.
                No manual copy-paste. No re-explaining your stack.
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="border border-border rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-violet/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text-0 text-[17px] mb-2">5 Memory Types</h3>
            <p className="text-[15px] text-text-2 leading-[1.7]">
              Decisions, patterns, context, documents, and sessions—organized and versioned.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text-0 text-[17px] mb-2">Smart Context Loading</h3>
            <p className="text-[15px] text-text-2 leading-[1.7]">
              Relevance engine surfaces only what matters—saves 5K+ tokens per session.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-green/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-text-0 text-[17px] mb-2">Git-like Branching</h3>
            <p className="text-[15px] text-text-2 leading-[1.7]">
              Create memory branches, experiment freely, merge when ready. Full version history.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="font-semibold text-text-0 text-[17px] mb-2">Cloud Sync</h3>
            <p className="text-[15px] text-text-2 leading-[1.7]">
              Push to cloud, pull on another machine. Works offline-first with SQLite.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6 bg-white md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-0 text-[17px] mb-2">Passive Capture — Zero Friction</h3>
                <p className="text-[15px] text-text-2 leading-[1.7] mb-3">
                  Contxt captures context where you already work. Annotate decisions in code comments, edit a markdown
                  file, commit to git—context is captured automatically. No terminal. No forms.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['@decision tags in code', 'rules.md sync', 'git hooks', 'file watcher', 'MCP auto-capture'].map(
                    (tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-amber/10 text-amber text-[12px] font-medium">
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.35}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/installation"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  Installation Guide
                </div>
                <div className="text-sm text-text-2">Detailed setup instructions for all platforms</div>
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
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  Understanding Memory Types
                </div>
                <div className="text-sm text-text-2">Learn about decisions, patterns, context, and more</div>
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
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">MCP Setup</div>
                <div className="text-sm text-text-2">Configure Claude Code, Cursor, and other AI tools</div>
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
