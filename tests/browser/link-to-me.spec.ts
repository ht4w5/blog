// Browser tests for the homepage link-to-me box: the Copy control puts the
// snippet on the clipboard and confirms inline; where the clipboard API is
// unavailable, the snippet text is selected for manual copying instead.
// Assert only what a visitor observes — visible text and clipboard contents,
// never CSS property values, markup minutiae, or script internals.
import { test, expect, type Page } from '@playwright/test';

// The snippet is plain text in a code block (the code element has no ARIA
// role), so it is located by the text it shows — not by a CSS selector.
const SNIPPET_PREFIX =
  '<a href="https://ht4w5.github.io/"><img src="https://ht4w5.github.io/buttons/ht4w5.png"';
const snippet = (page: Page) => page.getByText(SNIPPET_PREFIX);

test('Copy puts the snippet on the clipboard and confirms with "copied!"', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  const shown = await snippet(page).textContent();
  expect(shown).toContain('https://ht4w5.github.io/');

  // The name pattern matches the control in both label states ("copy" →
  // "copied!"), so the locator stays valid while the feedback shows.
  const copy = page.getByRole('button', { name: /cop(y|ied)/i });
  await copy.click();
  await expect(copy).toHaveText(/copied!/i);

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(shown);
});

test('without clipboard access the snippet text is selected for manual copying', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
  });
  const page = await context.newPage();
  await page.goto('/');

  const shown = await snippet(page).textContent();
  await page.getByRole('button', { name: /cop(y|ied)/i }).click();

  const selected = await page.evaluate(() => window.getSelection()?.toString() ?? '');
  expect(selected).toBe(shown);
  await context.close();
});
