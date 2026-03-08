import { FadeUp } from '../../components/FadeUp';

export default function DocsSync() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-bg text-blue text-xs font-semibold uppercase tracking-[1px] mb-4">
            Core Concepts
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Sync &amp; Cloud
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Contxt stores memory locally by default. Sync pushes your context to the cloud so it's available across machines, teams, and the web dashboard.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Push to cloud
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Push all local entries that haven't been synced yet:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt sync push</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Only new or updated entries are transferred. Already-synced entries are skipped.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Pull from cloud
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Pull remote entries to your local database (useful when switching machines or joining a shared project):
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">contxt sync pull</code>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Bidirectional sync
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt sync</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Runs pull then push in sequence. Safe to run frequently.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
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
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">--dry-run</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Show what would be synced without making changes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet border-b border-border">--force</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Override conflict detection and push all local entries</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Automatic sync via git hooks
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          If you initialized your project with{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt init</code>, git hooks are already
          installed — no extra setup needed. The{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">post-commit</code> and{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">pre-push</code> hooks silently push new
          entries to the cloud on every commit and push.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          If hooks were removed or you need to reinstall them manually:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt hook install</code>
          {'  '}
          <code className="font-mono text-[13.5px] text-white/40"># re-install if removed</code>
        </div>
        <p className="text-[14px] text-text-2 mb-6">
          See the{' '}
          <a href="/docs/cli/hook" className="text-violet hover:underline">
            contxt hook
          </a>{' '}
          reference for the full list of installed hooks and configuration options.
        </p>
      </FadeUp>

      <FadeUp delay={0.35}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/branching" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">Branching</div>
          </a>
          <a href="/docs/passive-capture" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Passive Capture</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
