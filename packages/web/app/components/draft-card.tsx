'use client';

import { useState } from 'react';
import { Check, Edit2, X } from 'lucide-react';
import type { MemoryEntry } from '@contxt/core';
import { useConfirmDraftMutation, useDiscardDraftMutation, useUpdateEntryMutation } from '../../lib/store/api';

const TYPE_COLORS: Record<string, string> = {
  decision: 'bg-blue/10 text-blue',
  pattern: 'bg-violet/10 text-violet',
  context: 'bg-amber/10 text-amber',
  document: 'bg-teal/10 text-teal',
  session: 'bg-rose/10 text-rose',
};

interface DraftCardProps {
  entry: MemoryEntry;
}

export function DraftCard({ entry }: DraftCardProps) {
  const [confirmDraft, { isLoading: confirming }] = useConfirmDraftMutation();
  const [discardDraft, { isLoading: discarding }] = useDiscardDraftMutation();
  const [updateEntry] = useUpdateEntryMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.title);
  const [editContent, setEditContent] = useState(entry.content);

  async function handleConfirm() {
    await confirmDraft(entry.id);
  }

  async function handleDiscard() {
    if (confirm('Discard this draft? This cannot be undone.')) {
      await discardDraft(entry.id);
    }
  }

  async function handleSaveAndConfirm() {
    await updateEntry({ id: entry.id, updates: { title: editTitle, content: editContent } });
    await confirmDraft(entry.id);
  }

  const source = entry.metadata?.source ?? 'auto';

  return (
    <div className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-black/[0.05]">
      <div className="flex items-start gap-3 mb-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${TYPE_COLORS[entry.type] ?? ''}`}>
          {entry.type}
        </span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full h-8 px-2.5 rounded-[7px] border border-black/[0.1] text-[14px] font-semibold text-text-0 outline-none focus:border-blue/40 transition-all"
            />
          ) : (
            <div className="text-[15px] font-semibold text-text-0 leading-snug">{entry.title}</div>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-text-3">
            <span>Source: {source}</span>
            <span>·</span>
            <span>{entry.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-[9px] border border-black/[0.1] text-[13px] text-text-1 outline-none focus:border-blue/40 transition-all resize-none font-mono mb-3"
        />
      ) : (
        <p className="text-[13.5px] text-text-2 leading-[1.65] mb-4 line-clamp-3">{entry.content}</p>
      )}

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="h-8 px-3 rounded-[8px] text-[12.5px] font-medium text-text-2 hover:bg-black/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndConfirm}
              className="h-8 px-3 rounded-[8px] text-[12.5px] font-semibold bg-bg-dark text-white hover:bg-[#333] transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save & Confirm
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="h-8 px-3 rounded-[8px] text-[12.5px] font-semibold bg-bg-dark text-white hover:bg-[#333] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="h-8 px-3 rounded-[8px] text-[12.5px] font-medium text-text-2 border border-black/[0.08] hover:bg-black/[0.03] transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={handleDiscard}
              disabled={discarding}
              className="h-8 px-3 rounded-[8px] text-[12.5px] font-medium text-rose border border-rose/20 hover:bg-rose/5 transition-colors flex items-center gap-1.5 ml-auto disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
