import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliStats() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt stats
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Usage analytics for your project memory — token efficiency, session counts, most-retrieved entries, and stale entries that need review.
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
            <code className="text-white/90">contxt stats</code>
          </pre>
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example output
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-8">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`📊 Project stats (my-app, last 30 days)

Memory
  decisions   12
  patterns     8
  documents    3
  total       23

Token Efficiency
  avg returned      1 240 tokens
  avg reduction        62%
  est. cost saved    $0.84

Sessions
  total           47
  avg duration    34 min
  auto-captured   31 entries

Most Retrieved
  1. JWT in httpOnly cookies (decision) — 18×
  2. API Error Handler pattern — 14×
  3. Use Prisma for ORM (decision) — 11×

⚠  4 stale entries (not updated in 30+ days)
   Run: contxt review --stale`}</pre>
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
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--days &lt;n&gt;</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">30</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Number of days of history to include in the report</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">--export json</td>
                <td className="px-4 py-3 text-[13px] text-text-2">—</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Output full stats as a JSON object (useful for scripting or CI dashboards)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          How token efficiency is measured
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Every time Contxt loads context for an AI agent (via <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">suggest_context</code>, <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">get_decisions</code>, or similar), it records the number of tokens returned and estimates the baseline cost of sending your entire memory unfiltered. The reduction percentage is the savings from targeted retrieval vs. a full dump.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Cost estimates use the OpenAI GPT-4o pricing model as a benchmark ($5 / 1M input tokens). These are rough estimates — your actual savings depend on your model and usage pattern.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.9] m-0">
            <code className="text-white/40">{'# Export stats for the last 7 days\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">{'contxt stats --days 7 --export json'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          MCP tool
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The same data is available to AI agents via the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_stats</code> MCP tool. When you ask your AI &ldquo;what&rsquo;s the project health?&rdquo;, it automatically calls <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_stats</code> and summarises the results for you.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Note: token efficiency metrics are stored locally in your project&rsquo;s SQLite database and are not synced to the cloud. The web dashboard at{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">/dashboard/stats</code> shows entry counts from Supabase; run <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt stats</code> locally for full token analytics.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/suggest" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt suggest</div>
          </a>
          <a href="/docs/cli/diff" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt diff</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
