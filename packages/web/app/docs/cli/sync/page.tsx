import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliSync() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt push / pull
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Sync your local memory to the cloud and back. Entries are stored locally first — sync makes them available across machines and in the web dashboard.
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
              <code className="font-mono text-[13.5px] text-green">contxt sync push</code>
            </div>
            <p className="text-[15px] text-text-2">Upload all local entries that haven't been synced yet.</p>
          </div>
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt sync pull</code>
            </div>
            <p className="text-[15px] text-text-2">Download remote entries to your local database.</p>
          </div>
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt sync</code>
            </div>
            <p className="text-[15px] text-text-2">Bidirectional sync — pull then push in sequence.</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
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
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Preview what would be synced without making changes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px] text-violet">--force</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Override conflicts and push all local entries regardless of sync state</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Automatic sync
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Install git hooks to sync automatically on commit and push:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt hook install</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          After installation, <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">post-commit</code> silently pushes new entries and <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">pre-push</code> ensures everything is synced before your code reaches the remote.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/sync" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Sync &amp; Cloud overview</div>
          </a>
          <a href="/docs/mcp" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">MCP Setup</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
