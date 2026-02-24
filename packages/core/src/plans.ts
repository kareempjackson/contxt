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
