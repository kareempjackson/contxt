import { FadeUp } from './components/FadeUp';
import { StaggerContainer, StaggerItem } from './components/StaggerContainer';

export default function Home() {
  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-bg">
        <div className="max-w-[1320px] mx-auto px-5 md:px-12 h-full flex items-center justify-between">
          <div className="flex items-center gap-8 md:gap-13">
            <a href="#" className="font-bold text-[17px] tracking-tight">
              contxt
            </a>
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Features
              </a>
              <a href="#sessions" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Sessions
              </a>
              <a href="#analytics" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Analytics
              </a>
              <a href="#pricing" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Pricing
              </a>
              <a href="/docs" className="text-sm font-medium text-text-3 hover:text-text-0 transition-colors">
                Docs
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <a href="https://github.com/kareempjackson/contxt" target="_blank" rel="noopener noreferrer" className="hidden sm:flex h-9 px-3 md:px-[18px] text-[13.5px] font-semibold rounded-full bg-transparent text-text-2 hover:text-text-0 transition-colors items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span className="hidden md:inline">GitHub</span>
            </a>
            <a href="/auth/login" className="hidden md:flex h-9 px-[18px] text-[13.5px] font-semibold rounded-full bg-transparent text-text-2 hover:text-text-0 transition-colors items-center justify-center">
              Sign in
            </a>
            <a href="/auth/login" className="h-9 px-4 md:px-[18px] text-[13px] md:text-[13.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center whitespace-nowrap">
              Get contxt
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-28 md:pt-40 px-5 md:px-12 text-center max-w-[1320px] mx-auto">
        <FadeUp>
          <h1 className="font-serif text-[clamp(42px,7.5vw,104px)] font-normal leading-[1.05] tracking-tight md:tracking-[-2px] mb-6">
            Memory that survives<br />every session, <em className="italic">every<br />context reset</em>
          </h1>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-[16px] md:text-[17px] text-text-2 max-w-[520px] mx-auto mb-8 md:mb-11 leading-[1.75]">
            Contxt gives AI coding agents persistent, versioned, project-scoped memory — with session tracking, analytics, and support for every major AI tool.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-14 md:mb-20">
            <a href="/auth/login" className="w-full sm:w-auto h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center justify-center">
              Get contxt
            </a>
            <a href="/docs" className="text-[15.5px] font-semibold underline underline-offset-4 decoration-[1.5px] hover:opacity-50 transition-opacity">
              Explore the docs
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Hero Cards */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-4 max-w-[1320px] mx-auto px-5 md:px-12 mb-16 md:mb-[140px]">
        {/* Terminal Card */}
        <StaggerItem className="bg-bg-dark rounded-[20px] overflow-hidden min-h-[380px] md:min-h-[500px] flex flex-col relative">
          <div className="h-12 flex items-center px-5 gap-[7px] border-b border-white/[0.06] flex-shrink-0">
            <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]"></span>
            <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]"></span>
            <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]"></span>
            <span className="ml-3 font-mono text-[11.5px] text-white/40 px-[10px] py-1 rounded-[5px] bg-white/[0.06] truncate">
              ~/my-saas-app
            </span>
          </div>
          <div className="p-5 md:p-8 font-mono text-[12.5px] md:text-[13.5px] leading-[2.2] text-white/75 flex-1 overflow-x-auto">
            <div className="flex gap-2">
              <span className="text-white/25 select-none flex-shrink-0">$</span>
              <span className="text-white/90 font-medium">contxt init</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium">✓ Initialized in ./my-saas-app</div>
            <div className="pl-[22px] text-white/25 text-xs">Platforms: claude-code · gemini · vscode-copilot</div>
            <div className="h-1"></div>
            <div className="flex gap-2">
              <span className="text-white/25 select-none flex-shrink-0">$</span>
              <span className="text-white/90 font-medium">contxt push</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium whitespace-nowrap">✓ Synced 14 decisions · 8 patterns</div>
            <div className="h-1"></div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-white/25 select-none flex-shrink-0">$</span>
              <span className="text-white/90 font-medium">contxt sessions resume</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium">✓ Context restored from last session</div>
            <div className="pl-[22px] text-white/25 text-xs">Goal: payment integration · 3 tasks in progress</div>
            <div className="h-1"></div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-white/25 select-none flex-shrink-0">$</span>
              <span className="text-white/90 font-medium">contxt stats</span>
            </div>
            <div className="pl-[22px] text-[#6EE7B7] font-medium">62% token reduction · $0.84 saved</div>
          </div>
          <div className="absolute bottom-6 left-7 bg-white text-text-0 px-5 py-3 rounded-xl text-[14.5px] font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green"></span>
            Context always available
          </div>
        </StaggerItem>

        {/* Editorial Card */}
        <StaggerItem className="rounded-[20px] overflow-hidden min-h-[280px] md:min-h-[500px] flex items-end p-8 md:p-10 bg-gradient-to-br from-[#B8C6DB] via-[#C5D8A4] via-[#E8D5B7] to-[#D4B5D0] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40"></div>
          <div className="text-white relative z-10">
            <h3 className="font-serif text-[24px] md:text-[28px] font-normal leading-[1.2] mb-[6px] tracking-tight">
              Memory that persists<br />across every session
            </h3>
            <p className="text-sm text-white/70">Your architecture. Your decisions. Always there.</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Problem */}
      <div className="py-20 md:py-[140px] px-5 md:px-12 max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <FadeUp>
            <div className="space-y-6 md:space-y-8 text-[16px] md:text-[17px] text-text-2 leading-[1.75]">
              <p>
                Every AI coding session starts from zero. You spend 40% of your prompts re-explaining your architecture, your patterns, your past decisions. Your AI doesn't remember that you use Prisma, that you prefer server actions over API routes, or that you already decided against Redis.
              </p>
              <p>
                Worse — when the context window fills up and your AI compacts the conversation, all that momentum is gone. Hours of session history, decisions in progress, blockers you were working through. Vanished.
              </p>
              <p>
                <strong className="text-text-0 font-semibold">Contxt solves this.</strong> Persistent project memory, rolling session snapshots, token analytics, and zero-config setup for every AI tool you use.
              </p>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-bg-dark rounded-[20px] p-5 md:p-8 text-white">
                <div className="font-serif text-[44px] md:text-[56px] font-normal leading-none mb-3">40%</div>
                <div className="text-xs md:text-sm text-white/50">of prompts wasted on re-explaining context</div>
              </div>
              <div className="bg-bg-dark rounded-[20px] p-5 md:p-8 text-white">
                <div className="font-serif text-[44px] md:text-[56px] font-normal leading-none mb-3">3.2×</div>
                <div className="text-xs md:text-sm text-white/50">faster iteration with persistent memory</div>
              </div>
              <div className="bg-bg-dark rounded-[20px] p-5 md:p-8 text-white">
                <div className="font-serif text-[44px] md:text-[56px] font-normal leading-none mb-3">5K+</div>
                <div className="text-xs md:text-sm text-white/50">tokens saved per session on average</div>
              </div>
              <div className="bg-bg-dark rounded-[20px] p-5 md:p-8 text-white">
                <div className="font-serif text-[44px] md:text-[56px] font-normal leading-none mb-3">0</div>
                <div className="text-xs md:text-sm text-white/50">manual copy-paste. Contxt loads automatically.</div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-20 md:py-[140px] px-5 md:px-12 max-w-[1320px] mx-auto space-y-16 md:space-y-24">
        {/* Feature 1 */}
        <FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#01 Workflow</div>
              <h3 className="font-serif text-[clamp(28px,4vw,48px)] font-normal leading-[1.15] tracking-tight mb-5">
                Push once.<br />Never repeat yourself.
              </h3>
              <p className="text-[16px] md:text-[17px] text-text-2 leading-[1.75] mb-6">
                Store decisions, patterns, and active context in your project's <span className="font-mono text-[13px] md:text-[15px] bg-bg-dark/5 px-2 py-0.5 rounded">.contxt/</span> directory. One command syncs it to the cloud. Every AI tool you use pulls from the same source of truth.
              </p>
              <ul className="space-y-3 text-[14px] md:text-[15px] text-text-2">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Decisions (why you chose Prisma over TypeORM)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Patterns (your API error handler template)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Context (current blockers, active features)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Documents (API references, onboarding guides)</span>
                </li>
              </ul>
            </div>
            <div className="bg-[#F5F0FF] rounded-[20px] overflow-hidden min-h-[300px] md:min-h-[420px] flex items-center justify-center p-10">
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

        {/* Feature 2 — Multi-platform */}
        <FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="bg-bg-dark rounded-[20px] overflow-hidden min-h-[300px] md:min-h-[420px] flex flex-col relative order-2 md:order-1">
              <div className="h-12 flex items-center px-5 gap-[7px] border-b border-white/[0.06] flex-shrink-0">
                <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57] flex-shrink-0"></span>
                <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E] flex-shrink-0"></span>
                <span className="w-[10px] h-[10px] rounded-full bg-[#28C840] flex-shrink-0"></span>
                <span className="ml-3 font-mono text-[10px] md:text-[11.5px] text-white/40 px-[10px] py-1 rounded-[5px] bg-white/[0.06] truncate">
                  ~/my-saas-app
                </span>
              </div>
              <div className="p-5 md:p-8 font-mono text-[12px] md:text-[13px] leading-[2.1] text-white/75 flex-1">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-white/25">$</span>
                  <span className="text-white/90">contxt init <span className="text-[#C4B5FD]">--platforms claude-code,gemini,vscode-copilot</span></span>
                </div>
                <div className="text-[#6EE7B7]">✓ .mcp.json (Claude Code)</div>
                <div className="text-[#6EE7B7]">✓ ~/.gemini/settings.json</div>
                <div className="text-[#6EE7B7]">✓ .vscode/mcp.json (Copilot)</div>
                <div className="text-[#6EE7B7]">✓ CLAUDE.md (agent instructions)</div>
                <div className="text-[#6EE7B7]">✓ GEMINI.md</div>
                <div className="text-white/25 text-[11px] mt-1">All platforms configured in one command.</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#02 Integrations</div>
              <h3 className="font-serif text-[clamp(28px,4vw,48px)] font-normal leading-[1.15] tracking-tight mb-5">
                Every AI tool.<br />One command to rule them.
              </h3>
              <p className="text-[16px] md:text-[17px] text-text-2 leading-[1.75] mb-6">
                Contxt uses MCP — the open standard for AI context. Run <span className="font-mono text-[13px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt init</span> once and it detects which AI tools you have installed, writes the right config for each, and injects agent instructions so they know exactly how to use your memory.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Claude Code</span>
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Gemini CLI</span>
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">VS Code Copilot</span>
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Cursor</span>
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Windsurf</span>
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">OpenCode</span>
                <span className="px-4 py-2 rounded-full bg-bg-dark/5 text-sm font-medium">Codex CLI</span>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Feature 3 — Branching */}
        <FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#03 Structure</div>
              <h3 className="font-serif text-[clamp(28px,4vw,48px)] font-normal leading-[1.15] tracking-tight mb-5">
                Git-like branching.<br />Time travel included.
              </h3>
              <p className="text-[16px] md:text-[17px] text-text-2 leading-[1.75] mb-6">
                Want to experiment with a new approach? Create a branch. Try it out. Merge it back or throw it away. Every change is versioned — you can revert to any point in your project's memory history.
              </p>
              <div className="space-y-2 font-mono text-[12px] md:text-[13.5px] overflow-x-auto">
                <div className="flex gap-2 whitespace-nowrap">
                  <span className="text-text-3">$</span>
                  <span className="text-text-0">contxt branch create experiment</span>
                </div>
                <div className="flex gap-2 whitespace-nowrap">
                  <span className="text-text-3">$</span>
                  <span className="text-text-0">contxt decision add --title "Try approach B"</span>
                </div>
                <div className="flex gap-2 whitespace-nowrap">
                  <span className="text-text-3">$</span>
                  <span className="text-text-0">contxt branch merge experiment</span>
                </div>
              </div>
            </div>
            <div className="bg-[#FEF3E2] rounded-[20px] overflow-hidden min-h-[300px] md:min-h-[420px] flex items-center justify-center p-8 md:p-10">
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
      <div id="smart-suggest" className="py-20 md:py-[140px] px-5 md:px-12 bg-bg-dark">
        <div className="max-w-[1320px] mx-auto">
          <FadeUp>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-serif text-[clamp(36px,6vw,80px)] font-normal leading-[1.0] tracking-[-1px] md:tracking-[-2px] mb-6 text-white">
                The relevance engine
              </h2>
              <p className="text-[16px] md:text-[17px] text-white/50 max-w-[600px] mx-auto">
                Contxt doesn't dump everything into your prompt. It intelligently scores each memory entry and surfaces only what matters for your current task.
              </p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6">
            {/* Input Card */}
            <StaggerItem className="bg-white/[0.06] rounded-[20px] p-6 md:p-8">
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
                    <div className="bg-white/[0.04] rounded px-3 py-2 text-xs font-mono text-white/60 truncate">src/app/api/webhooks/route.ts</div>
                    <div className="bg-white/[0.04] rounded px-3 py-2 text-xs font-mono text-white/60 truncate">src/lib/stripe.ts</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-white/30 mb-2">TOKEN BUDGET</div>
                  <div className="bg-white/[0.04] rounded px-3 py-2 text-xs font-mono text-white/60">
                    max_tokens: 2000
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Results Card */}
            <StaggerItem className="bg-white/[0.06] rounded-[20px] p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-mono uppercase tracking-[2px] text-white/40">Ranked Results</div>
                <div className="text-xs font-mono text-[#6EE7B7]">5 entries • 1,847 tokens</div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/[0.04] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="text-sm font-medium text-white">Decision: Use Stripe for payments</div>
                    <div className="text-xs font-mono text-white/40 flex-shrink-0">0.94</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">Keyword overlap • File match • Type priority</div>
                  <div className="text-xs font-mono text-white/30">432 tokens</div>
                </div>
                <div className="bg-white/[0.04] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="text-sm font-medium text-white">Pattern: API error handler</div>
                    <div className="text-xs font-mono text-white/40 flex-shrink-0">0.87</div>
                  </div>
                  <div className="text-xs text-white/40 mb-2">Recency • Type priority</div>
                  <div className="text-xs font-mono text-white/30">318 tokens</div>
                </div>
                <div className="bg-white/[0.04] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="text-sm font-medium text-white">Context: Payment flow blockers</div>
                    <div className="text-xs font-mono text-white/40 flex-shrink-0">0.82</div>
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

      {/* Session Continuity */}
      <section id="sessions" className="py-20 md:py-[140px] px-5 md:px-12 bg-bg-dark">
        <div className="max-w-[1320px] mx-auto">
          <FadeUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
              {/* Left: Copy */}
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-white/30 mb-4">
                  #04 Session Continuity
                </div>
                <h3 className="font-serif text-[clamp(28px,4vw,52px)] font-normal leading-[1.15] tracking-tight mb-5 text-white">
                  Context resets.<br />Your momentum doesn't.
                </h3>
                <p className="text-[16px] md:text-[17px] text-white/50 leading-[1.75] mb-8">
                  Contxt logs every notable event during your session — decisions made, files edited, tasks completed, errors hit. Every 10 events it builds a rolling snapshot. When Claude hits the context limit, one command restores everything.
                </p>
                <ul className="space-y-4 text-[14px] md:text-[15px] text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
                    <span>Your AI silently logs events via <span className="font-mono text-[12px] md:text-[13px] bg-white/[0.06] px-2 py-0.5 rounded text-white/80">contxt_session_event</span> — no manual work required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
                    <span>A compact snapshot is rebuilt automatically every 10 events and stored in the cloud</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</span>
                    <span>Start a new session, run <span className="font-mono text-[12px] md:text-[13px] bg-white/[0.06] px-2 py-0.5 rounded text-white/80">contxt sessions resume</span> — full context restored in one tool call</span>
                  </li>
                </ul>
              </div>

              {/* Right: Before/After terminal cards */}
              <div className="space-y-4">
                {/* Before */}
                <div className="bg-[#1a0a0a] border border-red-900/40 rounded-[16px] overflow-hidden">
                  <div className="h-10 flex items-center px-4 gap-2 border-b border-red-900/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] flex-shrink-0"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] flex-shrink-0"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] flex-shrink-0"></span>
                    <span className="ml-2 font-mono text-[11px] text-red-400/60">claude code — 3h 12m</span>
                  </div>
                  <div className="p-5 font-mono text-[12px] md:text-[13px] leading-[1.8]">
                    <div className="text-red-400/80">⚠ This conversation cannot be compacted anymore.</div>
                    <div className="text-white/25 text-[11px] mt-1">Start a new session to continue.</div>
                  </div>
                </div>

                {/* After */}
                <div className="bg-[#0a1a0f] border border-green-900/40 rounded-[16px] overflow-hidden">
                  <div className="h-10 flex items-center px-4 gap-2 border-b border-green-900/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] flex-shrink-0"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] flex-shrink-0"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] flex-shrink-0"></span>
                    <span className="ml-2 font-mono text-[11px] text-green-400/60 truncate">~/my-saas-app — new session</span>
                  </div>
                  <div className="p-5 font-mono text-[12px] md:text-[13px] leading-[1.8]">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-white/25">$</span>
                      <span className="text-white/80">contxt sessions resume</span>
                    </div>
                    <div className="text-[#6EE7B7] font-medium">✓ Context restored</div>
                    <div className="text-white/40 text-[11px]">Goal: payment integration · 47 events logged</div>
                    <div className="text-white/40 text-[11px]">Completed: Stripe handler, signature middleware</div>
                    <div className="text-white/40 text-[11px]">In progress: retry queue · Next: integration tests</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Analytics */}
      <section id="analytics" className="py-20 md:py-[140px] px-5 md:px-12 max-w-[1320px] mx-auto">
        <FadeUp>
          <div className="text-center mb-12 md:mb-16">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-3 mb-4">#05 Analytics</div>
            <h2 className="font-serif text-[clamp(36px,6vw,80px)] font-normal leading-[1.0] tracking-[-1px] md:tracking-[-2px] mb-6">
              Know your memory health
            </h2>
            <p className="text-[16px] md:text-[17px] text-text-2 max-w-[600px] mx-auto">
              Track token savings, see what changed since your last session, and surface stale entries before they mislead your AI.
            </p>
          </div>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stats card */}
          <StaggerItem className="bg-bg-dark rounded-[20px] overflow-hidden">
            <div className="h-12 flex items-center px-5 gap-[7px] border-b border-white/[0.06]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]"></span>
              <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]"></span>
              <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]"></span>
              <span className="ml-3 font-mono text-[11.5px] text-white/40">contxt stats</span>
            </div>
            <div className="p-6 md:p-8 font-mono text-[12px] md:text-[13px] leading-[2] text-white/75">
              <div className="text-white/40 mb-2">📊 my-app · last 30 days</div>
              <div className="mb-3">
                <div className="text-white/40 text-[11px] mb-1">MEMORY</div>
                <div>decisions <span className="text-[#6EE7B7] float-right">12</span></div>
                <div>patterns <span className="text-[#6EE7B7] float-right">8</span></div>
                <div>total <span className="text-[#6EE7B7] float-right">23</span></div>
              </div>
              <div className="mb-3 border-t border-white/[0.06] pt-3">
                <div className="text-white/40 text-[11px] mb-1">TOKEN EFFICIENCY</div>
                <div>avg reduction <span className="text-[#6EE7B7] float-right">62%</span></div>
                <div>est. cost saved <span className="text-[#6EE7B7] float-right">$0.84</span></div>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="text-white/40 text-[11px] mb-1">MOST RETRIEVED</div>
                <div className="text-white/60 text-[11px]">1. JWT in httpOnly cookies — 18×</div>
                <div className="text-white/60 text-[11px]">2. API Error Handler — 14×</div>
              </div>
            </div>
          </StaggerItem>

          {/* Diff card */}
          <StaggerItem className="bg-bg-dark rounded-[20px] overflow-hidden">
            <div className="h-12 flex items-center px-5 gap-[7px] border-b border-white/[0.06]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]"></span>
              <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]"></span>
              <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]"></span>
              <span className="ml-3 font-mono text-[11.5px] text-white/40">contxt diff</span>
            </div>
            <div className="p-6 md:p-8 font-mono text-[12px] md:text-[13px] leading-[2] text-white/75">
              <div className="text-white/40 mb-3">Context diff — since 2h ago</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-green-900/60 text-green-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">+</span>
                  <span className="text-white/80 truncate">[decision] Switch to Edge runtime</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-green-900/60 text-green-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">+</span>
                  <span className="text-white/80 truncate">[pattern] Optimistic UI updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">~</span>
                  <span className="text-white/80 truncate">[decision] Use Prisma for ORM  v3→v4</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">~</span>
                  <span className="text-white/80 truncate">[pattern] API Error Handler  v2→v3</span>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <span className="w-4 h-4 rounded-full bg-white/[0.06] text-white/40 flex items-center justify-center text-[10px] font-bold flex-shrink-0">?</span>
                  <span className="text-white/60 truncate">[decision] Use Redux — stale · 45d</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-white/30">
                2 new · 2 updated · 1 stale
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Analytics sub-copy */}
        <FadeUp delay={0.2}>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-[14px] font-semibold text-text-0 mb-1">Token efficiency</div>
              <div className="text-[13px] text-text-3 leading-[1.6]">Track avg tokens returned, reduction %, and estimated cost savings per project.</div>
            </div>
            <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="text-[14px] font-semibold text-text-0 mb-1">Context diff</div>
              <div className="text-[13px] text-text-3 leading-[1.6]">See exactly what changed since your last session — new, updated, and stale entries at a glance.</div>
            </div>
            <div className="bg-white rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-lg bg-[#FFF8E1] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-[14px] font-semibold text-text-0 mb-1">Stale detection</div>
              <div className="text-[13px] text-text-3 leading-[1.6]">Surface memory that hasn't been updated in 30+ days before it starts misleading your AI.</div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Integrations */}
      <div className="py-20 md:py-[140px] px-5 md:px-12 max-w-[1320px] mx-auto">
        <FadeUp>
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-[clamp(36px,6vw,80px)] font-normal leading-[1.0] tracking-[-1px] md:tracking-[-2px] mb-6">
              One integration.<br /><em className="italic">Every tool.</em>
            </h2>
            <p className="text-[16px] md:text-[17px] text-text-2 max-w-[600px] mx-auto">
              Contxt uses MCP, the open standard for AI context. Run <span className="font-mono text-[14px] bg-bg-dark/5 px-2 py-0.5 rounded">contxt init</span> once — it detects installed tools and configures them all.
            </p>
          </div>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark text-white text-[14px] md:text-[15px] font-semibold">Claude Code</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">Gemini CLI</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">VS Code Copilot</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">Cursor</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">Windsurf</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">OpenCode</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">Codex CLI</div>
            <div className="px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-bg-dark/5 text-text-0 text-[14px] md:text-[15px] font-semibold">Zed</div>
          </div>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="text-center">
            <a href="/docs/mcp" className="text-sm font-semibold underline underline-offset-4 decoration-[1.5px] hover:opacity-50 transition-opacity">
              View MCP setup guide →
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20 md:py-[140px] px-5 md:px-12 bg-bg-dark">
        <div className="max-w-[1320px] mx-auto">
          <FadeUp>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-serif text-[clamp(36px,6vw,80px)] font-normal leading-[1.0] tracking-[-1px] md:tracking-[-2px] mb-6 text-white">
                Simple, transparent pricing
              </h2>
              <p className="text-[16px] md:text-[17px] text-white/50">Start free. Scale as you grow.</p>
            </div>
          </FadeUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[860px] mx-auto">
            {/* Free */}
            <StaggerItem className="bg-white/[0.06] rounded-[20px] p-6 md:p-8">
              <div className="text-xs font-mono uppercase tracking-[2px] text-white/40 mb-4">Free</div>
              <div className="mb-6 md:mb-8">
                <div className="font-serif text-[48px] md:text-[56px] font-normal leading-none text-white mb-2">$0</div>
                <div className="text-sm text-white/40">Forever free</div>
              </div>
              <ul className="space-y-3 mb-6 md:mb-8 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>3 projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Up to 1,000 memory entries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Local + cloud sync</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>MCP integration (all platforms)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Session continuity</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Basic search</span>
                </li>
              </ul>
              <a href="/auth/login" className="w-full h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center">
                Get started
              </a>
            </StaggerItem>

            {/* Pro */}
            <StaggerItem className="bg-white rounded-[20px] p-6 md:p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-violet text-white text-xs font-bold uppercase tracking-[1.5px] whitespace-nowrap">
                Most Popular
              </div>
              <div className="text-xs font-mono uppercase tracking-[2px] text-text-3 mb-4">Pro</div>
              <div className="mb-6 md:mb-8">
                <div className="font-serif text-[48px] md:text-[56px] font-normal leading-none text-text-0 mb-2">$29</div>
                <div className="text-sm text-text-3">per month</div>
              </div>
              <ul className="space-y-3 mb-6 md:mb-8 text-sm text-text-2">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Up to 50,000 memory entries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Semantic search (AI-powered)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Branch & version history</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Token analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>API access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <a href="/auth/login" className="w-full h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center justify-center">
                Get started
              </a>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-20 md:py-[140px] px-5 md:px-12 max-w-[1320px] mx-auto">
        <FadeUp>
          <h2 className="font-serif text-[clamp(36px,6vw,80px)] font-normal leading-[1.0] tracking-[-1px] md:tracking-[-2px] mb-6">
            Give your AI<br />a <em className="italic">memory</em>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="text-[16px] md:text-[17px] text-text-2 mb-8 md:mb-11 max-w-[480px] mx-auto">
            Stop repeating yourself. Stop losing session context. Start shipping faster.
          </p>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <a href="/auth/login" className="w-full sm:w-auto h-[52px] px-9 text-[15.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center justify-center">
              Get contxt
            </a>
            <a href="/docs" className="text-[15.5px] font-semibold underline underline-offset-4 decoration-[1.5px] hover:opacity-50 transition-opacity">
              Read the docs
            </a>
          </div>
        </FadeUp>
      </div>

      {/* Footer */}
      <footer className="bg-bg-dark text-text-inv py-8 md:py-10 px-5 md:px-12">
        <div className="max-w-[1320px] mx-auto flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="text-[13px] text-white/20">© 2026 Contxt · Ghost Savvy Studios</div>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <a href="/docs" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">Docs</a>
            <a href="/privacy" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">Privacy</a>
            <a href="/terms" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">Terms</a>
            <a href="https://github.com/kareempjackson/contxt" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/30 hover:text-white/70 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
