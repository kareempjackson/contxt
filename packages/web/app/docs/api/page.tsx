import { FadeUp } from '../../components/FadeUp';

export default function DocsApi() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 text-amber text-xs font-semibold uppercase tracking-[1px]">
              Advanced
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E65100] text-xs font-semibold uppercase tracking-[1px]">
              Coming Soon
            </div>
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            API Reference
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Access your Contxt memory programmatically via REST API. Build integrations, scripts, and custom tooling on top of your project's knowledge base.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet/10 text-violet text-[13.5px] font-medium mb-8">
          API access is available on Pro and Team plans.
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Authentication
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          All API requests require a Bearer token. Use your Contxt access token obtained from <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt auth token</code>:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`Authorization: Bearer <your-access-token>`}</pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-6 mt-12">
          Endpoints
        </h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Method</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Endpoint</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-green border-b border-border">GET</td>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">/api/v1/projects</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">List all projects</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-green border-b border-border">GET</td>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">/api/v1/projects/:id/entries</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">List entries for a project</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-green border-b border-border">GET</td>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">/api/v1/entries/:id</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Get a single entry</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-blue border-b border-border">POST</td>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">/api/v1/projects/:id/entries</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Create a new entry</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-green">GET</td>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">/api/v1/projects/:id/export</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Export all entries as JSON</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Base URL
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-white/90">https://mycontxt.ai/api/v1</code>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/copilot" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">GitHub Copilot</div>
          </a>
          <a href="/docs/self-hosting" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Self-Hosting</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
