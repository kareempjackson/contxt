import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: projects } = await serviceClient
    .from('projects')
    .select('*')
    .eq('user_id', user.id);

  const projectIds = (projects ?? []).map((p: { id: string }) => p.id);

  const { data: entries } = projectIds.length > 0
    ? await serviceClient
        .from('memory_entries')
        .select('*')
        .in('project_id', projectIds)
    : { data: [] };

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    projects: projects ?? [],
    entries: entries ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="contxt-export.json"',
    },
  });
}
