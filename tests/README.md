# Tests

Two test seams cover the site. Run everything with a single command from the
repo root (works on a clean checkout — it builds the site first):

```sh
pnpm test
```

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
