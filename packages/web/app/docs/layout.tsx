'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { name: 'Introduction', href: '/docs' },
      { name: 'Installation', href: '/docs/installation' },
      { name: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { name: 'Memory Types', href: '/docs/memory-types' },
      { name: 'Branching', href: '/docs/branching' },
      { name: 'Sync & Cloud', href: '/docs/sync' },
    ],
  },
  {
    title: 'Passive Capture',
    items: [
      { name: 'Overview', href: '/docs/passive-capture' },
      { name: 'Scan (Code Tags)', href: '/docs/scan' },
      { name: 'Rules File', href: '/docs/rules-sync' },
      { name: 'Import Sources', href: '/docs/capture' },
      { name: 'Git Hooks', href: '/docs/git-hooks' },
      { name: 'Watch Daemon', href: '/docs/watch' },
      { name: 'Review Queue', href: '/docs/review' },
    ],
  },
  {
    title: 'CLI Reference',
    items: [
      { name: 'add (smart capture)', href: '/docs/cli/add' },
      { name: 'init', href: '/docs/cli/init' },
      { name: 'decision', href: '/docs/cli/decision' },
      { name: 'pattern', href: '/docs/cli/pattern' },
      { name: 'context', href: '/docs/cli/context' },
      { name: 'push / pull', href: '/docs/cli/sync' },
      { name: 'auth', href: '/docs/cli/auth' },
      { name: 'hook', href: '/docs/cli/hook' },
      { name: 'billing', href: '/docs/cli/billing' },
      { name: 'status', href: '/docs/cli/status' },
      { name: 'suggest', href: '/docs/cli/suggest' },
      { name: 'stats', href: '/docs/cli/stats' },
      { name: 'diff', href: '/docs/cli/diff' },
      { name: 'sessions', href: '/docs/cli/sessions' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { name: 'MCP Setup', href: '/docs/mcp' },
      { name: 'Claude Code', href: '/docs/claude-code' },
      { name: 'Cursor', href: '/docs/cursor' },
      { name: 'GitHub Copilot', href: '/docs/copilot' },
      { name: 'Windsurf', href: '/docs/windsurf' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { name: 'API Reference', href: '/docs/api' },
      { name: 'Self-Hosting', href: '/docs/self-hosting' },
      { name: 'Configuration', href: '/docs/config' },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Top Nav */}
      <nav className="flex-shrink-0 h-16 bg-white border-b border-border">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="font-bold text-[17px] tracking-tight">
              contxt
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-text-2 hover:text-text-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a
              href={isLoggedIn ? '/dashboard' : '/auth/signup'}
              className="h-9 px-5 text-[13.5px] font-semibold rounded-full bg-bg-dark text-text-inv hover:bg-[#333] transition-colors flex items-center justify-center"
            >
              {isLoggedIn ? 'Return to dashboard' : 'Get started'}
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed, non-scrolling */}
        <aside
          className={`fixed md:relative top-16 md:top-0 left-0 bottom-0 w-[260px] bg-white border-r border-border flex-shrink-0 transition-transform duration-300 z-40 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Search */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search docs..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-bg text-sm text-text-0 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-violet/20 focus:border-violet transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Navigation */}
              <nav className="space-y-6 pb-6">
                {navigation.map((section) => (
                  <div key={section.title}>
                    <div className="font-mono text-[10.5px] font-bold uppercase tracking-[1.5px] text-text-3 mb-3">
                      {section.title}
                    </div>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="block px-3 py-1.5 text-[14px] text-text-2 hover:text-text-0 hover:bg-bg rounded-md transition-colors"
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[800px] mx-auto px-6 md:px-12 py-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
