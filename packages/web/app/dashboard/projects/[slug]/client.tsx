'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../../lib/store/hooks';
import { openEntry } from '../../../../lib/store/panel-slice';
import {
  useGetEntriesQuery,
  useGetBranchesQuery,
  useGetSessionsQuery,
} from '../../../../lib/store/api';
import { EntryPanel } from '../../../components/entry-panel';
import { usePanelUrl } from '../../../../lib/hooks/use-panel-url';
import type { Project, MemoryEntryType } from '@mycontxt/core';

const TYPE_BADGES: Record<string, string> = {
  decision: 'bg-blue/10 text-blue',
  pattern: 'bg-violet/10 text-[#A855F7]',
  context: 'bg-amber/10 text-amber',
  document: 'bg-teal/10 text-teal',
  session: 'bg-rose/10 text-rose',
};

const TYPE_FILTERS: { label: string; value: MemoryEntryType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Decisions', value: 'decision' },
  { label: 'Patterns', value: 'pattern' },
  { label: 'Context', value: 'context' },
  { label: 'Docs', value: 'document' },
  { label: 'Sessions', value: 'session' },
];

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const tab = searchParams.get('tab') || 'memory';
  const typeFilter = (searchParams.get('type') || 'all') as MemoryEntryType | 'all';
  const branch = searchParams.get('branch') || project.config.defaultBranch;

  usePanelUrl();

  const { data: entries = [], isLoading } = useGetEntriesQuery({
    projectId: project.id,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    branch,
    isArchived: false,
  });

  const { data: branches = [] } = useGetBranchesQuery(project.id, { skip: tab !== 'branches' });
  const { data: sessions = [] } = useGetSessionsQuery({ projectId: project.id }, { skip: tab !== 'sessions' });

  function setTab(t: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('tab', t);
    router.push(`?${sp.toString()}`);
  }

  function setTypeFilter(type: MemoryEntryType | 'all') {
    const sp = new URLSearchParams(searchParams.toString());
    if (type === 'all') sp.delete('type');
    else sp.set('type', type);
    router.push(`?${sp.toString()}`);
  }

  const tabs = ['Memory', 'Branches', 'Sessions', 'History', 'Settings'];

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] mb-6 mt-1">
        <a href="/dashboard" className="text-text-2 hover:text-text-0 transition-colors">Projects</a>
        <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-text-0 font-medium">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-[20px] font-bold tracking-[-0.5px] text-text-0">{project.name}</h1>
        <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-full bg-black/[0.04] text-text-2">
          {branch}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button className="h-8 px-3 text-[12.5px] font-medium text-text-2 border border-black/[0.08] rounded-[9px] hover:bg-black/[0.03] transition-all">
            Export
          </button>
          <button className="h-8 px-3 text-[12.5px] font-semibold bg-bg-dark text-white rounded-[9px] hover:bg-[#333] transition-all">
            Add entry
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-text-2 mb-6">
        <span><strong className="font-semibold text-text-1">Synced</strong> {timeAgo(project.updatedAt)}</span>
        <span><strong className="font-semibold text-text-1">Entries</strong> {entries.length}</span>
        {project.stack?.map((t) => (
          <span key={t} className="font-mono text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-black/[0.035] text-text-2">{t}</span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-black/[0.06]">
        {tabs.map((t) => {
          const key = t.toLowerCase();
          const isActive = tab === key;
          return (
            <button
              key={t}
              onClick={() => setTab(key)}
              className={`h-9 px-3.5 text-[13px] font-medium transition-all relative ${
                isActive
                  ? 'text-text-0 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-text-0 after:rounded-full'
                  : 'text-text-2 hover:text-text-1'
              }`}
            >
              {t}
              {t === 'Memory' && entries.length > 0 && (
                <span className="ml-1 font-mono text-[10px] text-text-3">{entries.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Memory Tab */}
      {tab === 'memory' && (
        <>
          <div className="flex gap-1.5 mb-4 flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`h-[28px] px-3 rounded-full text-[12px] font-medium transition-all ${
                  typeFilter === f.value
                    ? 'bg-text-0 text-white'
                    : 'bg-black/[0.04] text-text-2 hover:bg-black/[0.07]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="space-y-1.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-[60px] bg-white rounded-[12px] animate-pulse opacity-60" />
              ))}
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="text-[14px] font-semibold text-text-0 mb-1">No entries yet</div>
              <p className="text-[12.5px] text-text-2 mb-3">Start capturing context from the terminal:</p>
              <pre className="text-[12px] font-mono text-text-1 bg-[#F6F6F6] rounded-[10px] px-4 py-2.5 inline-block">
                contxt decision add
              </pre>
            </div>
          )}

          {!isLoading && entries.length > 0 && (
            <div className="space-y-1">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => dispatch(openEntry(entry.id))}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-[12px] text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:-translate-y-[0.5px] transition-all"
                >
                  <span className={`text-[10.5px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_BADGES[entry.type] ?? ''}`}>
                    {entry.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-text-0 truncate">{entry.title}</div>
                    <div className="text-[12px] text-text-3 truncate mt-0.5 line-clamp-1">{entry.content}</div>
                  </div>
                  <div className="flex items-center gap-3 text-[11.5px] text-text-3 flex-shrink-0">
                    <span>v{entry.version}</span>
                    <span>{timeAgo(entry.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Branches Tab */}
      {tab === 'branches' && (
        <div className="space-y-1">
          {branches.length === 0 && <div className="text-[13px] text-text-2 py-4">No branches found.</div>}
          {branches.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <span className="text-text-3 text-[15px]">⎇</span>
              <span className="text-[13px] font-medium text-text-0">{b.name}</span>
              {b.isActive && <span className="ml-auto font-mono text-[10px] text-green">active</span>}
            </div>
          ))}
        </div>
      )}

      {/* Sessions Tab */}
      {tab === 'sessions' && (
        <div className="space-y-2">
          {sessions.length === 0 && (
            <div className="text-[13px] text-text-2 py-4">
              No sessions yet. Sessions are auto-captured when using MCP or{' '}
              <code className="font-mono text-[12px] bg-black/[0.04] px-1.5 py-0.5 rounded">contxt watch</code>.
            </div>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="px-4 py-3.5 bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="text-[13.5px] font-semibold text-text-0 mb-1">{s.title}</div>
              <div className="text-[12px] text-text-3">{timeAgo(s.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      {/* History & Settings tabs — minimal for now */}
      {tab === 'history' && (
        <div className="text-[13px] text-text-2 py-4">History coming in Phase 2.</div>
      )}
      {tab === 'settings' && (
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[14px] font-semibold text-text-0 mb-4">Project Settings</div>
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between"><span className="text-text-2">Name</span><span className="font-medium text-text-0">{project.name}</span></div>
            <div className="flex justify-between"><span className="text-text-2">Default branch</span><span className="font-mono text-text-1">{project.config.defaultBranch}</span></div>
            <div className="flex justify-between"><span className="text-text-2">Max tokens</span><span className="font-mono text-text-1">{project.config.maxTokens.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-2">Auto session</span><span className="text-text-1">{project.config.autoSession ? 'Enabled' : 'Disabled'}</span></div>
          </div>
        </div>
      )}

      <EntryPanel />
    </>
  );
}
