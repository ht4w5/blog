// Built-HTML tests for the homepage button wall. Assert rendered HTML a
// visitor receives — visible text, link destinations, image alt text, and
// document order of visible content — never CSS property values, markup
// minutiae, or script internals. Run via `pnpm test`, which builds first.
//
// Expectations derive from src/data/buttons.ts (the maintainer-facing wall
// data), so data-file edits stay data-only while the rendering contract
// stays under test. See tests/README.md ("Expectation styles").
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage, listBuiltPages } from './load-page.mjs';
import { attr, links, images, assertOpensSafelyInNewTab } from './helpers.mjs';
import { buttons } from '../../src/data/buttons.ts';

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The image tag of a wall entry on the page, or null. */
function entryImage(html, entry) {
  const match = html.match(
    new RegExp(`<img\\s[^>]*src="${escapeRegExp(entry.imageSrc)}"[^>]*>`)
  );
  return match ? match[0] : null;
}

/**
 * The anchor wrapping a wall entry's image (attrs + full tag), or null when
 * the image is not linked. An image is wrapped when an anchor opens before
 * it and does not close before it.
 */
function anchorAround(html, entry) {
  const match = html.match(
    new RegExp(
      `<a\\s([^>]*)>(?:(?!<\\/a>)[\\s\\S])*?<img\\s[^>]*src="${escapeRegExp(entry.imageSrc)}"[^>]*>`
    )
  );
  return match ? { attrs: match[1], tag: match[0] } : null;
}

test('the button wall follows the posts, separated from them', async () => {
  const html = await loadBuiltPage('index.html');
  const wallImages = images(html).filter((img) =>
    buttons.some((entry) => img.src === entry.imageSrc)
  );
  assert.ok(wallImages.length > 0, 'homepage shows the button wall');

  // A visible separator sits between the posts and the buttons.
  const separator = html.indexOf('<hr');
  assert.ok(separator !== -1, 'homepage shows a separator before the buttons');
  assert.ok(
    separator < wallImages[0].index,
    'the separator comes before the buttons'
  );

  // Document order of visible content: every post title link comes before
  // the separator, so the wall follows the posts; the wall comes before the
  // footer's copyright line.
  const destinations = links(html);
  for (const link of destinations.filter((l) => l.href.startsWith('/blog/'))) {
    assert.ok(
      link.index < separator,
      `the post link ${link.href} comes before the separator`
    );
  }
  const copyright = html.search(/© \d{4} ht4w5/);
  assert.ok(copyright !== -1, 'homepage shows the footer copyright line');
  for (const img of wallImages) {
    assert.ok(img.index < copyright, 'the button wall is before the footer');
  }
});

test('every button wall image renders at 88×31 with descriptive alt text', async () => {
  const html = await loadBuiltPage('index.html');

  for (const entry of buttons) {
    const img = entryImage(html, entry);
    assert.ok(img, `the wall shows ${entry.id}`);

    assert.equal(attr(img, 'width'), '88', `image is 88 wide: ${img}`);
    assert.equal(attr(img, 'height'), '31', `image is 31 tall: ${img}`);
    assert.ok(
      entry.alt.trim().length > 0,
      `the data module gives ${entry.id} descriptive alt text`
    );
    assert.equal(attr(img, 'alt'), entry.alt, `image shows its alt text: ${img}`);
  }
});

test('linked buttons carry their destination; flair badges render without a link', async () => {
  // Derived from the data file: whatever the wall currently holds, each entry
  // renders as its data describes — linked buttons with their destination,
  // flair badges without any link.
  const html = await loadBuiltPage('index.html');

  for (const entry of buttons) {
    const anchor = anchorAround(html, entry);
    if (entry.href) {
      assert.ok(anchor, `the button ${entry.id} links to its destination`);
      assert.equal(
        attr(anchor.attrs, 'href'),
        entry.href,
        `the button ${entry.id} links to ${entry.href}`
      );
      if (/^https?:\/\//.test(entry.href)) {
        assertOpensSafelyInNewTab(anchor.attrs, `the button ${entry.id}`);
      }
    } else {
      assert.ok(entryImage(html, entry), `the flair badge ${entry.id} shows its image`);
      assert.ok(!anchor, `the flair badge ${entry.id} renders without a link`);
    }
  }
});

test('the button wall renders on the homepage and on no other page', async () => {
  // A whole-dist sweep: every emitted HTML page is checked — tag pagination
  // pages included whenever the build emits any — so absence can never
  // silently go unverified.
  const pages = await listBuiltPages();
  assert.ok(pages.includes('index.html'), 'the build emits the homepage');

  for (const page of pages) {
    const html = await loadBuiltPage(page);
    const onHomepage = page === 'index.html';
    for (const entry of buttons) {
      assert.equal(
        entryImage(html, entry) !== null,
        onHomepage,
        onHomepage
          ? `the button wall renders on ${page}`
          : `the button wall does not appear on ${page}`
      );
    }
  }
});
