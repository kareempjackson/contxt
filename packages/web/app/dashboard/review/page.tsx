'use client';

import { useGetDraftsQuery, useConfirmDraftMutation, useDiscardDraftMutation } from '../../../lib/store/api';
import { DraftCard } from '../../components/draft-card';
import { createClient } from '../../../lib/supabase/client';
import { useEffect, useState } from 'react';

export default function ReviewPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { data: drafts = [], isLoading } = useGetDraftsQuery(
    { userId: userId ?? '' },
    { skip: !userId }
  );

  const [confirmDraft] = useConfirmDraftMutation();
  const [discardDraft] = useDiscardDraftMutation();

  async function handleConfirmAll() {
    for (const draft of drafts) {
      await confirmDraft(draft.id);
    }
  }

  async function handleDiscardAll() {
    if (!confirm(`Discard all ${drafts.length} drafts? This cannot be undone.`)) return;
    for (const draft of drafts) {
      await discardDraft(draft.id);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Review</h1>
        {drafts.length > 0 && (
          <span className="font-mono text-[12px] font-semibold bg-blue text-white px-2.5 py-0.5 rounded-full">
            {drafts.length}
          </span>
        )}
        {drafts.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleConfirmAll}
              className="h-8 px-3.5 text-[12.5px] font-semibold bg-bg-dark text-white rounded-[9px] hover:bg-[#333] transition-colors"
            >
              Confirm All ({drafts.length})
            </button>
            <button
              onClick={handleDiscardAll}
              className="h-8 px-3.5 text-[12.5px] font-medium text-rose border border-rose/20 rounded-[9px] hover:bg-rose/5 transition-colors"
            >
              Discard All
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-[14px] animate-pulse opacity-60" />
          ))}
        </div>
      )}

      {!isLoading && drafts.length === 0 && (
        <div className="bg-white rounded-[14px] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[32px] mb-3">✓</div>
          <div className="text-[15px] font-semibold text-text-0 mb-1">All caught up</div>
          <p className="text-[13px] text-text-2">No drafts pending review.</p>
        </div>
      )}

      <div className="space-y-3">
        {drafts.map((draft) => (
          <DraftCard key={draft.id} entry={draft} />
        ))}
      </div>
    </>
  );
}
