import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), { status: 400 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { status: 500 });
  }

  // Read raw bytes to avoid any encoding issues with signature verification
  const bodyBytes = await req.arrayBuffer();
  const body = new TextDecoder("utf-8").decode(bodyBytes);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
    });
  }

  console.log(`Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Retrieve subscription to get plan details
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0].price.id;
        const planId = mapPriceIdToPlan(priceId);
        const period =
          sub.items.data[0].price.recurring?.interval === "year"
            ? "annual"
            : "monthly";

        // Find user by stripe_customer_id
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingSub) {
          // Update existing subscription record
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscriptionId,
              plan_id: planId,
              status: "active",
              billing_period: period,
              current_period_start: new Date(
                sub.current_period_start * 1000,
              ).toISOString(),
              current_period_end: new Date(
                sub.current_period_end * 1000,
              ).toISOString(),
              seats: sub.items.data[0].quantity || 1,
            })
            .eq("stripe_customer_id", customerId);

          // Denormalize plan_id to user_profiles for fast reads
          await supabase
            .from("user_profiles")
            .update({
              plan_id: planId,
            })
            .eq("id", existingSub.user_id);
        }
        break;
      }

      case "customer.subscription.updated": {
        // Retrieve fresh data via API so field shapes match our library version
        const subId = (event.data.object as { id: string }).id;
        const sub = await stripe.subscriptions.retrieve(subId);
        const priceId = sub.items.data[0].price.id;
        const planId = mapPriceIdToPlan(priceId);

        await supabase
          .from("subscriptions")
          .update({
            plan_id: planId,
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            seats: sub.items.data[0].quantity || 1,
          })
          .eq("stripe_subscription_id", sub.id);

        // Update user_profiles
        const { data: record } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (record) {
          await supabase
            .from("user_profiles")
            .update({
              plan_id: sub.status === "active" ? planId : "free",
            })
            .eq("id", record.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            plan_id: "free",
          })
          .eq("stripe_subscription_id", sub.id);

        const { data: record } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (record) {
          await supabase
            .from("user_profiles")
            .update({
              plan_id: "free",
            })
            .eq("id", record.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: "past_due",
            })
            .eq("stripe_subscription_id", invoice.subscription as string);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          const priceId = sub.items.data[0].price.id;
          const planId = mapPriceIdToPlan(priceId);

          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              plan_id: planId,
              current_period_end: new Date(
                sub.current_period_end * 1000,
              ).toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          const { data: record } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single();

          if (record) {
            await supabase
              .from("user_profiles")
              .update({ plan_id: planId })
              .eq("id", record.user_id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error(`Error processing event ${event.id}:`, error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500 },
    );
  }
});

// Map Stripe price IDs to plan IDs — use env vars
function mapPriceIdToPlan(priceId: string): string {
  const map: Record<string, string> = {
    [Deno.env.get("STRIPE_PRO_MONTHLY_PRICE_ID")!]: "pro",
    [Deno.env.get("STRIPE_PRO_ANNUAL_PRICE_ID")!]: "pro",
    [Deno.env.get("STRIPE_TEAM_MONTHLY_PRICE_ID")!]: "team",
    [Deno.env.get("STRIPE_TEAM_ANNUAL_PRICE_ID")!]: "team",
  };
  return map[priceId] || "free";
}
