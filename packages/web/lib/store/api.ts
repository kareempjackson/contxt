import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { SupabaseDatabase } from '@contxt/adapters/supabase';
import type {
  Project,
  MemoryEntry,
  Branch,
  CreateEntryInput,
  ActivityItem,
  UsageStats,
  EntryQuery,
} from '@contxt/core';

function getDb() {
  return new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
}

export const contxtApi = createApi({
  reducerPath: 'contxtApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Projects', 'Entries', 'Entry', 'Drafts', 'Activity', 'Sessions', 'Branches', 'Usage'],
  endpoints: (builder) => ({
    // ─── Queries ───────────────────────────────────────────
    getProjects: builder.query<Project[], string>({
      queryFn: async (userId) => {
        try {
          const db = getDb();
          const data = await db.getProjects(userId);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Projects'],
    }),

    getEntries: builder.query<MemoryEntry[], EntryQuery>({
      queryFn: async (query) => {
        try {
          const db = getDb();
          const data = await db.listEntries(query);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Entries'],
    }),

    getEntry: builder.query<MemoryEntry | null, string>({
      queryFn: async (entryId) => {
        try {
          const db = getDb();
          const data = await db.getEntry(entryId);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: (_result, _err, id) => [{ type: 'Entry', id }],
    }),

    searchEntries: builder.query<
      MemoryEntry[],
      { projectId: string; query: string; type?: string; branch?: string; limit?: number }
    >({
      queryFn: async ({ projectId, query, type, branch, limit }) => {
        try {
          const db = getDb();
          const data = await db.searchEntries(projectId, query, { type, branch, limit });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Entries'],
    }),

    getDrafts: builder.query<MemoryEntry[], { userId: string; projectId?: string }>({
      queryFn: async ({ userId, projectId }) => {
        try {
          const db = getDb();
          const data = await db.getDrafts(userId, projectId);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Drafts'],
    }),

    getActivity: builder.query<ActivityItem[], { userId: string; projectId?: string; limit?: number }>({
      queryFn: async ({ userId, projectId, limit }) => {
        try {
          const db = getDb();
          const data = await db.getActivity(userId, { projectId, limit }) as ActivityItem[];
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Activity'],
    }),

    getSessions: builder.query<MemoryEntry[], { projectId: string; limit?: number }>({
      queryFn: async ({ projectId, limit }) => {
        try {
          const db = getDb();
          const data = await db.getSessions(projectId, { limit });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Sessions'],
    }),

    getBranches: builder.query<Branch[], string>({
      queryFn: async (projectId) => {
        try {
          const db = getDb();
          const data = await db.listBranches(projectId);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Branches'],
    }),

    getUsage: builder.query<UsageStats, string>({
      queryFn: async (userId) => {
        try {
          const db = getDb();
          const data = await db.getUsage(userId);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Usage'],
    }),

    searchAll: builder.query<
      MemoryEntry[],
      { userId: string; query: string; type?: string; limit?: number }
    >({
      queryFn: async ({ userId, query, type, limit }) => {
        try {
          const db = getDb();
          const data = await db.searchAllEntries(userId, query, { type, limit });
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Entries'],
    }),

    // ─── Mutations ─────────────────────────────────────────
    createEntry: builder.mutation<MemoryEntry, CreateEntryInput>({
      queryFn: async (input) => {
        try {
          const db = getDb();
          const data = await db.createEntry(input);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Entries', 'Drafts'],
    }),

    updateEntry: builder.mutation<
      MemoryEntry,
      { id: string; updates: Partial<Pick<MemoryEntry, 'title' | 'content' | 'metadata' | 'status'>> }
    >({
      queryFn: async ({ id, updates }) => {
        try {
          const db = getDb();
          const data = await db.updateEntry(id, updates);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Entry', id }, 'Entries'],
    }),

    archiveEntry: builder.mutation<void, string>({
      queryFn: async (entryId) => {
        try {
          const db = getDb();
          await db.archiveEntry(entryId);
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (_result, _err, id) => [{ type: 'Entry', id }, 'Entries'],
    }),

    confirmDraft: builder.mutation<MemoryEntry, string>({
      queryFn: async (entryId) => {
        try {
          const db = getDb();
          const data = await db.confirmDraft(entryId);
          return { data };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      onQueryStarted: async (entryId, { dispatch, queryFulfilled, getState }) => {
        // Optimistic removal from draft list
        const patchResult = dispatch(
          contxtApi.util.updateQueryData('getDrafts', { userId: '' }, (draft) => {
            const idx = draft.findIndex((e) => e.id === entryId);
            if (idx !== -1) draft.splice(idx, 1);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Drafts', 'Entries'],
    }),

    discardDraft: builder.mutation<void, string>({
      queryFn: async (entryId) => {
        try {
          const db = getDb();
          await db.discardDraft(entryId);
          return { data: undefined };
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Drafts'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetEntriesQuery,
  useGetEntryQuery,
  useSearchEntriesQuery,
  useSearchAllQuery,
  useGetDraftsQuery,
  useGetActivityQuery,
  useGetSessionsQuery,
  useGetBranchesQuery,
  useGetUsageQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useArchiveEntryMutation,
  useConfirmDraftMutation,
  useDiscardDraftMutation,
} = contxtApi;
