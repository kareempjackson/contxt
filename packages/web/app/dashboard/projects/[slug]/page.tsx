import { redirect, notFound } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { SupabaseDatabase } from '@contxt/adapters/supabase';
import type { Project } from '@contxt/core';
import { ProjectDetailClient } from './client';

async function getProject(slug: string): Promise<Project> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const project = await db.getProjectByName(user.id, decodeURIComponent(slug));
  if (!project) notFound();
  return project;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  return <ProjectDetailClient project={project} />;
}
