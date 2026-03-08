import { FadeUp } from '../../components/FadeUp';

export default function DocsConfig() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 text-amber text-xs font-semibold uppercase tracking-[1px] mb-4">
            Advanced
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            Configuration
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Contxt stores its configuration globally in <code className="font-mono text-[16px]">~/.contxt/</code>. Most settings are managed automatically — this page covers manual configuration options.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Config directory
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-3 text-[15px]">
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">~/.contxt/db.sqlite</code>
              <span className="text-text-2">Local database — all memory entries across all projects</span>
            </li>
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">~/.contxt/auth.json</code>
              <span className="text-text-2">Authentication credentials (access token, user ID)</span>
            </li>
            <li className="flex gap-3">
              <code className="font-mono text-[13px] text-violet bg-bg px-2 py-0.5 rounded min-w-fit h-fit">~/.contxt/config.json</code>
              <span className="text-text-2">Global settings (Supabase URL override, default branch)</span>
            </li>
          </ul>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Environment variables
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          These environment variables override config file values:
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Variable</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">CONTXT_SUPABASE_URL</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Override the Supabase URL (for self-hosting)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">CONTXT_SUPABASE_ANON_KEY</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Override the Supabase anon key</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">CONTXT_DB_PATH</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Override the SQLite database path</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Reset config
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          To reset authentication without removing your local data:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">contxt auth logout</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          This removes <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">~/.contxt/auth.json</code> only. Your local database and project registrations are preserved.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-1 gap-4">
          <a href="/docs/self-hosting" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">Self-Hosting</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
