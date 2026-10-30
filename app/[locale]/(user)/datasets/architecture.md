# Public dataset page

> Part of feature: **public-dataset** · siblings: none in this slice. The provider editor lives under the dashboard and is out of scope.

## Overview

Someone opens a published dataset without logging in and sees what it is before they reach the charts and the files. The top of the page keeps the existing breadcrumb (Home, Dataset Listing, Dataset Details). Then a summary: back to the list, download, share, the title, a short reading of the description, where the dataset is used, how many records and downloads it has, how many files and which types, the sector and geography, then licence, source, last update, and publisher.

This slice does not change how a dataset is created, edited, or published. Those screens stay in the dashboard. The fields on the summary are the same ones the provider review already collects: title, description, sector, geography, source website, licence, files, and the public counters the API already returns.

SDK: no — this is public page presentation. No API client method was added or changed.

## Submodule map

- **Summary** — the opening card on the public dataset page.
- **Tabs** — Data, Visualisations, Metadata, and Connected to under the summary.

---

## Submodule: Summary

### Trigger

A person opens `/datasets/[id]` while logged out or logged in. The page loads the public dataset, then paints the summary.

### Business use case

The person can tell, in one glance, what the dataset describes, who published it, where it applies, when it was last updated, what it is licensed as, where it came from, and how large it is. They can go back to the dataset list, download the only file, or jump to the file list when there is more than one. They can share the page, copy its link, or download the summary card as an image. The underlined use-case and collaborative counts open the Connected to tab with that filter selected; the chart count opens Visualisations.

### Flow (English)

1. Record one dataset view for analytics, whichever tab the visitor opens. Load this dataset.
2. If it is still loading, show the spinner. If the request fails, show the error. If nothing comes back, show not found.
3. In parallel, count the charts for this dataset, and collect published use cases and collaboratives so the summary can say which of them include this dataset.
4. Turn the record into the summary: description, counts, file facts, and the footer facts.
5. Show the summary, then four tabs. Data is the file browser. Visualisations is the charts. Metadata is the full record, including tags and any extra notes. Connected to lists the use cases and collaboratives that include this dataset.
6. A link from the summary to the files, the charts, metadata, or connections opens that tab.


### Helpers

- `buildDatasetCover(dataset, links) -> cover`
  - What it does: picks the title, the plain description, the three usage counts and where each one links, the record total, the download total, the file count and types, the sector and geography, the licence, the source site, the last-updated date, the publisher, and what the Download button should open.
  - Inputs: the published dataset fields the summary shows, plus the use-case list, the collaborative list, and the chart count. A list that has not arrived, or that failed to load, is left out, and the usage sentence waits rather than claiming the count is zero. Outputs: a cover ready to render. Errors: none — a missing description, picture, source, date, sector, or geography is left blank rather than throwing.
  - Tier 2, next to the public dataset page. Does not write anything.
- `buildDatasetPageUrl(datasetId) -> url`
  - What it does: builds the public address of this dataset from the platform URL and the id in the address bar.
  - Inputs: dataset id. Outputs: absolute URL. Errors: none.
  - Tier 2. Uses the typed platform URL.
- `buildShareTargets(pageUrl, title) -> targets`
  - What it does: builds the X, LinkedIn, Facebook, and email links, plus a copy action that has no link.
  - Inputs: page URL and title. Outputs: five targets. Errors: none. Copying itself happens in the panel and can fail in the browser.
  - Tier 1, shared under components. Already used by the public use case page.
- `matchesFor(datasetId, items) -> items`
  - What it does: keeps the use cases or collaboratives that list this dataset. The summary counts come from it, and so does the Connected to tab, so the two always agree.
  - Inputs: dataset id and a published list. Outputs: the matching entries. Errors: none.
  - Tier 2, in `dataset-cover.ts`.
- Shared formatting in `lib/public-entity.ts`: backend file addresses, publisher page links, unique name lists, website host labels, HTML to plain text, and the `05 Aug 2026` date. Used by this page and the public use case page.
  - Tier 1. Pure. Does not write anything.

### Data model

No tables are written. The summary reads fields the public dataset query already returns: title, description, modified, download count, licence, formats, sectors, geographies, metadata (the source website is the URL-typed item), source homepage, resources (id and row count), and the user or organisation name and picture.

The last-updated line uses `modified`, formatted as `05 Aug 2026`. There is no separate published-on field on this query.

