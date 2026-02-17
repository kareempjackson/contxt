# Contxt Dashboard — Wire to Backend

## What Exists

- **Dashboard UI** — `contxt-dashboard.html` is a complete, pixel-perfect HTML/CSS/JS prototype with all views, components, interactions, hover states, transitions, and responsive behavior. Every visual decision is made.
- **Backend** — Supabase project is live with schema, RLS policies, migrations, and auth (GitHub OAuth) configured.
- **Core package** — `@contxt/core` exports all TypeScript types: `MemoryEntry`, `Project`, `Branch`, `Session`, etc.
- **Adapter package** — `@contxt/adapters` exports Supabase query functions: `getProjects`, `getEntries`, `getEntry`, `searchEntries`, `getDrafts`, `confirmDraft`, `discardDraft`, `updateEntry`, `createEntry`, `archiveEntry`, `getActivity`, `getSessions`, `getBranches`, `getUsage`.
- **CLI, MCP server, landing page, docs** — all built and deployed.

## What This Prompt Does

One job: convert `contxt-dashboard.html` into a Next.js app inside `packages/dashboard/`, connect it to Supabase auth and data via `@contxt/adapters`, and manage client state with Redux Toolkit + RTK Query.

**Do not redesign anything.** Extract the HTML/CSS exactly as-is into React components. Every class, every shadow, every transition, every color — match the prototype. The design is final.

---

## Before Writing Code

1. Read `contxt-dashboard.html` end to end — understand every view, component, and interaction
2. Read `packages/core/src/types.ts` — these are your data types, import them
3. Read `packages/adapters/src/supabase/` — these are your queries, import them
4. Run existing migrations to understand the Supabase schema

---

## Stack

