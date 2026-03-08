import { FadeUp } from '../../components/FadeUp';

export default function DocsBranching() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-bg text-blue text-xs font-semibold uppercase tracking-[1px] mb-4">
            Core Concepts
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Branching
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Contxt supports branches — isolated memory contexts that mirror your git workflow. Capture decisions and patterns per-branch, then merge or compare across branches as your project evolves.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          How branches work
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Every memory entry belongs to a branch. By default, entries are created on <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">main</code>. When you switch branches, Contxt filters context to that branch — so your AI only sees decisions relevant to the work in progress.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Branches are independent of git — you can name them anything. The convention is to match your git branch name so hooks can auto-switch context.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          Branch commands
        </h2>

        <div className="space-y-6 mb-8">
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
              <code className="font-mono text-[13.5px] text-green">contxt branch list</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">List all branches and their entry counts.</p>
          </div>

          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
              <code className="font-mono text-[13.5px] text-green">contxt branch switch &lt;name&gt;</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Switch to a branch (creates it if it doesn't exist). All subsequent entries are added to this branch.</p>
          </div>

          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
              <code className="font-mono text-[13.5px] text-green">contxt branch create &lt;name&gt;</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Create a new branch without switching to it.</p>
          </div>

          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
              <code className="font-mono text-[13.5px] text-green">contxt branch merge &lt;name&gt;</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Merge entries from the named branch into the current branch. Duplicate entries (matched by title) are skipped.</p>
          </div>

          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
              <code className="font-mono text-[13.5px] text-green">contxt branch delete &lt;name&gt;</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Delete a branch and all its entries. You cannot delete the currently active branch — switch away first.</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Automatic branch switching
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          When the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">post-checkout</code> git hook is installed, Contxt automatically switches its context branch to match your current git branch:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt hook install</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          After installation, every <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">git checkout</code> or <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">git switch</code> silently updates your active Contxt branch.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Use cases
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-4 text-[15px] text-text-1">
            <li className="flex gap-3">
              <span className="font-semibold text-text-0 min-w-[140px]">Feature branches</span>
              <span className="text-text-2">Capture decisions specific to a feature (e.g. "use optimistic updates here") without polluting main context.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-text-0 min-w-[140px]">Experiments</span>
              <span className="text-text-2">Prototype on a branch. If the experiment is scrapped, the context is cleanly isolated and won't confuse future AI sessions.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-text-0 min-w-[140px]">Time travel</span>
              <span className="text-text-2">View what your context looked like at any point by switching to a historical branch snapshot.</span>
            </li>
          </ul>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/memory-types" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">Memory Types</div>
          </a>
          <a href="/docs/sync" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Sync &amp; Cloud</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