The record total is the sum of each file's row count. A file with no row count adds nothing. The file count is how many resources came back. File types are the dataset's format list, uppercased, with duplicates removed.

Use-case and collaborative counts are not a field on the dataset. The public API only lists use cases and collaboratives, each with the datasets it includes. The page asks for those two lists (id, slug, and dataset id only) and counts the ones that include this dataset. Chart count is the chart query already scoped to this dataset.

The licence words match the short labels on the provider review: `CC BY 4.0`, not the longer form the old sidebar used.

The source line is the website's host (`data.gov.in`), taken from the source-website metadata the provider form saves, then from the import homepage if that metadata is empty.

There is no save or bookmark on a dataset, so the summary does not show a bookmark control.

### Indexing & performance

The dataset query and the chart query are scoped to one id.

The use-case list and the collaborative list are not. The public filters cannot say "only those that include this dataset", and there is no count field on the dataset. Asking for every published use case and collaborative on a dataset page gets slower as those catalogs grow. The selection is only id, slug, and dataset id. The result is cached under this page's own query keys, so it is fetched once per session and reused across dataset pages. A reverse count on the dataset would remove these two lists. That needs an API change, which this slice does not make.

No new index.

### Security

No new access path. The page still calls the existing public dataset query with the id from the URL and no organisation header. Whoever the API already allows to read that dataset is who sees this page. This slice does not take an organisation id and does not decide draft versus published; that stays in the API.

The use-case and collaborative lists are the same published lists the public listing pages already load.

A person from another organisation opening this URL gets the same response the public query already returns. This page does not add a second check and does not widen what the query returns.

### Tests

The frontend has no unit-test runner, and this slice does not change the backend, so layers 1–4 are not executed here.

#### Layer 1 — DB helper tests

n/a — no database access in this slice.

#### Layer 2 — Non-DB helper tests

n/a — the frontend has no unit-test runner, and this kit says not to add one for a page change. The cover helper is pure. A later runner should check: a description full of HTML comes back as plain text; a missing description is omitted; row counts add up and a missing row count adds nothing; one file makes Download open that file; if that file address cannot be built, or there is more than one file, Download jumps to the file list; no files leaves Download with nowhere to go; formats become uppercase unique types joined with a middle dot; the source line is the host of the URL metadata, then the import homepage; an unparseable date is omitted; a valid date reads `05 Aug 2026`; `CC_BY_4_0_ATTRIBUTION` reads `CC BY 4.0`; an organisation publisher links to the organisation page; an individual publisher links to the person; a use-case list that has not loaded yet leaves the usage sentence out; the use-case count links to the Connected to tab filtered to use cases; the collaborative count does the same for collaboratives; the chart count links to the charts on this page; zero is plural ("0 use cases").

#### Layer 3 — Flow tests

n/a — the frontend has no unit-test runner. The page flow is: load, branch on loading / error / missing / ready, build the cover, then show the three tabs.

#### Layer 4 — Backend API e2e

n/a — no endpoint was added or changed.

#### Layer 5 — API user journey

A person opens a published dataset while logged out. The dataset query returns the summary fields. The chart query returns only that dataset's charts. The published use-case and collaborative lists return enough to count membership. A draft dataset stays hidden the way the public query already hides it.

#### Layer 6 — Browser e2e

- Open a published dataset while logged out and see the title, the description, the counts, and the footer facts.
- Download with one file opens that file. Download with several files moves to the file list. Download with no files does nothing.
- Share opens a panel under the share icon with X, LinkedIn, Facebook, and email, plus Copy link and Download Data Card. Copy reports success or failure. Download Data Card saves the summary card as a PNG; the image library loads only when that row is clicked, and a failure is reported to Sentry.
- The use-case count opens Connected to with use cases selected. Same for collaboratives. The visualisation count moves to the charts.
- Opening the page records one dataset view in analytics, on any tab. Switching tabs does not record another.
- A dataset with no description, no sector, and no source still shows the card, with those spots empty.
- A failed dataset request shows the error and does not show an empty card.

### Visual checklist (manual, on request)

