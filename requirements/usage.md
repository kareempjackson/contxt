# Contxt — Usage Gates & Stripe Integration Build Prompt

## Role

You are the sole engineer building Contxt, a CLI + MCP developer tool ("GitHub for AI Context"). The CLI and core CRUD already work. Your job now is to add the billing layer: Stripe subscription management, usage gate enforcement, and upgrade flows — all from the CLI. No web dashboard. No custom checkout UI. Stripe Checkout handles payments.

---

## Current State (what already exists)

- TypeScript monorepo: `@contxt/core`, `@contxt/adapters`, `@contxt/cli`, `@contxt/mcp`
- Local SQLite database (better-sqlite3) with full memory CRUD
- Supabase backend (Postgres + pgvector + Auth)
- CLI commands working: `init`, `decision add/list`, `pattern add/list`, `context set/show`, `search`, `load`, `push`, `pull`
- MCP server working with Claude Code / Cursor
- Auth flow working (GitHub OAuth via Supabase)
- Interface contracts defined: `IBillingProvider` in `packages/core/src/interfaces/billing.ts`

---

## What You're Building

Three things, in this order:

1. **Plans constant + usage limits engine** (in `@contxt/core`)
2. **Stripe adapter** (in `@contxt/adapters/src/stripe/`)
3. **CLI billing commands + gate enforcement** (in `@contxt/cli`)

---

## 1. Plans Constant — Single Source of Truth

Create `packages/core/src/plans.ts`. This is the ONLY place tier definitions live. Everything else reads from here.

```typescript
export type PlanId = "free" | "pro" | "team" | "enterprise";
export type BillingPeriod = "monthly" | "annual";

export interface PlanLimits {
  maxProjects: number | null; // null = unlimited
  maxEntriesPerProject: number | null;
  maxTotalEntries: number | null;
  maxSeats: number | null;
  semanticSearchEnabled: boolean;
  smartSuggestEnabled: boolean;
  branchingEnabled: boolean;
  cloudSyncEnabled: boolean;
  teamSharingEnabled: boolean;
  prioritySupport: boolean;
  ssoEnabled: boolean;
  auditLogEnabled: boolean;
  apiAccessEnabled: boolean;
  customIntegrationsEnabled: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  limits: PlanLimits;
  pricing: {
    monthly: number | null; // null = "Contact sales"
    annual: number | null; // per-year price (not per-month)
  };
  stripePriceIds: {
    monthly: string | null;
    annual: string | null;
  };
  isDefault: boolean;
  sortOrder: number;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    description: "For individual developers getting started",
    limits: {
      maxProjects: 3,
      maxEntriesPerProject: 500,
      maxTotalEntries: 1000,
      maxSeats: 1,
      semanticSearchEnabled: false,
      smartSuggestEnabled: false,
      branchingEnabled: false,
      cloudSyncEnabled: true,
      teamSharingEnabled: false,
      prioritySupport: false,
      ssoEnabled: false,
      auditLogEnabled: false,
      apiAccessEnabled: false,
      customIntegrationsEnabled: false,
    },
    pricing: { monthly: 0, annual: 0 },
    stripePriceIds: { monthly: null, annual: null },
    isDefault: true,
    sortOrder: 0,
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For developers who ship with AI daily",
    limits: {
      maxProjects: null,
      maxEntriesPerProject: null,
      maxTotalEntries: 50000,
      maxSeats: 1,
      semanticSearchEnabled: true,
      smartSuggestEnabled: true,
      branchingEnabled: true,
      cloudSyncEnabled: true,
      teamSharingEnabled: false,
      prioritySupport: true,
      ssoEnabled: false,
      auditLogEnabled: false,
      apiAccessEnabled: true,
      customIntegrationsEnabled: false,
    },
    pricing: { monthly: 29, annual: 290 },
    stripePriceIds: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
    },
    sortOrder: 1,
    isDefault: false,
  },
  team: {
    id: "team",
    name: "Team",
    description: "For teams building together with AI",
    limits: {
      maxProjects: null,
      maxEntriesPerProject: null,
      maxTotalEntries: null,
      maxSeats: 25,
      semanticSearchEnabled: true,
      smartSuggestEnabled: true,
      branchingEnabled: true,
      cloudSyncEnabled: true,
      teamSharingEnabled: true,
      prioritySupport: true,
      ssoEnabled: false,
      auditLogEnabled: true,
      apiAccessEnabled: true,
      customIntegrationsEnabled: true,
    },
    pricing: { monthly: 49, annual: 490 },
    stripePriceIds: {
      monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || "",
      annual: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || "",
    },
    sortOrder: 2,
    isDefault: false,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations that need control and scale",
    limits: {
      maxProjects: null,
      maxEntriesPerProject: null,
      maxTotalEntries: null,
      maxSeats: null,
      semanticSearchEnabled: true,
      smartSuggestEnabled: true,
      branchingEnabled: true,
      cloudSyncEnabled: true,
      teamSharingEnabled: true,
      prioritySupport: true,
      ssoEnabled: true,
      auditLogEnabled: true,
      apiAccessEnabled: true,
      customIntegrationsEnabled: true,
    },
    pricing: { monthly: null, annual: null },
    stripePriceIds: { monthly: null, annual: null },
    sortOrder: 3,
    isDefault: false,
  },
};

// Helper: get plan by ID with fallback to free
export function getPlan(id: PlanId): PlanDefinition {
  return PLANS[id] ?? PLANS.free;
}

// Helper: check if a feature is available on a plan
export function hasFeature(planId: PlanId, feature: keyof PlanLimits): boolean {
  const plan = getPlan(planId);
  const value = plan.limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return true; // null means unlimited
}
```

