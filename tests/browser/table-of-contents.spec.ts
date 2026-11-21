// Table-of-contents behaviour (nav-posts-search ticket 02): the table of
// contents is readable and never folded. The Contents label is a plain
// static heading, the entries are always visible on load in both placements
// — the sticky right rail at desktop width and the copy above the article at
// phone width — and the entry for the section being read carries
// aria-current as the reader scrolls or jumps. Assert only what a visitor
// observes: visible entries, disclosure-free labels, navigation destinations,
// on-screen arrangement
// (bounding boxes), and accessibility state exposed to assistive tech — never
// CSS property values, markup minutiae, or script internals.
//
// Every test operates on the table-of-contents instances a visitor can see,
// so the suite keeps covering the component wherever its copies are placed.
// The label is located by its visible "Contents" text.
import { test, expect, type Page, type Locator } from '@playwright/test';
import { box, isBelow, isWithin, DESKTOP, PHONE } from './helpers';

const POST_URL = '/blog/pooling-slices-in-go-without-extra-allocations';

const ENTRY_NAMES = [
  'Interface assignment allocation',
  'The better approach',
  'A common pattern',
  'See also',
];

const tocs = (page: Page) => page.getByRole('navigation', { name: 'Table of contents' });
const contentsLabel = (toc: Locator) => toc.getByRole('heading', { name: 'Contents', exact: true });
const entries = (toc: Locator) => toc.getByRole('list');
const entry = (toc: Locator, name: string) => toc.getByRole('link', { name, exact: true });

// This seam observes line-box geometry only, so the sizing claims here are
// line boxes: at the component's line spacing (1.8), entry text of 14px
// measures ≈ 25.2px per line and label text of 16px ≈ 28.8px — the old
// 12px/12.8px sizes measured ≈ 21.6px and ≈ 23.0px. The mono face and the
// bold weight are paint attributes with no geometry of their own at this
// seam, so nothing here claims them.
const ENTRY_LINE = 14 * 1.8;

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

  test('the Contents label is plain static text and the entries are always visible', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    for (const toc of await visibleTocs(page)) {
      await expect(entries(toc)).toBeVisible();
      await expect(entry(toc, 'The better approach')).toBeVisible();

      // The label is a plain static heading — exposed to assistive tech as a
      // heading, not as any kind of control.
      await expect(contentsLabel(toc)).toBeVisible();

      // Not interactive: clicking the label, and pressing Enter and Space as
      // if it were a control, leave the entries exactly as they were. (A
      // pointer cursor and a disclosure marker are paint details with no
      // geometry at this seam.)
      await contentsLabel(toc).click();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
      await expect(entries(toc)).toBeVisible();
      await expect(entry(toc, 'The better approach')).toBeVisible();
    }
  });

  test('the table of contents is the right-side rail with entries visible on load', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];

    // Visible without any interaction.
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

  test('the table of contents above the article shows its entries fully expanded on load', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];

    // Nothing to tap open: the label and every entry are visible the moment
    // the page loads.
    await expect(contentsLabel(toc)).toBeVisible();
    for (const name of ENTRY_NAMES) {
      await expect(entry(toc, name)).toBeVisible();
    }

    // Tapping the label does not fold the list away.
    await contentsLabel(toc).tap();
    await expect(entries(toc)).toBeVisible();
    for (const name of ENTRY_NAMES) {
      await expect(entry(toc, name)).toBeVisible();
    }
  });

  test('tapping an entry jumps to its section and marks it as current in the visible copy', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];
    await entry(toc, 'The better approach').tap();
    await expect(page).toHaveURL(/#the-better-approach$/);
    await expect(page.getByRole('heading', { name: 'The better approach' })).toBeInViewport();
    await expect(entry(toc, 'The better approach')).toHaveAttribute('aria-current', 'true');
    await expect(entry(toc, 'A common pattern')).not.toHaveAttribute('aria-current', 'true');
  });
});

test.describe('text sizing', () => {
  test.use({ viewport: DESKTOP });

  test('the entry and label line boxes are consistent with 14px and 16px text at the component\'s 1.8 line spacing', async ({
    page,
  }) => {
    await page.goto(POST_URL);
    for (const viewport of [DESKTOP, PHONE]) {
      await page.setViewportSize(viewport);
      for (const toc of await visibleTocs(page)) {
        // The label's line box measures ≈ 28.8px — consistent with 16px
        // text at the 1.8 line spacing (the old 12.8px size measured
        // ≈ 23.0px).
        const labelBox = await box(contentsLabel(toc));
        expect(labelBox.height).toBeGreaterThan(27);
        expect(labelBox.height).toBeLessThan(30.5);

        // Each entry line box measures ≈ 25.2px — consistent with 14px text
        // at the 1.8 line spacing (the old 12px size measured ≈ 21.6px). An
        // entry that wraps onto a second line in the rail occupies a whole
        // multiple of a line box.
        for (const item of await toc.getByRole('listitem').all()) {
          const height = (await box(item)).height;
          const lines = Math.round(height / ENTRY_LINE);
          expect(lines).toBeGreaterThanOrEqual(1);
          expect(Math.abs(height - lines * ENTRY_LINE)).toBeLessThan(1);
        }
      }
    }
  });
});

test.describe('without JavaScript', () => {
  test.use({ viewport: PHONE, javaScriptEnabled: false });

  test('the entries are visible and usable without script', async ({ page }) => {
    await page.goto(POST_URL);
    const toc = (await visibleTocs(page))[0];

    // Nothing to tap open: the label and the entries arrive expanded with or
    // without script…
    await expect(contentsLabel(toc)).toBeVisible();
    await expect(entries(toc)).toBeVisible();
    await expect(entry(toc, 'The better approach')).toBeVisible();

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

  test('each copy stays expanded and tracks the current section as the reader moves between viewports', async ({
    page,
  }) => {
    // The site renders two copies of the component — rail and inline — but a
    // visitor sees one per viewport. Both are always expanded; what a visitor
    // observes across a viewport change is that whichever copy is showing
    // knows the section being read.
    await page.goto(POST_URL);

    // Reading at phone width: the inline copy shows the section.
    await page.setViewportSize(PHONE);
    await scrollToHeading(page, 'a-common-pattern');
    const inline = (await visibleTocs(page))[0];
    await expect(entries(inline)).toBeVisible();
    await expect(entry(inline, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    await expect(entry(inline, 'See also')).not.toHaveAttribute('aria-current', 'true');

    // At desktop width the rail copy tracks it too — with no state to restore
    // and nothing to reopen.
    await page.setViewportSize(DESKTOP);
    // The reflow moved the headings, so put the reader back at the section.
    await scrollToHeading(page, 'a-common-pattern');
    const rail = (await visibleTocs(page))[0];
    await expect(entries(rail)).toBeVisible();
    await expect(entry(rail, 'A common pattern')).toHaveAttribute('aria-current', 'true');
    await expect(entry(rail, 'See also')).not.toHaveAttribute('aria-current', 'true');
  });
});
