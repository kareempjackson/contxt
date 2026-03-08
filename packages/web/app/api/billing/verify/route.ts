import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
      });
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      if (checkoutSession.payment_status === 'paid' && checkoutSession.subscription) {
        const sub = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
        const priceId = sub.items.data[0].price.id;
        const priceMap: Record<string, string> = {
          [process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '']: 'pro',
          [process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '']: 'pro',
          [process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? '']: 'team',
          [process.env.STRIPE_TEAM_ANNUAL_PRICE_ID ?? '']: 'team',
        };
        const planId = priceMap[priceId] ?? 'free';
        if (planId !== 'free') {
          const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
          );
          await Promise.all([
            serviceClient.from('user_profiles').upsert({ id: user.id, plan_id: planId }, { onConflict: 'id' }),
            serviceClient.from('subscriptions').update({ plan_id: planId, status: 'active' }).eq('user_id', user.id),
          ]);
        }
      }
    } catch {
      // Verification failed — redirect anyway; webhook will eventually sync
    }
  }

  return NextResponse.redirect(new URL('/dashboard/settings?upgraded=true', request.url));
}
