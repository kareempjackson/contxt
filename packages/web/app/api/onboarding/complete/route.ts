import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json() as { name: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Save name to auth metadata and mark as onboarded
  const { error } = await supabase.auth.updateUser({
    data: { full_name: name.trim(), onboarded: true },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Ensure user_profiles row exists (trigger can fail silently) and keep email current.
  // Uses service role because users have no INSERT policy on user_profiles.
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await serviceClient
    .from('user_profiles')
    .upsert({ id: user.id, email: user.email ?? null }, { onConflict: 'id' });

  return NextResponse.json({ ok: true });
}