---

## 2. Usage Gate Engine

Create `packages/core/src/engine/usage.ts`. This is the enforcement layer. Every write operation passes through here.

```typescript
import { PlanId, PlanLimits, getPlan } from "../plans.js";

export interface UsageCounts {
  totalProjects: number;
  totalEntries: number;
  entriesInProject: number;
  totalSeats: number;
}

export type GateResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: string;
      limit: number | null;
      current: number;
      upgradeHint: string;
    };

export class UsageGate {
  constructor(
    private planId: PlanId,
    private getUsage: () => Promise<UsageCounts>,
  ) {}

  async checkProjectCreate(): Promise<GateResult> {
    const plan = getPlan(this.planId);
    if (plan.limits.maxProjects === null) return { allowed: true };
    const usage = await this.getUsage();
    if (usage.totalProjects >= plan.limits.maxProjects) {
      return {
        allowed: false,
        reason: `You've reached the ${plan.limits.maxProjects}-project limit on the ${plan.name} plan.`,
        limit: plan.limits.maxProjects,
        current: usage.totalProjects,
        upgradeHint:
          "Upgrade to Pro for unlimited projects → contxt billing upgrade",
      };
    }
    return { allowed: true };
  }

  async checkEntryCreate(): Promise<GateResult> {
    const plan = getPlan(this.planId);
    const usage = await this.getUsage();

    // Check per-project limit
    if (
      plan.limits.maxEntriesPerProject !== null &&
      usage.entriesInProject >= plan.limits.maxEntriesPerProject
    ) {
      return {
        allowed: false,
        reason: `This project has reached its ${plan.limits.maxEntriesPerProject}-entry limit on the ${plan.name} plan.`,
        limit: plan.limits.maxEntriesPerProject,
        current: usage.entriesInProject,
        upgradeHint:
          "Upgrade to Pro for unlimited entries per project → contxt billing upgrade",
      };
    }

    // Check total limit
    if (
      plan.limits.maxTotalEntries !== null &&
      usage.totalEntries >= plan.limits.maxTotalEntries
    ) {
      return {
        allowed: false,
        reason: `You've reached the ${plan.limits.maxTotalEntries.toLocaleString()}-entry limit on the ${plan.name} plan.`,
        limit: plan.limits.maxTotalEntries,
        current: usage.totalEntries,
        upgradeHint:
          "Upgrade to Pro for 50,000 entries → contxt billing upgrade",
      };
    }

    return { allowed: true };
  }

  checkFeature(feature: keyof PlanLimits): GateResult {
    const plan = getPlan(this.planId);
    const value = plan.limits[feature];

    if (value === false) {
      const featureNames: Partial<Record<keyof PlanLimits, string>> = {
        semanticSearchEnabled: "Semantic search",
        smartSuggestEnabled: "Smart context retrieval",
        branchingEnabled: "Branching & time travel",
        teamSharingEnabled: "Team sharing",
        ssoEnabled: "SSO",
        auditLogEnabled: "Audit logs",
        apiAccessEnabled: "API access",
        customIntegrationsEnabled: "Custom integrations",
      };

      return {
        allowed: false,
        reason: `${featureNames[feature] || feature} is not available on the ${plan.name} plan.`,
        limit: 0,
        current: 0,
        upgradeHint: `Upgrade to unlock this feature → contxt billing upgrade`,
      };
    }

    return { allowed: true };
  }
}
```

### Where to enforce gates

Insert gate checks at these exact points in the existing code:

| Action                           | Gate check                                        | Block if exceeded                          |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| `contxt init` (new project)      | `checkProjectCreate()`                            | Yes — show error + upgrade hint            |
| `contxt decision add`            | `checkEntryCreate()`                              | Yes                                        |
| `contxt pattern add`             | `checkEntryCreate()`                              | Yes                                        |
| `contxt doc add`                 | `checkEntryCreate()`                              | Yes                                        |
| `contxt context set`             | `checkEntryCreate()`                              | Yes                                        |
| `contxt search --semantic`       | `checkFeature('semanticSearchEnabled')`           | Yes — fall back to full-text with message  |
| `contxt suggest` / smart suggest | `checkFeature('smartSuggestEnabled')`             | Yes                                        |
| `contxt branch create`           | `checkFeature('branchingEnabled')`                | Yes                                        |
| `contxt branch switch`           | `checkFeature('branchingEnabled')`                | Yes                                        |
| `contxt history` (time travel)   | `checkFeature('branchingEnabled')`                | Yes                                        |
| MCP `contxt_suggest` tool        | `checkFeature('smartSuggestEnabled')`             | Return degraded response with upgrade note |
| MCP `contxt_search` tool         | Semantic: `checkFeature('semanticSearchEnabled')` | Fall back to full-text                     |

### Gate enforcement pattern in CLI commands

```typescript
// In every gated CLI command handler:
const gate = new UsageGate(userPlan, () =>
  getUsageCounts(db, userId, projectId),
);
const result = await gate.checkEntryCreate();

