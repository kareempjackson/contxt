import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import type { MemoryEntry } from '@mycontxt/core';

interface DiffData {
  projectId: string;
  projectName: string;
  since: Date | null;
  newEntries: MemoryEntry[];
  updatedEntries: MemoryEntry[];
  staleEntries: MemoryEntry[];
}

async function getDiffData(): Promise<DiffData[]> {
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

  const result: DiffData[] = [];

  for (const project of projects) {
    const entries = await db.listEntries({ projectId: project.id, isArchived: false }).catch(() => [] as MemoryEntry[]);

    // Find last session end time
    const sessions = entries
      .filter((e) => e.type === 'session' && e.metadata?.endedAt)
      .sort((a, b) => new Date(b.metadata.endedAt).getTime() - new Date(a.metadata.endedAt).getTime());
    const lastSessionEnd = sessions.length > 0 ? new Date(sessions[0].metadata.endedAt) : null;
    const sinceDate = lastSessionEnd ?? thirtyDaysAgo;

    const nonSessionEntries = entries.filter((e) => e.type !== 'session' && e.status === 'active');

    const newEntries = nonSessionEntries.filter((e) => e.createdAt > sinceDate);
    const updatedEntries = nonSessionEntries.filter(
      (e) => e.createdAt <= sinceDate && e.updatedAt > sinceDate && e.version > 1
    );
    const staleEntries = nonSessionEntries.filter((e) => e.updatedAt < thirtyDaysAgo);

    result.push({
      projectId: project.id,
      projectName: project.name,
      since: lastSessionEnd,
      newEntries,
      updatedEntries,
      staleEntries,
    });
  }

  return result;
}

function typeTag(type: string) {
  const colors: Record<string, string> = {
    decision: 'text-blue bg-blue/8',
    pattern: 'text-violet bg-violet/8',
    context: 'text-teal bg-teal/8',
    document: 'text-amber-600 bg-amber-50',
  };
  return (
    <span className={`inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[type] ?? 'text-text-3 bg-black/5'}`}>
      {type}
    </span>
  );
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default async function DiffPage() {
  const diffs = await getDiffData();
  const hasAny = diffs.some(
    (d) => d.newEntries.length > 0 || d.updatedEntries.length > 0 || d.staleEntries.length > 0
  );

  return (
    <>
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Context Diff</h1>
        <span className="text-[12px] text-text-3">Changes since your last session</span>
      </div>

      {diffs.length === 0 && (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[14px] font-semibold text-text-0 mb-1">No projects yet</div>
          <p className="text-[12.5px] text-text-2">Initialize a project to start tracking context changes.</p>
        </div>
      )}

      {!hasAny && diffs.length > 0 && (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[14px] font-semibold text-text-0 mb-1">No changes</div>
          <p className="text-[12.5px] text-text-2">Everything is up to date since your last session.</p>
        </div>
      )}

      <div className="space-y-4">
        {diffs.map((d) => {
          if (d.newEntries.length === 0 && d.updatedEntries.length === 0 && d.staleEntries.length === 0) return null;
          return (
            <div key={d.projectId} className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Project header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.05]">
                <a
                  href={`/dashboard/projects/${encodeURIComponent(d.projectName)}`}
                  className="text-[13.5px] font-semibold text-text-0 hover:text-blue transition-colors"
                >
                  {d.projectName}
                </a>
                <span className="text-[11px] text-text-3">
                  {d.since ? `since ${timeAgo(d.since)}` : 'last 30 days'}
                </span>
              </div>

              <div className="divide-y divide-black/[0.04]">
                {/* NEW */}
                {d.newEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-[10px] font-bold flex-shrink-0">+</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {typeTag(e.type)}
                      <span className="text-[13px] text-text-0 truncate">{e.title}</span>
                    </div>
                    <span className="text-[11.5px] text-text-3 flex-shrink-0">{timeAgo(e.createdAt)}</span>
                  </div>
                ))}

                {/* UPDATED */}
                {d.updatedEntries.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold flex-shrink-0">~</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {typeTag(e.type)}
                      <span className="text-[13px] text-text-0 truncate">{e.title}</span>
                      <span className="text-[11px] text-text-3 flex-shrink-0">v{e.version}</span>
                    </div>
                    <span className="text-[11.5px] text-text-3 flex-shrink-0">{timeAgo(e.updatedAt)}</span>
                  </div>
                ))}

                {/* STALE */}
                {d.staleEntries.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3 opacity-50">
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-black/[0.06] text-text-3 text-[10px] font-bold flex-shrink-0">?</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {typeTag(e.type)}
                      <span className="text-[13px] text-text-2 truncate">{e.title}</span>
                    </div>
                    <span className="text-[11.5px] text-text-3 flex-shrink-0">stale · {timeAgo(e.updatedAt)}</span>
                  </div>
                ))}
                {d.staleEntries.length > 5 && (
                  <div className="px-5 py-2.5 text-[12px] text-text-3 opacity-50">
                    + {d.staleEntries.length - 5} more stale entries
                  </div>
                )}
              </div>

              {/* Summary footer */}
              <div className="px-5 py-2.5 bg-black/[0.02] border-t border-black/[0.04] flex gap-3">
                {d.newEntries.length > 0 && (
                  <span className="text-[11px] font-semibold text-green-600">{d.newEntries.length} new</span>
                )}
                {d.updatedEntries.length > 0 && (
                  <span className="text-[11px] font-semibold text-amber-600">{d.updatedEntries.length} updated</span>
                )}
                {d.staleEntries.length > 0 && (
                  <span className="text-[11px] font-semibold text-text-3">{d.staleEntries.length} stale</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
