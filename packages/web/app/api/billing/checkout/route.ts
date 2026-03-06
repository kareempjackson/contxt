import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { StripeBilling } from '@mycontxt/adapters/stripe/billing';
import { PLANS, type PlanId } from '@mycontxt/core/plans';

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

  const billing = new StripeBilling(secretKey);

  const customerId = await billing.getOrCreateCustomer(user.id, user.email!);

  // Ensure subscription row exists with stripe_customer_id so the webhook can find it
  await supabase.from('subscriptions').upsert(
    { user_id: user.id, stripe_customer_id: customerId, plan_id: 'free', status: 'active' },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );

  const origin = request.headers.get('origin') || 'https://mycontxt.ai';
  const checkoutUrl = await billing.createCheckoutUrl({
    customerId,
    priceId: plan.stripePriceIds[billingPeriod]!,
    successUrl: `${origin}/dashboard/settings?upgraded=true`,
    cancelUrl: `${origin}/dashboard/settings`,
  });

  return NextResponse.json({ url: checkoutUrl });
}
