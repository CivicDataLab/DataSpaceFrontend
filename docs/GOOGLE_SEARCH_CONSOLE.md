# 🔍 Google Search Console — Setup & Sitemap Validation Handover

How to connect CivicDataSpace to Google Search Console (GSC) and read the
sitemap validation report. Companion to [`SEO.md`](./SEO.md).

---

## 0. Scope decision — which domain(s) to register

| Domain | Environment | Register in GSC? |
|---|---|---|
| `civicdataspace.in` | production (`main`) | ✅ Yes — this is what should be indexed |
| `dev.civicdataspace.in` | development (`dev`) | ⚠️ No — see caveat below |

**Caveat found while auditing this repo:** `app/robots.txt/route.ts` returns
`Allow: /` on every environment, with no distinction for dev. That means
`dev.civicdataspace.in` is currently fully crawlable, and if it's ever
submitted to GSC or linked from anywhere, Google can index the staging site
as duplicate content. Before doing outreach/backlink work, consider gating
dev behind `Disallow: /` (or `noindex` headers) keyed off
`NEXT_PUBLIC_PLATFORM_URL`/environment. Flagging this as a follow-up, not
blocking sitemap validation on prod.

This doc assumes you're registering **`civicdataspace.in`** in GSC.

---

## 1. Prerequisites

- Access to DNS for `civicdataspace.in` (needed for domain-property
  verification — ask whoever manages the domain registrar/DNS zone).
- A Google account to own the GSC property (ideally a shared team account or
  Google Group, not a personal one, so access survives people leaving).
- Confirm `FEATURE_SITEMAPS=true` is set in the **production** GitHub
  environment vars (`deploy-Dataspace.yml` → `environment: production`).
  Sitemap routes 404 if this flag is off (`lib/utils.ts` → `isSitemapEnabled`).

  **Quoting matters differently depending on where you set it.** The check
  is a strict string comparison: `process.env.FEATURE_SITEMAPS === 'true'`
  (`lib/utils.ts:210`).
  - In a `.env` file (local dev, or a `.env` living on the EC2 box):
    quotes are stripped by Next.js's dotenv-based loader, so
    `FEATURE_SITEMAPS='true'`, `="true"`, and `=true` are all equivalent.
  - In a **GitHub Actions repo/environment variable** (Settings →
    Environments → Variables, consumed as `${{ vars.FEATURE_SITEMAPS }}`):
    there is no quote-stripping. The value you type is used verbatim, so
    it must be entered as `true` with **no quotes** — typing `'true'` there
    becomes the literal 6-character string `'true'`, which fails the check.

  Also note: **this variable only affects the CI build job**, not the live
  server. `deploy-Dataspace.yml` never ships an `.env` file or injects env
  vars into the EC2 process — it only scp's the built `.next`/`public`
  folders over and does `pm2 restart dataspace`. The running server reads
  `FEATURE_SITEMAPS` from its own local `.env` file on the EC2 box at
  process start (dotenv-loaded, quotes-safe there), completely independent
  of the GitHub Actions variable. So editing the GH Actions var alone won't
  change what `dev.civicdataspace.in`/`civicdataspace.in` actually serves —
  the box's own `.env` is the source of truth for runtime behavior.

---

## 2. Add the property

**What we actually used (confirmed working):** **URL-prefix** property type,
entered as exactly `https://civicdataspace.in` (no `www`, no trailing
slash). This matches the sitemap's real host — `www.civicdataspace.in` and
plain `http://` both 301-redirect into this canonical host (confirmed via
`curl`), so the URL-prefix property that matches the redirect *target*
verifies and fetches cleanly.

