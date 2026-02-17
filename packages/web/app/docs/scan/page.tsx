import { FadeUp } from '../../components/FadeUp';

export default function ScanPage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt scan
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Extract @decision, @pattern, and @context annotations from code comments across your codebase.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Comment Syntax
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Contxt recognizes three annotation tags anywhere inside a code comment. An optional{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">[category]</code> bracket and a{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">| key: value</code> metadata
          trailer are both optional but encouraged for richer indexing.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@decision'}</code>
            <code className="text-white/75">{' Use Prisma over Drizzle'}</code>
            <code className="text-white/40">{' | '}</code>
            <code className="text-[#C4B5FD]">{'rationale:'}</code>
            <code className="text-white/75">{' better TS support\n'}</code>

            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@decision'}</code>
            <code className="text-white/40">{' ['}</code>
            <code className="text-[#FCD34D]">{'infrastructure'}</code>
            <code className="text-white/40">{'] '}</code>
            <code className="text-white/75">{'JWT in httpOnly cookies'}</code>
            <code className="text-white/40">{' | '}</code>
            <code className="text-[#C4B5FD]">{'rationale:'}</code>
            <code className="text-white/75">{' stateless, refresh rotation\n'}</code>

            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@pattern'}</code>
            <code className="text-white/75">{' API route: Zod schema → validate → handler → typed response\n'}</code>

            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@pattern'}</code>
            <code className="text-white/40">{' ['}</code>
            <code className="text-[#FCD34D]">{'api'}</code>
            <code className="text-white/40">{'] '}</code>
            <code className="text-white/75">{'Error handler'}</code>
            <code className="text-white/40">{' | '}</code>
            <code className="text-[#C4B5FD]">{'when:'}</code>
            <code className="text-white/75">{' transient failures\n'}</code>

            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@context'}</code>
            <code className="text-white/75">{' Currently building user onboarding flow'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Multi-line Support
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          An annotation can span multiple lines. Any immediately following comment line that starts with two slashes
          and at least two spaces (not a new tag) is treated as a continuation of the previous annotation.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@decision'}</code>
            <code className="text-white/75">{' Use server-side rendering for all marketing pages\n'}</code>
            <code className="text-white/40">{'//   '}</code>
            <code className="text-white/75">{'rationale: SEO is critical; hydration cost on static pages\n'}</code>
            <code className="text-white/40">{'//   '}</code>
            <code className="text-white/75">{'is unjustified. RSC removes the client bundle entirely.\n'}</code>
            {'\n'}
            <code className="text-white/40">{'// '}</code>
            <code className="text-[#C4B5FD]">{'@pattern'}</code>
            <code className="text-white/75">{' Wrap every fetch in a try/catch and log with context\n'}</code>
            <code className="text-white/40">{'//   '}</code>
            <code className="text-white/75">{'Include: requestId, userId, endpoint, durationMs'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          Supported Languages
        </h2>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Language(s)
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Comment style
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Example
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">
                  JavaScript / TypeScript
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">
                  {'//'}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border font-mono">
                  {'// @decision ...'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">
                  Python / Ruby / Shell
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">
                  {'#'}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border font-mono">
                  {'# @pattern ...'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">
                  SQL
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">
                  {'--'}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border font-mono">
                  {'-- @context ...'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0 border-b border-border">
                  CSS / C / C++ / Java
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">
                  {'/* ... */'}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border font-mono">
                  {'/* @decision ... */'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-medium text-text-0">
                  HTML / JSX / Svelte
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 font-mono">
                  {'<!-- ... -->'}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-2 font-mono">
                  {'<!-- @pattern ... -->'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          CLI Flags
        </h2>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Flag
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">contxt scan</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">—</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Scan the current directory recursively. Respects{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">.contxtignore</code> and{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">.gitignore</code>.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">--path &lt;dir&gt;</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">./</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Limit the scan to a specific directory or file.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">--dry-run</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border font-mono">false</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Print discovered annotations to stdout without writing any drafts. Useful for verifying syntax.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code className="font-mono text-[13px] text-violet">--auto-confirm</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 font-mono">false</td>
                <td className="px-4 py-3 text-[14px] text-text-2">
                  Skip the draft review queue and immediately confirm all discovered annotations as active entries.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Deduplication
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Every annotation is content-hashed on first scan. On subsequent runs, Contxt compares the current hash
          against the stored value and assigns one of four statuses:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-[1.9]">
            <code className="text-white/40">{'Scan complete — 47 files, 12 annotations\n\n'}</code>
            <code className="text-[#6EE7B7]">{'  NEW       '}</code>
            <code className="text-white/75">{'src/lib/auth.ts:14     @decision JWT in httpOnly cookies\n'}</code>
            <code className="text-[#6EE7B7]">{'  NEW       '}</code>
            <code className="text-white/75">{'src/api/users.ts:3     @pattern  API route handler\n'}</code>
            <code className="text-[#FCD34D]">{'  UPDATED   '}</code>
            <code className="text-white/75">{'src/lib/db.ts:1        @decision Use Prisma for database\n'}</code>
            <code className="text-white/40">{'  UNCHANGED '}</code>
            <code className="text-white/50">{'src/components/Button.tsx:22  @pattern  Button variants\n'}</code>
            <code className="text-[#FCA5A5]">{'  STALE     '}</code>
            <code className="text-white/75">{'src/lib/old-cache.ts   @decision Redis caching strategy\n'}</code>
            {'\n'}
            <code className="text-white/40">{'3 drafts queued — run '}</code>
            <code className="text-white/75">{'contxt review'}</code>
            <code className="text-white/40">{' to confirm'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.35}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          .contxtignore
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Place a{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxtignore</code> file in your
          project root to exclude paths from scanning. Syntax is identical to{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.gitignore</code> — glob
          patterns, one per line. Contxt also respects your existing{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.gitignore</code> automatically.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">{'# .contxtignore\n'}</code>
            <code className="text-white/75">{'*.generated.ts\n'}</code>
            <code className="text-white/75">{'src/vendor/**\n'}</code>
            <code className="text-white/75">{'**/__tests__/**\n'}</code>
            <code className="text-white/75">{'**/fixtures/**\n'}</code>
            <code className="text-white/75">{'src/lib/legacy-migrations.ts'}</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.4}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/passive-capture"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Passive Capture Overview</div>
                <div className="text-sm text-text-2">All passive capture methods: hooks, watcher, MCP, import</div>
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
                <div className="text-sm text-text-2">Confirm or discard drafts found during scanning</div>
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
