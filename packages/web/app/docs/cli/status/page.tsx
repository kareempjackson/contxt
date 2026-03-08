import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliStatus() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt status
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Show the current project, active branch, session summary, and pending draft count at a glance.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Usage
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">contxt status</code>
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example output
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-8">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`Project:  my-saas-app
Branch:   feat/onboarding
Session:  Active (23 min)

Memory
  Stack:      5 entries
  Decisions:  12 entries
  Patterns:   8 entries
  Context:    1 entry

Pending drafts: 3  (run: contxt review)`}</pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
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
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">Project</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">The initialized project name for the current directory</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">Branch</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Active Contxt memory branch (mirrors git branch when hooks are installed)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">Session</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Whether a watch session is running and how long it has been active</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">Memory</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Entry counts by memory type for the active branch</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">Pending drafts</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Number of unreviewed draft entries waiting for approval</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Flags
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
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">--json</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Output status as JSON for scripting or CI integration</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet">--short</td>
                <td className="px-4 py-3 text-[14px] text-text-2">One-line summary: project name, branch, and pending draft count</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/review" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Review &amp; Drafts</div>
          </a>
          <a href="/docs/cli/suggest" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt suggest</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
