import type { Metadata } from 'next';
import { FadeUp } from '../../components/FadeUp';

export const metadata: Metadata = {
  title: 'Google Antigravity Integration',
  description: "Add persistent memory to Google's Antigravity IDE. Contxt connects via MCP and auto-configures on contxt init.",
  alternates: { canonical: 'https://mycontxt.ai/docs/antigravity' },
};

export default function DocsAntigravity() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-bg text-teal-mute text-xs font-semibold uppercase tracking-[1px] mb-4">
            Integrations
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Google Antigravity
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Connect Contxt to Google's Antigravity IDE via MCP. Your project's decisions and patterns are available to Gemini in every session.
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
          <li>Google Antigravity IDE</li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Automatic setup
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Running <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt init</code> automatically registers Contxt in your Antigravity MCP config at{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">~/.gemini/antigravity/mcp_config.json</code>. No extra steps needed.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Manual setup
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          If you need to add Contxt manually, open Antigravity → MCP Servers → Manage MCP Servers → View raw config, or edit{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">~/.gemini/antigravity/mcp_config.json</code> directly:
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
          Restart Antigravity after saving.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Using Contxt in Antigravity
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Once connected, Gemini can load your project context on demand:
        </p>
        <div className="bg-violet-bg rounded-lg p-4 mb-6">
          <div className="text-xs font-mono uppercase tracking-[2px] text-violet mb-3">Example prompts</div>
          <ul className="space-y-2 text-[14px] text-text-1 italic">
            <li>"What decisions have we made about the database layer?"</li>
            <li>"Load my project context and help me add a new API endpoint"</li>
            <li>"Are there any patterns I should follow for error handling?"</li>
          </ul>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Gemini will call <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">suggest_context</code> to retrieve relevant decisions and patterns, then use that context throughout the session.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/windsurf" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">Windsurf</div>
          </a>
          <a href="/docs/api" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">API Reference</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
