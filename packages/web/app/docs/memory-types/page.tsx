import { FadeUp } from '../../components/FadeUp';

export default function DocsMemoryTypes() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-bg text-blue text-xs font-semibold uppercase tracking-[1px] mb-4">
            Core Concepts
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Memory Types
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Contxt organizes your project's context into five structured memory types. Each serves a specific purpose and gets its own relevance scoring in Smart Suggest.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        {/* Decisions */}
        <div className="mb-12">
          <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
            Decisions
          </h2>
          <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
            Architectural and technical choices with rationale. Decisions are the most valuable memory type — they prevent AI from suggesting approaches you've already evaluated and rejected.
          </p>
          <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
            <code className="font-mono text-[13.5px] text-white/90">contxt decision add</code>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-text-0 text-[17px] mb-3">What to store:</h3>
            <ul className="space-y-2 text-[15px] text-text-2 list-disc list-inside">
              <li>Technology choices (why Prisma over Drizzle, why Stripe over Paddle)</li>
              <li>Architecture decisions (JWT auth strategy, API design patterns)</li>
              <li>Convention choices (file naming, error handling approach)</li>
              <li>Trade-off resolutions (performance vs simplicity, build vs buy)</li>
            </ul>
          </div>

          <div className="bg-violet-bg rounded-lg p-4 mb-6">
            <div className="text-xs font-mono uppercase tracking-[2px] text-violet mb-3">Example</div>
            <div className="space-y-2 text-[14px] text-text-1">
              <div><span className="font-semibold">Decision:</span> Use Prisma over Drizzle</div>
              <div><span className="font-semibold">Category:</span> infrastructure</div>
              <div><span className="font-semibold">Rationale:</span> Better TypeScript support, more mature migration system, larger community.</div>
              <div><span className="font-semibold">Alternatives:</span> Drizzle (faster, less mature), Knex (no TS), raw SQL (too much boilerplate)</div>
              <div><span className="font-semibold">Status:</span> active</div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        {/* Patterns */}
        <div className="mb-12">
          <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
            Patterns
          </h2>
          <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
            Reusable code patterns and conventions. Patterns teach your AI how your codebase works so it generates code that matches your existing style.
          </p>
          <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
            <code className="font-mono text-[13.5px] text-white/90">contxt pattern add</code>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-text-0 text-[17px] mb-3">What to store:</h3>
            <ul className="space-y-2 text-[15px] text-text-2 list-disc list-inside">
              <li>API route structure (how every endpoint should be organized)</li>
              <li>Error handling patterns (centralized handler, retry logic)</li>
              <li>Component patterns (how React components are structured)</li>
              <li>Service patterns (event-driven architecture, repository pattern)</li>
              <li>Testing patterns (how tests are organized and written)</li>
            </ul>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        {/* Context */}
        <div className="mb-12">
          <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
            Context
          </h2>
          <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
            Active working context — what you're building right now. Context entries tell your AI about current state so it can give relevant suggestions without you re-explaining each session.
          </p>
          <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
            <code className="font-mono text-[13.5px] text-white/90">contxt context add</code>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-text-0 text-[17px] mb-3">What to store:</h3>
            <ul className="space-y-2 text-[15px] text-text-2 list-disc list-inside">
              <li>Current feature being built</li>
              <li>Active blockers and dependencies</li>
              <li>Work-in-progress status</li>
              <li>Files currently being modified</li>
              <li>Session notes and next steps</li>
            </ul>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        {/* Documents */}
        <div className="mb-12">
          <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
            Documents
          </h2>
          <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
            Long-form reference material. Documents are less frequently changed but provide essential background that AI needs for complex tasks.
          </p>
          <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
            <code className="font-mono text-[13.5px] text-white/90">contxt doc add</code>
          </div>

          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-text-0 text-[17px] mb-3">What to store:</h3>
            <ul className="space-y-2 text-[15px] text-text-2 list-disc list-inside">
              <li>API specifications and endpoint docs</li>
              <li>Deployment runbooks and procedures</li>
              <li>Database schema documentation</li>
              <li>Third-party integration guides</li>
              <li>Architecture overview documents</li>
            </ul>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        {/* Sessions */}
        <div className="mb-12">
          <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
            Sessions
          </h2>
          <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
            Automatic snapshots of coding sessions. Sessions capture what was worked on and what was accomplished, creating a timeline of project progress.
          </p>
          <div className="bg-blue-bg border border-blue/20 rounded-xl p-6 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="font-semibold text-text-0 mb-1">Automatic capture</div>
                <div className="text-[15px] text-text-1 leading-[1.7]">
                  Sessions are typically auto-captured when using the MCP server integration. They can also be logged manually with <code className="font-mono text-[13px] bg-white/60 px-1.5 py-0.5 rounded">contxt session log</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.35}>
        {/* Summary Table */}
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          Memory Type Summary
        </h2>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Type</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Purpose</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Update Frequency</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Token Priority</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">Decision</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Why choices were made</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Low</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">High</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">Pattern</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">How code should be written</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Medium</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">High</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">Context</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">What you're working on now</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">High</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Medium</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">Document</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Reference material</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Low</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Low (on demand)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0">Session</td>
                <td className="px-4 py-3 text-[14px] text-text-2">Work timeline</td>
                <td className="px-4 py-3 text-[14px] text-text-2">Automatic</td>
                <td className="px-4 py-3 text-[14px] text-text-2">Low (historical)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>
    </article>
  );
}
