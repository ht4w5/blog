// Table-of-contents behaviour (mobile-nav-toc tickets 02–03): the Contents
// label is a real disclosure — clicking, tapping, or pressing Enter/Space on it
// collapses and re-expands the list — the entry for the section being read
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
import { box, isBelow, isWithin } from './helpers';

const POST_URL = '/blog/pooling-slices-in-go-without-extra-allocations';

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 375, height: 812 };

const tocs = (page: Page) => page.getByRole('navigation', { name: 'Table of contents' });
const contentsLabel = (toc: Locator) => toc.getByText('Contents', { exact: true });
const entries = (toc: Locator) => toc.getByRole('list');
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
  test.use({ viewport: DESKTOP });

  test('the table of contents loads expanded and the Contents label collapses and re-expands the list', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    for (const toc of await visibleTocs(page)) {
      await expect(entries(toc)).toBeVisible();
      await contentsLabel(toc).click();
      await expect(entries(toc)).toBeHidden();
      await contentsLabel(toc).click();
      await expect(entries(toc)).toBeVisible();
    }
  });

  test('the disclosure is operable with Enter and Space', async ({ page }) => {
    await page.goto(POST_URL);
    for (const toc of await visibleTocs(page)) {
      await expect(entries(toc)).toBeVisible();
      await contentsLabel(toc).focus();
      await page.keyboard.press('Enter');
      await expect(entries(toc)).toBeHidden();
      await page.keyboard.press('Space');
      await expect(entries(toc)).toBeVisible();
    }
  });

  test('the table of contents is the right-side rail, expanded by default', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];

    // Expanded without any interaction.
    await expect(entries(toc)).toBeVisible();

    // Beside the article on its right — not above the content.
    const tocBox = await box(toc);
    const articleBox = await box(page.getByRole('article'));
    expect(tocBox.x).toBeGreaterThan(articleBox.x + articleBox.width);
  });

  test('the table of contents stays the sticky right rail beside the article', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    const article = page.getByRole('article');

    // Beside the article, on its right.
    const railBox = await box(toc);
    const articleBox = await box(article);
    expect(railBox.x).toBeGreaterThan(articleBox.x + articleBox.width);

    // Still stuck near the top of the viewport while reading on: on screen
    // and in its top quarter — the visitor-observable effect of stickiness,
    // without pinning the CSS offset itself.
    await scrollToHeading(page, 'the-better-approach');
    const stuckBox = await box(toc);
    expect(stuckBox.y).toBeGreaterThanOrEqual(0);
    expect(stuckBox.y).toBeLessThan(DESKTOP.height / 4);
  });

  // The rail's entries fit its visible area on a tall window, so scroll-into-
  // view only has observable work to do when the window is short enough for
  // them to overflow it.
  test.describe('with a window short enough to overflow the rail', () => {
    test.use({ viewport: { width: 1280, height: 160 } });

    test('the active entry is scrolled into view in the rail while reading on', async ({ page }) => {
      await page.goto(POST_URL);
      const toc = (await visibleTocs(page))[0];

      // The last entry starts out of view inside the rail — otherwise this
      // window would not exercise scrolling the entry into view at all.
      expect(isWithin(await box(entry(toc, 'See also')), await box(toc))).toBe(false);

      // Reading on brings each active entry into view in the rail.
      await scrollToHeading(page, 'a-common-pattern');
      await expect(entry(toc, 'A common pattern')).toHaveAttribute('aria-current', 'true');
      expect(isWithin(await box(entry(toc, 'A common pattern')), await box(toc))).toBe(true);
      await scrollToHeading(page, 'see-also');
      await expect(entry(toc, 'See also')).toHaveAttribute('aria-current', 'true');
      expect(isWithin(await box(entry(toc, 'See also')), await box(toc))).toBe(true);
    });

    test('opening a collapsed rail brings the current entry into view', async ({ page }) => {
      await page.goto(POST_URL);
      const toc = (await visibleTocs(page))[0];
      await contentsLabel(toc).click();
      await expect(entries(toc)).toBeHidden();

      // Reading on while the rail is collapsed moves the current entry …
      await scrollToHeading(page, 'see-also');

      // … and opening the rail marks it and brings it into view.
      await contentsLabel(toc).click();
      await expect(entries(toc)).toBeVisible();
      await expect(entry(toc, 'See also')).toHaveAttribute('aria-current', 'true');
      expect(isWithin(await box(entry(toc, 'See also')), await box(toc))).toBe(true);
    });
  });
});

