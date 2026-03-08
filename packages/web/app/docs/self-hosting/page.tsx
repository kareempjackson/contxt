import { FadeUp } from '../../components/FadeUp';

export default function DocsSelfHosting() {
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
            Self-Hosting
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Run your own Contxt backend using Supabase. Your memory stays on your infrastructure — no data leaves your control.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Requirements
        </h2>
        <ul className="space-y-2 text-[17px] text-text-1 leading-[1.8] mb-6">
          <li>A Supabase project (free tier works)</li>
          <li>pgvector extension enabled (for semantic search)</li>
          <li>OpenAI API key (for embedding generation)</li>
        </ul>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          1. Set up the database
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Run the migration files from the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">supabase/migrations/</code> directory in your Supabase project's SQL editor, in order:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`00001_initial_schema.sql
00002_auth_schema.sql
00003_rls_policies.sql
00004_pgvector.sql
...`}</pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          2. Deploy the edge function
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Deploy the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">embed</code> edge function to enable automatic embedding generation on sync:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <code className="font-mono text-[13.5px] text-green">supabase functions deploy embed</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Set the required secret:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">supabase secrets set OPENAI_API_KEY=sk-...</code>
        </div>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          3. Configure the CLI
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Point the CLI at your Supabase instance by setting environment variables or passing the URL to init:
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-4">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`export CONTXT_SUPABASE_URL=https://your-project.supabase.co
export CONTXT_SUPABASE_ANON_KEY=your-anon-key`}</pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Then run <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt auth login</code> to authenticate against your instance.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/api" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">API Reference</div>
          </a>
          <a href="/docs/config" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">Configuration</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
