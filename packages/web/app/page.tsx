import { FadeUp } from './components/FadeUp';
import { StaggerContainer, StaggerItem } from './components/StaggerContainer';

export default function Home() {
  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-bg">
        <div className="max-w-[1320px] mx-auto px-12 h-full flex items-center justify-between">
          <div className="flex items-center gap-13">
            <a href="#" className="font-bold text-[17px] tracking-tight">
              contxt
            </a>
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Features
              </a>
              <a href="#smart-suggest" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Smart Suggest
              </a>
              <a href="#pricing" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Pricing
              </a>
              <a href="/docs" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Docs
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/auth/login" className="h-9 px-[18px] text-[13.5px] font-semibold rounded-full bg-transparent text-text-2 hover:text-text-0 transition-colors flex items-center justify-center">
              Sign in
            </a>
            <a href="/auth/login" className="h-9 px-[18px] text-[13.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center">
              Get contxt
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-40 px-12 text-center max-w-[1320px] mx-auto">
        <FadeUp>
          <h1 className="font-serif text-[clamp(52px,7.5vw,104px)] font-normal leading-[1.0] tracking-[-2px] mb-6">
            Your AI's next<br />breakthrough, <em className="italic">powered<br />by memory</em>
          </h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-[17px] text-text-2 max-w-[480px] mx-auto mb-11 leading-[1.75]">
            Contxt gives AI coding agents persistent, versioned, project-scoped memory — so they work like a teammate, not a stranger.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex gap-4 justify-center items-center mb-20">
            <a href="/auth/login" className="h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center">
              Get contxt
            </a>
            <a href="/docs" className="text-[15.5px] font-semibold underline underline-offset-4 decoration-[1.5px] hover:opacity-50 transition-opacity">
              Explore the docs
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Hero Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-4 max-w-[1320px] mx-auto px-12 mb-[140px]">
        {/* Terminal Card */}
        <StaggerItem className="bg-bg-dark rounded-[20px] overflow-hidden min-h-[480px] flex flex-col relative">
          <div className="h-12 flex items-center px-5 gap-[7px] border-b border-white/[0.06]">
            <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]"></span>
            <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]"></span>
            <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]"></span>
            <span className="ml-3 font-mono text-[11.5px] text-white/40 px-[10px] py-1 rounded-[5px] bg-white/[0.06]">
              ~/my-saas-app
            </span>
          </div>
          <div className="p-8 font-mono text-[13.5px] leading-[2.2] text-white/75 flex-1">
            <div className="flex gap-2">
              <span className="text-white/25 select-none">$</span>
              <span className="text-white/90 font-medium">contxt init</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium">✓ Initialized in ./my-saas-app</div>
            <div className="pl-[22px] text-white/25 text-xs">Stack detected: Next.js · Prisma · Postgres</div>
            <div className="h-1"></div>
            <div className="flex gap-2">
              <span className="text-white/25 select-none">$</span>
              <span className="text-white/90 font-medium">contxt push</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium">✓ Synced 14 decisions · 8 patterns · active context</div>
            <div className="pl-[22px] text-white/25 text-xs">→ mycontxt.ai/kareem/my-saas-app</div>
            <div className="h-1"></div>
            <div className="flex gap-2">
              <span className="text-white/25 select-none">$</span>
              <span className="text-white/90 font-medium">contxt load</span>
              <span className="text-[#C4B5FD]">--task "add Stripe webhooks"</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium">✓ 5 entries loaded · 812 tokens</div>
            <div className="pl-[22px] text-white/25 text-xs">Filtered 24 irrelevant entries (saved 3,388 tokens)</div>
          </div>
          <div className="absolute bottom-6 left-7 bg-white text-text-0 px-5 py-3 rounded-xl text-[14.5px] font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green"></span>
            81% fewer tokens
          </div>
        </StaggerItem>

        {/* Editorial Card */}
        <StaggerItem className="rounded-[20px] overflow-hidden min-h-[480px] flex items-end p-10 bg-gradient-to-br from-[#B8C6DB] via-[#C5D8A4] via-[#E8D5B7] to-[#D4B5D0] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>
          <div className="text-white relative z-10">
            <h3 className="font-serif text-[28px] font-normal leading-[1.2] mb-[6px] tracking-tight">
              Context that persists<br />across every session
            </h3>
            <p className="text-sm text-white/70">Your architecture. Your decisions. Always there.</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Problem */}
      <div className="py-[140px] px-12 max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <div className="space-y-8 text-[17px] text-text-2 leading-[1.75]">
            <p>
              Every AI coding session starts from zero. You spend 40% of your prompts re-explaining your architecture, your patterns, your past decisions. Your AI doesn't remember that you use Prisma, that you prefer server actions over API routes, or that you already decided against Redis.
            </p>
            <p>
              The result? Wasted tokens. Generic suggestions. Code that doesn't fit your stack. You become a human clipboard, copying context into every conversation.
            </p>
            <p>
              <strong className="text-text-0 font-semibold">Contxt solves this.</strong> Your AI gets persistent, project-scoped memory. Push your architecture once — every tool remembers it. Forever.
            </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-dark rounded-[20px] p-8 text-white">
              <div className="font-serif text-[56px] font-normal leading-none mb-3">40%</div>
              <div className="text-sm text-white/50">of prompts wasted on re-explaining context</div>
            </div>
            <div className="bg-bg-dark rounded-[20px] p-8 text-white">
              <div className="font-serif text-[56px] font-normal leading-none mb-3">3.2×</div>
              <div className="text-sm text-white/50">faster iteration with persistent memory</div>
            </div>
            <div className="bg-bg-dark rounded-[20px] p-8 text-white">
              <div className="font-serif text-[56px] font-normal leading-none mb-3">5K+</div>
              <div className="text-sm text-white/50">tokens saved per session on average</div>
            </div>
            <div className="bg-bg-dark rounded-[20px] p-8 text-white">
              <div className="font-serif text-[56px] font-normal leading-none mb-3">0</div>
              <div className="text-sm text-white/50">manual copy-paste. Contxt loads automatically.</div>
            </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-[140px] px-12 max-w-[1320px] mx-auto space-y-24">
        {/* Feature 1 */}
        <FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#01 Workflow</div>
            <h3 className="font-serif text-[clamp(32px,4vw,48px)] font-normal leading-[1.15] tracking-tight mb-5">
              Push once.<br />Never repeat yourself.
            </h3>
            <p className="text-[17px] text-text-2 leading-[1.75] mb-6">
              Store decisions, patterns, and active context in your project's <span className="font-mono text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/</span> directory. One command syncs it to the cloud. Every AI tool you use can pull from it.
            </p>
            <ul className="space-y-3 text-[15px] text-text-2">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                <span>Decisions (why you chose Prisma over TypeORM)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                <span>Patterns (your API error handler template)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                <span>Context (current blockers, active features)</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#F5F0FF] rounded-[20px] overflow-hidden min-h-[420px] flex items-center justify-center p-10">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-violet/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="font-serif text-2xl font-normal text-violet mb-2">Push to cloud</div>
              <div className="text-sm text-violet/60">Sync happens automatically</div>
            </div>
          </div>
          </div>
        </FadeUp>

        {/* Feature 2 */}
        <FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-bg-dark rounded-[20px] overflow-hidden min-h-[420px] flex flex-col relative order-2 md:order-1">
            <div className="h-12 flex items-center px-5 gap-[7px] border-b border-white/[0.06]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]"></span>
              <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]"></span>
              <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]"></span>
              <span className="ml-3 font-mono text-[11.5px] text-white/40 px-[10px] py-1 rounded-[5px] bg-white/[0.06]">
                ~/.claude/claude_desktop_config.json
              </span>
            </div>
            <div className="p-8 font-mono text-[13px] leading-[2] text-white/75 flex-1">
              <div className="text-white/40">{"{"}</div>
              <div className="pl-4 text-white/40">"mcpServers": {"{"}</div>
              <div className="pl-8 text-white/40">"contxt": {"{"}</div>
              <div className="pl-12">
                <span className="text-[#6EE7B7]">"command"</span>: <span className="text-[#FCA5A5]">"contxt"</span>,
              </div>
              <div className="pl-12">
                <span className="text-[#6EE7B7]">"args"</span>: [<span className="text-[#FCA5A5]">"mcp"</span>]
              </div>
              <div className="pl-8 text-white/40">{"}"}</div>
              <div className="pl-4 text-white/40">{"}"}</div>
              <div className="text-white/40">{"}"}</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#02 Integrations</div>
            <h3 className="font-serif text-[clamp(32px,4vw,48px)] font-normal leading-[1.15] tracking-tight mb-5">
              Works with every AI coding tool
            </h3>
            <p className="text-[17px] text-text-2 leading-[1.75] mb-6">
              Contxt uses MCP (Model Context Protocol) — the open standard for AI context. One integration, every tool. Claude Code, Cursor, Copilot, Windsurf — they all read from the same source of truth.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Claude Code</span>
              <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Cursor</span>
              <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Copilot</span>
              <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Windsurf</span>
            </div>
          </div>
          </div>
        </FadeUp>

        {/* Feature 3 */}
        <FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#03 Structure</div>
            <h3 className="font-serif text-[clamp(32px,4vw,48px)] font-normal leading-[1.15] tracking-tight mb-5">
              Git-like branching.<br />Time travel included.
            </h3>
            <p className="text-[17px] text-text-2 leading-[1.75] mb-6">
              Want to experiment with a new approach? Create a branch. Try it out. Merge it back or throw it away. Every change is versioned — you can revert to any point in your project's memory history.
            </p>
            <div className="space-y-2 font-mono text-[13.5px]">
              <div className="flex gap-2">
                <span className="text-text-3">$</span>
                <span className="text-text-0">contxt branch create experiment</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-3">$</span>
                <span className="text-text-0">contxt decision add --title "Try approach B"</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-3">$</span>
                <span className="text-text-0">contxt branch merge experiment</span>
              </div>
            </div>
          </div>
          <div className="bg-[#FEF3E2] rounded-[20px] overflow-hidden min-h-[420px] flex items-center justify-center p-10">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber"></div>
                <div className="font-mono text-sm text-amber-dark">main</div>
              </div>
              <div className="ml-6 pl-6 py-2 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber/50"></div>
                  <div className="text-xs text-amber-dark/60">Decision: Use Prisma</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber/50"></div>
                  <div className="text-xs text-amber-dark/60">Pattern: API errors</div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-6">
                <div className="w-3 h-3 rounded-full bg-violet"></div>
                <div className="font-mono text-sm text-violet">experiment</div>
              </div>
              <div className="ml-12 pl-6 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet/50"></div>
                  <div className="text-xs text-violet/60">Decision: Try approach B</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </FadeUp>
      </div>

      {/* Smart Suggest */}
      <div id="smart-suggest" className="py-[140px] px-12 bg-bg-dark">
        <div className="max-w-[1320px] mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="font-serif text-[clamp(44px,6vw,80px)] font-normal leading-[1.0] tracking-[-2px] mb-6 text-white">
                The relevance engine
              </h2>
              <p className="text-[17px] text-white/50 max-w-[600px] mx-auto">
                Contxt doesn't dump everything into your prompt. It intelligently scores each memory entry and surfaces only what matters for your current task.
              </p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6">
            {/* Input Card */}
            <StaggerItem className="bg-white/[0.06] rounded-[20px] p-8">
              <div className="text-xs font-mono uppercase tracking-[2px] text-white/40 mb-6">Task Signal</div>
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-mono text-white/30 mb-2">QUERY</div>
                  <div className="bg-white/[0.04] rounded-lg p-4 text-sm text-white/80 font-mono">
                    "implement Stripe webhook handler"
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-white/30 mb-2">ACTIVE FILES</div>
                  <div className="space-y-1">
                    <div className="bg-white/[0.04] rounded px-3 py-2 text-xs font-mono text-white/60">src/app/api/webhooks/route.ts</div>
                    <div className="bg-white/[0.04] rounded px-3 py-2 text-xs font-mono text-white/60">src/lib/stripe.ts</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-white/30 mb-2">CONSTRAINTS</div>
                  <div className="bg-white/[0.04] rounded px-3 py-2 text-xs font-mono text-white/60">
                    Max 2000 tokens
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Results Card */}
            <StaggerItem className="bg-white/[0.06] rounded-[20px] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-mono uppercase tracking-[2px] text-white/40">Ranked Results</div>
                <div className="text-xs font-mono text-[#6EE7B7]">5 entries • 1,847 tokens</div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/[0.04] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">Decision: Use Stripe for payments</div>
                    <div className="text-xs font-mono text-white/40">0.94</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">Keyword overlap • File match • Type priority</div>
                  <div className="text-xs font-mono text-white/30">432 tokens</div>
                </div>
                <div className="bg-white/[0.04] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">Pattern: API error handler</div>
                    <div className="text-xs font-mono text-white/40">0.87</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">Recency • Type priority</div>
                  <div className="text-xs font-mono text-white/30">318 tokens</div>
                </div>
                <div className="bg-white/[0.04] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">Context: Payment flow blockers</div>
                    <div className="text-xs font-mono text-white/40">0.82</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">Semantic similarity • Recency</div>
                  <div className="text-xs font-mono text-white/30">245 tokens</div>
                </div>
                <div className="text-xs text-white/30 text-center pt-2">
                  Filtered 18 irrelevant entries • Saved 4,203 tokens
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* Context Wall Section */}
      <section className="py-[140px] px-12 bg-bg-dark">
        <div className="max-w-[1320px] mx-auto">
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {/* Left: Copy */}
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-white/30 mb-4">
                  #04 Context Limit
                </div>
                <h3 className="font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.15] tracking-tight mb-5 text-white">
                  The context wall.<br />Meet your escape hatch.
                </h3>
                <p className="text-[17px] text-white/50 leading-[1.75] mb-8">
                  You&apos;re deep in a session — 2 hours in, real momentum — and Claude hits the limit.
                  &ldquo;This conversation cannot be compacted anymore.&rdquo; Without Contxt, that context is gone.
                  With Contxt, it was already saved.
                </p>
                <ul className="space-y-4 text-[15px] text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
                    <span>Run <span className="font-mono text-[13px] bg-white/[0.06] px-2 py-0.5 rounded text-white/80">contxt push</span> anytime during your session — decisions and patterns are saved to the cloud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
                    <span>Start a fresh conversation — no more hitting the wall</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</span>
                    <span>Run <span className="font-mono text-[13px] bg-white/[0.06] px-2 py-0.5 rounded text-white/80">contxt load --task &quot;...&quot;</span> — get 800 tokens of the right context, not 40k of history</span>
                  </li>
                </ul>
              </div>

              {/* Right: Before/After terminal cards */}
              <div className="space-y-4">
                {/* Before */}
                <div className="bg-[#1a0a0a] border border-red-900/40 rounded-[16px] overflow-hidden">
                  <div className="h-10 flex items-center px-4 gap-2 border-b border-red-900/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></span>
                    <span className="ml-2 font-mono text-[11px] text-red-400/60">claude code — 3h 12m</span>
                  </div>
                  <div className="p-5 font-mono text-[13px] leading-[1.8]">
                    <div className="text-red-400/80">⚠ This conversation cannot be compacted anymore.</div>
                    <div className="text-white/25 text-[12px] mt-1">Start a new session to continue.</div>
                  </div>
                </div>

                {/* After */}
                <div className="bg-[#0a1a0f] border border-green-900/40 rounded-[16px] overflow-hidden">
                  <div className="h-10 flex items-center px-4 gap-2 border-b border-green-900/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></span>
                    <span className="ml-2 font-mono text-[11px] text-green-400/60">~/my-saas-app — new session</span>
                  </div>
                  <div className="p-5 font-mono text-[13px] leading-[1.8]">
                    <div className="flex gap-2">
                      <span className="text-white/25">$</span>
                      <span className="text-white/80">contxt load <span className="text-[#C4B5FD]">--task &quot;add Stripe webhooks&quot;</span></span>
                    </div>
                    <div className="text-[#6EE7B7] font-medium">✓ 5 entries loaded · 812 tokens</div>
                    <div className="text-white/25 text-[12px]">Filtered 24 irrelevant entries (saved 3,388 tokens)</div>
                    <div className="mt-2 text-white/40 text-[12px]">Context restored. Continue where you left off.</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Integrations */}
      <div className="py-[140px] px-12 max-w-[1320px] mx-auto">
        <FadeUp>
          <div className="text-center mb-16">
            <h2 className="font-serif text-[clamp(44px,6vw,80px)] font-normal leading-[1.0] tracking-[-2px] mb-6">
              One integration.<br /><em className="italic">Every tool.</em>
            </h2>
            <p className="text-[17px] text-text-2 max-w-[600px] mx-auto">
              Contxt uses MCP, the open standard for AI context. Install once, use everywhere.
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="px-6 py-3 rounded-full bg-bg-dark text-white text-[15px] font-semibold">Claude Code</div>
          <div className="px-6 py-3 rounded-full bg-bg-dark/5 text-text-0 text-[15px] font-semibold">Cursor</div>
          <div className="px-6 py-3 rounded-full bg-bg-dark/5 text-text-0 text-[15px] font-semibold">GitHub Copilot</div>
          <div className="px-6 py-3 rounded-full bg-bg-dark/5 text-text-0 text-[15px] font-semibold">Windsurf</div>
          <div className="px-6 py-3 rounded-full bg-bg-dark/5 text-text-0 text-[15px] font-semibold">Zed</div>
          <div className="px-6 py-3 rounded-full bg-bg-dark/5 text-text-0 text-[15px] font-semibold">Continue</div>
        </div>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="text-center">
            <a href="#" className="text-sm font-semibold underline underline-offset-4 decoration-[1.5px] hover:opacity-50 transition-opacity">
              View MCP setup guide →
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-[140px] px-12 bg-bg-dark">
        <div className="max-w-[1320px] mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <h2 className="font-serif text-[clamp(44px,6vw,80px)] font-normal leading-[1.0] tracking-[-2px] mb-6 text-white">
                Simple, transparent pricing
              </h2>
              <p className="text-[17px] text-white/50">Start free. Scale as you grow.</p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[860px] mx-auto">
            {/* Free */}
            <StaggerItem className="bg-white/[0.06] rounded-[20px] p-8">
              <div className="text-xs font-mono uppercase tracking-[2px] text-white/40 mb-4">Free</div>
              <div className="mb-8">
                <div className="font-serif text-[56px] font-normal leading-none text-white mb-2">$0</div>
                <div className="text-sm text-white/40">Forever free</div>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>3 projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Up to 1,000 memory entries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Local + cloud sync</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>MCP integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Basic search</span>
                </li>
              </ul>
              <button className="w-full h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                Get started
              </button>
            </StaggerItem>

            {/* Pro */}
            <StaggerItem className="bg-white rounded-[20px] p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet text-white text-xs font-bold uppercase tracking-[1.5px]">
                Most Popular
              </div>
              <div className="text-xs font-mono uppercase tracking-[2px] text-text-3 mb-4">Pro</div>
              <div className="mb-8">
                <div className="font-serif text-[56px] font-normal leading-none text-text-0 mb-2">$29</div>
                <div className="text-sm text-text-3">per month</div>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-text-2">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Up to 50,000 memory entries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Semantic search (AI-powered)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Branch & version history</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors">
                Get started
              </button>
            </StaggerItem>

          </StaggerContainer>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-[140px] px-12 max-w-[1320px] mx-auto">
        <FadeUp>
          <h2 className="font-serif text-[clamp(44px,6vw,80px)] font-normal leading-[1.0] tracking-[-2px] mb-6">
            Give your AI<br />a <em className="italic">memory</em>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-[17px] text-text-2 mb-11">Stop repeating yourself. Start shipping faster.</p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex gap-4 justify-center items-center">
            <a href="/auth/login" className="h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center">
              Get contxt
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Footer */}
      <footer className="bg-bg-dark text-text-inv py-10 px-12">
        <div className="max-w-[1320px] mx-auto flex justify-between items-center">
          <div className="text-[13px] text-white/20">© 2026 Contxt · Ghost Savvy Studios</div>
          <div className="flex gap-6">
            <a href="/docs" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">Docs</a>
            <a href="/privacy" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">Privacy</a>
            <a href="/terms" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
