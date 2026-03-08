import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliSuggest() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt suggest
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Retrieve the most relevant memory entries for a task. The same relevance engine used by the MCP{' '}
            <code className="font-mono text-[17px]">contxt_suggest</code> tool — available directly from the terminal.
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
            <code className="text-white/90">{'contxt suggest --task "add Stripe webhook handler"'}</code>
          </pre>
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example output
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-8">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`Relevant context for: "add Stripe webhook handler"

[decision]  JWT in httpOnly cookies (stateless, refresh rotation)  score: 0.91
[pattern]   API routes: Zod schema → validate → handler → typed response  score: 0.87
[decision]  Use Prisma for ORM (better TS support than Drizzle)  score: 0.74
[context]   Currently building user onboarding flow. Blocked on Stripe webhook integration.  score: 0.68`}</pre>
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
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--task</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">required</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Natural language description of the task to find context for</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--limit</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">5</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Maximum number of results to return</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--min-score</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">0.6</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Minimum relevance score (0–1). Results below this threshold are omitted</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">--type</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">all</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Filter by memory type: <code className="font-mono text-[11px] bg-bg px-1 rounded">decision</code>, <code className="font-mono text-[11px] bg-bg px-1 rounded">pattern</code>, <code className="font-mono text-[11px] bg-bg px-1 rounded">stack</code>, <code className="font-mono text-[11px] bg-bg px-1 rounded">context</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">--json</td>
                <td className="px-4 py-3 text-[13px] text-text-2">false</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Output results as JSON</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Relevance scoring
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          On Pro plans, relevance is computed with vector similarity — each entry is embedded at write time and compared against the task embedding at query time. On the Free plan, full-text search is used instead (keyword matching, no embedding).
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Scores range from 0 to 1. A score of 0.8+ indicates strong relevance; below 0.6 is typically noise. The default <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">--min-score 0.6</code> filters most irrelevant results without being too aggressive.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Relation to MCP
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          When an AI editor calls the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_suggest</code> MCP tool, it runs the same query under the hood — the CLI exposes the same engine for scripting and debugging. You can use <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt suggest</code> to preview exactly what context your AI will receive before starting a session.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.9] m-0">
            <code className="text-white/40">{'# Preview what your AI will see for a given task\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">{'contxt suggest --task "refactor auth middleware" --limit 10'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/status" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt status</div>
          </a>
          <a href="/docs/mcp" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">MCP Integration</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
