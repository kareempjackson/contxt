import Stripe from "stripe";

/**
 * Stripe billing adapter
 * Handles checkout sessions, customer portal, and subscription management
 */
export class StripeBilling {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  }

  /**
   * Get or create Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if customer already exists by email
    const customers = await this.stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      return customers.data[0].id;
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email,
      metadata: { contxt_user_id: userId },
    });

    return customer.id;
  }

  /**
   * Create Stripe Checkout session and return URL
   */
  async createCheckoutUrl(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    seats?: number;
  }): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: "subscription",
      line_items: [
        {
          price: params.priceId,
          quantity: params.seats || 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: { enabled: true },
    });

    return session.url!;
  }

  /**
   * Create billing portal session for managing subscription
   */
  async createPortalUrl(
    customerId: string,
    returnUrl: string,
  ): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Get current subscription status
   */
  async getSubscription(subscriptionId: string): Promise<{
    status: string;
    planId: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null> {
    try {
      const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
      return {
        status: sub.status,
        planId: sub.metadata.contxt_plan_id || "free",
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      };
    } catch {
      return null;
    }
  }
}
