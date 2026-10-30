# Public use case page

> Part of feature: **public-use-case** · siblings: none in this slice. The provider editor lives under the dashboard and is out of scope.

## Overview

Someone opens a published use case without logging in and sees what it is before they read the story. The top of the page keeps the existing breadcrumb (Home, Use Cases, then this use case). Then a cover, stacked in one column with the same left and right inset as the story: back to the list, where it applies, when it was published, the title, the short description, who published it, then the thumbnail on a pale blue band. Beside the story, one box shares the page, lists the story sections, and lists the people and organisations. The story itself is the same content blocks the editor saves. Under the story: the embedded dashboard, the datasets behind the story, then tags, SDG goals, and sectors. A tag, goal, or sector opens global search with that value selected and use cases showing.

This slice does not change how a use case is created, edited, or published. Those screens stay in the dashboard.

SDK: no — this is public page presentation. No API client method was added or changed.

## Submodule map

- **Cover** — the opening band on the public use case page.
- **Side box** — share actions, contents links, and contributors. The frame can hold the same kind of list on another public page.
- **Story** — the existing content blocks, with each heading marked so a contents link scrolls to it.
- **After the story** — embedded dashboard, dataset links, then tags, SDG goals, and sectors.

---

## Submodule: Cover

### Trigger

A person opens `/usecases/[slug]` while logged out or logged in. The page loads the existing public use-case query, then paints the cover.

### Business use case

The person can tell, in one glance, where it applies, when it was published, what the use case is, who stands behind it, and what it looks like. They can go back to the use case list, or open the publisher.

### Flow (English)

1. Load the use case with the existing public query.
2. If it is still loading, show the spinner. If the request fails, show the error. If nothing comes back, show not found.
3. Turn the record into the cover: title, subtitle, thumbnail, publisher, place, and published date.
4. Build the public page address for sharing.
5. Read the story headings, the contributor list, and the tags, goals, and sectors.
6. Show the cover, then the side box beside the story. Under the story, show the dashboard, the datasets, and the topic bar.

### Helpers

- `buildUseCaseCover(useCase) -> cover`
  - What it does: picks the title, the subtitle, the thumbnail address, the publisher (name, picture, link, and whether they are an organisation or an individual), the place names, and the published date.
  - Inputs: the published use case fields the cover shows. Outputs: a cover ready to render. Errors: none — a missing picture, place, date, or publisher is left out rather than throwing.
  - Tier 2, next to the public use case page. Depends on the existing content parser for the subtitle only. Does not write the document.
- `buildUseCasePageUrl(slug) -> url`
  - What it does: builds the public address of this use case from the platform URL and the slug in the address bar.
  - Inputs: slug. Outputs: absolute URL. Errors: none.
  - Tier 2. Uses the typed platform URL.
- `storyHeadings(summary) -> headings`
  - What it does: lists the headings inside the story text, in order, each with a stable anchor.
  - Inputs: the saved summary. Outputs: label and id pairs. Errors: none — a story with no headings returns an empty list.
  - Tier 2. Uses the existing content parser. Does not change the saved document.
- `buildRailContributors(useCase) -> people`
  - What it does: lists contributors first, then supporting and partner organisations, without repeating the same profile link. Organisations are captioned Organisation. People have no job title in the public data, so no role line is invented.
  - Inputs: contributor and organisation fields. Outputs: name, picture, link, caption. Errors: none — a row with no name is skipped.
  - Tier 2.
- `buildUseCaseTopics(useCase) -> topics`
  - What it does: collects tags, SDG goals, and sectors that have a label.
  - Inputs: those three lists. Outputs: labels ready for the topic bar. Errors: none.
  - Tier 2.
- `searchHref(filter, value) -> url`
  - What it does: builds `/search` with that tag, sector, or SDG value and `types=usecase`, which is the use-case tab of global search.
  - Inputs: filter name and the label the person clicked. Outputs: a path. Errors: none.
  - Tier 2.
- `buildShareTargets(pageUrl, title) -> targets`
  - What it does: builds the X, LinkedIn, Facebook, and email links, plus a copy action that has no link.
  - Inputs: page URL and title. Outputs: five targets. Errors: none. Copying itself happens in the panel and can fail in the browser.
  - Tier 1, shared under components, so another public page can share the same way.

### Data model

No tables are written. The cover reads fields the public query already returns: title, summary (subtitle only), logo, created, individual-or-organisation flag, user or organisation name and picture, and geography names.

The published line uses `created`, formatted as `06 Aug 2026`. There is no separate published-on field on this query.

The thumbnail is the use case logo. Its stored path still has the `/code/files/` prefix stripped before it is joined to the backend file host, which is how the old page loaded the same image.

### Indexing & performance

n/a — no new query and no new index. The page still asks for the same use case. The thumbnail is the priority image so it can paint with the title.

### Security

No new access path. The page still calls the existing public use-case query with the slug from the URL and no session. Whoever the API already allows to read that use case is who sees this page. This slice does not take an organisation id and does not decide draft versus published; that stays in the API.

A person from another organisation opening this URL gets the same response the public query already returns. This page does not add a second check and does not widen what the query returns.

### Tests

The frontend has no unit-test runner, and this slice does not change the backend, so layers 1–4 are not executed here.

#### Layer 1 — DB helper tests

n/a — no database access in this slice.

#### Layer 2 — Non-DB helper tests

n/a — the frontend has no unit-test runner, and this kit says not to add one for a page change. The helpers are pure: cover mapping, page URL, and share links. A later runner should check: subtitle comes from the content subtitle and not the story body; a missing thumbnail is omitted; an organisation publisher links to the organisation page and is labelled Organisation; an individual publisher links to the person and is labelled Individual; an empty geography list is omitted; an unparseable date is omitted; a valid date reads `Published 06 Aug 2026`; share links encode the page URL; the copy target has no href.

