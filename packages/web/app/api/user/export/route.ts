import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let projectsQuery = serviceClient.from('projects').select('*').eq('user_id', user.id);
  if (projectId) projectsQuery = projectsQuery.eq('id', projectId);
  const { data: projects } = await projectsQuery;

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

  const filename = projectId && projects?.[0]?.name
    ? `contxt-export-${projects[0].name}.json`
    : 'contxt-export.json';

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
