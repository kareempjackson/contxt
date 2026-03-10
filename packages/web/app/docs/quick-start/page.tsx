import { FadeUp } from '../../components/FadeUp';

export default function DocsQuickStart() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Getting Started
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Quick Start
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Get Contxt running in your project in under 2 minutes.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        {/* Step 1 */}
        <div className="mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet text-white flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
                Initialize
              </h2>
              <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
                Navigate to your project root and run:
              </p>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
                <pre className="font-mono text-[13.5px] leading-[1.8]">
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">cd my-project</code>
                  {'\n'}
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">contxt init</code>
                </pre>
              </div>
              <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
                Contxt creates a <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/</code> directory in your project root. This is where your local context store lives.
              </p>
              <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
                You'll be prompted for basic project info:
              </p>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8] text-white/75">
                  {'? Project name: my-saas-app\n'}
                  {'? Project type: web-app\n'}
                  {'? Tech stack: Next.js, Prisma, Postgres, Stripe\n'}
                  {'? Description: B2B SaaS with team billing and SSO'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        {/* Step 2 */}
        <div className="mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet text-white flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
                Capture Your First Entry
              </h2>
              <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
                The fastest way — type it in plain English and let Contxt classify it:
              </p>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
                <pre className="font-mono text-[13.5px] leading-[1.8]">
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">{'contxt add "We\'re using Stripe for billing — better API and webhook reliability"'}</code>
                  {'\n\n'}
                  <code className="text-white/50">  Classified as: </code><code className="text-[#6EE7B7]">decision</code>
                  {'\n'}
                  <code className="text-white/50">  Save as decision? (Y/n/type) › </code>
                  {'\n\n'}
                  <code className="text-[#6EE7B7]">  ✓ Decision saved: "We're using Stripe for billing..."</code>
                </pre>
              </div>
              <p className="text-[15px] text-text-2 leading-[1.7] mb-4">
                Or use the typed command for more fields (alternatives, category, consequences):
              </p>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8] text-white/75">
                  {'? Decision: Use Stripe for billing\n'}
                  {'? Category: infrastructure\n'}
                  {'? Rationale: Better API design, webhook reliability,\n'}
                  {'  global coverage. Using Checkout links for v1.\n'}
                  {'? Alternatives considered: Paddle (simpler tax, weaker API),\n'}
                  {'  LemonSqueezy (good DX, limited enterprise)\n\n'}
                  <span className="text-[#6EE7B7]">{'✓ Decision logged: dec_a1b2c3d4 (v1)'}</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        {/* Step 3 */}
        <div className="mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet text-white flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
                Add a Code Pattern
              </h2>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
                <code className="font-mono text-[13.5px] text-white/90">contxt pattern add</code>
              </div>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8] text-white/75">
                  {'? Pattern name: API route handler\n'}
                  {'? Category: api\n'}
                  {'? When to use: Every new API endpoint\n'}
                  {'? Template: Parse with Zod schema → pass to handler → return typed response\n\n'}
                  <span className="text-[#6EE7B7]">{'✓ Pattern saved: pat_e5f6g7h8 (v1)'}</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        {/* Step 4 */}
        <div className="mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet text-white flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
                Set Active Context
              </h2>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8]">
                  <code className="text-white/40">$ </code>
                  <code className="text-white/90">contxt context add </code>
                  <span className="text-[#C4B5FD]">\</span>
                  {'\n  '}
                  <code className="text-[#C4B5FD]">--feature</code>{' '}
                  <code className="text-[#FCA5A5]">"user onboarding flow"</code>{' '}
                  <span className="text-[#C4B5FD]">\</span>
                  {'\n  '}
                  <code className="text-[#C4B5FD]">--status</code>{' '}
                  <code className="text-[#FCA5A5]">"in-progress"</code>{' '}
                  <span className="text-[#C4B5FD]">\</span>
                  {'\n  '}
                  <code className="text-[#C4B5FD]">--blockers</code>{' '}
                  <code className="text-[#FCA5A5]">"Stripe webhook integration"</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        {/* Step 5 */}
        <div className="mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet text-white flex items-center justify-center font-bold text-lg">
              5
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
                See What Your AI Will See
              </h2>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
                <code className="font-mono text-[13.5px] text-white/90">contxt suggest --task "add team billing endpoint"</code>
              </div>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
                <pre className="font-mono text-[13.5px] leading-[1.8] text-white/75">
                  {'Smart Suggest — 4 entries (relevance ≥ 0.60)\n\n'}
                  {' 0.94  DECISION  Use Stripe for billing\n'}
                  {' 0.87  PATTERN   API route handler\n'}
                  {' 0.72  CONTEXT   Building: user onboarding flow\n'}
                  {' 0.65  DOCUMENT  API spec v2\n\n'}
                  {'Token estimate: 1,240 (vs 5,620 loading all)\n'}
                  {'Reduction: 78%'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.35}>
        {/* Step 6 */}
        <div className="mb-12">
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet text-white flex items-center justify-center font-bold text-lg">
              6
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
                Connect to Your AI Tool
              </h2>
              <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
                For Claude Code (via MCP):
              </p>
              <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
                <pre className="font-mono text-[13.5px] leading-[1.8] text-white/75">
                  <code className="text-white/40">{'// .claude/mcp.json\n'}</code>
                  <code className="text-white/40">{'{\n'}</code>
                  <code className="text-white/40">{'  "mcpServers": {\n'}</code>
                  <code className="text-white/40">{'    "contxt": {\n'}</code>
                  <code>{'      '}<span className="text-[#6EE7B7]">"command"</span>{': '}<span className="text-[#FCA5A5]">"contxt"</span>{',\n'}</code>
                  <code>{'      '}<span className="text-[#6EE7B7]">"args"</span>{': ['}<span className="text-[#FCA5A5]">"mcp"</span>{']\n'}</code>
                  <code className="text-white/40">{'    }\n'}</code>
                  <code className="text-white/40">{'  }\n'}</code>
                  <code className="text-white/40">{'}'}</code>
                </pre>
              </div>
              <p className="text-[17px] text-text-1 leading-[1.8]">
                Now Claude Code automatically has access to your project's context on every session.
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.4}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/memory-types"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  Memory Types
                </div>
                <div className="text-sm text-text-2">Understand what to store in your project context</div>
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
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  MCP Integration
                </div>
                <div className="text-sm text-text-2">Set up automatic context loading for your AI tools</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a
            href="/docs/branching"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  Branching
                </div>
                <div className="text-sm text-text-2">Learn about feature-branch context isolation</div>
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
