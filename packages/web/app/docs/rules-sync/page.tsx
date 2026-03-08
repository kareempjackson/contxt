import { FadeUp } from '../../components/FadeUp';

export default function RulesSyncPage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Rules File Sync
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Edit <code className="font-mono text-[17px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/rules.md</code> in
            your IDE and watch it sync to memory automatically.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          The Rules File
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/rules.md</code> is a
          human-readable markdown file that mirrors your memory store. It gives you a plain-text window into everything
          Contxt knows about your project — your stack, architectural decisions, coding patterns, and active context.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Because it lives in your repository, you can read and edit it directly in your IDE. Contxt watches for
          changes and syncs them back to the memory store automatically, keeping both representations in lockstep.
        </p>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          File Format
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The rules file uses standard markdown headings to separate memory categories. Each heading maps to a specific
          memory type, and the bullet items beneath become individual memory entries.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-[2]">
            <code className="text-white/40">{'# Stack\n'}</code>
            <code className="text-white/75">{'- Next.js 14, App Router\n'}</code>
            <code className="text-white/75">{'- Prisma + Postgres\n'}</code>
            <code className="text-white/75">{'- Stripe Billing\n'}</code>
            <code className="text-white/40">{'\n# Decisions\n'}</code>
            <code className="text-white/75">{'- Use Prisma for ORM (better TS support than Drizzle)\n'}</code>
            <code className="text-white/75">{'- JWT in httpOnly cookies (stateless, refresh rotation)\n'}</code>
            <code className="text-white/40">{'\n# Patterns\n'}</code>
            <code className="text-white/75">{'- API routes: Zod schema → validate → handler → typed response\n'}</code>
            <code className="text-white/75">{'- Error handling: centralized with exponential backoff\n'}</code>
            <code className="text-white/40">{'\n# Context\n'}</code>
            <code className="text-white/75">{'Currently building user onboarding flow.\n'}</code>
            <code className="text-white/75">{'Blocked on Stripe webhook integration.'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          Section Parsing
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Each markdown heading signals a different parsing strategy. Contxt applies the appropriate parser to each
          section when syncing.
        </p>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Heading
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Behavior
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet"># Stack</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Project stack metadata — stored as stack entries on the project
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet"># Decisions</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Decision entries — text in parentheses is extracted as rationale
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet"># Patterns</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Pattern entries — text before the colon becomes the pattern name
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet"># Context</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Active context entry — replaces the current context block entirely
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code className="font-mono text-[13px] text-text-2">Any other heading</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2">
                  Document entry — stored as a document with the heading as the title
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          CLI Commands
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Three commands cover the full sync lifecycle:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[2]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt rules sync</code>
            {'       '}
            <code className="text-white/40"># Parse rules.md → update memory{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt rules generate</code>
            {'   '}
            <code className="text-white/40"># Generate rules.md from memory (first-time bootstrap){'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt rules diff</code>
            {'       '}
            <code className="text-white/40"># Show what{'\''}s out of sync (no writes)</code>
          </pre>
        </div>
        <ul className="space-y-3 mb-12">
          <li className="flex items-start gap-3">
            <code className="font-mono text-[13px] font-bold text-violet shrink-0 mt-1">sync</code>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Reads the current rules.md and upserts changed entries into memory. Safe to run repeatedly — unchanged
              entries are detected by content hash and skipped.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <code className="font-mono text-[13px] font-bold text-violet shrink-0 mt-1">generate</code>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Writes a fresh rules.md from whatever is already in memory. Use this on first setup if memory was built
              through other means (CLI commands, MCP, git hooks).
            </p>
          </li>
          <li className="flex items-start gap-3">
            <code className="font-mono text-[13px] font-bold text-violet shrink-0 mt-1">diff</code>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Compares the file and memory without writing anything. Useful before syncing to confirm exactly what will
              change.
            </p>
          </li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Auto-Sync with Watch
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          If you initialized your project with{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt init</code>, the watch
          daemon is already running — no extra setup needed. The daemon monitors{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/rules.md</code> for
          changes and automatically triggers a sync the moment you save the file. Changes appear in memory within
          seconds. You do not need to run{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt rules sync</code> manually.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="font-mono text-[13.5px] leading-[1.9]">
            <code className="text-white/40">{'# Edit .contxt/rules.md in your editor and save\n'}</code>
            {'  '}
            <code className="text-white/75">{'15:22  rules    rules.md changed — syncing 2 updates'}</code>
          </pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          If the daemon was stopped, restart it:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="font-mono text-[13.5px] leading-[1.9]">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt watch --daemon</code>
            {'\n'}
            <code className="text-[#6EE7B7]">{'✓ Watcher started (PID 48291)'}</code>
          </pre>
        </div>
        <p className="text-[14px] text-text-2 mb-12">
          See the{' '}
          <a href="/docs/watch" className="text-violet hover:underline">
            Watch Daemon
          </a>{' '}
          page for details on automatic setup and auto-sync behavior.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/watch"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Watch Daemon</div>
                <div className="text-sm text-text-2">Auto-sync rules.md changes without any manual commands</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          <a
            href="/docs/passive-capture"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Passive Capture Overview</div>
                <div className="text-sm text-text-2">All passive capture methods: hooks, watcher, MCP, scan</div>
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
