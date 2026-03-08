import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliPattern() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt pattern
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Capture recurring code patterns and conventions. Patterns teach AI how your codebase is structured — so it generates code that fits rather than code you have to rewrite.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Add a pattern
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">contxt pattern add</code>
        </div>
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
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">title</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Name of the pattern (e.g. "API route error handling")</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">description</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">When and why to use this pattern</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet">example</td>
                <td className="px-4 py-3 text-[13px] text-text-2">A code snippet showing the pattern in practice</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Patterns vs Decisions
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-6 text-[14px]">
            <div>
              <div className="font-semibold text-text-0 mb-2">Use a Pattern when...</div>
              <ul className="space-y-1.5 text-text-2 list-disc list-inside">
                <li>You have a repeatable code structure</li>
                <li>You want AI to follow a naming convention</li>
                <li>It's about <em>how</em> to write code</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-text-0 mb-2">Use a Decision when...</div>
              <ul className="space-y-1.5 text-text-2 list-disc list-inside">
                <li>You chose one option over another</li>
                <li>There's a rationale worth preserving</li>
                <li>It's about <em>why</em> you chose something</li>
              </ul>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example
        </h2>
        <div className="bg-violet-bg rounded-lg p-5 mb-6">
          <div className="text-xs font-mono uppercase tracking-[2px] text-violet mb-4">Sample pattern</div>
          <div className="space-y-2.5 text-[14px] text-text-1">
            <div><span className="font-semibold text-text-0">Title:</span> Next.js API route structure</div>
            <div><span className="font-semibold text-text-0">Description:</span> All API routes validate auth first, then parse the request body, then perform the operation. Errors are returned as JSON with a consistent shape.</div>
            <div><span className="font-semibold text-text-0">Example:</span></div>
            <pre className="bg-bg-dark text-green text-[12px] rounded-lg p-3 overflow-x-auto mt-2">{`export async function POST(req) {
  const { user } = await requireAuth(req);
  const body = await req.json();
  // ... operation
  return NextResponse.json({ data });
}`}</pre>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/decision" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt decision</div>
          </a>
          <a href="/docs/cli/context" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt context</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
