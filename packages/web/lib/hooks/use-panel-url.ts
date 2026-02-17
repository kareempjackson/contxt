'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { openEntry, closePanel } from '../store/panel-slice';

/**
 * Syncs Redux panel state ↔ URL ?entry= param.
 * Mount once per page that uses the entry panel.
 */
export function usePanelUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { entryId } = useAppSelector((s) => s.panel);

  // On mount: if ?entry= is in URL, open that entry
  useEffect(() => {
    const urlEntry = searchParams.get('entry');
    if (urlEntry) {
      dispatch(openEntry(urlEntry));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When panel opens/closes, sync to URL
  useEffect(() => {
    const current = searchParams.get('entry');
    const sp = new URLSearchParams(searchParams.toString());

    if (entryId && entryId !== current) {
      sp.set('entry', entryId);
      router.replace(`?${sp.toString()}`, { scroll: false });
    } else if (!entryId && current) {
      sp.delete('entry');
      router.replace(`?${sp.toString()}`, { scroll: false });
    }
  }, [entryId, searchParams, router]);
}
