# Tests

Two test seams cover the site. Run everything with a single command from the
repo root (works on a clean checkout — it builds the site first):

```sh
pnpm test
```

`pnpm test` builds the site, runs the built-HTML tests, installs the
Chromium binary for Playwright when it is not cached yet (idempotent — fast
once cached under `~/.cache/ms-playwright`), and runs the browser tests. It
does not install OS-level browser dependencies (that takes sudo); if
Chromium fails to launch on a fresh machine, run
`pnpm exec playwright install-deps chromium` once.

## The two seams

### 1. Built HTML — `tests/html/`

Node's built-in test runner (`node --test`) asserting on the HTML that
`pnpm build` emits into `dist/`. Fast, no browser.

- Helper: `tests/html/load-page.mjs` exports `loadBuiltPage('index.html')`,
  which returns the built page's HTML as a string.
- Add a `*.test.mjs` file in `tests/html/`, load a built page, and assert on
  the HTML a visitor receives.

```js
import { loadBuiltPage } from './load-page.mjs';

const html = await loadBuiltPage('index.html');
assert.match(html, /<title>Home - ht4w5<\/title>/);
```

### 2. Browser — `tests/browser/`

Playwright (`@playwright/test`) running against the real site in Chromium.
`playwright.config.ts` manages the server lifecycle: Playwright starts
`astro preview` on port 4322 before the tests and tears it down afterwards.

- Add a `*.spec.ts` file in `tests/browser/`, navigate with `page.goto('/')`
  (paths are relative to the preview server), and assert what a visitor sees
  or does.

```ts
await page.goto('/');
await expect(page.getByRole('link', { name: 'ht4w5', exact: true })).toBeVisible();
```

Prefer role-based locators (`getByRole`, `getByLabel`, …) over CSS selectors.

## What to assert

External behaviour only: rendered HTML, visible text and titles, link
destinations, and observable interactions (clicks, navigation). Never assert
on CSS property values, markup structure minutiae, or script internals.

## Expectation styles (built-HTML seam)

Two expectation styles are in use, deliberately:

- **Derived from the data file** — see `site-directory.test.mjs` and
  `button-wall.test.mjs`. Import the typed data module (e.g.
  `src/data/site-directory.ts`) and derive the expectations from it. Use this
  when the rendering contract is "editing the data file is data-only": the
  page must track the data file's destinations, descriptions, and order, so a
  data edit must not require a test edit.
  Importing the TS data modules relies on Node's built-in TypeScript type
  stripping (Node ≥ 23.6; Node 22.18+ also enables it by default).
- **Hardcoded literals** — see `footer.test.mjs`. Write the expected labels
  and destinations into the test. Use this when the expectation guards a
  regression contract and must not move with the data file: the CC BY-NC-SA
  badge that stays in the footer must stay valid even if the footer or a
  data file is edited by mistake.

## Browser-seam scope

The site-directory-button-wall spec's Testing Decisions describe the browser
seam as covering "exactly one thing" (the search-result click fix). The ticket
checklists and user stories require more observable browser coverage: ticket
02's right-half clicks and unchanged open/close behaviour, and user story 30's
tap; later specs extend it further. Those browser tests stay; the tables below
record which ticket checklist item or user story each browser test covers, so
the extension is deliberate and traceable. One row per test, with the test's
literal name as it appears in its spec file.

Rows for the site-directory-button-wall spec:

| Test | Covers |
| --- | --- |
| `homepage.spec.ts` — homepage shows the site title and its first post can be opened | ticket 01 (the browser seam itself) |

Rows for the mobile-nav-toc spec (the Covers column names the spec slug to
keep the ticket numbers unambiguous):

