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
