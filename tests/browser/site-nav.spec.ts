// Site nav (nav-posts-search ticket 04): the site nav is a tidy bracket bar —
// [home], [posts], [about], [tags], [dirs], [feed], then the theme toggle as
// the final bracket item — with the site title at the left and the whole
// bracket group at the right on desktop, and two deliberate rows (site title,
// then the wrappable bracket links) on phones. The old embedded search widget
// is gone. Assert only what a visitor observes: visible elements, on-screen
// arrangement (bounding boxes), tap outcomes, and accessibility state — never
// CSS values, markup minutiae, or script internals.
import { test, expect, type Page } from '@playwright/test';
import { box, boxes, isBelow, overlapsVertically, LAYOUT_SLACK, DESKTOP } from './helpers';

const NAV_LINKS = [
  { name: '[home]', href: '/' },
  { name: '[posts]', href: '/posts' },
  { name: '[about]', href: '/about' },
  { name: '[tags]', href: '/tags' },
  { name: '[dirs]', href: '/dirs' },
  { name: '[feed]', href: '/feed.xml' },
] as const;

// Pixel band for grouping link boxes into rows despite sub-pixel offsets.
const ROW_BAND = 4;

const navParts = (page: Page) => ({
  title: page.getByRole('link', { name: 'ht4w5', exact: true }),
  links: NAV_LINKS.map(({ name }) => page.getByRole('link', { name, exact: true })),
  toggle: page.getByRole('button', { name: /theme/i }),
});

test('the bracket links are home, posts, about, tags, dirs, feed, then the theme toggle', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP);
  await page.goto('/');
  const { title, links, toggle } = navParts(page);

  // The site title still links home …
  await expect(title).toHaveAttribute('href', '/');
  // … and every bracket link goes where it says.
  for (const [i, { href }] of NAV_LINKS.entries()) {
    await expect(links[i]).toBeVisible();
    await expect(links[i]).toHaveAttribute('href', href);
  }

  // The order a reader sees: site title, then the bracket items left to
  // right, with the theme toggle as the final bracket item.
  const partsInOrder = await boxes([title, ...links, toggle]);
  for (let i = 1; i < partsInOrder.length; i++) {
    expect(partsInOrder[i].x).toBeGreaterThan(partsInOrder[i - 1].x);
  }
});

test('the theme toggle label mirrors the mode through the cycle and the state persists', async ({
  page,
}) => {
  await page.goto('/');
  // The accessible name says what activating the button does and names the
  // current mode; the visible label shows that mode.
  let toggle = page.getByRole('button', { name: 'Change theme (currently system)' });
  await expect(toggle).toHaveText('system');
  await toggle.click();
  toggle = page.getByRole('button', { name: 'Change theme (currently dark)' });
  await expect(toggle).toHaveText('dark');
  await toggle.click();
  toggle = page.getByRole('button', { name: 'Change theme (currently light)' });
  await expect(toggle).toHaveText('light');
  // The chosen theme survives a reload …
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Change theme (currently light)' })
  ).toHaveText('light');
  // … and the cycle wraps back to system.
  await toggle.click();
  await expect(page.getByRole('button', { name: 'Change theme (currently system)' })).toHaveText(
    'system'
  );
});

test('no search input or results dropdown is present in the nav at any viewport', async ({
  page,
}) => {
  for (const width of [300, 375, 480, 1280]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    // The search widget is gone outright: no field to type into …
    await expect(page.getByRole('textbox')).toHaveCount(0);
    await expect(page.getByPlaceholder('search')).toHaveCount(0);
    // … so its results dropdown can never appear.
    await expect(page.getByText(/no results/i)).toHaveCount(0);
  }
});

