import type { Metadata } from 'next';
import { FadeUp } from '../../components/FadeUp';

export const metadata: Metadata = {
  title: 'GitHub Copilot Integration',
  description: 'Add persistent memory to GitHub Copilot. Contxt connects via MCP so Copilot retains architectural decisions and patterns across sessions.',
  alternates: { canonical: 'https://mycontxt.ai/docs/copilot' },
};

export default function DocsCopilot() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-bg text-teal-mute text-xs font-semibold uppercase tracking-[1px] mb-4">
            Integrations
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            GitHub Copilot
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Connect Contxt to GitHub Copilot via MCP. Copilot Chat can query your project's memory to give context-aware suggestions.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber/10 text-amber text-[13.5px] font-medium mb-8">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          MCP support in GitHub Copilot is in preview and requires VS Code 1.99+ with the Copilot Chat extension.
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Prerequisites
        </h2>
        <ul className="space-y-2 text-[17px] text-text-1 leading-[1.8] mb-6">
          <li>VS Code 1.99 or later</li>
          <li>GitHub Copilot Chat extension</li>
          <li>MCP support enabled in VS Code settings</li>
          <li>Contxt CLI installed and authenticated</li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Enable MCP in VS Code
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Add to your VS Code <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">settings.json</code>:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`{
  "github.copilot.chat.experimental.mcpServers": {
    "contxt": {
      "command": "contxt",
      "args": ["mcp"]
    }
  }
}`}</pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Reload VS Code after saving. The Contxt tools will appear in the Copilot Chat tool picker.
        </p>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Using Contxt in Copilot Chat
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          In Copilot Chat, use the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">#contxt_suggest</code> tool reference or ask Copilot to load your project context:
        </p>
        <div className="bg-violet-bg rounded-lg p-4 mb-6">
          <div className="text-xs font-mono uppercase tracking-[2px] text-violet mb-3">Example prompt</div>
          <p className="text-[14px] text-text-1 italic">"Use the contxt tools to load my project decisions, then help me refactor this service"</p>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cursor" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">Cursor</div>
          </a>
          <a href="/docs/windsurf" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Windsurf</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
