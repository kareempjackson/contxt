'use client';

import { useState, useMemo } from 'react';
import type { Project } from '@mycontxt/core';
import { ProjectsList } from './projects-client';

type SortKey = 'updated' | 'name-asc' | 'name-desc';

const SORT_LABELS: Record<SortKey, string> = {
  updated: 'Recently Updated',
  'name-asc': 'Name A→Z',
  'name-desc': 'Name Z→A',
};

const SORT_CYCLE: SortKey[] = ['updated', 'name-asc', 'name-desc'];

export function ProjectsFilter({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('updated');

  function cycleSort() {
    const idx = SORT_CYCLE.indexOf(sort);
    setSort(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const result = q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : [...projects];

    if (sort === 'name-asc') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'name-desc') result.sort((a, b) => b.name.localeCompare(a.name));
    else result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return result;
  }, [projects, query, sort]);

  return (
    <>
      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.75 h-3.75 text-text-3 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full h-10 px-3.5 pl-9.5 text-[13px] text-text-0 bg-white border-none rounded-[10px] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.03),0_0_1px_rgba(0,0,0,0.04)] transition-shadow focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1),0_1px_3px_rgba(0,0,0,0.03)] placeholder:text-text-3"
          />
        </div>
        <button
          onClick={cycleSort}
          className="h-10 px-3.5 flex items-center gap-2 text-[12.5px] font-medium text-text-2 bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all"
        >
          <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {SORT_LABELS[sort]}
        </button>
      </div>

      <div className="text-[12.5px] text-text-2 mb-4">
        Showing {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        {query && ` matching "${query}"`}
      </div>

      <ProjectsList projects={filtered} />
    </>
  );
}
