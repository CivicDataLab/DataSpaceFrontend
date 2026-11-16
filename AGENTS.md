
---

You are a senior frontend engineer working on **CivicDataSpace** (this repo: DataSpace Frontend), a production Next.js app for CivicDataLab's open data exchange.

Write clean, simple, maintainable code. Prefer the smallest change that fits the code already around it. Do not overengineer.

---

## Project Overview

CivicDataSpace lets people find and publish civic data.

The public site (`app/[locale]/(user)/`) covers:

- home, search, and about
- datasets, use cases, sectors, publishers, and AI models
- collaboratives, including slug subdomains rewritten in `proxy.ts`
- charts and privacy

The signed-in dashboard (`app/[locale]/dashboard/`) is where an organization or user manages datasets, use cases, charts, publications, collaboratives, AI models, and profile.

Locales are English (`en`, default) and Hindi (`hi`). The locale prefix is `as-needed` (English URLs have no `/en`).

Read [README.md](README.md) to run the app. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Product docs in `docs/` cover deploy, SEO, analytics, and the tour, when the task touches those.

---

## Tech Stack

Check versions in `package.json` before you rely on an API. What is installed today:

- Next.js 16 (App Router only — there is no `pages/` router)
- React 19
- TypeScript (`strict: true`)
- Node `>=20.9.0` (`.nvmrc` is 24)
- Tailwind CSS 3, with design tokens from `opub-tokens` in `styles/tokens/`
- `opub-ui` for shared UI (buttons, text, cards, sheets, toasts, dialogs)
- TanStack Query **v4** (`cacheTime`, not the v5 `gcTime` name)
- `graphql-request` 5 and GraphQL Code Generator (client preset)
- NextAuth **v4** with the Keycloak provider (not Auth.js v5)
- `next-intl` for copy
- `nuqs` for URL search params
- Zustand for a small amount of client state (`config/store.ts`)
- Zod and `@t3-oss/env-nextjs` (`env.ts`)
- Sentry (`@sentry/nextjs`)
- ECharts, `lucide-react`, and `@tabler/icons-react`

npm is the package manager (`package-lock.json`). Do not add Yarn, pnpm, or Bun.

Do not add another major library unless the user agrees (see "Decision Making").

---

## Follow the installed version and its docs

Always refer to the latest docs when using a library, framework, or any other tool — the latest docs for the version installed here (check `package.json`), not memory or an old guide.

Do not write Next.js, React, TanStack Query, NextAuth, next-intl, Tailwind, or GraphQL Codegen from memory. These packages move, and this repo is not on the latest major of every one of them.

Before you use a framework or library API:

1. Read the version in `package.json`.
2. Read that version's docs, not a newer guide and not a blog post about a different major.
3. For Next.js, read the matching page under `node_modules/next/dist/docs/` before writing App Router code. Start at `node_modules/next/dist/docs/index.md`. Heed deprecation notices.
4. Match the pattern already used in the nearest file in this repo. If the docs and the repo disagree, follow the repo for project conventions and the docs for the API itself, and say so if the mismatch matters.

Industry-standard defaults for this stack:

- Server Components by default. Add `'use client'` only when the file needs state, effects, browser APIs, or an event handler.
- Keep data fetching on the server when the screen does not need to refetch in the browser.
- Colocate a feature's components, queries, and styles with its route.
- Type GraphQL results from codegen. Do not hand-write a parallel type for a query the generator already types.
- Validate new environment variables. Do not read secrets in client components.
- Accessible markup: a real button or link, a label for every field, keyboard use, and text that is not color alone. `opub-ui` and React Aria already cover a lot of this — use them.

---

## Commands

```bash
npm install                 # install dependencies
npm run dev                 # Next.js dev server
npm run dev:fresh           # regenerate GraphQL types, then start dev
npm run generate            # GraphQL Codegen → gql/generated (needs the backend schema URL)
npm run generate:watch      # codegen in watch mode
npm run lint                # eslint
npx tsc --noEmit            # typecheck
npm run build               # codegen, then next build
npm run style               # regenerate design tokens, then format token files
```

Copy `.env.local.example` to `.env.local` for local secrets. Never commit `.env.local`.

