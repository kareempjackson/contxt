import { FadeUp } from '../../components/FadeUp';

export default function DocsMCPSetup() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-bg text-teal-mute text-xs font-semibold uppercase tracking-[1px] mb-4">
            Integrations
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            MCP Setup
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Contxt includes a built-in MCP (Model Context Protocol) server. This lets AI tools load your project's context automatically — no copy-pasting, no manual prompts.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          What is MCP?
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          MCP is an open protocol that lets AI applications access external tools and data sources. Contxt implements an MCP server that exposes your project's memory as tools the AI can call.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          Available MCP Tools
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          When connected via MCP, your AI tool gets access to these tools:
        </p>
        <div className="overflow-x-auto mb-12">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Tool</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_suggest</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Get relevant context for a task (Smart Suggest)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_search</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Search across all memory entries</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_get_context</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Load current active context</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_get_decisions</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">List decisions (with optional filters)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_get_patterns</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">List patterns (with optional filters)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_log_decision</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Log a new decision from the AI session</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_log_pattern</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Save a new pattern from the AI session</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet border-b border-border">contxt_update_context</td>
                <td className="px-4 py-3 text-[14px] text-text-2 border-b border-border">Update active working context</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[14px] font-mono font-medium text-violet">contxt_end_session</td>
                <td className="px-4 py-3 text-[14px] text-text-2">End and log the current session</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Generic MCP Configuration
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          For any MCP-compatible client, add Contxt as a server:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="font-mono text-[13.5px] leading-[1.8] text-white/75">
            <code className="text-white/40">{'{\n'}</code>
            <code className="text-white/40">{'  "mcpServers": {\n'}</code>
            <code className="text-white/40">{'    "contxt": {\n'}</code>
            <code>{'      '}<span className="text-[#6EE7B7]">"command"</span>{': '}<span className="text-[#FCA5A5]">"contxt"</span>{',\n'}</code>
            <code>{'      '}<span className="text-[#6EE7B7]">"args"</span>{': ['}<span className="text-[#FCA5A5]">"mcp"</span>{'],\n'}</code>
            <code>{'      '}<span className="text-[#6EE7B7]">"env"</span>{': {\n'}</code>
            <code>{'        '}<span className="text-[#6EE7B7]">"CONTXT_PROJECT"</span>{': '}<span className="text-[#FCA5A5]">"/path/to/your/project"</span>{'\n'}</code>
            <code>{'      }\n'}</code>
            <code className="text-white/40">{'    }\n'}</code>
            <code className="text-white/40">{'  }\n'}</code>
            <code className="text-white/40">{'}'}</code>
          </pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          The <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">CONTXT_PROJECT</code> environment variable tells the MCP server which project to load. If omitted, it uses the current working directory.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Starting the MCP Server Manually
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-white/90">contxt mcp serve</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          This starts the MCP server on stdio (standard input/output), which is the transport most AI tools expect.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-white/90">contxt mcp serve --port 3100</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Start on HTTP for tools that use HTTP transport.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Verifying the Connection
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Once configured, ask your AI tool: <strong>"What decisions have been made in this project?"</strong> If Contxt is connected, it will call <code className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt_get_decisions</code> and return your logged decisions.
        </p>
      </FadeUp>

      <FadeUp delay={0.35}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Next: Configure Your AI Tool
        </h2>
        <div className="space-y-3 mb-12">
          <a
            href="/docs/claude-code"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  Claude Code Integration
                </div>
                <div className="text-sm text-text-2">Set up Contxt with Claude Code in one step</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a
            href="/docs/cursor"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  Cursor Integration
                </div>
                <div className="text-sm text-text-2">Connect Contxt to Cursor&apos;s AI features</div>
              </div>
              <svg className="w-5 h-5 text-text-3 group-hover:text-violet transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a
            href="/docs/copilot"
            className="block p-4 border border-border rounded-lg hover:border-violet hover:bg-violet/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-0 group-hover:text-violet transition-colors">
                  GitHub Copilot & Other Tools
                </div>
                <div className="text-sm text-text-2">Use Contxt with any MCP-compatible tool</div>
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
