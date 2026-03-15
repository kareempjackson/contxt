import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliDiff() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt diff
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Show what changed in your project memory since the last session — new entries, updated entries, and ones that have gone stale.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Usage
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.9] m-0">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt diff</code>
          </pre>
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example output
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-8">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`Context diff — my-app (since 2h ago)

+ [decision]  Switch to Edge runtime for API routes
+ [pattern]   Optimistic UI update pattern
~ [decision]  Use Prisma for ORM  (v3 → v4)
~ [pattern]   API Error Handler  (v2 → v3)
? [decision]  Use Redux for state  (stale · 45d ago)
? [document]  Onboarding guide  (stale · 38d ago)

  2 new  ·  2 updated  ·  2 stale`}</pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Flags
        </h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Flag</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Default</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--since &lt;timestamp&gt;</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">last session end</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">ISO 8601 timestamp to compare against. Overrides auto-detection from session history.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--days &lt;n&gt;</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">30</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Number of days before which an entry is considered stale</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">--json</td>
                <td className="px-4 py-3 text-[13px] text-text-2">false</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Output diff as JSON with <code className="font-mono text-[11px] bg-bg px-1 rounded">newEntries</code>, <code className="font-mono text-[11px] bg-bg px-1 rounded">updatedEntries</code>, <code className="font-mono text-[11px] bg-bg px-1 rounded">staleEntries</code> arrays</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          How the baseline is determined
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          By default, <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt diff</code> looks up the most recent session with an <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">endedAt</code> timestamp and uses that as the &ldquo;since&rdquo; point. If no session end is found, it falls back to 30 days ago.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The three categories are:
        </p>
        <ul className="text-[17px] text-text-1 leading-[1.8] mb-6 space-y-2">
          <li><strong>New</strong> — entries created after the baseline timestamp</li>
          <li><strong>Updated</strong> — entries created before the baseline but modified after (version &gt; 1)</li>
          <li><strong>Stale</strong> — active entries not updated in the last 30 days (configurable via <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">--days</code>)</li>
        </ul>

        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.9] m-0">
            <code className="text-white/40">{'# Diff since a specific point in time\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">{'contxt diff --since 2024-01-15T09:00:00Z'}</code>
            <code className="text-white/40">{'\n\n# Machine-readable output for CI\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">{'contxt diff --json | jq .newEntries'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          MCP tool
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The same diff is available via the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_diff</code> MCP tool. Your AI automatically calls it when asked &ldquo;what changed since my last session?&rdquo; or when project health is mentioned in the CLAUDE.md / Gemini instructions.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          The web dashboard at <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">/dashboard/diff</code> shows the same information across all your synced projects.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/stats" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt stats</div>
          </a>
          <a href="/docs/cli/sessions" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt sessions</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
