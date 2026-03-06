import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { getPlan, type PlanId } from '@mycontxt/core/plans';
import { SettingsClient } from './settings-client';
import Stripe from 'stripe';

async function getSettingsData(stripeSessionId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: { session } } = await supabase.auth.getSession();

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken: session?.access_token,
  });

  let profile = await db.getUserProfile(user.id).catch(() => null);
  let planId = (profile?.plan_id as PlanId) || 'free';

  // Webhook hasn't fired yet — verify directly with Stripe and update DB
  if (stripeSessionId && planId === 'free' && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
      });
      const checkoutSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
      if (checkoutSession.payment_status === 'paid' && checkoutSession.subscription) {
        const sub = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
        const priceId = sub.items.data[0].price.id;
        const priceMap: Record<string, string> = {
          [process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '']: 'pro',
          [process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '']: 'pro',
          [process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? '']: 'team',
          [process.env.STRIPE_TEAM_ANNUAL_PRICE_ID ?? '']: 'team',
        };
        const resolvedPlan = (priceMap[priceId] ?? 'free') as PlanId;
        if (resolvedPlan !== 'free') {
          // Update the DB immediately — don't wait for the webhook
          await supabase.from('user_profiles').update({ plan_id: resolvedPlan }).eq('id', user.id);
          planId = resolvedPlan;
        }
      }
    } catch {
      // Stripe verify failed — fall through with DB value
    }
  }

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

export default async function DashboardSettings({ searchParams }: { searchParams: Promise<{ upgraded?: string; session_id?: string }> }) {
  const params = await searchParams;
  const justUpgraded = params.upgraded === 'true';
  const { user, planId, planName, planPrice } = await getSettingsData(justUpgraded ? params.session_id : undefined);

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