- Desktop width: the summary column is 1400px, centered, with 40px of space above Back and Download, 24px between the toolbar and the card, and 24px line-height. Back and Download sit on one row; the title does not collide with them; the blue description panel and the stat cards sit side by side; the sector row sits under the description; licence, source, date, and publisher sit on one row; the tabs use the same 1400px width; nothing clips.
- A long title wraps inside the card and does not cover the description.
- A long description clamps inside the blue panel and does not cover the illustration. Hovering or focusing that clamped text opens a tooltip with the full description. A description that fits has no tooltip.
- “From the dataset description” is Inter, 12px, line-height 16px, weight 400, letter-spacing 0, color `#0b3865` at 70% (`#0b3865b3`).
- “This dataset supports…” sits in a white box: background `#fff`, radius 16px, text `#0b3865`, line-height 24px, padding 24px, at least 110px tall. The counts stay underlined links.
- The records and downloads card is white, radius 16px, text `#0b3865`, line-height 24px, padding 24px, with the Tabler table icon.
- Many file types wrap inside their card and do not resize the card beside them.
- Mobile width: Back, Download, and Share stay on one row, inset from both screen edges, and the share control is fully visible. The description, the stats, the sector row, and the footer stack, and the Download button stays reachable. Wide screens keep the 1400px column.
- Loading shows the spinner and not an empty card. Error and not-found show a message. A dataset with no charts and no files still shows the summary, and Download is inactive.
- The page is not one flat colour: white page, pale card, blue description, white and lilac stats.

### LLM-judge points

n/a — all assertions are deterministic.

---

## Submodule: Tabs

### Trigger

The same page, after the summary has loaded. Data is selected unless the address already points at the charts or metadata.

### Business use case

The person can browse the files, open one, preview its rows, and download it. They can look at the charts. They can read the full metadata record, including notes that do not fit on the summary card.

### Flow (English)

1. Show Data, Visualisations, Metadata, and Connected to.
2. For Data, load this dataset's files. If that fails, say so. If there are none, say so.
3. Turn the files into a tree. A stored path with folders becomes folders. A flat upload stays a flat list. Select the first file, and open the folders that contain it.
4. Show that file's name, size, row count, column count, download, file details, and preview. A preview that is turned off is not shown. A PDF is shown as a PDF. Each column header shows the column name and its type.
5. For Visualisations, load and show the charts for this dataset only while that tab is open. If there are none, say so.
6. For Metadata, build three sections — About this dataset, Dataset information, About the publisher — with tags that open search, a licence-terms link, and the source and provenance links.
7. For Connected to, show the matching use cases and collaboratives as cards, with All / Use cases / Collaboratives filters. Each card loads its own details.

### Helpers

- `buildFileTree(files) -> tree`
  - What it does: groups files by the folders in the stored path, after dropping a leading `resources/` segment. The leaf label is the file's name, not the stored filename.
  - Inputs: published files. Outputs: folders and files. Errors: none — a file with no path sits at the root.
  - Tier 2.
- `firstFileId(tree) -> id` and `folderIdsForFile(tree, fileId) -> folder ids`
  - What they do: pick the first file in the tree, and list the folders that should start open so that file is visible.
  - Inputs: the tree, and a file id. Outputs: an id, or the folder ids. Errors: none — a tree with no files returns nothing.
  - Tier 2.
- `prepareDatasetFile(file) -> file view`
  - What it does: picks the filename, format, size, counts, download address, schema, and preview.
  - Inputs: one published file. Outputs: the view. Errors: none — a missing preview, schema, or size is left out.
  - Tier 2. The download address uses the backend host already used by the old file list.
- Column type in `PreviewData.tsx` (`columnKind`)
  - What it does: returns `integer`, `number`, `boolean`, `date`, or `string` for one column — the schema format when it is known, otherwise read from the preview cells.
  - Inputs: the preview cells of one column and its schema format. Outputs: the type under the column name. Errors: none.
  - Tier 3. The public file preview passes `fields` and `tableOnly` into the same table the creation flow uses. The creation call omits both, so that preview stays the name-only table.
- `buildMetadataPanel(dataset) -> panel`
  - What it does: builds the Metadata tab: the dataset facts (sector, geography, publisher, created, last updated, access, licence, downloads above zero), unique tags, the licence-terms link, source and provenance links without repeats, the other metadata notes, and the publisher card.
  - Inputs: the published dataset. Outputs: the panel. Errors: none — an empty note is skipped.
  - Tier 2. Uses the same licence words and date format as the summary.

### Data model

No tables are written. Data reads the public file query: name, description, type, url, row count, whether preview is on, preview columns and rows, column schema, format, size, and stored filename. Visualisations read the existing chart query. Metadata reads tags, access, and metadata labels from the same dataset query as the summary.