1. Go to [search.google.com/search-console](https://search.google.com/search-console).
2. Click **Add property**.
3. Under **URL prefix**, enter `https://civicdataspace.in`.
4. Verify (see §3).

**Alternative — Domain property** (covers `http`, `https`, `www`, and all
subdomains under one verification, so you don't have to think about which
host variant matches): choose **Domain**, enter `civicdataspace.in`, and
verify via DNS TXT record instead. More robust long-term, but needs DNS
access, which is why URL-prefix was used first.

## 3. Verify ownership

**URL-prefix property** (what worked): use one of GSC's offered methods —
HTML file upload to the site, HTML meta tag in `<head>`, or (simplest, no
deploy required) a DNS TXT record via your domain host — then click
**Verify**.

**Domain property** (DNS TXT record):
1. GSC gives you a TXT record value like `google-site-verification=xxxxx`.
2. Add it as a **TXT record** on the apex domain in your DNS provider.
3. Click **Verify** in GSC (propagation can take a few minutes to a few
   hours).

---

## 4. Submit the sitemap

1. In GSC, left sidebar → **Sitemaps**.
2. Under "Add a new sitemap," enter: `sitemap.xml`
   (resolves to `https://civicdataspace.in/sitemap.xml`).
3. Click **Submit**.

This is the canonical sitemap index — added in PR #429 (`app/sitemap.xml/route.ts`).
It fans out to:

```
/sitemap.xml
 ├── /sitemap/static.xml          (home, datasets, usecases, collaboratives,
 │                                  publishers, sectors, about-us)
 ├── /sitemap/datasets-1.xml
 ├── /sitemap/aimodels-1.xml      (isPublic: true, status: ACTIVE only)
 ├── /sitemap/usecases-1.xml      (published only)
 ├── /sitemap/collaboratives-1.xml
 ├── /sitemap/organizations-1.xml
 ├── /sitemap/users-1.xml
 └── /sitemap/sectors-1.xml
```

The old `/sitemap/main.xml` path still works but 308-redirects to
`/sitemap.xml` (`app/sitemap/main.xml/route.ts`) — submit the new canonical
path, not the legacy one.

Don't submit the child sitemaps (`datasets-1.xml`, etc.) individually — GSC
crawls a sitemap **index** and discovers its children automatically.

**Troubleshooting "Invalid sitemap address"**: this is a GSC input-side
error, not a broken sitemap (verify with the §6 `curl` checks first — if
those return 200 with correct XML, the server is fine). Most common causes:
1. Property not fully verified yet — submission is blocked until the
   property shows "Ownership verified".
2. Property host doesn't match the sitemap's actual canonical host — e.g. a
   property added as `https://www.civicdataspace.in/` won't reliably work
   since `www` redirects away to the bare apex. Match the property to
   whichever host the sitemap actually serves from (§2).
3. Stray characters in the input field — clear it and type exactly
   `sitemap.xml`, no leading `/`, no scheme/host prefix.

---

## 5. Read the validation report

**Sitemaps report** (Sidebar → Sitemaps → click the submitted sitemap row):

| Status | Meaning |
|---|---|
| `Success` | Google fetched and parsed it without errors |
| `Couldn't fetch` | 404/500/timeout — check `isSitemapEnabled()` and that the entity GraphQL queries aren't erroring server-side (they fail silently to count `0`, see `lib/sitemap-utils.ts` try/catch) |
| `Has errors` | Malformed XML or unreachable URLs inside it — click through for per-URL detail |

Key numbers shown per sitemap: **Discovered URLs** (how many Google found)
vs what you'd expect from the live counts (cross-check with `curl`, see §6).

**Indexing report** (Sidebar → Indexing → Pages) — the deeper report:

- **Indexed** — pages Google has actually indexed and may show in search.
- **Not indexed**, broken down by reason (crawled but not indexed,
  discovered but not crawled, duplicate without canonical, etc.). This is
  where you'll see if sitemap submission ≠ actual indexing.
- Filter by **"Sitemaps"** in this report to scope it to URLs that came from
  `sitemap.xml` specifically, rather than all discovered URLs.

**URL Inspection tool** (top search bar in GSC) — paste any single URL
(e.g. a dataset detail page) to see live crawl/index status, and use
**Request Indexing** to force a recrawl of that one page after a fix.

---

## 6. Sanity-check before/while waiting on GSC

GSC's first crawl can take hours to days. Validate the sitemap itself is
correct immediately after any deploy with `curl`:

```bash
curl -s https://civicdataspace.in/sitemap.xml
curl -s https://civicdataspace.in/sitemap/datasets-1.xml | grep -c '<url>'
curl -s https://civicdataspace.in/robots.txt   # should list Sitemap: .../sitemap.xml
```

Cross-check entity counts against the backend so a silent GraphQL failure
(caught and defaulted to 0 in `sitemap-utils.ts`) doesn't quietly ship an
empty child sitemap:

```bash
curl -s -X POST https://api.datakeep.civicdays.in/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query{publishedCollaboratives{id}}"}' \
  | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']['publishedCollaboratives']))"
```

(`api.datakeep.civicdays.in` is the production `BACKEND_GRAPHQL_URL` per the
GitHub `production` environment vars — a different host than the `dev`
environment's `dev.api.civicdataspace.in`, worth knowing so you hit the
right backend when validating.)

---

## 7. Ongoing monitoring

- Check the **Sitemaps** and **Indexing → Pages** reports weekly for the
  first month after go-live, then monthly.
- Set up **email alerts**: GSC → Settings → Users and permissions, or rely
  on Google's automatic "new issue detected" emails sent to the property
  owner.
- Re-submit the sitemap only if the URL itself changes — Google recrawls
  the existing one on its own schedule (`Cache-Control: max-age=3600` on
  `/sitemap.xml`, longer on child sitemaps via
  `FEATURE_SITEMAP_CHILD_CACHE_DURATION`).
- After any change to `ENTITY_CONFIG` (`lib/utils.ts`) — new entity type,
  changed filter — re-run the §6 curl checks against prod post-deploy.

---

## 8. Access handover checklist

- [x] Property added: URL-prefix `https://civicdataspace.in`, verified
      (2026-08-10)
- [x] Sitemap submitted: `sitemap.xml`
- [x] All 8 sitemaps (`static` + 7 entity sitemaps) confirmed 200, URL
      counts cross-checked 1:1 against the production backend
      (`api.datakeep.civicdays.in`) — see §6
- [ ] GSC property owner account documented (who has access)
- [ ] At least one teammate added as GSC property **Owner** (not just
      "Full user") so access doesn't bottleneck on one person
- [ ] Consider migrating to a **Domain** property (§2 alternative) for
      full `www`/`http`/subdomain coverage in one verification, once DNS
      access is available
- [ ] `FEATURE_SITEMAPS=true` confirmed in prod GitHub environment vars
      (done, but note this var doesn't actually reach the EC2 runtime —
      see §1 caveat; the box's own `.env` is what matters)
- [ ] `FEATURE_SITEMAP_ITEMS_PER_PAGE` reconcile — GH Actions prod var is
      `5`, but live pagination is using the code's default of `1000`
      (same root cause: EC2 `.env` isn't synced from GH Actions vars).
      Harmless today (well under the 50,000-URL sitemap limit) but worth
      fixing the drift if someone relies on that var meaning something
- [ ] Dev subdomain crawlability caveat (§0) triaged — ticket filed or
      explicitly accepted as-is
