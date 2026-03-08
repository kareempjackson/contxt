import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliContext() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt context
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            Capture free-form context entries — project background, notes, constraints, and anything that doesn't fit neatly into a decision or pattern.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Add context
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <code className="font-mono text-[13.5px] text-green">contxt context add</code>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          Opens an interactive prompt for a title and free-form content block.
        </p>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          What to store as context
        </h2>
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <ul className="space-y-2 text-[15px] text-text-2 list-disc list-inside">
            <li>Project background — what the product does, who uses it</li>
            <li>External constraints — API rate limits, compliance requirements</li>
            <li>Team conventions that don't have a specific code example</li>
            <li>Known issues or areas to avoid touching</li>
            <li>Deployment environment details (staging vs prod differences)</li>
            <li>Links to relevant external docs or design specs</li>
          </ul>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          When to use context vs other types
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Use <strong>context</strong> for background knowledge that helps AI understand the project. Use <strong>decisions</strong> for choices with rationale, and <strong>patterns</strong> for code structure examples. If unsure, context is a safe default.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/pattern" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt pattern</div>
          </a>
          <a href="/docs/cli/sync" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Next</div>
            <div className="text-[15px] font-semibold text-text-0">contxt push / pull</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
