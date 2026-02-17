import { FadeUp } from '../../components/FadeUp';

export default function CapturePage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Import Sources
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Seed your context store from files that already contain structured knowledge about your project.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Overview
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Most projects already contain structured knowledge scattered across READMEs, configuration files, and git
          history.{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt capture</code> reads these
          sources and extracts what it can, saving entries as drafts for your review.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          This is a one-time import, not an ongoing sync. Run it when initializing Contxt on an existing project to
          bootstrap your context store without starting from scratch.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt capture --source all</code>
            {'     '}
            <code className="text-white/40"># Import from all sources{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt capture --source readme</code>
            {'   '}
            <code className="text-white/40"># README only{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt capture --source commits</code>
            {'  '}
            <code className="text-white/40"># Recent git commits{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt capture --dry-run</code>
            {'         '}
            <code className="text-white/40"># Preview without saving</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          Import Sources
        </h2>
        <div className="space-y-4 mb-12">
          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <code className="font-mono text-[13px] font-bold text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                readme
              </code>
            </div>
            <p className="text-[14px] text-text-2 leading-[1.7]">
              Parses <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">README.md</code> (or{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">README.txt</code>) for
              technology mentions, architecture descriptions, and setup instructions. Extracts as document entries
              and infers stack technologies from dependency language.
            </p>
          </div>

          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <code className="font-mono text-[13px] font-bold text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                cursor
              </code>
            </div>
            <p className="text-[14px] text-text-2 leading-[1.7]">
              Reads{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">.cursorrules</code> or{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">.cursor/rules</code>. These
              files often contain explicit coding conventions and patterns that map directly to Contxt pattern
              entries.
            </p>
          </div>

          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <code className="font-mono text-[13px] font-bold text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                claude
              </code>
            </div>
            <p className="text-[14px] text-text-2 leading-[1.7]">
              Reads{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">CLAUDE.md</code> files in
              the project root. These often contain architectural decisions and project-specific instructions
              intended for Claude Code sessions.
            </p>
          </div>

          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <code className="font-mono text-[13px] font-bold text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                adr
              </code>
            </div>
            <p className="text-[14px] text-text-2 leading-[1.7]">
              Scans for Architecture Decision Record directories (
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">docs/decisions/</code>,{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">adr/</code>,{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">docs/adr/</code>). Each ADR
              markdown file becomes a decision entry with the ADR title and status preserved.
            </p>
          </div>

          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <code className="font-mono text-[13px] font-bold text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                commits
              </code>
            </div>
            <p className="text-[14px] text-text-2 leading-[1.7]">
              Parses the last 50 git commits (configurable with{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">--limit</code>) for
              conventional commit messages with decision-indicating prefixes:{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">feat</code>,{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">refactor</code>,{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">arch</code>, and commits
              containing keywords like "decided", "switched to", or "migrated".
            </p>
          </div>

          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <code className="font-mono text-[13px] font-bold text-violet bg-violet/10 px-2.5 py-1 rounded-full">
                package
              </code>
            </div>
            <p className="text-[14px] text-text-2 leading-[1.7]">
              Reads{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">package.json</code>,{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">pyproject.toml</code>,{' '}
              <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">Cargo.toml</code>, and
              similar manifest files. Extracts the dependency list to populate the project stack automatically.
            </p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
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
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">--source &lt;name&gt;</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Source to import from. One of:{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">readme</code>,{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">cursor</code>,{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">claude</code>,{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">adr</code>,{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">commits</code>,{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">package</code>,{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">all</code>. Default:{' '}
                  <code className="font-mono text-[12px] bg-bg-dark/5 px-1 py-0.5 rounded">all</code>.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">--dry-run</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Preview what would be imported without writing any drafts.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-border">
                  <code className="font-mono text-[13px] text-violet">--auto-confirm</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">
                  Skip the review queue and confirm all imported entries immediately.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <code className="font-mono text-[13px] text-violet">--limit &lt;n&gt;</code>
                </td>
                <td className="px-4 py-3 text-[14px] text-text-2">
                  For commit imports, limit to the last N commits. Default: 50.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next Steps
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/review"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">Review Queue</div>
                <div className="text-sm text-text-2">Confirm or discard the drafts created by the import</div>
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
                <div className="text-sm text-text-2">Ongoing passive capture: hooks, watcher, MCP, scan</div>
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
