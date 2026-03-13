import type { Metadata } from 'next';
import { FadeUp } from '../../components/FadeUp';

export const metadata: Metadata = {
  title: 'Git Hooks — Auto-Capture on Commit',
  description: 'Install Contxt git hooks to automatically capture context on every commit, push, and branch switch without any manual effort.',
  alternates: { canonical: 'https://mycontxt.ai/docs/git-hooks' },
};

export default function GitHooksPage() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-bg text-violet text-xs font-semibold uppercase tracking-[1px] mb-4">
            Passive Capture
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Git Hooks
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Automatically capture context from your git workflow. No manual commands after installation.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Installation
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-loose">
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt hook install</code>
            {'          '}
            <code className="text-white/40"># Install all hooks{'\n'}</code>
            <code className="text-[#6EE7B7]">{'✓ Installed post-commit, pre-push, post-checkout, prepare-commit-msg\n'}</code>
            {'\n'}
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt hook status</code>
            {'           '}
            <code className="text-white/40"># Check installed hooks{'\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt hook uninstall</code>
            {'        '}
            <code className="text-white/40"># Remove all Contxt hooks</code>
          </pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6">
          Available Hooks
        </h2>
        <div className="space-y-4 mb-12">
          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <code className="font-mono text-[14px] font-bold text-violet bg-violet/10 px-3 py-1 rounded-full">
                post-commit
              </code>
              <span className="text-[12px] text-text-3 font-mono">&lt;200ms</span>
            </div>
            <p className="text-[15px] text-text-1 leading-[1.7] mb-3">
              Scans the commit message for decision keywords and conventional commit prefixes. Creates draft entries
              and updates the context file list.
            </p>
            <div className="bg-bg-dark rounded-lg p-3 overflow-x-auto">
              <pre className="font-mono text-[12.5px] leading-[1.8]">
                <code className="text-white/40">{'# Triggers on: "decided", "switched to", "migrated", "chose"\n'}</code>
                <code className="text-white/40">{'# Also: feat(), fix(), refactor(), arch() prefixes\n'}</code>
                <code className="text-white/40">{'$ git commit -m "feat(db): migrate from Drizzle to Prisma"\n'}</code>
                <code className="text-[#6EE7B7]">{'contxt: draft saved — "migrate from Drizzle to Prisma" (decision)'}</code>
              </pre>
            </div>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <code className="font-mono text-[14px] font-bold text-violet bg-violet/10 px-3 py-1 rounded-full">
                pre-push
              </code>
            </div>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Counts unpushed commits and changed files, then updates the active context with a session summary.
              Optionally syncs to cloud before the push completes if{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">hooks.syncToCloud</code>{' '}
              is enabled in config.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <code className="font-mono text-[14px] font-bold text-violet bg-violet/10 px-3 py-1 rounded-full">
                post-checkout
              </code>
            </div>
            <p className="text-[15px] text-text-1 leading-[1.7]">
              Detects branch checkouts (not file checkouts) and switches the Contxt memory branch to match the git
              branch you just checked out. Your context stays aligned with your working branch automatically.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <code className="font-mono text-[14px] font-bold text-violet bg-violet/10 px-3 py-1 rounded-full">
                prepare-commit-msg
              </code>
            </div>
            <p className="text-[15px] text-text-1 leading-[1.7] mb-3">
              Injects your active context as{' '}
              <code className="font-mono text-[13px] bg-bg-dark/5 px-1.5 py-0.5 rounded">#</code> comment lines
              into the commit message template, so you always have your feature, blockers, and recent decisions
              visible when writing commits.
            </p>
            <div className="bg-bg-dark rounded-lg p-3 overflow-x-auto">
              <pre className="font-mono text-[12.5px] leading-[1.8]">
                <code className="text-white/40">{'# ─── Contxt context ───────────────────────\n'}</code>
                <code className="text-white/40">{'# Feature: User onboarding flow\n'}</code>
                <code className="text-white/40">{'# Blockers: Stripe webhook signature verification\n'}</code>
                <code className="text-white/40">{'# Recent: JWT in httpOnly cookies, Prisma for ORM\n'}</code>
                <code className="text-white/40">{'# ────────────────────────────────────────────\n'}</code>
                <code className="text-white/75">{'|'}</code>
              </pre>
            </div>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Non-Destructive Installation
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Contxt hooks append to existing hook files rather than replacing them. They are fully compatible with
          existing hook managers. If you already use Husky or lint-staged, Contxt adds its logic alongside yours
          without conflict.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          The installer wraps added lines between{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">CONTXT_BLOCK_START</code> and{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">CONTXT_BLOCK_END</code> sentinel
          comments. Running{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt hook uninstall</code>{' '}
          removes only those lines — your existing hook logic is untouched.
        </p>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Configuration
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Hook behavior is controlled by the{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">hooks</code> key in{' '}
          <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/config.json</code>:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-12">
          <pre className="font-mono text-[13.5px] leading-[1.8]">
            <code className="text-white/75">{'{\n'}</code>
            <code className="text-white/75">{'  "hooks": {\n'}</code>
            <code className="text-white/75">{'    "post-commit": {\n'}</code>
            <code className="text-white/75">{'      "enabled": true,\n'}</code>
            <code className="text-white/75">{'      "decisionDetection": true\n'}</code>
            <code className="text-white/75">{'    },\n'}</code>
            <code className="text-white/75">{'    "pre-push": {\n'}</code>
            <code className="text-white/75">{'      "enabled": true,\n'}</code>
            <code className="text-white/75">{'      "syncToCloud": false\n'}</code>
            <code className="text-white/75">{'    },\n'}</code>
            <code className="text-white/75">{'    "post-checkout": {\n'}</code>
            <code className="text-white/75">{'      "enabled": true,\n'}</code>
            <code className="text-white/75">{'      "switchMemoryBranch": true\n'}</code>
            <code className="text-white/75">{'    },\n'}</code>
            <code className="text-white/75">{'    "prepare-commit-msg": {\n'}</code>
            <code className="text-white/75">{'      "enabled": true\n'}</code>
            <code className="text-white/75">{'    }\n'}</code>
            <code className="text-white/75">{'  }\n'}</code>
            <code className="text-white/75">{'}'}</code>
          </pre>
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
                <div className="text-sm text-text-2">Confirm or discard drafts captured by hooks</div>
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
                <div className="text-sm text-text-2">See all passive capture methods in one place</div>
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
