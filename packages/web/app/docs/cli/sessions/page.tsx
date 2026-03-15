import { FadeUp } from '../../../components/FadeUp';

export default function DocsCliSessions() {
  return (
    <article className="prose prose-contxt max-w-none">
      <FadeUp>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5F0] text-teal text-xs font-semibold uppercase tracking-[1px] mb-4">
            CLI Reference
          </div>
          <h1 className="font-serif text-[clamp(40px,5vw,56px)] font-normal leading-[1.1] tracking-tight text-text-0 mb-4">
            contxt sessions
          </h1>
          <p className="text-[19px] text-text-2 leading-[1.7] max-w-[600px]">
            View session history, inspect logged events, and resume working context after an AI context compaction.
          </p>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <div className="h-px bg-border my-12" />

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4">
          Subcommands
        </h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Command</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">contxt sessions</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">List recent sessions with event counts and duration</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">contxt sessions show &lt;session-id&gt;</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">Show all logged events for a specific session</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">contxt sessions resume</td>
                <td className="px-4 py-3 text-[13px] text-text-2">Print the latest session snapshot — use after context compaction to restore working state</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Example output
        </h2>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-8">
          <pre className="font-mono text-[13px] text-white/90 m-0">{`$ contxt sessions

Recent sessions — my-app

  sess_abc123   payment-integration     47 events   2h 12m   ended 3h ago  ◆ snapshot
  sess_def456   auth-refactor           23 events   58m      ended 1d ago
  sess_ghi789   onboarding-flow         61 events   3h 41m   ended 3d ago  ◆ snapshot

$ contxt sessions show sess_abc123

Events — payment-integration (sess_abc123)

  14:02  decision_made    Chose Stripe over Braintree for webhook reliability
  14:18  file_edited      src/api/webhooks/stripe.ts
  14:35  error_hit        Webhook signature verification failing in test env
  14:52  task_completed   Stripe webhook handler implemented and tested
  15:10  file_edited      src/lib/stripe.ts, src/api/webhooks/stripe.ts
  ...

$ contxt sessions resume

Resume snapshot for session: payment-integration

  Goal     Implement Stripe payment webhooks
  Completed
    - Stripe webhook handler (src/api/webhooks/stripe.ts)
    - Signature verification middleware
  In progress
    - Retry logic for failed webhook deliveries
  Blockers
    - Test environment Stripe CLI setup
  Next steps
    - Wire up retry queue
    - Write integration tests`}</pre>
        </div>
      </FadeUp>

      <FadeUp delay={0.15}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Session events
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          During a session, your AI agent silently logs notable events using the <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_session_event</code> MCP tool. Four event types are tracked:
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-border rounded-lg">
            <thead className="bg-bg">
              <tr>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">Type</th>
                <th className="px-4 py-3 text-left text-[13px] font-semibold text-text-1 border-b border-border">When it fires</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">decision_made</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">An architectural or design decision is made</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">file_edited</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">A file is written or significantly modified</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet border-b border-border">task_completed</td>
                <td className="px-4 py-3 text-[13px] text-text-2 border-b border-border">A discrete task or sub-task is finished</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[12px] text-violet">error_hit</td>
                <td className="px-4 py-3 text-[13px] text-text-2">An error is encountered that is not immediately resolved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </FadeUp>

      <FadeUp delay={0.2}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Rolling snapshots and compaction survival
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          Every 10 events, Contxt automatically builds a compact &ldquo;resume snapshot&rdquo; — a structured summary of goals, completed work, in-progress tasks, blockers, and next steps. This snapshot is stored in the session entry&rsquo;s metadata so it survives context window compression.
        </p>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          When your AI editor compacts the context (Claude Code&rsquo;s automatic compaction, Gemini&rsquo;s rolling window, etc.), the history is lost — but the snapshot is not. Your CLAUDE.md (and equivalent files for other platforms) instructs the AI to call <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt_session_resume</code> immediately after loading, restoring full working context in a single tool call.
        </p>
        <div className="bg-bg-dark rounded-lg p-4 overflow-x-auto mb-6">
          <pre className="font-mono text-[13.5px] leading-[1.9] m-0">
            <code className="text-white/40">{'# After your AI context was compacted — get back up to speed\n'}</code>
            <code className="text-white/40">$ </code>
            <code className="text-white/90">contxt sessions resume</code>
          </pre>
        </div>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-6">
          You can also paste the resume output directly into a new chat to restore context manually, or run{' '}
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt sessions show &lt;id&gt;</code> to see the full event log for deeper investigation.
        </p>
      </FadeUp>

      <FadeUp delay={0.25}>
        <h2 className="font-serif text-[32px] font-normal leading-[1.2] tracking-tight text-text-0 mb-4 mt-12">
          Relation to <code className="font-mono text-[28px]">contxt session</code>
        </h2>
        <p className="text-[17px] text-text-1 leading-[1.8] mb-4">
          <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt session</code> (singular) manages session lifecycle — <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">start</code>, <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">end</code>, <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">current</code>. <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt sessions</code> (plural) is the history viewer. Use both together: start a session at the beginning of a coding task, let events be auto-logged, and use <code className="font-mono text-[14px] bg-bg px-1.5 py-0.5 rounded">contxt sessions resume</code> whenever you need to restore context.
        </p>
      </FadeUp>

      <FadeUp delay={0.3}>
        <div className="h-px bg-border my-12" />
        <div className="grid grid-cols-2 gap-4">
          <a href="/docs/cli/diff" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">Previous</div>
            <div className="text-[15px] font-semibold text-text-0">contxt diff</div>
          </a>
          <a href="/docs/mcp" className="block p-5 bg-white border border-border rounded-xl hover:border-violet/40 hover:shadow-sm transition-all">
            <div className="text-[12px] font-mono uppercase tracking-[1.5px] text-text-3 mb-2">See also</div>
            <div className="text-[15px] font-semibold text-text-0">MCP Integration</div>
          </a>
        </div>
      </FadeUp>
    </article>
  );
}
