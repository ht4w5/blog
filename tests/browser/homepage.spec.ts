// Browser smoke test: proves the real-browser seam works against the Astro
// preview server (see playwright.config.ts for the server lifecycle).
// Assert only what a visitor observes — visible text, titles, navigation —
// never CSS property values, markup minutiae, or script internals.
import { test, expect } from '@playwright/test';

test('homepage shows the site title and its first post can be opened', async ({ page }) => {
  await page.goto('/');

  // Visible in the browser tab and in the header.
  await expect(page).toHaveTitle(/ht4w5/);
  await expect(page.getByRole('link', { name: 'ht4w5', exact: true })).toBeVisible();

  // Clicking a post title navigates to the post.
  const firstPostLink = page.getByRole('heading', { level: 2 }).first().getByRole('link');
  const postTitle = await firstPostLink.textContent();
  await firstPostLink.click();
  await expect(page).toHaveURL(/\/blog\//);
  await expect(page.getByRole('heading', { level: 1, name: postTitle! })).toBeVisible();
});
