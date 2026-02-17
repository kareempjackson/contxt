'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../lib/store/hooks';
import { openEntry } from '../../../lib/store/panel-slice';
import { useSearchEntriesQuery, useSearchAllQuery } from '../../../lib/store/api';
import { EntryPanel } from '../../components/entry-panel';
import { usePanelUrl } from '../../../lib/hooks/use-panel-url';
import type { Project } from '@contxt/core';

const TYPE_BADGES: Record<string, string> = {
  decision: 'bg-blue/10 text-blue',
  pattern: 'bg-violet/10 text-[#A855F7]',
  context: 'bg-amber/10 text-amber',
  document: 'bg-teal/10 text-teal',
  session: 'bg-rose/10 text-rose',
};

interface Props {
  userId: string;
  projects: Project[];
}

export function SearchClient({ userId, projects }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const urlQuery = searchParams.get('q') || '';
  const urlProject = searchParams.get('project') || 'all';
  const [inputValue, setInputValue] = useState(urlQuery);

  usePanelUrl();

  // Cross-project search (all projects)
  const { data: allResults = [], isFetching: fetchingAll } = useSearchAllQuery(
    { userId, query: urlQuery },
    { skip: !urlQuery || urlProject !== 'all' }
  );

  // Single-project search
  const { data: projectResults = [], isFetching: fetchingProject } = useSearchEntriesQuery(
    { projectId: urlProject, query: urlQuery, limit: 30 },
    { skip: !urlQuery || urlProject === 'all' }
  );

  const results = urlProject === 'all' ? allResults : projectResults;
  const isFetching = fetchingAll || fetchingProject;

  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('q', inputValue.trim());
    router.push(`?${sp.toString()}`);
  }

  function handleProjectChange(projectId: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (projectId === 'all') {
      sp.delete('project');
    } else {
      sp.set('project', projectId);
    }
    router.push(`?${sp.toString()}`);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Search</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search your memory…"
            className="w-full h-11 px-3.5 pl-10 text-[14px] text-text-0 bg-white border-none rounded-[10px] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1)] transition-shadow placeholder:text-text-3"
            autoFocus
          />
          {inputValue && (
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 h-7 px-3 text-[12px] font-semibold bg-blue text-white rounded-[7px] hover:bg-[#0070E0] transition-colors">
              Search
            </button>
          )}
        </div>
      </form>

      {/* Project filter */}
      {projects.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => handleProjectChange('all')}
            className={`flex-shrink-0 h-7 px-3 text-[12px] font-medium rounded-full transition-colors ${
              urlProject === 'all'
                ? 'bg-blue text-white'
                : 'bg-white text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-text-0'
            }`}
          >
            All projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProjectChange(p.id)}
              className={`flex-shrink-0 h-7 px-3 text-[12px] font-medium rounded-full transition-colors ${
                urlProject === p.id
                  ? 'bg-blue text-white'
                  : 'bg-white text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-text-0'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {isFetching && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-white rounded-[12px] animate-pulse opacity-60" />
          ))}
        </div>
      )}

      {!urlQuery && !isFetching && (
        <div className="text-[13px] text-text-3 py-6 text-center">
          Type a query to search across your memory entries.
        </div>
      )}

      {urlQuery && !isFetching && (
        <>
          {results.length > 0 && (
            <div className="text-[12.5px] text-text-2 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{urlQuery}&rdquo;
            </div>
          )}

          {results.length === 0 && (
            <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="text-[14px] font-semibold text-text-0 mb-1">No results</div>
              <p className="text-[12.5px] text-text-2">Try broader terms or a different project filter.</p>
            </div>
          )}

          <div className="space-y-1">
            {results.map((entry) => (
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
                  <div className="text-[12px] text-text-3 truncate mt-0.5">{entry.content.slice(0, 100)}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <EntryPanel />
    </>
  );
}
