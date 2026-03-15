import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import type { MemoryEntry } from '@mycontxt/core';

interface ProjectStats {
  projectId: string;
  projectName: string;
  decisions: number;
  patterns: number;
  documents: number;
  sessions: number;
  total: number;
  stale: number;
}

async function getStats(): Promise<ProjectStats[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: { session } } = await supabase.auth.getSession();

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken: session?.access_token,
  });

  const projects = await db.getProjects(user.id).catch(() => []);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const stats: ProjectStats[] = [];
  for (const project of projects) {
    const entries = await db.listEntries({ projectId: project.id, isArchived: false }).catch(() => [] as MemoryEntry[]);
    const decisions = entries.filter((e) => e.type === 'decision' && e.status === 'active').length;
    const patterns = entries.filter((e) => e.type === 'pattern' && e.status === 'active').length;
    const documents = entries.filter((e) => e.type === 'document' && e.status === 'active').length;
    const sessions = entries.filter((e) => e.type === 'session').length;
    const stale = entries.filter(
      (e) => e.type !== 'session' && e.status === 'active' && e.updatedAt < thirtyDaysAgo
    ).length;
    stats.push({
      projectId: project.id,
      projectName: project.name,
      decisions,
      patterns,
      documents,
      sessions,
      total: decisions + patterns + documents,
      stale,
    });
  }

  return stats;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="text-[12px] font-mono font-semibold uppercase tracking-wide text-text-3 mb-1">{label}</div>
      <div className="text-[26px] font-bold tracking-tight text-text-0">{value}</div>
      {sub && <div className="text-[12px] text-text-3 mt-0.5">{sub}</div>}
    </div>
  );
}

export default async function StatsPage() {
  const stats = await getStats();
  const totalEntries = stats.reduce((s, p) => s + p.total, 0);
  const totalDecisions = stats.reduce((s, p) => s + p.decisions, 0);
  const totalPatterns = stats.reduce((s, p) => s + p.patterns, 0);
  const totalSessions = stats.reduce((s, p) => s + p.sessions, 0);
  const totalStale = stats.reduce((s, p) => s + p.stale, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Stats</h1>
        <span className="text-[12px] text-text-3">Last 30 days</span>
      </div>

      {stats.length === 0 && (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[14px] font-semibold text-text-0 mb-1">No projects yet</div>
          <p className="text-[12.5px] text-text-2 mb-3">Initialize a project to start tracking stats:</p>
          <pre className="text-[12px] font-mono text-text-1 bg-[#F6F6F6] rounded-[10px] px-4 py-2.5 inline-block">
            contxt init
          </pre>
        </div>
      )}

      {stats.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Entries" value={totalEntries.toLocaleString()} />
            <StatCard label="Decisions" value={totalDecisions.toLocaleString()} />
            <StatCard label="Patterns" value={totalPatterns.toLocaleString()} />
            <StatCard label="Sessions" value={totalSessions.toLocaleString()} />
          </div>

          {/* Token analytics note */}
          <div className="bg-[#F0F6FF] border border-blue/20 rounded-[14px] p-5 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-blue mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-[13px] font-semibold text-text-0 mb-1">Token efficiency analytics</div>
                <p className="text-[12.5px] text-text-2">
                  Detailed token usage, reduction percentages, and cost savings are tracked locally by the CLI.
                  Run <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded text-[11.5px]">contxt stats</code> in your project directory to see full analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Per-project breakdown */}
          <div className="mb-2">
            <h2 className="text-[14px] font-bold tracking-[-0.3px] mb-3">Per-project breakdown</h2>
            <div className="space-y-2">
              {stats.map((p) => (
                <div key={p.projectId} className="bg-white rounded-[12px] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between mb-3">
                    <a
                      href={`/dashboard/projects/${encodeURIComponent(p.projectName)}`}
                      className="text-[13.5px] font-semibold text-text-0 hover:text-blue transition-colors"
                    >
                      {p.projectName}
                    </a>
                    {p.stale > 0 && (
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {p.stale} stale
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {[
                      { label: 'Decisions', count: p.decisions },
                      { label: 'Patterns', count: p.patterns },
                      { label: 'Docs', count: p.documents },
                      { label: 'Sessions', count: p.sessions },
                    ].map(({ label, count }) => (
                      <div key={label} className="text-center">
                        <div className="text-[15px] font-bold text-text-0">{count}</div>
                        <div className="text-[11px] text-text-3">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stale notice */}
          {totalStale > 0 && (
            <div className="mt-4 bg-white rounded-[12px] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="text-[13px] font-semibold text-text-0 mb-1">
                {totalStale} stale {totalStale === 1 ? 'entry' : 'entries'} (not updated in 30+ days)
              </div>
              <p className="text-[12px] text-text-3">
                Run <code className="font-mono bg-[#F6F6F6] px-1.5 py-0.5 rounded text-[11px]">contxt review --stale</code> to clean up outdated memory.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}
