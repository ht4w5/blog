// Homepage — 10 most recent posts (nav-posts-search ticket 03), observed on
// a fixture build: the live content set has fewer than 10 posts, so this
// spec generates fixture posts with known titles, dates, and tags, builds
// the site with them to a separate output dir, and serves that output the
// way the real static host does. Assert only what a visitor observes —
// visible text, on-screen arrangement (bounding boxes), navigation
// outcomes, and response status — never CSS property values, markup
// minutiae, or script internals.
import { test, expect, type Page } from '@playwright/test';
import {
  buildFixtureSite,
  fixtureTitle,
  removeFixtureOutput,
  removeFixturePosts,
  FIXTURE_COUNT,
  type FixtureSite,
} from './fixture-site';

// The 10 newest fixture posts, newest first: exactly what the homepage
// snapshot must show. Fixture n is dated 2027-01-n, so the numeric order is
// the newest-first order.
const NEWEST_TEN = Array.from({ length: 10 }, (_, i) => fixtureTitle(FIXTURE_COUNT - i));

const postLinks = (page: Page) => page.getByRole('heading', { level: 2 }).getByRole('link');

let site: FixtureSite | undefined;

test.beforeAll(async () => {
  site = await buildFixtureSite();
}, 240_000);

test.afterAll(async () => {
  // Even when assertions fail, the fixture posts must not outlive the run.
  if (site) {
    await site.dispose();
  } else {
    await removeFixturePosts();
    await removeFixtureOutput();
  }
});

test('the homepage shows exactly the 10 most recent posts, newest first', async ({ page }) => {
  await page.goto(`${site!.url}/`);

  const links = postLinks(page);
  await expect(links).toHaveCount(10);
  for (const [index, title] of NEWEST_TEN.entries()) {
    await expect(links.nth(index)).toHaveText(title);
  }

  // The capped posts are absent from the homepage.
  await expect(page.getByRole('link', { name: fixtureTitle(14), exact: true })).toHaveCount(0);
});

test('a request for a page-2 URL returns the site 404 page', async ({ page }) => {
  // With more than one old page of posts, the removed numbered pagination
  // route would have emitted a page 2; the posts page supersedes it.
  const response = await page.goto(`${site!.url}/page/2`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
});

test('the [all posts] link opens the complete list, including the capped posts', async ({ page }) => {
  await page.goto(`${site!.url}/`);

  await page.getByRole('link', { name: '[all posts]', exact: true }).click();
  await expect(page).toHaveURL(/\/posts$/);

  // The complete list: every fixture post, newest first, nothing capped.
  await expect(postLinks(page)).toHaveCount(FIXTURE_COUNT + 2);
  const all = await postLinks(page).allTextContents();
  expect(all.slice(0, FIXTURE_COUNT)).toEqual(
    Array.from({ length: FIXTURE_COUNT }, (_, i) => fixtureTitle(FIXTURE_COUNT - i))
  );
});

test('tag pages still paginate: a tag with more than 20 posts keeps its page 2', async ({ page }) => {
  // Tag-page pagination is untouched by this ticket: with more than 20
  // posts in a tag, the tag page and its numbered page 2 both exist, and
  // page 2 lists the posts beyond the first page-full.
  const indexResponse = await page.goto(`${site!.url}/tags/fixture`);
  expect(indexResponse?.status()).toBe(200);
  await expect(page.getByRole('link', { name: fixtureTitle(1), exact: true })).toBeVisible();

  const response = await page.goto(`${site!.url}/tags/fixture/page/2`);
  expect(response?.status()).toBe(200);
  const links = postLinks(page);
  await expect(links).toHaveCount(4);
  await expect(links.nth(0)).toHaveText(fixtureTitle(4));
  await expect(links.nth(3)).toHaveText(fixtureTitle(1));
  await expect(page.getByRole('link', { name: fixtureTitle(24), exact: true })).toHaveCount(0);
});
