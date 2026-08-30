# Resources (Publication) — frontend

> Part of feature: **resources** · sibling (primary): `DataExBackend/api/schema/publication_architecture.md` — see it for the cross-repo overview, data model, security and API contract.

## Overview

The frontend for the Resource entity (backend name **Publication**). Users only ever see the word **"Resource"** — the single source for that label is `lib/constants/resourceLabel.ts` (`RESOURCE_LABEL`, `RESOURCE_LABEL_PLURAL`, `RESOURCE_PATH = '/publications'`). The FE has two halves: a public **read** side (Explore listing, detail page, global-search presence) and a dashboard **authoring** side (create / edit / publish, block editor, and a Resource picker inside the Use Case / Collaborative editors).

All data goes through the shared GraphQL clients in `lib/api.ts` (`GraphQL` session-aware, entity-header scoped) and the REST search helper `fetchData(type, …)` (`@/fetch`) which hits `/api/search/publication/`. Block files download through the gated REST route `${NEXT_PUBLIC_BACKEND_URL}/api/publications/blocks/<id>/download/`. GraphQL documents are inline `graphql()` tags typed by codegen; the codegen `documents` glob was widened to include `components/**` so the shared components' docs are typed.

## Submodule map

| Submodule | Route / entry |
|---|---|
| Detail page | `app/[locale]/(user)/publications/[publicationId]/` |
| Explore listing | `app/[locale]/(user)/publications/page.tsx` (reuses `ListingComponent type="publication"`) |
| Explore nav entry | `app/[locale]/dashboard/components/main-nav.tsx` (`exploreLinks`) |
| Unified search | `app/[locale]/(user)/search/components/UnifiedListingComponent.tsx` (`publication` type + redirect) |
| Dashboard list + create | `app/[locale]/dashboard/[entityType]/[entitySlug]/publications/` |
| Create / edit / publish shell | `…/publications/edit/` (context + layout + `[id]/{metadata,blocks,publish}`) |
| Shared metadata form | `components/publications/PublicationForm.tsx` |
| Link picker | `components/publications/PublicationLinkPicker.tsx` (embedded in UC & Collab assign pages) |
| Dashboard sidebar entry | `app/[locale]/dashboard/[entityType]/[entitySlug]/layout.tsx` (`orgSidebarNav`) |

---

## Submodule: Detail page

### Trigger
Route `/publications/[publicationId]` → `PublicationDetailsPage` runs the `getPublication` query.

### Flow
Fetch → loading/error/not-found branches → two-column layout: left renders `PrimaryData` (title, abstract, authors, external link) + `Blocks`; right rail renders `Metadata` (owner, license, tags, download count). `Blocks` sorts by `position` and renders each: **PDF** → inline `<iframe>` of the gated download URL + a download button; **YouTube** → responsive 16:9 embed from `youtubeVideoId`; **any other file** → a download card (name, format, size). Zero blocks → an empty-content message (zero-block publish is allowed).

### States
Loading (spinner), error, not-found, published-with-blocks, published-empty.

---

## Submodule: Authoring (create / edit / publish)

### Trigger
Dashboard: `…/publications` (list + Create) → `…/publications/create` (metadata form → `createPublication` → redirect to the block editor) → `…/publications/edit/[id]/{metadata,blocks,publish}`.

### Flow
- **Create:** the shared `PublicationForm` collects the full metadata (create requires all required fields server-side), submits `createPublication`; on success routes to the new resource's block editor. On a validation failure it surfaces the backend's field / non-field error.
- **Edit shell:** `layout.tsx` renders three tabs (Metadata / Content / Publish); `context.tsx` is the save-status provider (cloned from the AI Model edit shell).
- **Metadata tab:** pre-fills `PublicationForm` from `getPublication` and saves via `updatePublication`.
- **Content tab (block editor):** YouTube URL input → `addPublicationYoutubeBlock`; opub-ui `DropZone` (accept `.pdf .doc .docx .ppt .pptx .odp .odt .key`) → `addPublicationFileBlock` (multipart, file passed in variables); per-block up/down → `reorderPublicationBlocks`; remove → `removePublicationBlock`.
- **Publish tab:** shows status, a Publish/Unpublish button (`publishPublication` / `unpublishPublication`), and the owner-only **"linked to N"** flag from `linkedCount` / `linkedUsecases` / `linkedCollaboratives`.

