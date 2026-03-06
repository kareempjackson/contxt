'use client';

import { useState } from 'react';
import type { Project } from '@mycontxt/core';

const PROJECT_COLORS = [
  '#0A84FF', '#BF5AF2', '#64D2FF', '#FF9F0A',
  '#30D158', '#FF375F', '#FFD60A', '#AC8E68',
];

interface SidebarUser {
  name: string;
  email: string;
  initials: string;
}

interface DashboardSidebarProps {
  projects: Project[];
  draftCount: number;
  user: SidebarUser;
  planId: string;
  planName: string;
  maxProjects: number | null;
  maxEntries: number | null;
}

export function DashboardSidebar({ projects, draftCount, user, planId, planName, maxProjects, maxEntries }: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden w-8 h-8 flex items-center justify-center rounded-[8px] bg-white shadow-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg className="w-4 h-4 text-text-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside
        className={`w-[244px] bg-[#FBFBFB] flex flex-col flex-shrink-0 overflow-y-auto transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-50 h-full`}
      >
        {/* Header */}
        <div className="h-14 flex items-center gap-2.5 px-4 mb-1">
          <span className="font-bold text-[15px] tracking-tight text-text-0">contxt</span>
          {planId !== 'free' && (
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wide px-[7px] py-[3px] rounded-full bg-bg-dark text-text-inv">
              {planName}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-2.5 mb-3 relative">
          <input
            type="text"
            placeholder="Search memory…"
            className="w-full h-[34px] px-3 pl-8 bg-black/[0.035] border-[1.5px] border-transparent rounded-[9px] text-[12.5px] text-text-0 placeholder:text-text-3 outline-none transition-all focus:bg-white focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
          />
          <svg
            className="absolute left-[18px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-3 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9.5px] text-text-3 px-[5px] py-[2px] rounded bg-white/70">
            ⌘K
          </span>
        </div>

        {/* Navigation */}
        <nav className="px-2 flex-1">
          <div className="mb-0.5">
            <a
              href="/dashboard"
              className="flex items-center gap-2 h-[34px] px-3 rounded-[9px] text-[13px] font-medium text-text-0 bg-black/5 transition-all"
            >
              <svg className="w-4 h-4 text-text-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Projects
              <span className="ml-auto font-mono text-[10px] text-text-3">{projects.length}</span>
            </a>
            <a
              href="/dashboard/search"
              className="flex items-center gap-2 h-[34px] px-3 rounded-[9px] text-[13px] font-medium text-text-2 hover:bg-black/[0.028] hover:text-text-1 transition-all"
            >
              <svg className="w-4 h-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </a>
            <a
              href="/dashboard/activity"
              className="flex items-center gap-2 h-[34px] px-3 rounded-[9px] text-[13px] font-medium text-text-2 hover:bg-black/[0.028] hover:text-text-1 transition-all"
            >
              <svg className="w-4 h-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Activity
            </a>
            {draftCount > 0 && (
              <a
                href="/dashboard/review"
                className="flex items-center gap-2 h-[34px] px-3 rounded-[9px] text-[13px] font-medium text-text-2 hover:bg-black/[0.028] hover:text-text-1 transition-all"
              >
                <svg className="w-4 h-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Review
                <span className="ml-auto font-mono text-[10px] font-semibold bg-blue text-white px-[6px] py-[1px] rounded-full">
                  {draftCount}
                </span>
              </a>
            )}
          </div>

          {/* Projects list */}
          <div className="mt-5 mb-0.5">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[1px] text-text-3 px-3 py-5 pb-1.5">
              Projects
            </div>
            {projects.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-text-3">
                No projects yet
              </div>
            )}
            {projects.map((project, idx) => (
              <a
                key={project.id}
                href={`/dashboard/projects/${encodeURIComponent(project.name)}`}
                className="flex items-center gap-2 h-8 px-3 rounded-[9px] text-[13px] font-medium text-text-2 hover:bg-black/[0.028] hover:text-text-1 transition-all"
              >
                <span
                  className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                  style={{ background: PROJECT_COLORS[idx % PROJECT_COLORS.length] }}
                />
                <span className="flex-1 truncate">{project.name}</span>
              </a>
            ))}
          </div>

          {/* Account */}
          <div className="mt-5">
            <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[1px] text-text-3 px-3 py-5 pb-1.5">
              Account
            </div>
            <a
              href="/dashboard/settings"
              className="flex items-center gap-2 h-[34px] px-3 rounded-[9px] text-[13px] font-medium text-text-2 hover:bg-black/[0.028] hover:text-text-1 transition-all"
            >
              <svg className="w-4 h-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
          </div>
        </nav>

        {/* Usage Meters */}
        <div className="m-1.5 mt-1 p-3.5 pb-4 rounded-[14px] bg-black/[0.035]">
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[1px] text-text-3 mb-3">Usage</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[11.5px] font-medium text-text-2">Projects</span>
                <span className="font-mono text-[10.5px] font-medium text-text-1">
                  {projects.length} / {maxProjects === null ? '∞' : maxProjects}
                </span>
              </div>
              <div className="h-[3px] bg-black/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue rounded-full"
                  style={{ width: maxProjects === null ? '0%' : `${Math.min((projects.length / maxProjects) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          {planId === 'free' && (
            <a
              href="/dashboard/settings"
              className="mt-3 block text-center text-[11px] font-semibold text-violet hover:text-violet-dark transition-colors"
            >
              Upgrade to Pro →
            </a>
          )}
        </div>

        {/* User */}
        <div className="mx-2 mt-2 mb-0 flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer hover:bg-black/[0.028] transition-all">
          <div className="w-7 h-7 rounded-[9px] bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {user.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-text-0 truncate">{user.name}</div>
            <div className="text-[10.5px] text-text-3 truncate">{user.email}</div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}
