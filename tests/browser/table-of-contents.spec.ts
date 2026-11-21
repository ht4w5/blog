// Table-of-contents behaviour (mobile-nav-toc ticket 02): the Contents label
// is a real disclosure — it loads expanded, and clicking, tapping, or pressing
// Enter/Space on it collapses and re-expands the outline — and the entry for
// the section being read carries aria-current as the reader scrolls or jumps.
// Assert only what a visitor observes: visible entries, disclosure state,
// navigation destinations, and accessibility state exposed to assistive tech —
// never CSS property values, markup minutiae, or script internals.
//
// Every test operates on the table-of-contents instances a visitor can see,
// looping over whatever renders, so the suite keeps covering the component
// wherever ticket 03 places its copies. The summary is located by its visible
// "Contents" label: like the search results dropdown (see
// search-click.spec.ts), it exposes no ARIA role that role selectors match.
import { test, expect, type Page, type Locator } from '@playwright/test';

const POST_URL = '/blog/pooling-slices-in-go-without-extra-allocations';

const tocs = (page: Page) => page.getByRole('navigation', { name: 'Table of contents' });
const contentsLabel = (toc: Locator) => toc.getByText('Contents', { exact: true });
const outline = (toc: Locator) => toc.getByRole('list');
const entry = (toc: Locator, name: string) => toc.getByRole('link', { name, exact: true });

// Scroll the reader to a section: the heading lands at the top of the
// viewport, as after a table-of-contents jump.
async function scrollToHeading(page: Page, id: string): Promise<void> {
  await page.evaluate((headingId) => {
    const heading = document.getElementById(headingId);
    if (heading) window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY);
  }, id);
}

// The instances a visitor can currently see. A second variant rendered
// display-none is not the visitor's table of contents at this viewport and
// cannot be operated.
async function visibleTocs(page: Page): Promise<Locator[]> {
  const visible: Locator[] = [];
  for (const toc of await tocs(page).all()) {
    if (await toc.isVisible()) visible.push(toc);
  }
  return visible;
}

test.describe('at desktop width', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the table of contents loads expanded and the Contents label collapses and re-expands the outline', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    for (const toc of await visibleTocs(page)) {
      await expect(outline(toc)).toBeVisible();
      await contentsLabel(toc).click();
      await expect(outline(toc)).toBeHidden();
      await contentsLabel(toc).click();
      await expect(outline(toc)).toBeVisible();
    }
  });

  test('the disclosure is operable with Enter and Space', async ({ page }) => {
    await page.goto(POST_URL);
    for (const toc of await visibleTocs(page)) {
      await expect(outline(toc)).toBeVisible();
      await contentsLabel(toc).focus();
      await page.keyboard.press('Enter');
      await expect(outline(toc)).toBeHidden();
      await page.keyboard.press('Space');
      await expect(outline(toc)).toBeVisible();
    }
  });

  test('the table of contents stays the sticky right rail beside the article', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    const article = page.getByRole('article');

    // Beside the article, on its right.
    const railBox = (await toc.boundingBox())!;
    const articleBox = (await article.boundingBox())!;
    expect(railBox.x).toBeGreaterThan(articleBox.x + articleBox.width);

    // Still stuck near the top of the viewport while reading on.
    await scrollToHeading(page, 'the-better-approach');
    const stuckBox = (await toc.boundingBox())!;
    expect(stuckBox.y).toBeGreaterThanOrEqual(30);
    expect(stuckBox.y).toBeLessThanOrEqual(34);
  });
});

test.describe('on a phone viewport', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });

  test('tapping the Contents label collapses and re-expands the outline', async ({ page }) => {
    await page.goto(POST_URL);
    for (const toc of await visibleTocs(page)) {
      // Flip and flip back whatever state the disclosure loads in.
      const loadedOpen = await outline(toc).isVisible();
      await contentsLabel(toc).tap();
      await expect(outline(toc)).toBeVisible({ visible: !loadedOpen });
      await contentsLabel(toc).tap();
      await expect(outline(toc)).toBeVisible({ visible: loadedOpen });
    }
  });
});

test.describe('current-section tracking', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('jumping to a section marks that entry as the current one', async ({ page }) => {
    await page.goto(POST_URL);
    const instances = await visibleTocs(page);
    await entry(instances[0], 'The better approach').click();
    await expect(page).toHaveURL(/#the-better-approach$/);
    for (const toc of instances) {
      await expect(entry(toc, 'The better approach')).toHaveAttribute('aria-current', 'true');
      await expect(entry(toc, 'A common pattern')).not.toHaveAttribute('aria-current', 'true');
    }
  });

  test('the marked entry updates as the reader scrolls', async ({ page }) => {
    await page.goto(POST_URL);
    const instances = await visibleTocs(page);
    await scrollToHeading(page, 'a-common-pattern');
    for (const toc of instances) {
      await expect(entry(toc, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    }
    await scrollToHeading(page, 'see-also');
    for (const toc of instances) {
      await expect(entry(toc, 'See also')).toHaveAttribute('aria-current', 'true');
      await expect(entry(toc, 'A common pattern')).not.toHaveAttribute('aria-current', 'true');
    }
  });
});

test.describe('with the table of contents used more than once on a page', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('each instance toggles and tracks the current section independently', async ({ page }) => {
    // Ticket 03 renders two copies of the component; until then the site has
    // one. To exercise "more than once" now, serve the post with every
    // rendered table of contents doubled — test plumbing at the network seam;
    // everything asserted below is what a visitor observes.
    await page.route(/\/blog\/pooling-slices[^/]*\/?$/, async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      await route.fulfill({
        response,
        body: body.replace(/(<nav class="toc[^"]*"[\s\S]*?<\/nav>)/g, '$1$1'),
      });
    });
    await page.goto(POST_URL);

    const instances = await visibleTocs(page);
    expect(instances.length).toBeGreaterThanOrEqual(2);

    // Start from expanded outlines so every entry is operable and visible.
    for (const toc of instances) {
      if (!(await outline(toc).isVisible())) await contentsLabel(toc).click();
      await expect(outline(toc)).toBeVisible();
    }

    // Activating one disclosure leaves the others alone.
    const first = instances[0];
    await contentsLabel(first).click();
    await expect(outline(first)).toBeHidden();
    for (const other of instances.slice(1)) await expect(outline(other)).toBeVisible();
    await contentsLabel(first).click();
    await expect(outline(first)).toBeVisible();

    // Every instance marks the section being read.
    await scrollToHeading(page, 'a-common-pattern');
    for (const toc of instances) {
      await expect(entry(toc, 'A common pattern')).toHaveAttribute('aria-current', 'true');
      await expect(entry(toc, 'See also')).not.toHaveAttribute('aria-current', 'true');
    }
  });
});