### Helpers / components
- `PublicationForm` (Tier-2, `components/publications/`) — the typed metadata form used by both create and edit; a normal form (Select for Resource Type from the `resourceTypes` query and for license from the shared vocabulary, Combobox for sectors/geographies, TextField for the rest), NOT the datasets' dynamic-metadata renderer. `toInput` maps the string form fields to the GraphQL input (authors split on commas, geography ids → ints).
- `PublicationLinkPicker` (Tier-2) — fetches published resources via REST search, shows a `DataTable` with the currently-linked set pre-selected, and saves via `updateUsecasePublications` / `updateCollaborativePublications`.

### Known opub-ui type note
opub-ui's `Combobox` declares `onChange: (val: string)` / `selectedValue: string` but at runtime passes/returns value-string **arrays** for multi-select (the rest of the app uses `any` here); `PublicationForm` casts at that single boundary rather than typing the whole component `any`. `Button` variants are `success | basic | interactive | critical` (there is no `primary`/`secondary`).

## Data — reads/writes
Queries: `getPublication`, `publications` (dashboard list), `resourceTypes`, `sectors`, `geographies`, UC/Collab publication-link queries. Mutations: create/update/publish/unpublish, block add(file/youtube)/remove/reorder, `updateUsecasePublications`, `updateCollaborativePublications`. No local persistence beyond TanStack Query cache.

## Security
Read: the detail query is gated server-side (drafts only to owner/org); the listing and search only return the caller's own or published resources. Write: every mutation carries the entity header (`{ [entityType]: entitySlug }`) and is authorized server-side. The link picker only lists published resources and the backend refuses to attach a draft.

## SDK impact
n/a (frontend slice) — the SDK client lives in the backend repo.

## Tests

### Layer 6 — Browser e2e (on-demand)
Highest-value flows: create-from-org-dashboard end to end (metadata → blocks → publish, save-state persists across tabs); create-from-individual-dashboard; block editor (add PDF + deck + YouTube in any order, reorder, remove, invalid-YouTube inline error, over-cap file toast); edit round-trips all metadata (no silent erasure); detail (inline PDF, inline YouTube, download card for other types, zero-block); Explore listing with Resource Type/Geography/Sector filters and no owner filter; unified search returns a Resource result linking to its detail; UC/Collab assign links a published Resource (unpublished not selectable) and the linked-count flag shows on the publish tab.

Layers 1–5: n/a — this is the FE slice; deterministic + journey tests live in the backend repo. FE has no unit runner; the deterministic gate is `npm run generate` + `npx tsc --noEmit` + `npm run lint` (all green: zero new tsc errors over baseline, lint clean).

### Visual checklist (manual, on request)
Empty / loading / populated / error listing; card matching the Dataset card; detail with 0 blocks and with many; long author list wrap; inline PDF at mobile width; responsive 16:9 YouTube; dark mode; "linked to N" as text (not a warning banner); download card shows format + size; **"Resource" everywhere, never "Publication"** — spot-check nav, card, detail, dashboard, search.

### LLM-judge points
n/a — all assertions deterministic.

## Limitations & future work
- The detail/listing **card** reuses the generic `ListingComponent`/detail composition; a bespoke "3 files + 1 video" multi-block indicator is a design follow-up.
- `PublicationForm` uses a comma-separated authors field and a native date input rather than a dynamic multi-author widget / styled date-picker — functional, polish deferred.
- Visual/browser (Layer 6) verification is written here but not yet walked — run on request.
