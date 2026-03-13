import type { Metadata } from 'next';
import { FadeUp } from '../../components/FadeUp';

export const metadata: Metadata = {
  title: 'Installation',
  description: 'Install the Contxt CLI via npm. Works with Claude Code, Cursor, Windsurf, Copilot, and any MCP-compatible AI coding agent.',
  alternates: { canonical: 'https://mycontxt.ai/docs/installation' },
};

export default function DocsInstallation() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Getting Started
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Installation
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Install Contxt globally via npm.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Requirements
        </h2>
        <ul className="space-y-2 text-[17px] text-text-1 leading-[1.8] mb-6">
          <li>Node.js 18 or higher</li>
          <li>npm, pnpm, or yarn</li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Install
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">npm install -g @mycontxt/cli</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">Or with pnpm:</p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">pnpm add -g @mycontxt/cli</code>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Verify Installation
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-white/90">contxt --version</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          You should see the current version number.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Authentication (Optional)
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          To sync context to the cloud and use Smart Suggest with semantic search, authenticate with your Contxt account:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-white/90">contxt auth login</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          This opens a browser window for GitHub OAuth. Once authenticated, your context syncs across machines and team members.
        </p>
        <div className="bg-amber-bg border border-amber/20 rounded-xl p-6 my-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="font-semibold text-text-0 mb-1">Local-first design</div>
              <div className="text-[15px] text-text-1 leading-[1.7]">
                Local-only usage works without authentication. All CLI commands function offline — cloud sync is additive.
              </div>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Updating
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-white/90">npm update -g @mycontxt/cli</code>
        </div>
      </FadeUp>

      <FadeUp delay={0.35}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Uninstall
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-white/90">npm uninstall -g @mycontxt/cli</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-12">
          This removes the CLI but preserves any <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/</code> directories in your projects.
        </p>
      </FadeUp>

      <FadeUp delay={0.4}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">Introduction</div>
          </a>
          <a href="/docs/quick-start" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Quick Start</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
