# Contxt — Landing Page Build Prompt

## Context

The Contxt CLI, core engine, adapters, and MCP server are already built and working. Now we need the marketing site at **mycontxt.ai**. A complete design reference exists as a single HTML file (`contxt.html`) — your job is to rebuild it as a proper Next.js app inside the existing monorepo.

## Reference File

**`contxt.html`** — This is the approved design. It contains the full page structure, exact copy, color system, typography, spacing, and component patterns. Rebuild it faithfully in Next.js. Do not redesign. Do not change copy. Do not invent new sections.

Read the entire file before writing any code.

---

## Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Fonts:** Instrument Serif (display), DM Sans (body), JetBrains Mono (code) — via `next/font/google`
- **Deployment:** Vercel
- **Package location:** `packages/web/` inside the existing monorepo

---

## Design System (extract from contxt.html)

### Colors — warm light theme, no dark mode

```
Background:       #FAFAF8 (cream)
Background warm:  #F0EFEB (warm grey)
Background card:  #FFFFFF
Background dark:  #1A1A1A (used for terminal cards, footer, Pro pricing card)
Background dark 2:#222222

Text primary:     #111111
Text secondary:   #444444
Text tertiary:    #777777
Text muted:       #AAAAAA
Text inverse:     #FAFAF8

Accent colors (for memory type badges):
  Blue:    #2563EB  on  #EEF2FF  (Decisions)
  Violet:  #7C3AED  on  #F5F0FF  (Patterns)
  Amber:   #D97706  on  #FFFBEB  (Context)
  Teal:    #0D9488  on  #F0FDFA  (Documents)
  Green:   #16A34A  (success states)
```

### Typography

```
Display:  Instrument Serif — 400 weight, italic for emphasis
          Hero: clamp(52px, 7.5vw, 104px), letter-spacing: -2px
          Section: clamp(40px, 5.5vw, 72px), letter-spacing: -1.5px
          Feature: 32px
          Stats: 56px

Body:     DM Sans — 400/500/600/700
          Body copy: 17px, color #777, line-height 1.75
          Nav links: 14px
          Buttons: 13.5-15.5px, weight 600

Mono:     JetBrains Mono — 400/500/600
          Code: 12-13.5px
          Labels: 10-12px, uppercase, letter-spacing 2px
          Badges: 10px, uppercase, weight 700
```

### Shapes & Spacing

```
Border radius:  Buttons → 100px (full pill), Cards → 20px, Terminals → 10px, Badges → 6px
Max width:      1320px container, 48px horizontal padding
Section padding: 140px vertical
No visible borders between sections — use whitespace and background color shifts only
Cards use subtle box-shadow (0 1px 3px rgba(0,0,0,0.04)) instead of borders
```

### Critical Design Rules

1. **No glass/frosted effects** — nav uses solid `#FAFAF8` background, no backdrop-filter
2. **No logo icon** — wordmark only ("contxt" in DM Sans 700)
3. **No grey divider lines** — sections are separated by whitespace only
4. **No border on cards** — use subtle shadows instead
5. **Pill-shaped buttons** — border-radius: 9999px on all CTAs
6. **Serif italics for emphasis** — hero and section headings use Instrument Serif italic for the gradient/emphasis words
7. **Dark cards for product demos** — terminal windows and Smart Suggest demo use #1A1A1A backgrounds
8. **Editorial feel** — Cohere.com-inspired. Light, airy, confident, institutional

---

## Page Structure (7 sections, exact order)

### 1. Nav (fixed)

- Solid background, no blur
- Left: wordmark "contxt" (no icon) + links (Features, Smart Suggest, Pricing, Docs, GitHub)
- Right: "Sign in" ghost button + "Get early access" dark pill button
- Mobile: hide links, keep brand + CTA

### 2. Hero

- Heading: `Your AI's next breakthrough, *powered by memory*` (italic on last two words)
- Subhead: `Contxt gives AI coding agents persistent, versioned, project-scoped memory — so they work like a teammate, not a stranger.`
- CTAs: "Get early access" (dark pill) + "Explore the docs" (underline text link)
- Below: two asymmetric cards (grid: 1.15fr / 0.85fr)
  - **Left (large):** Dark terminal card showing `contxt init` → `contxt push` → `contxt load --task "add Stripe webhooks"` output. Floating white stat pill at bottom: "81% fewer tokens"
  - **Right (smaller):** Editorial gradient card (soft pastels: lavender → sky → sage → gold) with overlay text: "Context that persists across every session"

### 3. Problem Section

- Label: `THE PROBLEM`
- Heading: `Every session starts from *zero*`
- Two-column layout:
  - Left: prose paragraphs explaining the memory gap
  - Right: 2×2 stat grid (40%, 3.2×, 5K+, 0) — large Instrument Serif numbers, no borders between stats

### 4. Features (3 alternating blocks)

- Label: `PLATFORM`
- Heading: `Memory infrastructure for the *AI era*`
- Three feature rows, alternating left/right:
  - **01 — Workflow:** "Git-like workflow for _context_" + dark terminal card showing `contxt decision add` + `contxt branch create`
  - **02 — Integrations:** "MCP native, _zero friction_" + dark terminal card showing `claude_desktop_config.json` MCP config (REVERSED layout — visual on left)
  - **03 — Structure:** "Five memory types, built for _developers_" + warm cream card with memory list items (Decision, Pattern, Context, Document badges with colored pills)

### 5. Smart Suggest (the money section)

