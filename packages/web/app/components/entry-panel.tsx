'use client';

import { useState } from 'react';
import { X, Edit2, Archive, Copy, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../lib/store/hooks';
import { closePanel, editEntry } from '../../lib/store/panel-slice';
import {
  useGetEntryQuery,
  useUpdateEntryMutation,
  useArchiveEntryMutation,
} from '../../lib/store/api';
import { SlidePanel } from './slide-panel';

const TYPE_COLORS: Record<string, string> = {
  decision: 'bg-blue/10 text-blue',
  pattern: 'bg-violet/10 text-violet',
  context: 'bg-amber/10 text-amber',
  document: 'bg-teal/10 text-teal',
  session: 'bg-rose/10 text-rose',
};

export function EntryPanel() {
  const dispatch = useAppDispatch();
  const { entryId, mode } = useAppSelector((s) => s.panel);
  const isOpen = entryId !== null || mode === 'create';

  const { data: entry, isLoading } = useGetEntryQuery(entryId ?? '', {
    skip: !entryId,
  });
  const [updateEntry] = useUpdateEntryMutation();
  const [archiveEntry] = useArchiveEntryMutation();

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  function handleClose() {
    dispatch(closePanel());
  }

  function handleStartEdit() {
    if (entry) {
      setEditTitle(entry.title);
      setEditContent(entry.content);
      dispatch(editEntry(entry.id));
    }
  }

  async function handleSave() {
    if (!entryId) return;
    await updateEntry({ id: entryId, updates: { title: editTitle, content: editContent } });
    dispatch(closePanel());
  }

  async function handleArchive() {
    if (!entryId) return;
    await archiveEntry(entryId);
    dispatch(closePanel());
  }

  function handleCopy() {
    if (!entry) return;
    const md = `## ${entry.title}\n\n${entry.content}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SlidePanel isOpen={isOpen} onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-black/[0.06] flex-shrink-0">
        {entry && (
          <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${TYPE_COLORS[entry.type] ?? ''}`}>
            {entry.type}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {mode === 'view' && entry && (
            <>
              <button
                onClick={handleCopy}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-text-2 hover:bg-black/[0.04] hover:text-text-0 transition-all"
                title="Copy as markdown"
              >
                {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleStartEdit}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-text-2 hover:bg-black/[0.04] hover:text-text-0 transition-all"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleArchive}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-text-2 hover:bg-black/[0.04] hover:text-text-0 transition-all"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-text-2 hover:bg-black/[0.04] hover:text-text-0 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-black/[0.05] rounded w-3/4" />
            <div className="h-4 bg-black/[0.05] rounded w-full" />
            <div className="h-4 bg-black/[0.05] rounded w-5/6" />
          </div>
        )}

        {entry && mode === 'view' && (
          <>
            <h2 className="text-[18px] font-semibold text-text-0 mb-3 leading-snug">{entry.title}</h2>
            <div className="flex items-center gap-3 mb-5 text-[12px] text-text-3">
              <span>v{entry.version}</span>
              <span>·</span>
              <span>{entry.branch}</span>
              <span>·</span>
              <span>{entry.updatedAt.toLocaleDateString()}</span>
            </div>
            <div className="text-[14px] text-text-1 leading-[1.75] whitespace-pre-wrap">{entry.content}</div>
            {Object.keys(entry.metadata).length > 0 && (
              <div className="mt-6 pt-5 border-t border-black/[0.06]">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-text-3 mb-3">Metadata</div>
                <pre className="text-[12px] text-text-2 font-mono bg-black/[0.03] rounded-[8px] p-3 overflow-x-auto">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {entry && mode === 'edit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-text-2 mb-1.5">Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-[9px] border border-black/[0.1] text-[14px] text-text-0 bg-white outline-none focus:border-blue/40 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)] transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-2 mb-1.5">Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="w-full px-3 py-2.5 rounded-[9px] border border-black/[0.1] text-[14px] text-text-0 bg-white outline-none focus:border-blue/40 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)] transition-all resize-none font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleClose}
                className="h-9 px-4 rounded-[9px] text-[13px] font-medium text-text-2 hover:bg-black/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="h-9 px-4 rounded-[9px] text-[13px] font-semibold bg-bg-dark text-white hover:bg-[#333] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </SlidePanel>
  );
}
