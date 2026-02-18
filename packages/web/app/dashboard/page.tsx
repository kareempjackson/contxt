import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import type { Project } from '@mycontxt/core';
import { ProjectsList } from './projects-client';

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

export default async function DashboardProjects() {
  const projects = await getProjects();

  return (
    <>
      {/* Page Top */}
      <div className="mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Projects</h1>
      </div>

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
            placeholder="Search projects…"
            className="w-full h-10 px-3.5 pl-9.5 text-[13px] text-text-0 bg-white border-none rounded-[10px] outline-none shadow-[0_1px_3px_rgba(0,0,0,0.03),0_0_1px_rgba(0,0,0,0.04)] transition-shadow focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1),0_1px_3px_rgba(0,0,0,0.03)] placeholder:text-text-3"
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

      {projects.length === 0 && (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[15px] font-semibold text-text-0 mb-2">No projects yet</div>
          <p className="text-[13px] text-text-2 mb-4">Initialize Contxt in your first project:</p>
          <pre className="text-[12px] font-mono text-text-1 bg-[#F6F6F6] rounded-[10px] px-5 py-3 inline-block text-left">
            {`cd your-project\ncontxt init\ncontxt push`}
          </pre>
        </div>
      )}

      <ProjectsList projects={projects} />
    </>
  );
}