if (!result.allowed) {
  // Use chalk for formatting
  console.error(chalk.red(`\n✖ ${result.reason}`));
  console.error(
    chalk.dim(`  Current: ${result.current} / Limit: ${result.limit}`),
  );
  console.error(chalk.cyan(`\n  ${result.upgradeHint}\n`));
  process.exit(1);
}
```

### Gate enforcement in MCP server

```typescript
// In MCP tool handlers — DO NOT crash the agent. Return degraded response.
const gate = new UsageGate(userPlan, () =>
  getUsageCounts(db, userId, projectId),
);
const result = gate.checkFeature("semanticSearchEnabled");

if (!result.allowed) {
  // Fall back to full-text search, append upgrade note
  const fallbackResults = await fullTextSearch(query);
  return {
    content: [
      {
        type: "text",
        text:
          formatSearchResults(fallbackResults) +
          "\n\n---\n💡 Tip: Upgrade to Pro for semantic search (understands meaning, not just keywords). Run `contxt billing upgrade`.",
      },
    ],
  };
}
```

**Critical rule:** The MCP server must NEVER throw or block the AI agent. Always degrade gracefully with a hint. The CLI can hard-block because the human is in control. The MCP cannot because it would break the agent's workflow.

---

## 3. Stripe Integration

### 3A. Supabase Schema Addition

Add this migration to create the subscriptions tracking table:

```sql
-- supabase/migrations/XXXXXX_add_subscriptions.sql

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'pro', 'team', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  seats INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS: users can only read their own subscription
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (webhook handler)
CREATE POLICY "Service role manages subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Index for webhook lookups
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- Auto-update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add plan_id column to user_profiles if not exists (denormalized for fast reads)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free';
```

### 3B. Stripe Adapter

Create `packages/adapters/src/stripe/billing.ts`:

```typescript
import Stripe from "stripe";
import { IBillingProvider } from "@contxt/core";

