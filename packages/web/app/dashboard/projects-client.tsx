'use client';

import type { Project } from '@mycontxt/core';

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function ProjectsList({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <a
          key={project.id}
          href={`/dashboard/projects/${encodeURIComponent(project.name)}`}
          className="block bg-white rounded-[14px] p-6 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:-translate-y-px transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[15px] font-bold text-blue tracking-[-0.2px]">{project.name}</span>
            <span className="w-1.75 h-1.75 rounded-full bg-green" />
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={(e) => e.preventDefault()}
                className="h-8 px-3 text-[12.5px] font-semibold bg-white text-text-1 rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all"
              >
                Connect
              </button>
              <button
                onClick={(e) => e.preventDefault()}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-3 hover:bg-black/[0.028] hover:text-text-1 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-text-2 mb-4">
            <span>
              <strong className="font-semibold text-text-1">Branch</strong> {project.config.defaultBranch}
            </span>
            <span>
              <strong className="font-semibold text-text-1">Synced</strong> {timeAgo(project.updatedAt)}
            </span>
          </div>
          {project.stack && project.stack.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-black/[0.035] text-text-2"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
