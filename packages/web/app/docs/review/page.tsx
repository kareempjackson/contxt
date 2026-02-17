import { FadeUp } from '../../components/FadeUp';

export default function ReviewPage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Review Queue
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            All passive capture sources produce drafts. Review and confirm them in one place.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Why Drafts?
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Passive capture is designed to be fast and silent. When the scanner, git hooks, file watcher, or MCP
          auto-capture detect something that looks like a decision, pattern, or context update, they do not
          immediately write it to memory. Instead, they create a{' '}
          <strong className="font-semibold text-text-0">draft</strong>.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          This gives you full control. You review drafts when it suits you — at the end of a session, before
          pushing, or whenever{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt status</code> shows pending
          items. Nothing enters your memory store without your explicit confirmation.
        </p>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          CLI Interface
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review</code>
            {'                  '}
            <code className="text-white/40"># Interactive review of all drafts{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review --source scan</code>
            {'     '}
            <code className="text-white/40"># Only from code scanning{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review --source hooks</code>
            {'    '}
            <code className="text-white/40"># Only from git hooks{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review --source mcp</code>
            {'      '}
            <code className="text-white/40"># Only from MCP auto-capture{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review --confirm-all</code>
            {'     '}
            <code className="text-white/40"># Confirm everything without prompting{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review --discard-all</code>
            {'     '}
            <code className="text-white/40"># Discard everything without prompting{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt review --count</code>
            {'           '}
            <code className="text-white/40"># Just show the pending count</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Interactive Mode
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Running{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt review</code> without flags
          opens an interactive session. Each draft is shown in full with its source and detected type:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-[1.9]">
            <code className="text-[#6EE7B7]">{'contxt review — 3 drafts pending\n\n'}</code>
            <code className="text-white/40">{'[1/3] '}</code>
            <code className="text-[#C4B5FD]">{'DECISION'}</code>
            <code className="text-white/40">{'  (source: hooks:post-commit)\n'}</code>
            <code className="text-white/75">{'  "Migrate from Express to Fastify"\n'}</code>
            <code className="text-white/40">{'  detected from: feat(server): switch to Fastify for better perf\n\n'}</code>
            <code className="text-white/40">{'  [c] Confirm   [e] Edit then confirm   [d] Discard   [s] Skip\n'}</code>
            <code className="text-white/40">{'> '}</code>
            <code className="text-white/90">{'c\n'}</code>
            <code className="text-[#6EE7B7]">{'  ✓ saved to memory.\n\n'}</code>
            <code className="text-white/40">{'[2/3] '}</code>
            <code className="text-[#C4B5FD]">{'PATTERN'}</code>
            <code className="text-white/40">{'   (source: scan)\n'}</code>
            <code className="text-white/75">{'  "API routes: Zod schema → validate → handler → typed response"\n'}</code>
            <code className="text-white/40">{'  detected in: src/api/users.ts:12\n\n'}</code>
            <code className="text-white/40">{'  [c] Confirm   [e] Edit then confirm   [d] Discard   [s] Skip\n'}</code>
            <code className="text-white/40">{'> '}</code>
            <code className="text-white/90">{'e\n'}</code>
            <code className="text-white/40">{'  opening editor...\n\n'}</code>
            <code className="text-white/40">{'[3/3] '}</code>
            <code className="text-[#C4B5FD]">{'CONTEXT'}</code>
            <code className="text-white/40">{'   (source: mcp:auto)\n'}</code>
            <code className="text-white/75">{'  "Refactoring auth middleware to support multi-tenancy"\n\n'}</code>
            <code className="text-white/40">{'  [c] Confirm   [e] Edit then confirm   [d] Discard   [s] Skip\n'}</code>
            <code className="text-white/40">{'> '}</code>
            <code className="text-white/90">{'d\n'}</code>
            <code className="text-white/40">{'  discarded.\n\n'}</code>
            <code className="text-[#6EE7B7]">{'review complete — 2 confirmed, 1 discarded'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          Draft Sources
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Every draft carries a source tag so you know exactly where it came from during review.
        </p>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Source tag
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Origin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">scan</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Code comment extraction via{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">contxt scan</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">hooks:post-commit</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Detected from git commit messages by the post-commit hook
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">import:readme</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Extracted from README, Cursor rules, Claude config, or ADR files via{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">contxt capture</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code className="font-mono text-[13px] text-violet">mcp:auto</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2">
                  AI auto-capture during an MCP conversation session with Claude Code or Cursor
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Status Reminder
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The pending draft count surfaces in{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt status</code> so your
          normal workflow check always includes a reminder:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-[1.9]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt status</code>
            {'\n\n'}
            <code className="text-white/40">{'  project   '}</code>
            <code className="text-white/90">{'my-app\n'}</code>
            <code className="text-white/40">{'  branch    '}</code>
            <code className="text-white/90">{'main\n'}</code>
            <code className="text-white/40">{'  session   '}</code>
            <code className="text-white/90">{'active — 42 min\n'}</code>
            <code className="text-white/40">{'  drafts    '}</code>
            <code className="text-[#FCD34D]">{'3 pending'}</code>
            <code className="text-white/40">{'  ← run "contxt review" to process'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/passive-capture"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Passive Capture Overview</div>
                <div className="text-sm text-text-2">All passive capture methods that feed the review queue</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          <a
            href="/docs/scan"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Scan (Code Tags)</div>
                <div className="text-sm text-text-2">Annotate decisions and patterns directly in code comments</div>
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
