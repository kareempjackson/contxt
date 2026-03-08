import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliDecision() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt decision
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Capture architectural and technical decisions with full rationale. Decisions are the most valuable memory type — they prevent AI from suggesting approaches you've already evaluated.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Add a decision
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt decision add</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Launches an interactive prompt to fill in the decision fields.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          Fields
        </h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Field</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Required</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">title</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Yes</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Short description of the decision (e.g. "Use Prisma over Drizzle")</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">rationale</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Yes</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Why you made this choice. This is what AI uses to give relevant suggestions.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">alternatives</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">No</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Options you considered and rejected</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">category</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">No</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">infrastructure, architecture, frontend, backend, etc.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet">status</td>
                <td className="px-4 py-3 text-[13px] text-text-2">No</td>
                <td className="px-4 py-3 text-[13px] text-text-2">active (default), deprecated, or superseded</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example
        </h2>
        <div className="bg-violet-bg rounded-lg p-5 mb-6">
          <div className="text-xs font-mono uppercase tracking-[2px] text-violet mb-4">Sample decision</div>
          <div className="space-y-2.5 text-[14px] text-text-1">
            <div><span className="font-semibold text-text-0">Title:</span> Use Stripe over Paddle for payments</div>
            <div><span className="font-semibold text-text-0">Rationale:</span> Better documentation, more mature webhooks, wider library support. Paddle has simpler tax handling but Stripe's ecosystem is more complete for our use case.</div>
            <div><span className="font-semibold text-text-0">Alternatives:</span> Paddle (rejected — limited webhook flexibility), Braintree (rejected — complex setup)</div>
            <div><span className="font-semibold text-text-0">Category:</span> infrastructure</div>
            <div><span className="font-semibold text-text-0">Status:</span> active</div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/memory-types" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Memory Types</div>
          </a>
          <a href="/docs/cli/pattern" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt pattern</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
