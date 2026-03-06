'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../../lib/store/hooks';
import { openEntry } from '../../../../lib/store/panel-slice';
import {
  useGetEntriesQuery,
  useGetBranchesQuery,
  useGetSessionsQuery,
  useUpdateProjectMutation,
} from '../../../../lib/store/api';
import { EntryPanel } from '../../../components/entry-panel';
import { usePanelUrl } from '../../../../lib/hooks/use-panel-url';
import { useAutoSync } from '../../../../lib/hooks/use-auto-sync';
import type { Project, MemoryEntryType, ProjectConfig } from '@mycontxt/core';

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
  planId: string;
}

export function ProjectDetailClient({ project, planId }: ProjectDetailClientProps) {
  const isFree = planId === 'free';
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

  const [updateProject, { isLoading: isSaving }] = useUpdateProjectMutation();
  const [config, setConfig] = useState<ProjectConfig>(project.config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync local config state if project prop changes
  useEffect(() => { setConfig(project.config); }, [project.config]);

  // Auto-sync polling
  useAutoSync(project);

  async function saveSettings() {
    await updateProject({ id: project.id, config });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

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

  const tabs = ['Memory', 'Branches', 'Sessions', 'Settings'];

  async function handleExport() {
    const res = await fetch(`/api/user/export?projectId=${project.id}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contxt-export-${project.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
          <button onClick={handleExport} className="h-8 px-3 text-[12.5px] font-medium text-text-2 border border-black/[0.08] rounded-[9px] hover:bg-black/[0.03] transition-all">
            Export
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
        isFree ? (
          <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-full bg-violet/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-[14px] font-semibold text-text-0 mb-1">Branching is a Pro feature</div>
            <p className="text-[12.5px] text-text-2 mb-4">Create isolated context branches for features, experiments, or team members.</p>
            <a
              href="/dashboard/settings"
              className="inline-flex items-center h-9 px-5 text-[13px] font-semibold text-white bg-violet rounded-[9px] hover:bg-violet-dark transition-colors"
            >
              Upgrade to Pro →
            </a>
          </div>
        ) : (
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
        )
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

      {tab === 'settings' && (
        <div className="space-y-4 max-w-130">
          {/* Info */}
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="text-[13px] font-semibold text-text-0 mb-3">Project Info</div>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-text-2">Name</span>
                <span className="font-medium text-text-0">{project.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-2">Default branch</span>
                <span className="font-mono text-[12px] text-text-1">{config.defaultBranch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-2">Max tokens</span>
                <span className="font-mono text-[12px] text-text-1">{config.maxTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Capture */}
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="text-[13px] font-semibold text-text-0 mb-3">Capture</div>
            <div className="space-y-3">
              <ToggleRow
                label="Auto session"
                description="Automatically start a session when you begin working"
                checked={config.autoSession}
                onChange={(v) => setConfig((c) => ({ ...c, autoSession: v }))}
              />
              <ToggleRow
                label="Stack detection"
                description="Automatically detect your project's tech stack"
                checked={config.stackDetection}
                onChange={(v) => setConfig((c) => ({ ...c, stackDetection: v }))}
              />
            </div>
          </div>

          {/* Sync */}
          <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="text-[13px] font-semibold text-text-0 mb-3">Sync</div>
            <div className="space-y-3">
              <ToggleRow
                label="Auto sync"
                description="Automatically refresh entries from the cloud at a set interval"
                checked={config.autoSync ?? false}
                onChange={(v) => setConfig((c) => ({ ...c, autoSync: v }))}
              />
              {config.autoSync && (
                <div className="flex justify-between items-center pl-11">
                  <span className="text-[12.5px] text-text-2">Sync interval</span>
                  <select
                    value={config.syncIntervalMinutes ?? 15}
                    onChange={(e) => setConfig((c) => ({ ...c, syncIntervalMinutes: Number(e.target.value) }))}
                    className="text-[12.5px] font-medium text-text-1 bg-black/4 rounded-[7px] px-2.5 py-1 border-none outline-none cursor-pointer"
                  >
                    <option value={5}>Every 5 min</option>
                    <option value={15}>Every 15 min</option>
                    <option value={30}>Every 30 min</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="h-9 px-5 text-[13px] font-semibold bg-bg-dark text-white rounded-[9px] hover:bg-[#333] transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save settings'}
            </button>
            {saveSuccess && (
              <span className="text-[12.5px] text-green font-medium">Saved</span>
            )}
          </div>
        </div>
      )}

      <EntryPanel />
    </>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[13px] font-medium text-text-0">{label}</div>
        <div className="text-[12px] text-text-3 mt-0.5">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors duration-150 mt-0.5 ${
          checked ? 'bg-bg-dark' : 'bg-black/10'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