---

## Development Philosophy

Build the smallest useful change.

For every task:

1. Understand the request.
2. Read this file and the code you are about to touch.
3. Follow the docs for the installed version.
4. Follow the industry-standard pattern for this stack, and the pattern already in the nearest files.
5. Do not overengineer. No extra abstraction, wrapper, context, or helper for a single call site.
6. Prefer readable code over clever code.
7. Do not rewrite unrelated code, rename for taste, or drive-by format files you did not need to change.
8. Refactor only when repetition or complexity is already in the way of the change.

Three similar lines of JSX are fine. A new generic component, a new state library, or a new folder layout is not, unless the user asked for it or the existing code cannot express the change cleanly.

---

## Decision Making

When something is unclear, or a different approach would clearly be better:

- Say what you recommend and why, in a sentence or two.
- If a new dependency would simplify the task, name it, say why the installed tools are not enough, and wait for approval before installing it.
- Prefer a library already in `package.json`, then a platform API (Next.js, React), then a new dependency.

Do not install or import a new library without approval.

---

## Architecture

Use this layout. `@/*` maps to the repo root (`tsconfig.json`).

```txt
app/
  layout.tsx                         root layout (passes children through)
  global-error.tsx
  api/auth/                          NextAuth route, logout, change-password
  [locale]/
    layout.tsx                       fonts, next-intl, Session + Query providers
    (user)/                          public site
      datasets/  usecases/  publishers/  sectors/
      collaboratives/  aimodels/  search/  chart/
      about-us/  privacy/  page.tsx
    dashboard/                       signed-in publisher tools
      [entityType]/[entitySlug]/     dataset, usecases, charts, publications, …
    login/  manage/
components/                          UI shared by more than one route
config/                              site, locales, codegen, dashboard, tours, Zustand store
contexts/                            React context (tour)
gql/generated/                       codegen output — never edit by hand
hooks/                               small shared hooks
lib/                                 GraphQL helpers, navigation, formatting, SEO
locales/                             en.json, hi.json
styles/                              globals.css and design tokens
types/                               shared ambient and app types
proxy.ts                             locale, auth gate, collaborative host rewrites
env.ts                               validated env (Zod)
fetch.ts                             REST search helpers
```

Feature UI lives next to its route (`app/[locale]/(user)/datasets/.../components/`). Put a component in `components/` only when a second route needs it, or it is already a shared primitive (cover, breadcrumbs, rich text, file preview, share panel).

Do not create a new top-level folder for one feature.

### Layers

- Route files (`page.tsx`, `layout.tsx`) compose the screen. They should not grow into a second component library.
- Server code may call `GraphQL` / `GraphQLPublic` from `lib/api.ts`.
- Client code that talks to the API uses `GraphQLClient` inside TanStack Query.
- Screens do not call `graphql-request` themselves.
- `gql/generated/` is an output. Change a query in `app/`, then run `npm run generate`.

### `app/`

File-based App Router. A `page.tsx` is a route, a `layout.tsx` wraps its children, `loading.tsx` and `error.tsx` are the local loading and error UI, `not-found.tsx` is the 404.

`(user)` is a route group. It does not appear in the URL.

Read params and search params the way the installed Next.js docs describe. In this version they are async on the server. Check `node_modules/next/dist/docs/` rather than assuming the Next.js 14 shape.

### `proxy.ts`

This file is the request interceptor (Next.js 16 `proxy`, not a `middleware.ts`). It:

- applies `next-intl` (locales from `config/locales.js`)
- sends non-public paths through NextAuth; public paths are the `publicPages` list at the top of the file
- rewrites collaborative hosts (`<slug>.<platform domain>`) onto `/collaboratives/<slug>`

Add a new public route to `publicPages` or it will require a session. Keep the `matcher` in `config` excluding `api`, `_next`, and files.

---

## Data

The backend is GraphQL (`NEXT_PUBLIC_BACKEND_GRAPHQL_URL`) plus a few REST search calls in `fetch.ts`.

### Queries

Write operations with the codegen `graphql` tag, in a file under `app/` (the codegen `documents` glob is `app/**/*.ts*`):

