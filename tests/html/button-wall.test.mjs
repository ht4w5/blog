// Built-HTML tests for the homepage button wall. Assert rendered HTML a
// visitor receives — visible text, link destinations, image alt text, and
// document order of visible content — never CSS property values, markup
// minutiae, or script internals. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage, listBuiltPages } from './load-page.mjs';
import {
  HEADING,
  COPYRIGHT,
  attr,
  wallRegion,
  images,
  links,
  visibleText,
  assertOpensSafelyInNewTab,
} from './helpers.mjs';

test('homepage ends with the buttons section after the post list and pagination', async () => {
  const html = await loadBuiltPage('index.html');

  const heading = html.match(HEADING);
  assert.ok(heading, 'homepage shows a heading with the text "buttons"');

  // Document order of visible content: every post title link precedes the
  // buttons heading, so the section comes after the post list.
  const destinations = links(html);
  const postLinks = destinations.filter((link) => link.href.startsWith('/blog/'));
  assert.ok(postLinks.length > 0, 'homepage shows the post list');
  for (const link of postLinks) {
    assert.ok(
      link.index < heading.index,
      `the post link ${link.href} comes before the buttons section`
    );
  }

  // Pagination links, when the build emits any, precede the heading too.
  for (const link of destinations.filter((link) => link.href.startsWith('/page/'))) {
    assert.ok(
      link.index < heading.index,
      `the pagination link ${link.href} comes before the buttons section`
    );
  }

  // The footer's copyright line is the page's closing text, so the buttons
  // section comes before the footer.
  const copyright = html.search(COPYRIGHT);
  assert.ok(copyright !== -1, 'homepage shows the footer copyright line');
  assert.ok(heading.index < copyright, 'the buttons section is before the footer');

  // The `buttons` heading is the last heading in main: the buttons section
  // is the page's last section.
  const headings = [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/g)];
  const lastHeading = headings.at(-1);
  assert.ok(lastHeading, 'homepage shows section headings');
  assert.equal(
    visibleText(lastHeading[2]).trim(),
    'buttons',
    'the buttons heading is the last heading in main'
  );
});

test('every button wall image renders at 88×31 with descriptive alt text', async () => {
  const html = await loadBuiltPage('index.html');
  const region = wallRegion(html);
  assert.ok(region, 'homepage has a button wall');

  const wallImages = images(region);
  assert.ok(wallImages.length > 0, 'the button wall renders images');

  for (const img of wallImages) {
    assert.equal(img.width, '88', `image is 88 wide: ${img.tag}`);
    assert.equal(img.height, '31', `image is 31 tall: ${img.tag}`);
    assert.ok(
      img.alt && img.alt.trim().length > 0,
      `image has descriptive alt text: ${img.tag}`
    );
  }
});

test('flair badges render without a link; linked buttons carry their href', async () => {
  const html = await loadBuiltPage('index.html');
  const region = wallRegion(html);
  assert.ok(region, 'homepage has a button wall');

  const items = [...region.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  assert.ok(items.length > 0, 'the button wall renders entries');

  let flairBadges = 0;
  let linkedButtons = 0;
  for (const item of items) {
    const anchor = item.match(/<a\s[^>]*>/)?.[0];
    if (anchor) {
      linkedButtons += 1;
      const href = attr(anchor, 'href');
      assert.ok(href && href.trim().length > 0, `linked button carries its href: ${anchor}`);
      if (/^https?:\/\//.test(href)) {
        assertOpensSafelyInNewTab(anchor, 'the linked button');
      }
    } else {
      flairBadges += 1;
      assert.ok(item.includes('<img'), `flair badge renders its image: ${item}`);
      assert.ok(!item.includes('href'), `flair badge renders without a link: ${item}`);
    }
  }

  assert.ok(flairBadges > 0, 'the wall includes at least one flair badge');
  assert.ok(linkedButtons > 0, 'the wall includes at least one linked button');
});

test('the buttons section renders on the homepage and on no other page', async () => {
  // A whole-dist sweep: every emitted HTML page — pagination pages included
  // whenever the build emits any — is checked, so absence can never silently
  // go unverified.
  const pages = await listBuiltPages();
  assert.ok(pages.includes('index.html'), 'the build emits the homepage');

  for (const page of pages) {
    const html = await loadBuiltPage(page);
    const onHomepage = page === 'index.html';
    assert.equal(
      HEADING.test(html),
      onHomepage,
      onHomepage
        ? `the buttons section renders on ${page}`
        : `the button wall does not appear on ${page}`
    );
  }
});
