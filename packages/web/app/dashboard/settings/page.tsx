import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { getPlan, type PlanId } from '@mycontxt/core/plans';
import { SettingsClient } from './settings-client';

async function getSettingsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: { session } } = await supabase.auth.getSession();

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken: session?.access_token,
  });

  const profile = await db.getUserProfile(user.id).catch(() => null);
  const planId = (profile?.plan_id as PlanId) || 'free';
  const plan = getPlan(planId);

  return {
    user: {
      name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
      email: user.email ?? '',
    },
    planId,
    planName: plan.name,
    planPrice: plan.pricing.monthly,
  };
}

export default async function DashboardSettings({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const { user, planId, planName, planPrice } = await getSettingsData();
  const params = await searchParams;
  const justUpgraded = params.upgraded === 'true';

  return (
    <SettingsClient
      user={user}
      planId={planId}
      planName={planName}
      planPrice={planPrice}
      justUpgraded={justUpgraded}
    />
  );
}
