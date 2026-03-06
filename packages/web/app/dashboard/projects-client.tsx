'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@mycontxt/core';

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function ProjectsList({ projects: initialProjects }: { projects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [connectProject, setConnectProject] = useState<Project | null>(null);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuProjectId(null);
      }
    }
    if (menuProjectId) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuProjectId]);

  async function handleDelete(project: Project) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        setDeleteProject(null);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  function handleCopyCommands(project: Project) {
    const commands = `cd your-project-directory\ncontxt init\ncontxt push`;
    navigator.clipboard.writeText(commands).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
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
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConnectProject(project); }}
                  className="h-8 px-3 text-[12.5px] font-semibold bg-white text-text-1 rounded-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all"
                >
                  Connect
                </button>
                <div className="relative" ref={menuProjectId === project.id ? menuRef : undefined}>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuProjectId(menuProjectId === project.id ? null : project.id); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-text-3 hover:bg-black/[0.028] hover:text-text-1 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  {menuProjectId === project.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-[10px] shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-black/[0.06] z-20 py-1 overflow-hidden">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuProjectId(null); router.push(`/dashboard/projects/${encodeURIComponent(project.name)}`); }}
                        className="w-full text-left px-3.5 py-2 text-[13px] text-text-1 hover:bg-black/[0.03] transition-colors"
                      >
                        Open project
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuProjectId(null); setDeleteProject(project); }}
                        className="w-full text-left px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete project
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Connect Modal */}
      {connectProject && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setConnectProject(null)}>
          <div className="bg-white rounded-[18px] p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-[15px] font-bold text-text-0 mb-1">Connect &ldquo;{connectProject.name}&rdquo;</div>
            <p className="text-[12.5px] text-text-2 mb-4">Run these commands in your project directory:</p>
            <pre className="font-mono text-[12px] text-text-1 bg-[#F6F6F6] rounded-[10px] px-4 py-3 mb-4 whitespace-pre leading-relaxed">{`cd your-project-directory\ncontxt init\ncontxt push`}</pre>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleCopyCommands(connectProject)}
                className="h-8 px-3.5 text-[12.5px] font-medium bg-black/[0.05] text-text-1 rounded-[8px] hover:bg-black/[0.08] transition-all"
              >
                {copied ? 'Copied!' : 'Copy commands'}
              </button>
              <button
                onClick={() => setConnectProject(null)}
                className="h-8 px-3.5 text-[12.5px] font-semibold bg-blue text-white rounded-[8px] hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteProject && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeleteProject(null)}>
          <div className="bg-white rounded-[18px] p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-[15px] font-bold text-text-0 mb-1">Delete &ldquo;{deleteProject.name}&rdquo;?</div>
            <p className="text-[12.5px] text-text-2 mb-5">All memory entries will be permanently removed. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteProject(null)}
                disabled={deleting}
                className="h-8 px-3.5 text-[12.5px] font-medium bg-black/[0.05] text-text-1 rounded-[8px] hover:bg-black/[0.08] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteProject)}
                disabled={deleting}
                className="h-8 px-3.5 text-[12.5px] font-semibold bg-red-500 text-white rounded-[8px] hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