The provider does not store a separate folder list. Folders on this page are the folders inside the stored filename. Most uploads are a single name, so the list is flat.

The line above the table says how many rows are on screen and how many the file has. The page must not download the whole file to read it: the backend download address adds to the dataset's download count on every fetch.

The File details panel shows the file's description, type, size, row and column counts, and stored filename, and can download that metadata (not the file) as JSON or CSV. It is built in the browser from the file query.

A file whose preview is turned off does not show a table. A PDF shows the existing PDF preview. It loads from the download address, so each preview adds to the download count until the backend offers a preview address that does not count. An API or external resource downloads from its own address.

### Indexing & performance

The file query is scoped to one dataset id. It includes the preview rows, which is the same preview the old file list loaded. The chart query is unchanged. The file preview is memoised, so opening or closing a folder does not redraw the table.

Connected to sends one request per matching card. That count is the number of use cases and collaboratives that include this dataset, which is small in practice.

### Security

No new access path. The file query is the existing public file query for this dataset id. The metadata fields are fields that query already could return. A person from another organisation gets the same response the public queries already return.

### Tests

The frontend has no unit-test runner, and this slice does not change the backend, so layers 1–4 are not executed here.

#### Layer 1 — DB helper tests

n/a — no database access in this slice.

#### Layer 2 — Non-DB helper tests

n/a — the frontend has no unit-test runner, and this kit says not to add one for a page change. A later runner should check, in addition to the summary cases above: `resources/data/employment/file.csv` becomes a `data` folder, then `employment`, then the file; `resources/file.csv` sits at the root; two files in the same folder share one folder node; folders sort before files; the first file is the first leaf; a column's type is its schema format when known, otherwise numbers read as `integer` or `number`, `yes`/`no` as `boolean`, dates as `date`, and anything else as `string`; a preview that is turned off is omitted; a PDF is marked for the PDF preview; an external resource downloads from its url; a metadata note with no value is skipped; the source website is not listed twice.

#### Layer 3 — Flow tests

n/a — the frontend has no unit-test runner. The page flow is: load, branch on loading / error / missing / ready, build the cover, then show the four tabs. The file tab loads files, then branches on loading / error / empty / ready.

#### Layer 4 — Backend API e2e

n/a — no endpoint was added or changed.

#### Layer 5 — API user journey

A person opens a published dataset while logged out. The dataset query returns the summary and metadata fields. The file query returns that dataset's files and previews. The chart query returns only that dataset's charts. A draft dataset stays hidden the way the public query already hides it.

#### Layer 6 — Browser e2e

- Data is selected first. Choosing Visualisations shows the charts, or a line that there are none. Choosing Metadata shows the three sections. Choosing Connected to shows the matching cards, or a line that there are none.
- The first-visit tour's preview step highlights the Data tab's file browser.
- The summary's chart count opens Visualisations. Download with several files opens Data.
- A file in a folder can be opened and closed. Selecting a file shows its preview and download.
- A dataset with no files says so. A file with preview turned off does not show a table.
- A long file name truncates in the tree and does not widen the preview.

### Visual checklist (manual, on request)

- Desktop: the four tabs sit under the summary; Data is underlined; the file tree and the preview sit side by side; the preview table scrolls inside itself and does not stretch the page.
- A folder path reads above the file name. The fact line wraps instead of overflowing.
- Mobile: the tree stacks above the preview. Tabs stay on one line or wrap without covering the summary.
- Metadata: About this dataset, Dataset information, and About the publisher are the same heading (Inter 20/600, line-height 26px, #0b3865). The line under each heading runs from the left card edge to the right card edge, with 16px above the line and 24px below it. Source & Provenance is an h4, Inter 16/600, line-height 20px, #0b3865. Fact values are divs, Inter 14/400, line-height 20px, #0a0a0a.
- Empty files, empty charts, and empty metadata each say so, and do not show a blank panel.

### LLM-judge points

n/a — all assertions are deterministic.

---

## Limitations & future work

The use-case and collaborative counts scan the published lists because the dataset has no reverse count. That should move to the API before those catalogs get large.

A bookmark control is in the reference layout and is not on this page, because a dataset cannot be saved yet.

Custom metadata that is not the source website is listed on the Metadata tab, not on the summary card.

Column distributions are not shown yet. They need the backend to compute per-column statistics when a file is uploaded and return them with the column schema, respecting the preview and field-visibility settings. The page can then draw them under each column header.

The Similar datasets section and its tour step were removed in this redesign.
