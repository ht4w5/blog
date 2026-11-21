// Site-nav arrangement (ticket 01): at phone widths the site nav stacks into
// three deliberate rows — site title + theme toggle, then the bracket nav
// links, then the search field spanning the full content width — while wider
// screens keep the one-line nav. Assert only what a visitor observes: visible
// elements, on-screen arrangement (bounding boxes), tap outcomes, and
// accessibility state — never CSS values, markup minutiae, or script
// internals.
import { test, expect, type Locator, type Page } from '@playwright/test';

const NAV_LINK_NAMES = ['[posts]', '[about]', '[tags]', '[dirs]', '[feed]'];

const navParts = (page: Page) => ({
  title: page.getByRole('link', { name: 'ht4w5', exact: true }),
  links: NAV_LINK_NAMES.map((name) => page.getByRole('link', { name, exact: true })),
  search: page.getByLabel('Search posts'),
  toggle: page.getByRole('button', { name: /^Theme:/ }),
});

type Box = { x: number; y: number; width: number; height: number };

const box = (locator: Locator): Promise<Box> => locator.boundingBox() as Promise<Box>;
const boxes = (locators: Locator[]): Promise<Box[]> => Promise.all(locators.map(box));

const overlapsVertically = (a: Box, b: Box): boolean =>
  a.y < b.y + b.height && b.y < a.y + a.height;
const isBelow = (a: Box, b: Box): boolean => a.y >= b.y + b.height - 2;

test.describe('on a phone viewport (375×812)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('the site nav stacks into three rows: title + toggle, links, full-width search', async ({
    page,
  }) => {
    await page.goto('/');
    const { title, links, search, toggle } = navParts(page);
    const titleBox = await box(title);
    const linkBoxes = await boxes(links);
    const searchBox = await box(search);
    const toggleBox = await box(toggle);

    // Row 1: site title on the left, theme toggle on the right.
    expect(overlapsVertically(titleBox, toggleBox)).toBe(true);
    expect(titleBox.x).toBeLessThanOrEqual(linkBoxes[0].x);
    expect(toggleBox.x).toBeGreaterThan(titleBox.x + titleBox.width);
    for (const part of [...linkBoxes, searchBox, titleBox]) {
      expect(toggleBox.x + toggleBox.width).toBeGreaterThan(part.x + part.width);
    }

    // Row 2: all bracket nav links, below row 1 and above the search row.
    for (const linkBox of linkBoxes) {
      expect(isBelow(linkBox, titleBox)).toBe(true);
      expect(isBelow(linkBox, toggleBox)).toBe(true);
      expect(isBelow(searchBox, linkBox)).toBe(true);
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(375);
    }

    // Row 3: the search field spans the full content width (a bracket
    // glyph's slack aside), below everything else.
    expect(isBelow(searchBox, titleBox)).toBe(true);
    expect(isBelow(searchBox, toggleBox)).toBe(true);
    const contentLeft = titleBox.x;
    const contentRight = 375 - titleBox.x;
    expect(Math.abs(searchBox.x - contentLeft)).toBeLessThanOrEqual(12);
    expect(Math.abs(searchBox.x + searchBox.width - contentRight)).toBeLessThanOrEqual(12);
  });
  test('the theme toggle cycles themes from its first-row spot and the state persists', async ({
    page,
  }) => {
    await page.goto('/');
    const { toggle } = navParts(page);
    await expect(toggle).toHaveAccessibleName('Theme: system');
    await toggle.click();
    await expect(toggle).toHaveAccessibleName('Theme: dark');
    await toggle.click();
    await expect(toggle).toHaveAccessibleName('Theme: light');
    // The chosen theme survives a reload …
    await page.reload();
    await expect(toggle).toHaveAccessibleName('Theme: light');
    // … and the cycle wraps back to system.
    await toggle.click();
    await expect(toggle).toHaveAccessibleName('Theme: system');
  });
  test('search works from the full-width row and results sit directly under it', async ({
    page,
  }) => {
    await page.goto('/');
    const input = page.getByLabel('Search posts');
    await input.fill('test');
    const row = page.getByRole('link', { name: /Test\s*2026-09-23/ });
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute('href', '/blog/hello-world');

    // The results appear directly under the field they came from.
    const inBox = await box(input);
    const rowBox = await box(row);
    expect(isBelow(rowBox, inBox)).toBe(true);
    expect(Math.abs(rowBox.x - inBox.x)).toBeLessThanOrEqual(12);
    expect(Math.abs(rowBox.x + rowBox.width - (inBox.x + inBox.width))).toBeLessThanOrEqual(12);
  });
});

test('every nav link stays fully visible at narrow widths', async ({ page }) => {
  const { links } = navParts(page);
  for (const width of [300, 320, 360]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    for (const linkBox of await boxes(links)) {
      expect(linkBox.x).toBeGreaterThanOrEqual(0);
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(width);
    }
  }
});

test('the nav links wrap onto multiple rows when one line cannot fit', async ({ page }) => {
  const { links } = navParts(page);
  for (const width of [300, 320]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    const rows = new Set((await boxes(links)).map((b) => Math.round(b.y / 4)));
    expect(rows.size).toBeGreaterThan(1);
  }
});

test.describe('on a desktop viewport (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('the site nav stays on one line, arranged title → links → search → toggle', async ({
    page,
  }) => {
    await page.goto('/');
    const { title, links, search, toggle } = navParts(page);
    const titleBox = await box(title);
    const linkBoxes = await boxes(links);
    const searchBox = await box(search);
    const toggleBox = await box(toggle);

    // One line: every part shares the title's row band.
    for (const part of [...linkBoxes, searchBox, toggleBox]) {
      expect(overlapsVertically(part, titleBox)).toBe(true);
    }

    // The one-line order a desktop reader knows: title, links, then search
    // and the theme toggle together at the right.
    expect(titleBox.x).toBeLessThan(linkBoxes[0].x);
    expect(linkBoxes.at(-1)!.x + linkBoxes.at(-1)!.width).toBeLessThan(searchBox.x);
    expect(searchBox.x + searchBox.width).toBeLessThan(toggleBox.x);
    expect(toggleBox.x + toggleBox.width).toBeGreaterThan(searchBox.x + searchBox.width);
  });
});
