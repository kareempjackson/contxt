import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { StripeBilling } from '@mycontxt/adapters/stripe/billing';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 500 });
  }

  // Get stripe_customer_id from subscriptions table
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const billing = new StripeBilling(secretKey);
  const origin = request.headers.get('origin') || 'https://mycontxt.ai';
  const portalUrl = await billing.createPortalUrl(sub.stripe_customer_id, `${origin}/dashboard/settings`);

  return NextResponse.json({ url: portalUrl });
}
