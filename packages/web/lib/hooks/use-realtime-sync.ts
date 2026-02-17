'use client';

import { useEffect } from 'react';
import { createClient } from '../supabase/client';
import { useAppDispatch } from '../store/hooks';
import { contxtApi } from '../store/api';

/**
 * Subscribes to Supabase Realtime for memory_entries changes.
 * When the CLI pushes new entries or drafts are auto-captured,
 * the dashboard updates without a page refresh.
 *
 * Mount once inside dashboard/layout's client wrapper.
 */
export function useRealtimeSync(userId: string | null) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel('contxt-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memory_entries',
          // RLS ensures only this user's rows fire
        },
        () => {
          dispatch(contxtApi.util.invalidateTags(['Entries', 'Drafts', 'Activity']));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          dispatch(contxtApi.util.invalidateTags(['Projects']));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, dispatch]);
}