- Label: `SMART SUGGEST`
- Heading: `Less context, *better output*`
- Full-width dark card containing:
  - Header bar: "RELEVANCE ENGINE" + stats (29 total, 5 returned, 81% saved)
  - Two-column body:
    - Left: Task signal input ("Add Stripe webhook handling...") + active files pills
    - Right: Ranked results with scores (0.92, 0.78, 0.75, 0.71, 0.65) + colored type tags + "24 entries filtered" note
  - Footer: comparison metrics (812 tokens vs ~~4,200~~ tokens)

### 6. Integrations

- Label: `INTEGRATIONS`
- Heading: `Works with every agent you *already use*`
- Row of pill-shaped chips: Claude Code, Cursor, Copilot, Windsurf, Any MCP Client, REST API, GitHub
- Each chip has a small colored square icon + name

### 7. Pricing (3 cards)

- Label: `PRICING`
- Heading: `Start free, *scale when ready*`
- Three cards:
  - **Starter** ($0) — white card, shadow
  - **Pro** ($29/seat/mo) — dark card (#1A1A1A), white CTA button
  - **Enterprise** (Custom) — white card, shadow
- Features listed with → arrows
- Pill-shaped CTA buttons

### 8. CTA

- Heading: `Give your AI a *memory*`
- Subhead: `Stop repeating yourself. Start shipping faster.`
- CTAs: "Get early access" (dark pill) + "Star on GitHub" (underline link)

### 9. Footer (dark, tall)

- Full-width dark background (#1A1A1A)
- Top section: brand + description on left, 3-column link grid on right (Product, Developers, Company)
- Bottom section: copyright + social links, separated by thin rgba white line
- Footer logo is wordmark only, no icon

---

## Package Setup

```
packages/web/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── og-image.png           ← Generate: 1200×630, dark bg, "contxt" wordmark + tagline
│   └── favicon.ico
├── src/
│   └── app/
│       ├── layout.tsx          ← Root layout: fonts, metadata, analytics
│       ├── page.tsx            ← Landing page (single page, all sections)
│       ├── globals.css         ← Tailwind imports + CSS variables
│       └── components/
│           ├── nav.tsx
│           ├── hero.tsx
│           ├── hero-cards.tsx   ← Terminal card + editorial card
│           ├── problem.tsx
│           ├── features.tsx     ← Three alternating feature blocks
│           ├── smart-suggest.tsx ← The dark relevance engine demo
│           ├── integrations.tsx
│           ├── pricing.tsx
│           ├── cta.tsx
│           ├── footer.tsx
│           └── ui/
│               ├── button.tsx
│               ├── section.tsx  ← Reusable section wrapper (label + heading)
│               ├── terminal.tsx ← Reusable dark terminal card
│               ├── badge.tsx    ← Memory type badge (Decision/Pattern/etc)
│               └── reveal.tsx   ← Scroll-triggered fade-up animation (Framer Motion)
```

---

## Implementation Notes

### Framer Motion Animations

- **Scroll reveal:** Every section fades up on scroll using `whileInView` with `once: true`. Use the `Reveal` wrapper component. Transition: `duration: 0.8, ease: [0.16, 1, 0.3, 1]`.
- **Stagger children:** Feature blocks, stat grid items, and pricing cards stagger with 60ms delay between siblings.
- **Hero:** Elements animate in sequence on page load (pill → heading → subhead → CTAs → cards) with staggered delays.
- **No hover animations on cards** — keep it editorial and calm. Hover only on buttons and links.

### Terminal Card Component

Reusable `<Terminal>` component that takes:

- `title` (tab label, e.g. "~/my-saas-app")
- `children` (terminal line content)
- Has macOS traffic light dots (red/yellow/green)
- Dark background (#1A1A1A), monospace font, colored syntax

### Metadata & SEO

```tsx
export const metadata: Metadata = {
  title: "Contxt — Memory for AI Agents",
  description:
    "Persistent, versioned, project-scoped memory for AI coding agents. Push context once — your tools remember it forever.",
  openGraph: {
    title: "Contxt — GitHub for AI Context",
    description: "Your AI forgets. Contxt remembers.",
    url: "https://mycontxt.ai",
    siteName: "Contxt",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};
```

### Tailwind Config

Extend with the design system colors, fonts, and animation easing. Use CSS variables for the color palette so they're consistent with the reference HTML.

### Early Access Form

All "Get early access" buttons should link to a Waitlist. For v1, use `mailto:kareem@ghostsavvy.com?subject=Contxt Early Access` or a simple Tally/Typeform embed. Do NOT build a custom form backend.

---

## Critical Rules

1. **Match the reference HTML exactly** — same copy, same layout, same colors, same spacing. Do not freelance.
2. **Component-first** — every section is its own component. Page.tsx is just composition.
3. **No borders between sections** — whitespace only.
4. **No glass effects, no backdrop-filter anywhere.**
5. **Wordmark only** — "contxt" in DM Sans 700. No icon, no logo mark, no square badge.
6. **Mobile responsive** — single column on mobile, hide nav links, stack hero cards vertically.
7. **Performance** — all fonts via next/font (no external stylesheet requests). Images optimized. No heavy JS.
8. **Ship as static** — `output: 'export'` in next.config for static hosting on Vercel. No server components that need runtime.

---

## Start

Read `contxt.html` first. Then scaffold `packages/web/`, install dependencies, set up Tailwind + fonts, and build section by section starting with the layout and nav. Each component should be pixel-accurate to the reference.