| Test | Covers |
| --- | --- |
| `table-of-contents.spec.ts` — the table of contents loads expanded and the Contents label collapses and re-expands the list | mobile-nav-toc ticket 02 checklist items 1–2; user stories 12, 14, 17 |
| `table-of-contents.spec.ts` — the disclosure is operable with Enter and Space | mobile-nav-toc ticket 02 checklist item 2; user stories 17, 18 |
| `table-of-contents.spec.ts` — the table of contents is the right-side rail, expanded by default | mobile-nav-toc ticket 03 checklist item 6; user stories 16, 17 |
| `table-of-contents.spec.ts` — the table of contents stays the sticky right rail beside the article | mobile-nav-toc ticket 02 checklist item 5; user story 16 |
| `table-of-contents.spec.ts` — the active entry is scrolled into view in the rail while reading on | mobile-nav-toc ticket 02 checklist item 5; user story 15 |
| `table-of-contents.spec.ts` — opening a collapsed rail brings the current entry into view | mobile-nav-toc ticket 02 checklist items 1, 5 |
| `table-of-contents.spec.ts` — the table of contents sits directly under the post title/date/tags and above the article body | mobile-nav-toc ticket 03 checklist item 1; user story 10 |
| `table-of-contents.spec.ts` — the table of contents loads collapsed; one tap expands it and a second tap collapses it | mobile-nav-toc ticket 03 checklist item 2; user stories 11, 12, 14 |
| `table-of-contents.spec.ts` — tapping an entry jumps to its section and marks it as current in the visible copy | mobile-nav-toc ticket 03 checklist item 3; user stories 13, 20 |
| `table-of-contents.spec.ts` — the disclosure and its entries are present and usable | mobile-nav-toc ticket 03 checklist item 4; user story 21 |
| `table-of-contents.spec.ts` — exactly one table of contents is exposed to assistive tech at a time | mobile-nav-toc ticket 03 checklist item 5; user story 19 |
| `table-of-contents.spec.ts` — jumping to a section marks that entry as the current one | mobile-nav-toc ticket 02 checklist item 3; user stories 15, 20 |
| `table-of-contents.spec.ts` — the marked entry updates as the reader scrolls | mobile-nav-toc ticket 02 checklist item 3; user stories 15, 20 |
| `table-of-contents.spec.ts` — each copy keeps its own disclosure state and tracks the current section | mobile-nav-toc ticket 02 checklist item 4; user story 25 |
| `layout-stability.spec.ts` — the page loads without content shifting under the reader | mobile-nav-toc user story 23 |

Rows for the nav-posts-search spec (the Covers column names the spec slug to
keep the ticket numbers unambiguous):

| Test | Covers |
| --- | --- |
| `posts-page.spec.ts` — the posts page shows the Posts heading and the complete post list newest first | nav-posts-search ticket 01 checklist item 1 |
| `posts-page.spec.ts` — the filter input spans the content width beneath the heading and carries the placeholder and an accessible label | nav-posts-search ticket 01 checklist items 1, 5 |
| `posts-page.spec.ts` — typing filters the list instantly and fuzzily over titles, tags, and excerpts — a typo still finds its post | nav-posts-search ticket 01 checklist item 2 |
| `posts-page.spec.ts` — every match stays visible — the filter has no result cap | nav-posts-search ticket 01 checklist item 3 |
| `posts-page.spec.ts` — when nothing matches the list is replaced by a single muted no posts match line | nav-posts-search ticket 01 checklist item 4 |
| `posts-page.spec.ts` — the filter has no URL state: navigating away or reloading clears it | nav-posts-search ticket 01 checklist item 6 |
| `posts-page.spec.ts` — the complete post list is present and no filter input is visible | nav-posts-search ticket 01 checklist item 7 |
| `site-nav.spec.ts` — the bracket links are home, posts, about, tags, dirs, feed, then the theme toggle | nav-posts-search ticket 04 checklist item 1 |
| `site-nav.spec.ts` — the theme toggle label mirrors the mode through the cycle and the state persists | nav-posts-search ticket 04 checklist item 2 |
| `site-nav.spec.ts` — the site nav stays on one line on desktop: site title left, bracket group right | nav-posts-search ticket 04 checklist item 3 |
| `site-nav.spec.ts` — the site nav stacks into two rows at every phone width: site title, then the bracket links | nav-posts-search ticket 04 checklist item 4 |
| `site-nav.spec.ts` — the bracket nav links wrap rather than overflow on the narrowest phones | nav-posts-search ticket 04 checklist item 4 |
| `site-nav.spec.ts` — no search input or results dropdown is present in the nav at any viewport | nav-posts-search ticket 04 checklist item 5 |
