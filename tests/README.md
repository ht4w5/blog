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
  migration or regression contract and must not move with the data file:
  the three button destinations migrated from the old footer and the CC
  BY-NC-SA badge that stays in the footer must stay valid even if
  `src/data/buttons.ts` is edited by mistake.

## Browser-seam scope

The spec's Testing Decisions describe the browser seam as covering "exactly
one thing" (the search-result click fix). The ticket checklists and user
stories require more observable browser coverage: ticket 02's right-half
clicks and unchanged open/close behaviour, and user story 30's tap. Those
browser tests stay; the table records which ticket checklist item or user
story each browser test covers, so the extension is deliberate and
traceable:

| Test | Covers |
| --- | --- |
| `homepage.spec.ts` — site title; opening the first post | ticket 01 (the browser seam itself) |
| `search-click.spec.ts` — left-half press-and-release opens the post; results collapse only via outside click or after navigation | ticket 02 checklist items 1–2; user stories 28–29 |
| `search-click.spec.ts` — right-half press-and-release opens the post | ticket 02 checklist item 3 |
| `search-click.spec.ts` — results open on focus and input, close on outside click, matching unchanged | ticket 02 checklist item 4; user story 31 |
| `search-click.spec.ts` — tapping a row opens the post on a touch screen | user story 30 |
