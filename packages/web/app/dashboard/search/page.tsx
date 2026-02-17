import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { SearchClient } from './client';

async function getSearchContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  const projects = await db.getProjects(user.id).catch(() => []);
  return { userId: user.id, projects };
}

export default async function SearchPage() {
  const { userId, projects } = await getSearchContext();
  return <SearchClient userId={userId} projects={projects} />;
}
