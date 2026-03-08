import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliBilling() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt billing
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Check your plan status and manage your subscription directly from the terminal.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Commands
        </h2>

        <div className="space-y-6 mb-8">
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt billing status</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7] mb-3">Displays your current plan, usage, and renewal date.</p>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto">
              <pre className="font-mono text-[13px] text-white/90 m-0">{`Plan:     Pro
Status:   active
Renews:   April 1, 2026
Entries:  1,240 / unlimited
Projects: 8 / unlimited`}</pre>
            </div>
          </div>

          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt billing manage</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Opens the Stripe customer portal in your browser. From there you can update payment methods, download invoices, or cancel your subscription.</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Plan limits
        </h2>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Feature</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Free</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Pro</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 text-[13px] text-text-1 border-b border-border">Memory entries</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">500</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Unlimited</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[13px] text-text-1 border-b border-border">Projects</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">3</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Unlimited</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[13px] text-text-1 border-b border-border">Search</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Keyword (FTS)</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Semantic (vector)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[13px] text-text-1">Cloud sync</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Included</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Included</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Upgrade at <a href="https://contxt.dev/dashboard/settings" className="text-violet hover:underline">contxt.dev/dashboard/settings</a> or via the web dashboard.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/auth" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt auth</div>
          </a>
          <a href="/docs/config" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Configuration</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
