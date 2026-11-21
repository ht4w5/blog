// Search-result click behaviour (ticket 02): a press-and-release anywhere on a
// result row — left half included — opens the post, and the results bar only
// ever collapses via an outside click or after navigation, never from a row
// press. Assert only what a visitor observes: visible results, link
// destinations, navigation — never CSS values or script internals.
import { test, expect, type Page } from '@playwright/test';
import { box } from './helpers';

const POST_URL = /\/blog\/hello-world\/?$/;

// The search results dropdown is a plain container with no ARIA role; its
// result rows are links, located by their accessible name (post title and
// date) instead of a CSS selector.
const resultRow = (page: Page) => page.getByRole('link', { name: /Test\s*2026-09-23/ });

async function searchAndGetRow(page: Page) {
  await page.goto('/');
  const input = page.getByLabel('Search posts');
  await input.fill('test');
  const row = resultRow(page);
  await expect(row).toBeVisible();
  // Let the expand-on-focus animation settle: press points below are measured
  // against the row's resting position.
  await page.waitForTimeout(300);
  return { input, row };
}

test('a press-and-release on the left half of a result row opens the post', async ({ page }) => {
  const { input, row } = await searchAndGetRow(page);
  const rowBox = await box(row);

  await page.mouse.move(rowBox.x + rowBox.width * 0.2, rowBox.y + rowBox.height / 2);
  await page.mouse.down();
  // Hold past the input's width transition — the bug slides the row out from
  // under a held cursor before the release.
  await page.waitForTimeout(400);

  // The press alone must not collapse the bar.
  await expect(row).toBeVisible();

  await page.mouse.up();

  // The row click navigates instead of being swallowed.
  await expect(page).toHaveURL(POST_URL);
  await expect(page.getByRole('heading', { level: 1, name: 'Test' })).toBeVisible();

  // Results are gone after navigation …
  await expect(row).toBeHidden();

  // … and they collapse via an outside click — never merely from a row press.
  await input.fill('test');
  await expect(row).toBeVisible();
  await page.getByRole('heading', { level: 1, name: 'Test' }).click();
  await expect(row).toBeHidden();
});

test('a press-and-release on the right half of a result row opens the post', async ({ page }) => {
  const { row } = await searchAndGetRow(page);
  const rowBox = await box(row);

  await page.mouse.move(rowBox.x + rowBox.width * 0.8, rowBox.y + rowBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(400);
  await page.mouse.up();

  await expect(page).toHaveURL(POST_URL);
});

test('results open on focus and input, close on outside click, and match as before', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByLabel('Search posts');
  const row = resultRow(page);

  await expect(row).toHaveCount(0);

  // Typing opens results and matches the post by title; the row links to it.
  await input.fill('test');
  await expect(row).toBeVisible();
  await expect(row).toContainText('Test');
  await expect(row).toHaveAttribute('href', '/blog/hello-world');

  // An outside click collapses the results …
  await page.getByText('Test description.').click();
  await expect(row).toBeHidden();

  // … and focusing the input again brings them back.
  await input.click();
  await expect(row).toBeVisible();

  // A query matching nothing reports so.
  await input.fill('zzzqqqxyz');
  await expect(page.getByText('No results found.')).toBeVisible();
  await expect(row).toHaveCount(0);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true });

  test('tapping a result row opens the post', async ({ page }) => {
    const { row } = await searchAndGetRow(page);
    const rowBox = await box(row);

    await page.touchscreen.tap(rowBox.x + rowBox.width / 2, rowBox.y + rowBox.height / 2);

    await expect(page).toHaveURL(POST_URL);
  });
});