#### Layer 3 — Flow tests

n/a — same reason. The page flow is: load, then cover, then share beside the story. Failure and not-found stay on the page and do not show the cover.

#### Layer 4 — Backend API e2e

n/a — no endpoint was added or changed.

#### Layer 5 — API user journey

n/a — no new API sequence. The page uses the existing public read.

#### Layer 6 — Browser e2e

Not run in this slice. When someone drives the browser:

1. Open a published use case with a thumbnail, subtitle, organisation, one geography, and a created date. The cover shows back, then the place with a map pin and “Published” plus the date, then the title, the subtitle, the organisation name and “Organisation”, then the thumbnail full width underneath on a pale blue band. The text and the thumbnail share the same left and right inset. Back is Inter, 14px, weight 500, 18px line height. The label and arrow are `#0a0a0a` at 75% until hover, then solid `#0a0a0a`.
2. Back returns to the use case list. The organisation name opens that organisation.
3. An individual use case shows the person, their picture, and “Individual”, and the name opens their publisher page. With no picture, the cover shows a person icon in a light gray circle instead of a broken image.
4. Share opens X, LinkedIn, and Facebook in a new tab, email opens a mail draft, and copy puts the page URL on the clipboard and announces it. If the browser blocks the clipboard, the box says the link could not be copied.
5. The story, including a heading such as “The Challenge”, sits to the right of the share box on a wide screen and under it on a narrow screen. Story paragraphs are Inter, 14px, weight 400, 21px line height, and `#0a0a0a` at 75%.
6. A use case with no thumbnail still shows the text and does not show a broken image.
7. Loading, error, and not-found still appear and do not show an empty cover.
8. The dashboard screens for creating or editing a use case are unchanged.

### Visual checklist (manual, on request)

- Wide screen: the cover and the story share one column, 1152px wide, inside a page gutter of 16px, then 24px from 768px, 32px from 1024px, and 40px from 1280px, capped at 1760px. Left and right gutters match. The title is Inter, 38px, weight 600, line height 41.8px, colour `#0a0a0a`. The subtitle is Inter, 16px, weight 400, 20px line height, `#0a0a0a` at 75%. Story paragraphs are Inter, 14px, weight 400, 21px line height, and `#0a0a0a` at 75%. The publisher name is Inter, 14px, weight 500, 18px line height, `#0a0a0a`. Cover text sits on white: back, then place and published date, then title, subtitle, and publisher. The thumbnail sits under that text, full width of the same column, on a full-width pale blue band. It is 2:1, and from 1024px it is 21:8 (1152×439 in that column), with 18px corners, and the picture covers the frame. Then a narrow box on the left (share, contents, contributors) and the story on the right. Explore the data, the dashboard, the dataset cards, and the grey topic bar sit under the story, in the same side inset as the thumbnail, starting at the left. Each dataset uses the same card as the dataset listing, in a grid: one column on a narrow screen, two from a small screen, three on a wide screen.
- Clicking a contents label scrolls to that heading. The heading is not hidden under the site header.
- Narrow screen: the box stacks above the story. Nothing overlaps the header.
- Share, Contents, and Contributors labels are Inter, 12px, weight 500, 16px line height, `#0a0a0a`, with 0.3px letter spacing. A contents link is Inter, 14px, weight 400, 21px line height, and `#6B6B6B`. Hover turns it `#0b3865`. A contributor name is Inter, 14px, weight 500, 18px line height, and `#0a0a0a`. The line under it is Inter, 12px, weight 400, 16px line height, and `#6B6B6B`. The photo is a 32px circle, and the image element itself is Inter, 12px, weight 400, 16px line height, and `#0a0a0a`. “Explore the data” and “Datasets behind this story” are each an `h2`: Inter, 24px, weight 600, 30px line height, and `#0a0a0a`. The dataset cards are the listing cards. Tags, SDG Goals, and Sector labels are Inter, 14px, weight 500, 18px line height, and `#0a0a0a`. Tag and sector pills are 12px, weight 500, with a `#e5e5e5` border. An SDG pill is tinted with that goal’s colour and reads `3. Good Health and Well-being`. The sentence under Explore the data is Inter, 14px, weight 400, 21px line height, and `#6B6B6B`.
- A story with no headings hides Contents. A use case with no people or organisations hides Contributors.
- Hovering a tag fills it orange. Hovering an SDG goal fills it with that goal’s colour. Hovering a sector tints it grey. Clicking any of them opens `/search` with that value and use cases selected.
- The five share icons stay on one line inside the side box. They are Tabler outlines, 16px: X, LinkedIn, Facebook, mail, and link. The circle border is `#e5e5e5` and the icon is `#6b6b6b`. Hover turns the border and the icon `#0b3865`.
- On a wide screen the whole side box stays put under the header while the story scrolls. If the box is taller than the screen, the box itself scrolls. On a narrow screen it stays in normal flow above the story.
- Copy still shows a check. Keyboard focus is visible on share controls, contents links, contributor names, dataset links, and topic pills.
- The old dark-blue partner strip is gone. Those organisations are in the side list.

### LLM-judge points

n/a — the cover is deterministic fields from the use case. Nothing here needs a judge.

---

## Limitations & future work

A person in the side list with no profile picture gets the same light gray circle and person icon as the cover. People in the side list have no role line. The public user record has no job title, so the page does not invent one. Organisations are labelled Organisation.

Contact, platform link, and running status are not on this page. Sectors and SDG goals are in the topic bar, not in a side column.

The story still renders through the existing content block view. This slice does not restyle those blocks, and it does not change the editor that writes them.

The page still loads the use case in the browser after first paint. Moving that read to the server, and adding a route-level loading and error file, is a later pass.
