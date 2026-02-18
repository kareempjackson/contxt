import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import type { Project } from '@mycontxt/core';

async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: { session } } = await supabase.auth.getSession();

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken: session?.access_token,
  });
  return db.getProjects(user.id).catch(() => []);
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default async function DashboardProjects() {
  const projects = await getProjects();

  return (
    <>
      {/* Page Top */}
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Projects</h1>
        <button className="h-9 px-4 flex items-center justify-center gap-2 rounded-[9px] bg-blue text-white font-semibold text-[13px] hover:bg-[#0070E0] transition-all shadow-[0_1px_3px_rgba(10,132,255,0.2)] hover:shadow-[0_3px_12px_rgba(10,132,255,0.25)]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New project
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-3 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search projects…"
            className="w-full h-10 px-3.5 pl-[38px] text-[13px] text-text-0 bg-white border-none rounded-[10px] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.03),0_0_1px_rgba(0,0,0,0.04)] transition-shadow focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1),0_1px_3px_rgba(0,0,0,0.03)] placeholder:text-text-3"
          />
        </div>
        <button className="h-10 px-3.5 flex items-center gap-2 text-[12.5px] font-medium text-text-2 bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
          <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </button>
        <button className="h-10 px-3.5 flex items-center gap-2 text-[12.5px] font-medium text-text-2 bg-white rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
          <svg className="w-3.5 h-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort
        </button>
      </div>

      <div className="text-[12.5px] text-text-2 mb-4">
        Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[15px] font-semibold text-text-0 mb-2">No projects yet</div>
          <p className="text-[13px] text-text-2 mb-4">Initialize Contxt in your first project:</p>
          <pre className="text-[12px] font-mono text-text-1 bg-[#F6F6F6] rounded-[10px] px-5 py-3 inline-block text-left">
            {`cd your-project\ncontxt init\ncontxt push`}
          </pre>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-2">
        {projects.map((project) => (
          <a
            key={project.id}
            href={`/dashboard/projects/${encodeURIComponent(project.name)}`}
            className="block bg-white rounded-[14px] p-6 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:-translate-y-[1px] transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[15px] font-bold text-blue tracking-[-0.2px]">{project.name}</span>
              <span className="w-[7px] h-[7px] rounded-full bg-green" />
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
    </>
  );
}
