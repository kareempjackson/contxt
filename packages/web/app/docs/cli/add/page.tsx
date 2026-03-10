import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliAdd() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt add
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            The fastest way to capture anything. Type it in plain English — Contxt figures out whether it's a decision, pattern, or context automatically.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Basic usage
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="font-mono text-[13.5px] leading-[1.8]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt add </code>
            <code className="text-[#FCA5A5]">"We're using Postgres for ACID compliance and relational joins"</code>
            {'\n\n'}
            <code className="text-white/50">  Classified as: </code><code className="text-[#6EE7B7]">decision</code>
            {'\n'}
            <code className="text-white/50">  Save as decision? (Y/n/type) › </code>
            {'\n\n'}
            <code className="text-[#6EE7B7]">  ✓ Decision saved: "We're using Postgres for ACID compliance..."</code>
          </pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Contxt reads the text, classifies it by keyword signals, shows you the result, and saves it on confirmation. No API key required — classification is done locally, instantly.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          How classification works
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Contxt scans the text for keyword signals and picks the best match. No AI call needed.
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Type</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Signals detected</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-violet/10 text-violet">decision</span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-text-2 border-b border-border">
                  "decided", "we use", "we chose", "we're using", "switched to", "migrated to", "going with", "instead of", "rationale"
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-blue/10 text-blue">pattern</span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-text-2 border-b border-border">
                  "always", "never", "every time", "convention", "best practice", "when you", "make sure to", "should always"
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-teal/10 text-teal">context</span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-text-2 border-b border-border">
                  "working on", "currently", "this sprint", "blocked by", "in progress", "implementing", "building"
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-bg text-text-2">document</span>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-text-2">
                  default — no strong signals detected
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Confirmation prompt
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          After classification, you're shown the result and asked to confirm:
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Input</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">Y (or Enter)</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Save with the classified type</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">n</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Discard — nothing is saved</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet">type</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Show a list to manually pick: decision / pattern / context / document</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Skip classification with <code className="font-mono text-[28px] bg-bg-dark/5 px-2 py-0.5 rounded">--type</code>
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          If you already know the type, pass <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">--type</code> to skip the classification step entirely:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="font-mono text-[13.5px] leading-[1.8]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt add </code>
            <code className="text-[#FCA5A5]">"Always wrap API calls in try/catch"</code>
            <code className="text-[#C4B5FD]"> --type pattern</code>
            {'\n'}
            <code className="text-[#6EE7B7]">  ✓ Pattern saved: "Always wrap API calls in try/catch"</code>
          </pre>
        </div>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.8]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt add </code>
            <code className="text-[#FCA5A5]">"Working on the auth flow this sprint"</code>
            <code className="text-[#C4B5FD]"> --type context</code>
            {'\n'}
            <code className="text-[#6EE7B7]">  ✓ Context saved: "Working on the auth flow this sprint"</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          Options
        </h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Flag</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">-t, --type &lt;type&gt;</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">
                  Override auto-classification. Values: <code className="font-mono text-[12px]">decision</code>, <code className="font-mono text-[12px]">pattern</code>, <code className="font-mono text-[12px]">context</code>, <code className="font-mono text-[12px]">document</code>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet">--tags &lt;tags...&gt;</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Tags to apply to the entry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.35}>
        <div className="bg-blue-bg border border-blue/20 rounded-xl p-6 my-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-semibold text-text-0 mb-1">contxt add vs. contxt decision add</div>
              <div className="text-[15px] text-text-1 leading-[1.7]">
                <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">contxt add</code> is the fast path — write it in plain language and move on. The typed commands (<code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">contxt decision add</code>, <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">contxt pattern add</code>, etc.) give you additional fields like alternatives, category, and consequences — use them when you want to be thorough.
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.4}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/memory-types" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Memory Types</div>
          </a>
          <a href="/docs/cli/decision" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Related</div>
            <div className="text-[15px] font-semibold text-text-0">contxt decision</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
