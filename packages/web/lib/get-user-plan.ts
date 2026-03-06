import { createClient } from './supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { getPlan, type PlanId } from '@mycontxt/core/plans';

export async function getUserPlan() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { planId: 'free' as PlanId, plan: getPlan('free') };

  const { data: { session } } = await supabase.auth.getSession();
  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken: session?.access_token,
  });

  const profile = await db.getUserProfile(user.id).catch(() => null);
  const planId = (profile?.plan_id as PlanId) || 'free';
  return { planId, plan: getPlan(planId) };
}