test.describe('on a phone viewport', () => {
  test.use({ viewport: PHONE, hasTouch: true });

  test('the table of contents sits directly under the post title/date/tags and above the article body', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    const tocBox = await box(toc);

    // Below every part of the post header: title, date, and tags.
    for (const part of [
      page.getByRole('heading', { level: 1 }),
      page.getByText('2026-11-20', { exact: true }),
      page.getByRole('link', { name: '[Go]', exact: true }),
      page.getByRole('link', { name: '[optimization]', exact: true }),
    ]) {
      expect(isBelow(tocBox, await box(part))).toBe(true);
    }

    // Above the article body: the first paragraph of the post starts below it.
    const bodyBox = await box(page.getByRole('article').getByRole('paragraph').first());
    expect(isBelow(bodyBox, tocBox)).toBe(true);
  });

  test('the table of contents loads collapsed; one tap expands it and a second tap collapses it', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    await expect(entries(toc)).toBeHidden();
    await contentsLabel(toc).tap();
    await expect(entries(toc)).toBeVisible();
    await contentsLabel(toc).tap();
    await expect(entries(toc)).toBeHidden();
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
  test.use({ viewport: PHONE, javaScriptEnabled: false });

  test('the disclosure and its entries are present and usable', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    await expect(contentsLabel(toc)).toBeVisible();
    await expect(entries(toc)).toBeHidden();
    // The native disclosure opens without script…
    await contentsLabel(toc).click();
    await expect(entries(toc)).toBeVisible();
    // …and the entries still take the reader to their sections.
    await entry(toc, 'The better approach').click();
    await expect(page).toHaveURL(/#the-better-approach$/);
    await expect(page.getByRole('heading', { name: 'The better approach' })).toBeInViewport();
  });
});

test.describe('assistive-tech exposure', () => {
  test.use({ viewport: DESKTOP });

  test('exactly one table of contents is exposed to assistive tech at a time', async ({ page }) => {
    await page.goto(POST_URL);
    // One navigation region at desktop width…
    await expect(tocs(page)).toHaveCount(1);
    // …and one at phone width — never a duplicate navigation region.
    await page.setViewportSize(PHONE);
    await expect(tocs(page)).toHaveCount(1);
  });
});

test.describe('current-section tracking', () => {
  test.use({ viewport: DESKTOP });

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
  test.use({ viewport: DESKTOP });

  test('each copy keeps its own disclosure state and tracks the current section', async ({ page }) => {
    // The site renders two copies of the component — rail and inline — but a
    // visitor sees one per viewport. Their independence is what a visitor
    // observes across a viewport change: each copy keeps its own state.
    await page.goto(POST_URL);

    // The rail copy at desktop width loads expanded; collapse it.
    const rail = (await visibleTocs(page))[0];
    await contentsLabel(rail).click();
    await expect(entries(rail)).toBeHidden();

    // The inline copy at phone width is its own disclosure: still collapsed
    // by default, and expandable without touching the rail copy's state.
    await page.setViewportSize(PHONE);
    const inline = (await visibleTocs(page))[0];
    await expect(entries(inline)).toBeHidden();
    await contentsLabel(inline).click();
    await expect(entries(inline)).toBeVisible();

    // Back at desktop width the rail copy kept its own state — still
    // collapsed — and the inline copy keeps its own: expanded at phone width.
    await page.setViewportSize(DESKTOP);
    await expect(entries(rail)).toBeHidden();
    await page.setViewportSize(PHONE);
    await expect(entries(inline)).toBeVisible();

    // Each copy marks the section being read, wherever the reader looks.
    await scrollToHeading(page, 'a-common-pattern');
    await expect(entry(inline, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    await expect(entry(inline, 'See also')).not.toHaveAttribute('aria-current', 'true');
    await page.setViewportSize(DESKTOP);
    // The reflow moved the headings, so put the reader back at the section.
    await scrollToHeading(page, 'a-common-pattern');
    await contentsLabel(rail).click();
    await expect(entries(rail)).toBeVisible();
    await expect(entry(rail, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    await expect(entry(rail, 'See also')).not.toHaveAttribute('aria-current', 'true');
  });
});
