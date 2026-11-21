// Posts page with fuzzy filter (nav-posts-search ticket 01): /posts is the
// complete post archive — every post, newest first — beneath a full-content-
// width filter input that fuzzy-filters the list instantly as the reader
// types, over post titles, tags, and excerpt text (the old nav search's
// matching, reused). When nothing matches, the list is replaced by a muted
// `no posts match` line. Without JavaScript the page is the plain complete
// list with no dead filter control. Assert only what a visitor observes:
// visible text, on-screen arrangement (bounding boxes), typing outcomes, and
// accessibility state exposed to assistive tech — never CSS property values,
// markup minutiae, or script internals.
import { test, expect, type Page } from '@playwright/test';
import { box, isBelow, LAYOUT_SLACK } from './helpers';

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 375, height: 812 };

// The site's two posts, in the newest-first order the archive shows.
const NEWEST_POST = 'Pooling slices in Go without extra allocations';
const OLDEST_POST = 'Test';

const heading = (page: Page) => page.getByRole('heading', { level: 1, name: 'Posts' });
const postLinks = (page: Page) => page.getByRole('heading', { level: 2 }).getByRole('link');
const filter = (page: Page) => page.getByRole('textbox', { name: 'Filter posts' });

test('the posts page shows the Posts heading and the complete post list newest first', async ({
  page,
}) => {
  await page.goto('/posts');

  await expect(heading(page)).toBeVisible();

  const links = postLinks(page);
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveText(NEWEST_POST);
  await expect(links.nth(1)).toHaveText(OLDEST_POST);
});

test('the filter input spans the content width beneath the heading and carries the placeholder and an accessible label', async ({
  page,
}) => {
  for (const viewport of [PHONE, DESKTOP]) {
    await page.setViewportSize(viewport);
    await page.goto('/posts');

    const input = filter(page);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('placeholder', 'filter posts');

    // Directly beneath the heading and above the list, spanning the full
    // content width the heading and list span.
    const headingBox = await box(heading(page));
    const inputBox = await box(input);
    const listBox = await box(postLinks(page).first());
    expect(isBelow(inputBox, headingBox)).toBe(true);
    expect(isBelow(listBox, inputBox)).toBe(true);
    expect(Math.abs(inputBox.x - headingBox.x)).toBeLessThanOrEqual(LAYOUT_SLACK);
    expect(Math.abs(inputBox.width - headingBox.width)).toBeLessThanOrEqual(LAYOUT_SLACK);
  }
});

test('typing filters the list instantly and fuzzily over titles, tags, and excerpts — a typo still finds its post', async ({
  page,
}) => {
  await page.goto('/posts');
  const newest = page.getByRole('link', { name: NEWEST_POST, exact: true });
  const oldest = page.getByRole('link', { name: OLDEST_POST, exact: true });

  // No submit anywhere: typing alone filters. Each query is a typo of a
  // detail of one post — the matching is fuzzy over all three fields.
  await filter(page).fill('poolng'); // title
  await expect(newest).toBeVisible();
  await expect(oldest).toBeHidden();

  await filter(page).fill('optimizaton'); // tag
  await expect(newest).toBeVisible();
  await expect(oldest).toBeHidden();

  await filter(page).fill('descrition'); // excerpt
  await expect(oldest).toBeVisible();
  await expect(newest).toBeHidden();

  // Clearing the input brings the complete list back.
  await filter(page).fill('');
  await expect(newest).toBeVisible();
  await expect(oldest).toBeVisible();
});

test('every match stays visible — the filter has no result cap', async ({ page }) => {
  await page.goto('/posts');

  // A query both posts match: the whole result set stays in the list.
  await filter(page).fill('o');
  await expect(page.getByRole('link', { name: NEWEST_POST, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: OLDEST_POST, exact: true })).toBeVisible();
});

test('when nothing matches the list is replaced by a single muted no posts match line', async ({
  page,
}) => {
  await page.goto('/posts');

  await filter(page).fill('zzzqqqxyz');
  const emptyLine = page.getByText('no posts match', { exact: true });
  await expect(emptyLine).toBeVisible();
  await expect(emptyLine).toHaveCount(1);
  await expect(page.getByRole('link', { name: NEWEST_POST, exact: true })).toBeHidden();
  await expect(page.getByRole('link', { name: OLDEST_POST, exact: true })).toBeHidden();

  // A match again replaces the empty line with the list.
  await filter(page).fill('poolng');
  await expect(emptyLine).toBeHidden();
  await expect(page.getByRole('link', { name: NEWEST_POST, exact: true })).toBeVisible();
});

test('the filter has no URL state: navigating away or reloading clears it', async ({ page }) => {
  await page.goto('/posts');
  const newest = page.getByRole('link', { name: NEWEST_POST, exact: true });
  const oldest = page.getByRole('link', { name: OLDEST_POST, exact: true });

  await filter(page).fill('poolng');
  await expect(newest).toBeVisible();
  await expect(oldest).toBeHidden();
  await page.reload();
  await expect(filter(page)).toHaveValue('');
  await expect(newest).toBeVisible();
  await expect(oldest).toBeVisible();

  await filter(page).fill('poolng');
  await expect(oldest).toBeHidden();
  await page.goto('/');
  await page.goto('/posts');
  await expect(filter(page)).toHaveValue('');
  await expect(newest).toBeVisible();
  await expect(oldest).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the complete post list is present and no filter input is visible', async ({ page }) => {
    await page.goto('/posts');

    await expect(heading(page)).toBeVisible();
    await expect(page.getByRole('link', { name: NEWEST_POST, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: OLDEST_POST, exact: true })).toBeVisible();

    // Nothing reveals the hidden filter — and no empty-result line lies
    // about a filter that cannot run.
    await expect(page.getByLabel('Filter posts')).toBeHidden();
    await expect(page.getByText('no posts match', { exact: true })).toBeHidden();
  });
});
