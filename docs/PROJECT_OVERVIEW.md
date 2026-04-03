# IVEHITMYHEAD — Project overview (living document)

> **Purpose:** Single place to orient humans and AI assistants on what this app is, how it is built, and how to extend it. **Update this file** when you ship meaningful features (add a line under [Feature log](#feature-log) and adjust sections as needed).

---

## Product summary

**IVEHITMYHEAD** is a Next.js app for discovering, browsing, and creating memes: editorial-style browsing (home, feeds, categories), meme detail views, **admin-only** library uploads, and an in-browser **meme generator** (templates + canvas-style editing). Backend data and assets are backed by **Supabase** (Postgres + auth-related patterns) and **Cloudinary** (image hosting and delivery). The product voice in metadata emphasizes a self-aware, low-expectations tone.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 15** (App Router), **React 19** |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`), **clsx**, **tailwind-merge** |
| Fonts | **Geist** / **Geist Mono** via `next/font/google` |
| Data / BaaS | **Supabase** (`@supabase/supabase-js`) — server client uses service role for admin API routes |
| Media | **Cloudinary** + **next-cloudinary** |
| Icons | **lucide-react** (also optimized via `next.config.ts` `optimizePackageImports`) |
| Upload UX | **react-dropzone** |

**Tooling:** `npm run dev` uses **Turbopack**; ESLint via `eslint-config-next`.

---

## Repository layout (mental map)

```
src/app/                 # Routes (App Router): pages + api/
src/app/api/             # REST-style route handlers (memes, categories, upload, etc.)
src/components/
  layout/                # Header, Footer
  meme/                  # MemeCard, MemeGrid, MemeDetail, generator-related pieces
  ui/                    # Shared UI (buttons, sidebars, canvas shell, etc.)
src/lib/
  contexts/              # React providers (auth, memes, categories, navigation warning)
  hooks/                 # useMemes, infinite scroll, scroll restoration, keyboard shortcuts, …
  meme-canvas/           # Canvas renderer/controller, text/image elements
  types/meme.ts          # Canonical Meme, User, Category, template/text types
  supabase/              # client.ts (browser), server.ts (service role)
  cloudinary/            # config
  data/templates.ts      # Template catalog for generator
  utils/                # share, canvas math, auth helpers, time periods, etc.
docs/
  editorial-design-guidelines.md   # Visual system (“Broadsheet Editorial”)
  PROJECT_OVERVIEW.md    # This file
```

---

## App routes (user-facing)

| Path | Role |
|------|------|
| `/` | Landing / featured content |
| `/memes` | Main feed (filters, infinite scroll patterns) |
| `/meme/[slug]` | Single meme detail / navigation |
| `/meme-generator` | Advanced meme generator |
| `/categories` | Categories index |
| `/about` | About |
| `/help` | Help center |
| `/contact` | Contact |
| `/privacy` | Privacy policy (draft placeholder) |
| `/terms` | Terms of service (draft placeholder) |
| `/admin`, `/admin/login` | Admin dashboard (library upload via `MemeUpload`) / auth entry |
| `/test*`, `/debug` | Dev / diagnostic pages (treat as non-production) |

---

## API surface (`src/app/api`)

| Route | Typical responsibility |
|-------|-------------------------|
| `GET/POST` `/api/memes` | List/create memes; query params for pagination, `category_id`, `sort_by`, `time_period`, `search` |
| `GET` `/api/memes/liked` | Liked memes for current context |
| `POST` `/api/memes/upload` | Upload pipeline (Cloudinary + DB); **admin auth required** (`verifyAdminAuth`) |
| `GET/PATCH/DELETE` `/api/memes/[slug]` | Single meme CRUD-style operations |
| `POST` `/api/memes/[slug]/like`, `/share`, `/view` | Interactions / counters |
| `GET/POST` `/api/memes/[slug]/comments` | Comments |
| `GET` `/api/categories` | Categories |
| `POST` `/api/newsletter` | Newsletter signup (webhook or Resend audience; returns 503 if unconfigured) |
| `/api/setup-admin`, `/api/test-*` | Operational / test endpoints — use with care |

**Implementation note:** List queries join `author:profiles` and `category:categories` — schema expectations live in Supabase; keep types in `src/lib/types/meme.ts` aligned with real columns.

---

## State and data flow

- **Server:** Route handlers use `supabaseAdmin` from `src/lib/supabase/server.ts` (requires `SUPABASE_SERVICE_ROLE_KEY` in env).
- **Client:** `MemesStateProvider`, `CategoriesStateProvider`, `AuthProvider`, `NavigationWarningProvider` wrap the app in `src/app/layout.tsx`.
- **Hooks:** `useMemes`, `useCategories`, infinite scroll and scroll-restoration hooks encapsulate feed behavior — prefer extending these over duplicating fetch logic in pages.

---

## Meme generator / canvas

- Core logic under `src/lib/meme-canvas/` (`MemeCanvasController`, `MemeCanvasRenderer`, `TextElement`, `ImageElement`, etc.).
- Templates and typing: `src/lib/data/templates.ts`, `MemeTemplate` / `TextField` in `src/lib/types/meme.ts`.
- UI composition: `AdvancedMemeGenerator`, `MemeCanvas`, template browser components under `components/meme` and `components/ui`.

When changing generator behavior, consider **export/image quality**, **text hit targets**, and **consistency with Broadsheet** surfaces (see design doc).

---

## Design system (high level)

The active visual direction is **“Broadsheet Editorial (Cleaner Shell)”**: hard edges, warm paper background, strong typographic hierarchy, minimal nested chrome. **Authoritative detail:** [`docs/editorial-design-guidelines.md`](./editorial-design-guidelines.md).

`globals.css` defines root theme tokens and utilities (e.g. scrollbar, mobile input font-size guard). Individual pages may layer editorial backgrounds on top of defaults.

---

## Configuration highlights

- **`next.config.ts`:** Remote images for `res.cloudinary.com`, Unsplash, placeholders, etc.; experimental `optimizeCss`, `optimizePackageImports` for `lucide-react`; production `removeConsole`.

---

## Environment variables (names only)

Do not commit secrets. Typical variables inferred from code:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if used on client — verify in `client.ts`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Cloudinary-related vars as required by `src/lib/cloudinary/config.ts` and upload routes
- `NEXT_PUBLIC_SITE_URL` — canonical origin for Open Graph, sitemap, and `metadataBase` (e.g. `https://yourdomain.com`)
- `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_FACEBOOK_URL` — optional footer social links
- `NEXT_PUBLIC_CONTACT_EMAIL` — optional; defaults for mailto on `/contact`
- Newsletter (optional): `NEWSLETTER_SIGNUP_WEBHOOK_URL` and optional `NEWSLETTER_WEBHOOK_SECRET`, **or** `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` for Resend Audiences

---

## Feature log

Append a short bullet when you merge a meaningful change (date + one line).

- *2026-04-01:* Initial `PROJECT_OVERVIEW.md` created from codebase scan.
- *2026-04-01:* Marketing backlog: `/help`, `/contact`, `/privacy`, `/terms`; root OG/Twitter metadata + `metadataBase`; footer social env + trending query link; `sitemap.ts` / `robots.ts`; server `generateMetadata` for meme detail; `POST /api/newsletter` + wired `Newsletter` UI.
- *2026-04-01:* Removed public `/upload` route; meme library uploads only via `/admin` + `POST /api/memes/upload` (admin-only, unchanged).
- *2026-04-03:* Default categories: removed Funny, Gaming, Tech; added Wholesome. Existing Supabase DBs: run `supabase/migrations/20260403_categories_wholesome.sql` once.

---

## Rules for future prompts (copy/paste blocks)

Use these when talking to an AI or onboarding a contributor so changes stay consistent.

### General project rules

```text
Repo: ivehitmyhead — Next.js 15 App Router, React 19, TypeScript, Tailwind v4.
Data: Supabase (admin client in API routes), images via Cloudinary.
Domain types: src/lib/types/meme.ts — extend types and API handlers together.
Prefer existing hooks (useMemes, useCategories) and contexts over new global state.
Keep API logic in src/app/api; avoid putting secrets in client bundles.
Match existing import aliases (@/…) and component organization (components/meme vs components/ui).
```

### UI / layout rules

```text
Follow docs/editorial-design-guidelines.md ("Broadsheet Editorial"):
- Hard corners unless functionally needed; warm paper #f7f4ee; one dominant frame per section.
- Hierarchy: headline → image/content → metadata/actions.
- Spacing rhythm 8/12/16/24; avoid glassmorphism and nested heavy borders.
```

### When adding a feature

```text
1) Update or add types in src/lib/types/meme.ts if the data shape changes.
2) Add or adjust API route under src/app/api with supabaseAdmin; validate inputs.
3) Wire UI through existing providers/hooks where possible.
4) Add a bullet to docs/PROJECT_OVERVIEW.md "Feature log" describing what shipped.
5) If UX is user-visible and broad, skim editorial-design-guidelines.md for conflicts.
```

### When touching the meme generator

```text
Coordinate changes across src/lib/meme-canvas/*, template data, and AdvancedMemeGenerator/MemeCanvas UI.
Preserve export behavior and text field model (percent-based layout in TextField).
```

---

## Related docs

- [`editorial-design-guidelines.md`](./editorial-design-guidelines.md) — UI/visual system and prompt template for design tasks.
- [`src/components/meme/README.md`](../src/components/meme/README.md) — Meme component responsibilities.
- [`src/app/memes/README.md`](../src/app/memes/README.md) — Memes feed notes (if present).