export class StripeBilling implements IBillingProvider {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" });
  }

  // Create or retrieve Stripe customer for a user
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check Supabase for existing customer ID first
    // If not found, create in Stripe, store in Supabase
    const customers = await this.stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) return customers.data[0].id;

    const customer = await this.stripe.customers.create({
      email,
      metadata: { contxt_user_id: userId },
    });
    return customer.id;
  }

  // Create a Stripe Checkout Session and return the URL
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

  // Create a billing portal session (manage subscription, cancel, update card)
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

  // Get current subscription status
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
```

### 3C. Stripe Webhook Handler (Supabase Edge Function)

Create `supabase/functions/stripe-webhook/index.ts`:

This Edge Function handles all Stripe events and updates the `subscriptions` table + `user_profiles.plan_id`.

```typescript
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
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
    });
  }

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
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0].price.id;
      const planId = mapPriceIdToPlan(priceId);

      await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          status: sub.status,
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_end: new Date(
            sub.current_period_end * 1000,
          ).toISOString(),
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
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
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
```

### 3D. CLI Billing Commands

Create `packages/cli/src/commands/billing.ts`:

```
contxt billing status     → Show current plan, usage, limits, renewal date
contxt billing upgrade    → Show available plans, open Stripe Checkout in browser
contxt billing manage     → Open Stripe Customer Portal in browser (update card, cancel)
contxt billing usage      → Show detailed usage breakdown vs limits
```

**`contxt billing status` output:**

```
╭─────────────────────────────────────────╮
│  Plan: Pro ($29/mo)                     │
│  Status: Active                         │
│  Renews: March 15, 2026                 │
│                                         │
│  Usage                                  │
│  Projects:  8 / unlimited               │
│  Entries:   2,847 / 50,000  (5.7%)      │
│  Seats:     1 / 1                       │
│                                         │
│  Features                               │
│  ✓ Semantic search                      │
│  ✓ Smart suggest                        │
│  ✓ Branching & time travel              │
│  ✗ Team sharing (Team plan)             │
│  ✗ SSO (Enterprise plan)               │
╰─────────────────────────────────────────╯

  Manage subscription → contxt billing manage
```

**`contxt billing upgrade` flow:**

1. Show current plan vs available plans in a formatted comparison table
2. User selects plan + billing period (monthly/annual) via interactive prompt
3. CLI calls `createCheckoutUrl()` with the correct Stripe price ID
4. Opens the URL in the default browser (`import open from 'open'`)
5. Prints: "Complete checkout in your browser. Your plan will update automatically."
6. CLI polls `billing status` every 5 seconds for up to 2 minutes to confirm upgrade
7. On confirmation: "✓ Upgraded to Pro! Semantic search and smart suggest are now active."

**`contxt billing usage` output:**

```
  Usage Report — Pro Plan

  ┌──────────────────────┬─────────┬─────────┬────────┐
  │ Resource             │ Used    │ Limit   │ %      │
  ├──────────────────────┼─────────┼─────────┼────────┤
  │ Projects             │ 8       │ ∞       │ -      │
  │ Total entries        │ 2,847   │ 50,000  │ 5.7%   │
  │ Decisions            │ 342     │ -       │ -      │
  │ Patterns             │ 89      │ -       │ -      │
  │ Docs                 │ 156     │ -       │ -      │
  │ Context updates      │ 2,260   │ -       │ -      │
  │ Seats                │ 1       │ 1       │ 100%   │
  └──────────────────────┴─────────┴─────────┴────────┘

  ⚠ You're at 100% seat capacity. Add seats → contxt billing upgrade
```

---

## 4. User Plan Resolution

The CLI needs to know the user's plan at startup. Here's the resolution order:

```typescript
// packages/core/src/engine/plan-resolver.ts

