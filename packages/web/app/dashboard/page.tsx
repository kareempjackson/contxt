import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import type { Project } from '@mycontxt/core';
import { ProjectsFilter } from './projects-filter';

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

      {projects.length === 0 ? (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[15px] font-semibold text-text-0 mb-2">No projects yet</div>
          <p className="text-[13px] text-text-2 mb-4">Initialize Contxt in your first project:</p>
          <pre className="text-[12px] font-mono text-text-1 bg-[#F6F6F6] rounded-[10px] px-5 py-3 inline-block text-left">
            {`cd your-project\ncontxt init\ncontxt push`}
          </pre>
        </div>
      ) : (
        <ProjectsFilter projects={projects} />
      )}
    </>
  );
}
