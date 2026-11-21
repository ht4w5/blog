// Table-of-contents behaviour (mobile-nav-toc tickets 02–03): the Contents
// label is a real disclosure — clicking, tapping, or pressing Enter/Space on it
// collapses and re-expands the outline — the entry for the section being read
// carries aria-current as the reader scrolls or jumps, and each breakpoint
// shows its own copy of the table of contents: the collapsed inline copy under
// the post header at phone width, the expanded sticky rail at desktop width.
// Assert only what a visitor observes: visible entries, disclosure state,
// navigation destinations, on-screen arrangement (bounding boxes), and
// accessibility state exposed to assistive tech — never CSS property values,
// markup minutiae, or script internals.
//
// Every test operates on the table-of-contents instances a visitor can see,
// so the suite keeps covering the component wherever its copies are placed.
// The summary is located by its visible "Contents" label: like the search
// results dropdown (see search-click.spec.ts), it exposes no ARIA role that
// role selectors match.
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

  test('the table of contents is the right-side rail, expanded by default', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];

    // Expanded without any interaction.
    await expect(outline(toc)).toBeVisible();

    // Beside the article on its right — not above the content.
    const tocBox = (await toc.boundingBox())!;
    const articleBox = (await page.getByRole('article').boundingBox())!;
    expect(tocBox.x).toBeGreaterThan(articleBox.x + articleBox.width);
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

  test('the table of contents sits directly under the post title/date/tags and above the article body', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    const tocBox = (await toc.boundingBox())!;

    // Below every part of the post header: title, date, and tags.
    for (const part of [
      page.getByRole('heading', { level: 1 }),
      page.getByText('2026-11-20', { exact: true }),
      page.getByRole('link', { name: '[Go]', exact: true }),
      page.getByRole('link', { name: '[optimization]', exact: true }),
    ]) {
      const partBox = (await part.boundingBox())!;
      expect(tocBox.y).toBeGreaterThanOrEqual(partBox.y + partBox.height - 2);
    }

    // Above the article body: the first paragraph of the post starts below it.
    const bodyBox = (await page.getByRole('article').getByRole('paragraph').first().boundingBox())!;
    expect(tocBox.y + tocBox.height).toBeLessThanOrEqual(bodyBox.y + 2);
  });

  test('the table of contents loads collapsed; one tap expands it and a second tap collapses it', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    await expect(outline(toc)).toBeHidden();
    await contentsLabel(toc).tap();
    await expect(outline(toc)).toBeVisible();
    await contentsLabel(toc).tap();
    await expect(outline(toc)).toBeHidden();
  });

  test('tapping an entry jumps to its section and marks it as current in the visible copy', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    await contentsLabel(toc).tap();
    await entry(toc, 'The better approach').tap();
    await expect(page).toHaveURL(/#the-better-approach$/);
    await expect(page.getByRole('heading', { name: 'The better approach' })).toBeInViewport();
    await expect(entry(toc, 'The better approach')).toHaveAttribute('aria-current', 'true');
    await expect(entry(toc, 'A common pattern')).not.toHaveAttribute('aria-current', 'true');
  });
});

test.describe('without JavaScript', () => {
  test.use({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });

  test('the disclosure and its entries are present and usable', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    await expect(contentsLabel(toc)).toBeVisible();
    await expect(outline(toc)).toBeHidden();
    // The native disclosure opens without script…
    await contentsLabel(toc).click();
    await expect(outline(toc)).toBeVisible();
    // …and the entries still take the reader to their sections.
    await entry(toc, 'The better approach').click();
    await expect(page).toHaveURL(/#the-better-approach$/);
    await expect(page.getByRole('heading', { name: 'The better approach' })).toBeInViewport();
  });
});

test.describe('assistive-tech exposure', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('exactly one table of contents is exposed to assistive tech at a time', async ({ page }) => {
    await page.goto(POST_URL);
    // One navigation region at desktop width…
    await expect(tocs(page)).toHaveCount(1);
    // …and one at phone width — never a duplicate navigation region.
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(tocs(page)).toHaveCount(1);
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

test.describe('with the table of contents rendered twice on a page', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('each copy keeps its own disclosure state and tracks the current section', async ({ page }) => {
    // The site renders two copies of the component — rail and inline — but a
    // visitor sees one per viewport. Their independence is what a visitor
    // observes across a viewport change: each copy keeps its own state.
    await page.goto(POST_URL);

    // The rail copy at desktop width loads expanded; collapse it.
    const rail = (await visibleTocs(page))[0];
    await contentsLabel(rail).click();
    await expect(outline(rail)).toBeHidden();

    // The inline copy at phone width is its own disclosure: still collapsed
    // by default, and expandable without touching the rail copy's state.
    await page.setViewportSize({ width: 375, height: 812 });
    const inline = (await visibleTocs(page))[0];
    await expect(outline(inline)).toBeHidden();
    await contentsLabel(inline).click();
    await expect(outline(inline)).toBeVisible();

    // Back at desktop width the rail copy kept its own state — still
    // collapsed — and the inline copy keeps its own: expanded at phone width.
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(outline(rail)).toBeHidden();
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(outline(inline)).toBeVisible();

    // Each copy marks the section being read, wherever the reader looks.
    await scrollToHeading(page, 'a-common-pattern');
    await expect(entry(inline, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    await expect(entry(inline, 'See also')).not.toHaveAttribute('aria-current', 'true');
    await page.setViewportSize({ width: 1280, height: 800 });
    // The reflow moved the headings, so put the reader back at the section.
    await scrollToHeading(page, 'a-common-pattern');
    await contentsLabel(rail).click();
    await expect(outline(rail)).toBeVisible();
    await expect(entry(rail, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    await expect(entry(rail, 'See also')).not.toHaveAttribute('aria-current', 'true');
  });
});