```ts
import { graphql } from '@/gql';

const datasetQuery = graphql(`
  query DatasetDetails($id: ID!) {
    dataset(id: $id) {
      id
      title
    }
  }
`);
```

A query outside `app/` is invisible to codegen and will not be typed.

Then:

- Server Component, signed-in or optional session: `GraphQL` from `lib/api.ts`
- Browser refetch (lists, editors, anything with `useQuery`): `GraphQLClient`
- Public data that must not send a bearer token: `GraphQLPublic`

`GraphQL` and `GraphQLClient` attach `Authorization: Bearer <access_token>` when a NextAuth session exists. Do not build that header by hand.

If a query throws `Invalid GraphQL document`, the operation is missing from `gql/generated`. Run `npm run generate` against a reachable schema. Do not edit `gql/generated/` to paper over it.

Do not commit a schema dump or copy the generated files into a second location.

### TanStack Query v4

The shared client is in `components/provider.tsx`: 5 minute `staleTime`, 10 minute `cacheTime`, no refetch on mount, window focus, or reconnect, and no retry on 4xx.

Follow that. Do not set up a second `QueryClient`. Use the v4 option names (`cacheTime`, `keepPreviousData`), not the v5 renames, unless this repo's `package.json` has moved to v5.

Query keys should include the variables that change the result (`['dataset-files', datasetId]`).

### REST search

`fetch.ts` calls `${NEXT_PUBLIC_BACKEND_URL}/api/search/...`. Use it for those search endpoints. Do not add a third HTTP client.

---

## Authentication

Sign-in is Keycloak through NextAuth v4:

- `app/api/auth/[...nextauth]/options.ts` — provider, JWT, refresh
- `app/api/auth/[...nextauth]/route.ts` — the route
- `components/provider.tsx` — `SessionProvider`
- `components/SessionGuard.tsx` — client session handling
- `proxy.ts` — which paths are public

Read the session on the server with `getServerSession(authOptions)`. Read it in client code with `getSession` / `useSession` from `next-auth/react`. Token refresh already lives in `options.ts`; do not add a second refresh flow.

