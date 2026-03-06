import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { PLANS, type PlanId } from '@mycontxt/core/plans';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planId, billingPeriod } = await request.json() as { planId: PlanId; billingPeriod: 'monthly' | 'annual' };

  const plan = PLANS[planId];
  if (!plan || !plan.stripePriceIds[billingPeriod]) {
    return NextResponse.json({ error: 'Invalid plan or billing period' }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion });

  // Get or create Stripe customer
  const existing = await stripe.customers.list({ email: user.email!, limit: 1 });
  const customerId = existing.data.length > 0
    ? existing.data[0].id
    : (await stripe.customers.create({ email: user.email!, metadata: { contxt_user_id: user.id } })).id;

  // Ensure subscription row exists so the webhook can find the user
  await supabase.from('subscriptions').upsert(
    { user_id: user.id, stripe_customer_id: customerId, plan_id: 'free', status: 'active' },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );

  const origin = request.headers.get('origin') || 'https://mycontxt.ai';
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.stripePriceIds[billingPeriod]!, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?upgraded=true`,
    cancel_url: `${origin}/dashboard/settings`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
