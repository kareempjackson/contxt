import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import { contxtApi } from '../store/api';
import type { Project } from '@mycontxt/core';

/**
 * When `project.config.autoSync` is true, invalidates the Entries and
 * Projects RTK Query cache on the configured interval so the UI stays
 * fresh without the user manually refreshing.
 */
export function useAutoSync(project: Project) {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const autoSync = project.config.autoSync ?? false;
  const intervalMinutes = project.config.syncIntervalMinutes ?? 15;

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!autoSync) return;

    const ms = intervalMinutes * 60 * 1000;

    intervalRef.current = setInterval(() => {
      dispatch(contxtApi.util.invalidateTags(['Entries', 'Projects', 'Branches', 'Sessions']));
    }, ms);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoSync, intervalMinutes, dispatch]);
}
