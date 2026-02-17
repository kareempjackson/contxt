'use client';

import { useRealtimeSync } from '../../lib/hooks/use-realtime-sync';

/**
 * Mounts the Supabase Realtime subscription for the dashboard.
 * Rendered once in dashboard/layout.tsx (server → client boundary).
 */
export function RealtimeSync({ userId }: { userId: string }) {
  useRealtimeSync(userId);
  return null;
}