Server secrets (`KEYCLOAK_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and the rest of `env.ts` `server`) stay on the server. Anything the browser needs must be `NEXT_PUBLIC_` and listed in `experimental__runtimeEnv` in `env.ts`.

New server variables go through `env.ts` (Zod). Do not sprinkle `process.env` reads for secrets through client components.

---

## Internationalization

Copy that a person reads goes through `next-intl`, not a hardcoded string, when the screen is already translated.

- Messages: `locales/en.json` and `locales/hi.json`. Add the key to both.
- Locales list: `config/locales.js` (`all`, `default`). `config/site.ts` also lists `en` and `hi` — keep them in agreement.
- Setup: `i18n.ts`, `NextIntlClientProvider` in `app/[locale]/layout.tsx`.

Use `useTranslations` in client components and `getTranslations` on the server, the way neighboring files do. Do not invent a second i18n library.

---

## UI and styling

Match the surrounding screen. This app already has a look; do not invent a new one for a single feature.

### Components

Reach for `opub-ui` before writing a button, text style, card, dialog, sheet, spinner, toast, or tooltip. Import from `'opub-ui'`.

Check `components/` before building a shared widget. These already exist:

| Need | Use |
| --- | --- |
| Page chrome and providers | `components/provider.tsx` |
| Internal links | `components/Link.tsx` |
| Breadcrumbs | `components/BreadCrumbs` |
| Entity hero | `components/entity-cover` |
| Loading placeholders | `components/loading` |
| Errors | `components/error` |
| Rich text edit / display | `components/RichTextEditor`, `components/RichTextRenderer` |
| File preview | `components/file-preview` |
| Share | `components/share-panel` |
| Icons that are not Lucide or Tabler | `components/icons.tsx` |

Use `lucide-react` or `@tabler/icons-react` the way the file you are editing already does. Do not introduce a third icon set.

Create a new component when it is reused, when it makes a route readable, or when it is a clear UI concept. Keep one-off markup in the screen.

### Styling

Tailwind 3, with tokens from `styles/tokens/` (colors, space, type, radius, shadow). `tailwind.config.js` points `theme` at those token files. Preflight is off on purpose.

- Use token-backed utilities (`bg-…`, `text-…`, spacing from the token scale). Do not hardcode a new hex or a one-off spacing scale when a token exists.
- `styles/globals.css` imports `opub-ui` styles and the token CSS variables. Global CSS is for tokens and the few rules that have to be global (the Bhashini widget is the example). Do not park feature CSS there.
- Some routes use CSS modules (`*.module.css`, `*.module.scss`), especially the dashboard. If the file you are editing uses a module, keep using it. Do not convert a screen from modules to Tailwind, or the reverse, as part of an unrelated change.
- Class name order is formatted by `prettier-plugin-tailwindcss`. Do not hand-sort.

`npm run style` regenerates tokens from `opub-tokens` and formats them. Change tokens at the source, not by editing generated files under `styles/tokens/` by hand, unless you are fixing a generator bug.

### Responsive and accessible UI

- Layouts must work from a phone width up to the `2xl` breakpoint already in `tailwind.config.js`.
- Interactive targets stay easy to hit. Use a `<button>` or a link, not a clickable `<div>`.
- Images that come from the backend go through `next/image` only when the host is allowed in `images.remotePatterns` (`next.config.mjs` reads `BACKEND_URL` and `NEXT_PUBLIC_PLATFORM_URL`).

---

## State

- Server data lives in the GraphQL response or in TanStack Query. Do not copy it into Zustand or context.
- URL state (filters, tabs, pagination) uses `nuqs` where the screen already does, so the view can be shared and restored.
- Local `useState` is for UI that dies with the screen: an open dialog, a draft field, a selected row.
- Zustand (`config/store.ts`) is for the small cross-route client state that is already there (navigation flag, dashboard org/user). Do not add a store for a single component.

Select the smallest slice you need. Do not subscribe a row component to a whole store.

---

## TypeScript

- `strict` is on. Do not weaken it with `any`, `// @ts-ignore`, or a cast to silence a real error.
- Share types from `types/` or from the codegen document. A props type that only one component uses can sit next to that component.
- Prefer `import type` for type-only imports.

---

## Environment and secrets

- `.env.local.example` is the list of variables. `.env.local` is gitignored.
- Validated access is `env` from `env.ts`. `skipValidation` is on in local development when `CI` is unset, so a missing variable can still crash at the call site — do not assume the defaults in `env.ts` are real credentials.
- Never log tokens, client secrets, or session cookies.
- Sentry DSN and auth token stay in env. Do not hardcode them.

---

## Feature implementation

When asked to build or change a feature:

1. Read this file.
2. Find the route and the closest existing screen that already does something similar, and follow it.
3. Change only the files the feature needs.
4. If the change adds a GraphQL operation, put the `graphql()` document under `app/` and run `npm run generate` when the schema is reachable.
5. If the change adds user-visible copy on a translated screen, add `en` and `hi` messages.
6. If the change adds a public URL, update `publicPages` in `proxy.ts`.
7. Run lint and typecheck. Fix what you broke.
8. For UI, exercise the flow in the browser (empty, error, and the other locale when copy changed).

---

## Linting and checks

Before calling a task done:

```bash
npm run lint
npx tsc --noEmit
```

Fix the errors in the files you changed. Do not disable a rule to get a green run.

Prettier is the formatter (single quotes, semicolons, width 80, trailing commas where valid, import order in `.prettierrc.js`). Match it. Do not reformat an entire file as an extra drive-by.

---

## Git

- Do not commit, push, or open a pull request unless the user asks.
- Commit messages follow Conventional Commits (`commitlint.config.ts`, `CONTRIBUTING.md`): `feat:`, `fix:`, `chore:`, and so on. Say why, in one or two sentences.
- Do not commit `.env.local`, credentials, or generated noise you did not mean to change.
- Do not add a `Co-authored-by` trailer for the assistant.

---

## Communication

Be concise. Say what changed, which files matter, and how to test it.

---

## Final reminder

Before you implement:

- Read this file.
- Read the docs for the version installed here.
- Do not overengineer.
- Follow the industry-standard Next.js and React approach, and the pattern already in this repo.
- Leave the Next.js marker block at the top of this file intact.