export async function resolveUserPlan(
  localDb: ILocalDatabase,
  remoteDb: IRemoteDatabase | null,
  userId: string | null,
): Promise<PlanId> {
  // 1. If not authenticated, always free
  if (!userId) return "free";

  // 2. Check local cache first (stored in ~/.contxt/plan.json)
  const cached = localDb.getCachedPlan(userId);
  if (cached && !isStale(cached.fetchedAt, 60 * 60 * 1000)) {
    // 1 hour TTL
    return cached.planId;
  }

  // 3. Fetch from Supabase (user_profiles.plan_id)
  if (remoteDb) {
    try {
      const profile = await remoteDb.getUserProfile(userId);
      const planId = (profile?.plan_id as PlanId) || "free";
      localDb.cachePlan(userId, planId); // Update cache
      return planId;
    } catch {
      // Network error — use cache even if stale, fall back to free
      return cached?.planId || "free";
    }
  }

  return "free";
}
```

**Critical:** The plan is cached locally so the CLI works offline. The cache has a 1-hour TTL. After a Stripe webhook updates the plan in Supabase, the next CLI command that checks will pick up the new plan. The polling in `billing upgrade` forces an immediate refresh.

---

## 5. Environment Variables to Add

```env
# Add to .env.example and document
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
```

---

## 6. Stripe Setup Steps (manual, not code)

Before running any of this code, set up in Stripe Dashboard:

1. Create Product: "Contxt Pro"
   - Price 1: $29/month recurring → copy price ID to STRIPE_PRO_MONTHLY_PRICE_ID
   - Price 2: $290/year recurring → copy price ID to STRIPE_PRO_ANNUAL_PRICE_ID

2. Create Product: "Contxt Team"
   - Price 1: $49/month per seat recurring → copy price ID to STRIPE_TEAM_MONTHLY_PRICE_ID
   - Price 2: $490/year per seat recurring → copy price ID to STRIPE_TEAM_ANNUAL_PRICE_ID

3. Set up Customer Portal in Stripe Dashboard:
   - Enable: Update payment method, Cancel subscription, Switch plans
   - Redirect URL: `https://mycontxt.ai/billing/return`

4. Set up webhook endpoint:
   - URL: `https://<your-supabase-project>.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`

---

## 7. Testing Checklist

Run these tests after implementation:

| #   | Test                                                         | Expected                                                   |
| --- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| 1   | Free user runs `contxt init` 4 times                         | 4th project blocked with upgrade hint                      |
| 2   | Free user runs `contxt search --semantic "auth"`             | Falls back to full-text with upgrade message               |
| 3   | Free user runs `contxt suggest`                              | Blocked with upgrade hint                                  |
| 4   | Free user runs `contxt branch create`                        | Blocked with upgrade hint                                  |
| 5   | Free user runs `contxt billing upgrade`                      | Shows plan comparison, opens Stripe Checkout               |
| 6   | After checkout completion, `contxt billing status` shows Pro | Plan updated within 60 seconds                             |
| 7   | Pro user runs `contxt search --semantic "auth"`              | Semantic search works                                      |
| 8   | Pro user runs `contxt suggest`                               | Smart suggest works                                        |
| 9   | Pro user creates unlimited projects                          | No blocking                                                |
| 10  | Pro user at 50,000 entries tries to add another              | Blocked with upgrade hint                                  |
| 11  | `contxt billing manage` opens Stripe portal                  | Can cancel, update card                                    |
| 12  | After cancellation, plan reverts to free                     | Features re-gated                                          |
| 13  | MCP server: free user asks agent to search semantically      | Agent gets full-text results + upgrade note (NOT an error) |
| 14  | Offline: plan cached, gates still enforced                   | Works without network                                      |
| 15  | Webhook: `invoice.payment_failed`                            | Status shows past_due, features still work (grace period)  |

---

## 8. Critical Rules

1. **Never block the MCP server.** Degrade gracefully, always return useful content + upgrade hint. Breaking the AI agent's flow is the worst possible UX.
2. **Never lose data on downgrade.** When a Pro user cancels and reverts to Free, all their data stays. They just can't create beyond limits or use gated features. They can still `contxt load` and `contxt search` (full-text) all existing data.
3. **Grace period on payment failure.** `past_due` status should be treated as active for 7 days. Don't lock people out immediately.
4. **Cache plans locally.** The CLI must work offline. Use local cache with 1-hour TTL.
5. **Stripe Checkout handles all payment UI.** Do NOT build a checkout form. Do NOT collect card details. Open a browser to Stripe.
6. **Usage counts come from Supabase, not local.** Cloud is the source of truth for usage across devices. Local cache for offline fallback only.
7. **Gate checks are fast.** The UsageGate should add < 50ms to any command. Cache usage counts per CLI session (refresh once per session, not per command).
8. **Upgrade hints are helpful, not annoying.** Show them once per blocked action. Never spam. Use chalk.cyan for the hint text so it stands out but isn't alarming.

---

## Start Now

Begin with the plans constant, then the usage gate engine, then wire gates into existing CLI commands. Test the gates with mock plan IDs before touching Stripe. Then build the Stripe adapter, webhook handler, and CLI billing commands. Test end-to-end with Stripe test mode.
