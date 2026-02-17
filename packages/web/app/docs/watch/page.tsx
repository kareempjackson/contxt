import { FadeUp } from '../../components/FadeUp';

export default function WatchPage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Watch Daemon
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Background process that keeps your context warm without any manual commands.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Starting the Watcher
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt watch</code>
            {'              '}
            <code className="text-white/40"># Foreground mode (Ctrl+C to stop){'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt watch --daemon</code>
            {'    '}
            <code className="text-white/40"># Background daemon{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt watch:stop</code>
            {'        '}
            <code className="text-white/40"># Stop the daemon{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt watch:status</code>
            {'      '}
            <code className="text-white/40"># Check if running</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          What It Monitors
        </h2>
        <div className="space-y-4 mb-12">
          <div className="flex items-start gap-4 p-4 border border-border rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-violet/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-0 mb-1">Source file changes</div>
              <p className="text-[14px] text-text-2 leading-[1.7]">
                Updates{' '}
                <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">context.files</code>{' '}
                with a 30-second debounce to avoid noise during active editing sessions. Respects{' '}
                <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">.contxtignore</code> and{' '}
                <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">.gitignore</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border border-border rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-0 mb-1">.contxt/rules.md</div>
              <p className="text-[14px] text-text-2 leading-[1.7]">
                Automatically runs{' '}
                <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">contxt rules sync</code>{' '}
                whenever the file is saved. Edit the markdown file in your IDE and memory updates within seconds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border border-border rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-0 mb-1">.git/HEAD</div>
              <p className="text-[14px] text-text-2 leading-[1.7]">
                Detects branch switches and updates the active memory branch to match. Complements the{' '}
                <a href="/docs/git-hooks" className="text-violet hover:underline">post-checkout hook</a>{' '}
                for teams who prefer not to install git hooks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border border-border rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-amber/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-0 mb-1">Session timing</div>
              <p className="text-[14px] text-text-2 leading-[1.7]">
                Tracks work sessions with a 30-minute inactivity timeout. Session data informs context summaries
                and the pre-push hook report.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border border-border rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-text-0 mb-1">Files with @tags</div>
              <p className="text-[14px] text-text-2 leading-[1.7]">
                When a file containing Contxt annotations is modified, runs an incremental re-scan of just that
                file — not the entire project. New or changed tags become drafts immediately.
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Foreground Output
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          When running in foreground mode, the watcher prints a live activity log with timestamps and event types:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-[1.9]">
            <code className="text-[#6EE7B7]">{'contxt watch — monitoring my-app (main)\n\n'}</code>
            <code className="text-white/40">{'  14:32  '}</code>
            <code className="text-[#C4B5FD]">{'files   '}</code>
            <code className="text-white/75">{'src/api/billing.ts, src/lib/stripe.ts\n'}</code>
            <code className="text-white/40">{'  14:35  '}</code>
            <code className="text-[#C4B5FD]">{'scan    '}</code>
            <code className="text-[#6EE7B7]">{'+ '}</code>
            <code className="text-white/75">{'DECISION "Use Stripe Connect" (draft)\n'}</code>
            <code className="text-white/40">{'  14:52  '}</code>
            <code className="text-[#C4B5FD]">{'context '}</code>
            <code className="text-white/75">{'session active — 20 min, 4 files\n'}</code>
            <code className="text-white/40">{'  15:22  '}</code>
            <code className="text-[#C4B5FD]">{'session '}</code>
            <code className="text-white/75">{'ended — 50 min, 6 files touched\n'}</code>
            <code className="text-white/40">{'  15:22  '}</code>
            <code className="text-[#C4B5FD]">{'rules   '}</code>
            <code className="text-white/75">{'rules.md changed — syncing 2 updates'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Daemon Mode
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          When started with{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">--daemon</code>, the watcher
          detaches from your terminal and runs as a background process. Its state is tracked via two files:
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <code className="font-mono text-[13px] font-bold text-violet shrink-0 mt-0.5">.contxt/.watch.pid</code>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Contains the process ID of the running daemon. Deleted automatically when the daemon stops cleanly.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <code className="font-mono text-[13px] font-bold text-violet shrink-0 mt-0.5">.contxt/watch.log</code>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Rolling log of all watcher events. Rotated at 5MB. Review with{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">tail -f .contxt/watch.log</code>.
            </p>
          </li>
        </ul>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Resource Usage
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The watcher is designed to be invisible in the background:
        </p>
        <ul className="space-y-2 mb-12">
          <li className="flex items-center gap-3 text-[15px] text-text-1">
            <span className="w-2 h-2 rounded-full bg-green shrink-0" />
            <span>Memory: under 50MB RAM</span>
          </li>
          <li className="flex items-center gap-3 text-[15px] text-text-1">
            <span className="w-2 h-2 rounded-full bg-green shrink-0" />
            <span>Polling: native OS file events via chokidar (1s fallback)</span>
          </li>
          <li className="flex items-center gap-3 text-[15px] text-text-1">
            <span className="w-2 h-2 rounded-full bg-green shrink-0" />
            <span>
              Ignored automatically:{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">node_modules</code>,{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">dist</code>,{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">build</code>, and{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">.contxtignore</code> patterns
            </span>
          </li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/rules-sync"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Rules File Sync</div>
                <div className="text-sm text-text-2">Edit .contxt/rules.md and have it auto-sync to memory</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          <a
            href="/docs/review"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Review Queue</div>
                <div className="text-sm text-text-2">Confirm or discard drafts captured while watching</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
