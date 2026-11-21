// Homepage — 10 most recent posts (nav-posts-search ticket 03): the
// homepage is a quick current snapshot — at most the 10 most recent posts,
// newest first, in the site's post-entry markup, followed by one
// bracket-style [all posts] link to the complete list at /posts. The
// numbered pagination pages are gone. The 10-cap itself is verified with
// generated fixture posts in homepage-fixtures.spec.ts (the live content
// set has fewer than 10 posts); this spec pins the behaviour on the built
// site. Assert only what a visitor observes — visible text, on-screen
// arrangement (bounding boxes), and navigation outcomes — never CSS
// property values, markup minutiae, or script internals.
import { test, expect } from '@playwright/test';
import { box, isBelow, DESKTOP, postLinks } from './helpers';

// The homepage regression guards run at the spec-pinned desktop viewport
// (1280×800 — Testing Decisions).
test.use({ viewport: DESKTOP });

test('the homepage lists at most the 10 most recent posts, newest first', async ({ page }) => {
  // The complete list, newest first, is what the posts page shows; the
  // homepage snapshot is its head, capped at 10. (The cap itself is verified
  // with fixture posts in homepage-fixtures.spec.ts — the live content set
  // has fewer than 10 posts.)
  await page.goto('/posts');
  const complete = await postLinks(page).allTextContents();

  await page.goto('/');
  const recent = await postLinks(page).allTextContents();

  expect(recent.length).toBeLessThanOrEqual(10);
  expect(recent).toEqual(complete.slice(0, 10));
});

test('the [all posts] link follows the post list and opens the complete list', async ({ page }) => {
  await page.goto('/');

  const link = page.getByRole('link', { name: '[all posts]', exact: true });
  await expect(link).toBeVisible();

  // The link follows the list it points past.
  const lastPostBox = await box(postLinks(page).last());
  const linkBox = await box(link);
  expect(isBelow(linkBox, lastPostBox)).toBe(true);

  await link.click();
  await expect(page).toHaveURL(/\/posts$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Posts' })).toBeVisible();
  expect(await postLinks(page).count()).toBeGreaterThan(0);
});