- Next.js 14+ (App Router) in `packages/dashboard/`
- Supabase Auth (`@supabase/ssr` for SSR, GitHub OAuth)
- Redux Toolkit + RTK Query
- Tailwind CSS v4 (extract design tokens from the HTML prototype's CSS variables)
- Lucide React (icons — already used in the HTML via CDN)
- Framer Motion (slide panel animation)
- Inter + JetBrains Mono via `next/font/google`

---

## Step 1: Scaffold + Auth

1. Init `packages/dashboard/` with Next.js 14, install deps
2. Extract the CSS custom properties from the HTML prototype into `tailwind.config.ts` (shadows, colors, easing, radii)
3. Set up Supabase auth:
   - `middleware.ts` — protect `/dashboard/**`, redirect unauthenticated to `/login`
   - `/login` page — match the HTML's design system, "Continue with GitHub" button
   - `/auth/callback/route.ts` — exchange OAuth code, redirect to `/dashboard`
4. Verify: GitHub login works, session persists, `/dashboard` is protected

## Step 2: Redux Store + RTK Query

Create `src/lib/store/`:

**`api.ts`** — Single RTK Query API slice. Every endpoint wraps a function from `@contxt/adapters`:

```
Query endpoints:     getProjects, getEntries, getEntry, searchEntries,
                     getDrafts, getActivity, getSessions, getBranches, getUsage
Mutation endpoints:  updateEntry, createEntry, archiveEntry, confirmDraft, discardDraft
Tag types:           Projects, Entries, Entry, Drafts, Activity, Sessions, Branches, Usage
```

Each mutation defines `invalidatesTags` so related queries refetch automatically. `confirmDraft` and `discardDraft` use `onQueryStarted` for optimistic removal from the draft list.

**`panel-slice.ts`** — Redux slice for slide panel state: `{ entryId, mode: 'view' | 'edit' | 'create', createType }`. Actions: `openEntry`, `editEntry`, `createEntry`, `closePanel`.

**`store.ts`** — `configureStore` combining `api.reducer`, `panel` reducer, and `api.middleware`.

**`store-provider.tsx`** — Redux Provider wrapper for the root layout.

## Step 3: Extract Components from HTML

Decompose the HTML prototype into React components. **Copy the styles exactly** — use Tailwind utility classes that map to the prototype's CSS, or inline the custom properties where Tailwind doesn't cover it.

Components to extract (all visuals already defined in the HTML):

- `sidebar.tsx` — brand, search, nav links, project list, account section, usage meters, user profile
- `topnav.tsx` — breadcrumb, docs/help links, avatar
- `entry-row.tsx` — single entry in a list (badge, title, description, version, time)
- `entry-panel.tsx` — slide-over panel with view/edit/create modes
- `project-card.tsx` — card in the projects grid
- `draft-card.tsx` — review queue card with confirm/edit/discard actions
- `activity-item.tsx` — timeline entry
- `session-item.tsx` — session row
- `branch-row.tsx` — branch list item
- `empty-state.tsx` — empty view with CLI command + copy button
- UI primitives: `badge.tsx`, `pill-tabs.tsx`, `filter-pills.tsx`, `slide-panel.tsx`, `copy-button.tsx`

## Step 4: Wire Pages to Data

Every page is a server component for initial data, then a client component using RTK Query for interactions.

**`/dashboard`** — Projects view

- Server: fetch projects via `@contxt/adapters`
- Client: `useGetProjectsQuery`, client-side search/filter/sort
- Click card → navigate to `/dashboard/projects/[slug]`

**`/dashboard/projects/[slug]`** — Project detail

- Server: fetch project + entries for default branch
- Client: `useGetEntriesQuery` with URL params (`?type=`, `?branch=`)
- Pill tabs: Memory, Branches (`useGetBranchesQuery`), Sessions (`useGetSessionsQuery`), History (`useGetActivityQuery`), Settings
- Click entry → dispatch `openEntry(id)` → panel opens → URL gets `?entry=[id]`

**`/dashboard/search`** — Search

- Client: `useSearchEntriesQuery` on form submit, query in URL `?q=`
- Click result → dispatch `openEntry(id)`

**`/dashboard/activity`** — Activity feed

- Server: fetch initial activity
- Client: `useGetActivityQuery`, filter tabs

**`/dashboard/review`** — Draft queue

- Client: `useGetDraftsQuery`
- Confirm → `useConfirmDraftMutation` (optimistic remove)
- Discard → `useDiscardDraftMutation` (optimistic remove)
- Sidebar badge reads draft count from this query

**`/dashboard/settings/**`\*\* — Profile, API Keys, Billing, Team

## Step 5: Realtime

One hook (`use-realtime-sync.ts`) subscribes to Supabase Realtime and dispatches `api.util.invalidateTags()`:

- `memory_entries` changes → invalidate `Entries`, `Drafts`
- `sync_log` changes → invalidate `Activity`

CLI pushes and MCP auto-captures appear in the dashboard without refresh.

## Step 6: Panel URL Sync

One hook (`use-panel-url.ts`) syncs Redux panel state ↔ URL `?entry=` param:

- Page loads with `?entry=dec_123` → dispatch `openEntry('dec_123')`
- Click entry → dispatch `openEntry(id)` → push `?entry=[id]` to URL
- Close panel → dispatch `closePanel()` → remove `?entry=` from URL
- Back button → URL change → dispatch accordingly

---

## Routes

```
/login                              → Login (public)
/auth/callback                      → OAuth callback (public)
/dashboard                          → Projects
/dashboard/projects/[slug]          → Project detail (?tab= ?type= ?branch= ?entry=)
/dashboard/search                   → Search (?q= ?project=)
/dashboard/activity                 → Activity (?project=)
/dashboard/review                   → Draft review
/dashboard/settings                 → Profile
/dashboard/settings/api-keys        → API keys
/dashboard/settings/billing         → Billing
/dashboard/settings/team            → Team
```

---

## Rules

1. **Do not redesign.** The HTML prototype is the source of truth for every visual detail.
2. **Import types from `@contxt/core`.** Do not redefine data types.
3. **Import queries from `@contxt/adapters`.** Do not rewrite Supabase queries.
4. **All data fetching through RTK Query.** No raw `useEffect` + `fetch` patterns.
5. **All mutations define `invalidatesTags`.** No manual cache clearing.
6. **Panel state lives in Redux.** URL sync is a side effect of Redux state changes.
7. **Supabase Realtime invalidates RTK Query tags.** Not custom state updates.

---

## Start

Read the HTML prototype. Read the core types. Read the adapter queries. Scaffold the Next.js app, set up auth, set up the Redux store, then extract components and wire pages — in that order.
