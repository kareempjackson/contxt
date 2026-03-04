import { PlanId } from "../plans.js";
import type { ILocalDatabase, IRemoteDatabase } from "../interfaces/database.js";

interface CachedPlan {
  planId: PlanId;
  fetchedAt: number;
}

/**
 * Resolve user's current plan with offline-first caching
 *
 * Resolution order:
 * 1. Return free plan if not authenticated
 * 2. Check local cache (1-hour TTL)
 * 3. Fetch from Supabase and update cache
 * 4. Fall back to stale cache if network fails
 * 5. Default to free plan
 */
export async function resolveUserPlan(
  localDb: ILocalDatabase,
  remoteDb: IRemoteDatabase | null,
  userId: string | null,
): Promise<PlanId> {
  // Local dev override — set CONTXT_PLAN=pro to bypass billing gates
  if (process.env.CONTXT_PLAN) {
    return process.env.CONTXT_PLAN as PlanId;
  }

  // Not authenticated = free plan
  if (!userId) return "free";

  // Check local cache first (1-hour TTL)
  const cached = localDb.getCachedPlan(userId);
  const oneHour = 60 * 60 * 1000;
  if (cached && Date.now() - cached.fetchedAt < oneHour) {
    return cached.planId as PlanId;
  }

  // Fetch from Supabase
  if (remoteDb) {
    try {
      const profile = await remoteDb.getUserProfile(userId);
      const planId = (profile?.plan_id as PlanId) || "free";

      // Update local cache
      localDb.cachePlan(userId, planId);
      return planId;
    } catch (error) {
      // Network error - use stale cache if available
      if (cached) {
        return cached.planId as PlanId;
      }
      // Fall back to free
      return "free";
    }
  }

  return "free";
}
