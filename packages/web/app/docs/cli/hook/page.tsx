import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliHook() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt hook
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Install, check, and remove Contxt git hooks. Hooks are installed automatically by <code className="font-mono text-[17px]">contxt init</code> — use these commands only when managing hooks manually.
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
              <code className="font-mono text-[13.5px] text-green">contxt hook install</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Installs all four hooks into <code className="font-mono text-[13px] bg-bg px-1 rounded">.git/hooks/</code>. Non-destructive — appends to existing hooks, preserving Husky and lint-staged.</p>
          </div>
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt hook status</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Shows which hooks are installed and whether each is enabled in your project config.</p>
          </div>
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt hook uninstall</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Removes only the Contxt-managed lines from each hook file. Your existing hook logic is untouched.</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Installed hooks
        </h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Hook</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">What it does</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">post-commit</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Scans commit messages for decision keywords; creates drafts</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">pre-push</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Updates active context with session summary; optionally syncs to cloud</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">post-checkout</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Switches Contxt memory branch to match the checked-out git branch</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">prepare-commit-msg</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Injects active context as comment lines into the commit template</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          See the <a href="/docs/git-hooks" className="text-violet hover:underline">Git Hooks</a> page for a detailed breakdown of each hook's behavior and configuration options.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/git-hooks" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Git Hooks</div>
          </a>
          <a href="/docs/cli/sync" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">contxt push / pull</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
