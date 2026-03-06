import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

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

  // Also update user_profiles email/name if needed
  await supabase
    .from('user_profiles')
    .update({ email: user.email })
    .eq('id', user.id);

  return NextResponse.json({ ok: true });
}
