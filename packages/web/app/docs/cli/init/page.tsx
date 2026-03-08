import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliInit() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt init
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Initialize a Contxt project in the current directory. Creates a local SQLite database and config file to start capturing memory.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Usage
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">contxt init</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Run this once at the root of each project you want to track. Contxt identifies projects by their directory path.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          What it creates
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-3 text-[15px]">
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">~/.contxt/</code>
              <span className="text-text-2">Global directory containing the shared SQLite database and auth credentials</span>
            </li>
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">~/.contxt/db.sqlite</code>
              <span className="text-text-2">Local database storing all memory entries across projects</span>
            </li>
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">.mcp.json</code>
              <span className="text-text-2">MCP server config for Claude Code — added to the project root</span>
            </li>
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">.cursor/mcp.json</code>
              <span className="text-text-2">MCP server config for Cursor — auto-detected and written</span>
            </li>
          </ul>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          The project is registered by its absolute path. You can have multiple projects on one machine — each with its own entries, branches, and sync state.
        </p>
      </FadeUp>

      <FadeUp delay={0.18}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Automatic setup
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          After creating the project, <code className="font-mono text-[15px] bg-bg px-1.5 py-0.5 rounded">contxt init</code> runs several setup steps automatically so you don't have to configure anything manually:
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-4 border border-border rounded-xl">
            <span className="text-green font-bold shrink-0 mt-0.5">✓</span>
            <div>
              <strong className="text-text-0 text-[15px]">Watch daemon started</strong>
              <p className="text-[14px] text-text-2 mt-0.5 leading-[1.7]">The background watcher launches immediately with <code className="font-mono text-[13px] bg-bg px-1 rounded">autoSync: true</code> — file changes are captured and pushed to the cloud automatically every 30 seconds.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-border rounded-xl">
            <span className="text-green font-bold shrink-0 mt-0.5">✓</span>
            <div>
              <strong className="text-text-0 text-[15px]">Git hooks installed</strong>
              <p className="text-[14px] text-text-2 mt-0.5 leading-[1.7]"><code className="font-mono text-[13px] bg-bg px-1 rounded">post-commit</code> and <code className="font-mono text-[13px] bg-bg px-1 rounded">pre-push</code> hooks are added to <code className="font-mono text-[13px] bg-bg px-1 rounded">.git/hooks/</code> to sync context on every commit and before every push.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-border rounded-xl">
            <span className="text-green font-bold shrink-0 mt-0.5">✓</span>
            <div>
              <strong className="text-text-0 text-[15px]">Claude Code hook registered</strong>
              <p className="text-[14px] text-text-2 mt-0.5 leading-[1.7]">A <code className="font-mono text-[13px] bg-bg px-1 rounded">UserPromptSubmit</code> hook is written to <code className="font-mono text-[13px] bg-bg px-1 rounded">~/.claude/settings.json</code>. Claude silently loads your project context at the start of every session without any prompting.</p>
            </div>
          </div>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          See the <a href="/docs/watch" className="text-violet hover:underline">Watch Daemon</a> page for more detail on passive capture and auto-sync behavior.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Interactive prompts
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          The init command asks for:
        </p>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-3 text-[15px] text-text-2 list-disc list-inside">
            <li><strong className="text-text-0">Project name</strong> — defaults to the current directory name</li>
            <li><strong className="text-text-0">Description</strong> — optional short description for the web dashboard</li>
          </ul>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          After init
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Start capturing memory right away:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
          <code className="font-mono text-[13.5px] text-white/90">contxt decision add    <span className="text-white/40"># capture an architectural decision</span></code>
        </div>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-3">
          <code className="font-mono text-[13.5px] text-white/90">contxt pattern add     <span className="text-white/40"># capture a code pattern</span></code>
        </div>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-white/90">contxt sync push       <span className="text-white/40"># push to cloud</span></code>
        </div>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/quick-start" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">Quick Start</div>
          </a>
          <a href="/docs/cli/decision" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt decision</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
