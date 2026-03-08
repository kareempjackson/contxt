import { FadeUp } from '../../components/FadeUp';

export default function DocsClaudeCode() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-bg text-teal-mute text-xs font-semibold uppercase tracking-[1px] mb-4">
            Integrations
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Claude Code
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Connect Contxt to Claude Code via MCP. Claude automatically loads your project's decisions, patterns, and context at the start of every session.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Prerequisites
        </h2>
        <ul className="space-y-2 text-[17px] text-text-1 leading-[1.8] mb-6">
          <li>Contxt CLI installed and authenticated (<code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt auth login</code>)</li>
          <li>A project initialized (<code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt init</code>)</li>
          <li>Claude Code installed</li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Add to Claude Code config
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Add the Contxt MCP server to your Claude Code MCP configuration. Edit <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">~/.claude/claude_desktop_config.json</code> (create it if it doesn't exist):
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`{
  "mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp"]
    }
  }
}`}</pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Restart Claude Code after saving the config.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Verify the connection
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          In a Claude Code session, ask Claude to list available tools. You should see Contxt MCP tools including:
        </p>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-2 text-[14px] font-mono text-violet">
            <li>contxt_suggest</li>
            <li>contxt_search</li>
            <li>contxt_get_entry</li>
            <li>contxt_list_entries</li>
            <li>contxt_add_entry</li>
          </ul>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          How it works
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          When you open a project in Claude Code, it can call <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_suggest</code> to automatically load relevant decisions and patterns. You can also prompt Claude directly:
        </p>
        <div className="bg-violet-bg rounded-lg p-4 mb-6">
          <div className="text-xs font-mono uppercase tracking-[2px] text-violet mb-3">Example prompt</div>
          <p className="text-[14px] text-text-1 italic">"Load my project context before we start"</p>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Claude will call the MCP tools to retrieve your decisions, patterns, and recent context, then use that to inform its responses throughout the session.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/mcp" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">MCP Setup</div>
          </a>
          <a href="/docs/cursor" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Cursor</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
