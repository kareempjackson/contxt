import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliAuth() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt auth
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Authenticate the CLI with your Contxt account. Required for cloud sync and semantic search. Local-only usage works without authentication.
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
              <code className="font-mono text-[13.5px] text-green">contxt auth login</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Opens a browser window for GitHub OAuth. On success, writes credentials to <code className="font-mono text-[13px] bg-bg px-1 rounded">~/.contxt/auth.json</code>.</p>
          </div>
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt auth logout</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Removes <code className="font-mono text-[13px] bg-bg px-1 rounded">~/.contxt/auth.json</code>. Your local database and project registrations are preserved.</p>
          </div>
          <div>
            <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-2">
              <code className="font-mono text-[13.5px] text-green">contxt auth status</code>
            </div>
            <p className="text-[15px] text-text-2 leading-[1.7]">Shows the currently authenticated user and whether the token is valid.</p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          What authentication enables
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-3 text-[15px]">
            <li className="flex gap-3">
              <span className="text-green font-bold shrink-0">✓</span>
              <span className="text-text-2"><strong className="text-text-0">Cloud sync</strong> — push and pull entries across machines with <code className="font-mono text-[13px] bg-bg px-1 rounded">contxt sync</code></span>
            </li>
            <li className="flex gap-3">
              <span className="text-green font-bold shrink-0">✓</span>
              <span className="text-text-2"><strong className="text-text-0">Web dashboard</strong> — view, search, and manage entries at contxt.dev</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green font-bold shrink-0">✓</span>
              <span className="text-text-2"><strong className="text-text-0">Semantic search</strong> — vector-powered search across all projects (Pro)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green font-bold shrink-0">✓</span>
              <span className="text-text-2"><strong className="text-text-0">Team sharing</strong> — share context with teammates on the same project</span>
            </li>
          </ul>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          All CLI commands — <code className="font-mono text-[15px] bg-bg px-1.5 py-0.5 rounded">contxt decision add</code>, <code className="font-mono text-[15px] bg-bg px-1.5 py-0.5 rounded">contxt pattern add</code>, MCP tools — work fully offline without authentication.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Credentials file
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          After login, credentials are stored at <code className="font-mono text-[15px] bg-bg px-1.5 py-0.5 rounded">~/.contxt/auth.json</code>:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`{
  "accessToken": "sbp_...",
  "userId": "usr_abc123",
  "email": "you@example.com"
}`}</pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Do not commit this file. It is automatically added to <code className="font-mono text-[15px] bg-bg px-1.5 py-0.5 rounded">~/.gitignore_global</code> during login.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/init" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">contxt init</div>
          </a>
          <a href="/docs/cli/billing" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt billing</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