test('the site nav stacks into two rows at every phone width: site title, then the bracket links', async ({
  page,
}) => {
  // "At 375×812 and any width ≤480px" — the arrangement must hold at the
  // narrowest phones and at the breakpoint's upper edge, not just at the one
  // reported width.
  for (const width of [300, 320, 375, 460]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    const { title, links, toggle } = navParts(page);
    const titleBox = await box(title);
    const linkBoxes = await boxes(links);
    const toggleBox = await box(toggle);

    // Row 1: the site title alone.
    for (const part of [...linkBoxes, toggleBox]) {
      expect(overlapsVertically(titleBox, part)).toBe(false);
    }

    // Row 2: all bracket links, below the title row (onto more than one
    // line if they must wrap) …
    for (const linkBox of linkBoxes) {
      expect(isBelow(linkBox, titleBox)).toBe(true);
    }

    // … with the theme toggle as the final bracket item — never before the
    // link that precedes it.
    expect(isBelow(toggleBox, titleBox)).toBe(true);
    const feedBox = linkBoxes.at(-1)!;
    expect(
      isBelow(toggleBox, feedBox) ||
        (overlapsVertically(toggleBox, feedBox) && toggleBox.x >= feedBox.x)
    ).toBe(true);
  }
});

test('the bracket nav links wrap rather than overflow on the narrowest phones', async ({
  page,
}) => {
  for (const width of [300, 320]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    const { links, toggle } = navParts(page);
    const bracketBoxes = await boxes([...links, toggle]);

    // Nothing is cut off …
    for (const partBox of bracketBoxes) {
      expect(partBox.x).toBeGreaterThanOrEqual(0);
      expect(partBox.x + partBox.width).toBeLessThanOrEqual(width);
    }

    // … and the bracket items wrap onto more than one row when one line
    // cannot fit.
    const rows = new Set(bracketBoxes.map((b) => Math.round(b.y / ROW_BAND)));
    expect(rows.size).toBeGreaterThan(1);
  }
});

test('the site nav stays on one line on desktop: site title left, bracket group right', async ({
  page,
}) => {
  const width = DESKTOP.width;
  await page.setViewportSize(DESKTOP);
  await page.goto('/');
  const { title, links, toggle } = navParts(page);
  const titleBox = await box(title);
  const linkBoxes = await boxes(links);
  const toggleBox = await box(toggle);

  // One line: the whole bracket group shares the site title's row band.
  for (const part of [...linkBoxes, toggleBox]) {
    expect(overlapsVertically(part, titleBox)).toBe(true);
  }

  // Title left, bracket group (toggle included) right: the group's right
  // edge sits at the content's right edge, mirrored against the title at the
  // content's left edge — the free space is all between them.
  expect(
    Math.abs(width - (toggleBox.x + toggleBox.width) - titleBox.x)
  ).toBeLessThanOrEqual(LAYOUT_SLACK);
});

test('the theme toggle sits level with the bracket links', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await page.goto('/');
  const { links, toggle } = navParts(page);
  const toggleBox = await box(toggle);

  // Level means level: the toggle's rendered box shares the links' text line
  // — same vertical centre to the pixel (same font, same line). A button
  // riding its own box used to sit a couple of pixels low.
  for (const link of links) {
    const linkBox = await box(link);
    expect(
      Math.abs(toggleBox.y + toggleBox.height / 2 - (linkBox.y + linkBox.height / 2))
    ).toBeLessThanOrEqual(1);
  }
});

test('the nav links and theme toggle are reachable in reading order and operable with the keyboard', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP);
  await page.goto('/');

  // Reading order: tabbing reaches the site title, then each bracket link in
  // order, then the theme toggle.
  const inReadingOrder = [
    page.getByRole('link', { name: 'ht4w5', exact: true }),
    ...NAV_LINKS.map(({ name }) => page.getByRole('link', { name, exact: true })),
    page.getByRole('button', { name: /theme/i }),
  ];
  for (const part of inReadingOrder) {
    await page.keyboard.press('Tab');
    await expect(part).toBeFocused();
  }

  // Enter on a focused nav link opens its destination.
  for (const [i, { name, href }] of NAV_LINKS.entries()) {
    await page.goto('/');
    for (let tab = 0; tab <= i + 1; tab++) await page.keyboard.press('Tab');
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href.replace(/\./g, '\\.')}$`));
  }

  // The theme toggle works with Enter and Space alike: each keypress cycles
  // the mode, as the changing label shows.
  await page.goto('/');
  for (let tab = 0; tab <= NAV_LINKS.length + 1; tab++) await page.keyboard.press('Tab');
  const toggle = page.getByRole('button', { name: 'Change theme (currently system)' });
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', { name: 'Change theme (currently dark)' })
  ).toHaveText('dark');
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('button', { name: 'Change theme (currently light)' })
  ).toHaveText('light');
});
