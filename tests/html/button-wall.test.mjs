// Built-HTML tests for the homepage button wall. Assert rendered HTML a
// visitor receives — never CSS property values, markup minutiae, or script
// internals. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';

const HEADING = /<h[1-6][^>]*>buttons<\/h[1-6]>/;

/** The button wall region: from the `buttons` heading to the end of its section. */
function wallRegion(html) {
  const heading = html.match(HEADING);
  if (!heading) return null;
  const end = html.indexOf('</section>', heading.index);
  return end === -1 ? html.slice(heading.index) : html.slice(heading.index, end);
}

function attr(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? null;
}

test('homepage ends with the buttons section after the post list and pagination', async () => {
  const html = await loadBuiltPage('index.html');

  const heading = html.match(HEADING);
  assert.ok(heading, 'homepage shows a heading with the text "buttons"');

  const postList = html.indexOf('class="post-list"');
  assert.ok(postList !== -1, 'homepage shows the post list');
  assert.ok(
    heading.index > postList,
    'the buttons section comes after the post list'
  );

  const pagination = html.indexOf('class="pagination"');
  if (pagination !== -1) {
    assert.ok(
      heading.index > pagination,
      'the buttons section comes after the pagination'
    );
  }

  const footer = html.indexOf('<footer');
  assert.ok(footer !== -1, 'homepage shows the footer');
  assert.ok(heading.index < footer, 'the buttons section is before the footer');

  const rest = html.slice(heading.index);
  assert.ok(!rest.includes('<section'), 'the buttons section is the last section');
});

test('every button wall image renders at 88×31 with descriptive alt text', async () => {
  const html = await loadBuiltPage('index.html');
  const region = wallRegion(html);
  assert.ok(region, 'homepage has a button wall');

  const images = region.match(/<img\s[^>]*>/g) ?? [];
  assert.ok(images.length > 0, 'the button wall renders images');

  for (const img of images) {
    assert.equal(attr(img, 'width'), '88', `image is 88 wide: ${img}`);
    assert.equal(attr(img, 'height'), '31', `image is 31 tall: ${img}`);
    const alt = attr(img, 'alt');
    assert.ok(alt && alt.trim().length > 0, `image has descriptive alt text: ${img}`);
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
        const rel = attr(anchor, 'rel') ?? '';
        assert.match(rel, /\bnoopener\b/, `external link is noopener: ${anchor}`);
        assert.match(rel, /\bnoreferrer\b/, `external link is noreferrer: ${anchor}`);
        assert.equal(attr(anchor, 'target'), '_blank', `external link opens in a new tab: ${anchor}`);
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

test('the button wall is absent from non-homepage pages', async () => {
  // Representative pages that the build always emits.
  const pages = ['about/index.html', 'tags/index.html', 'blog/hello-world/index.html', '404.html'];

  // Pagination pages only exist when there are enough posts; assert on them
  // whenever the build emits any.
  for (let n = 2; n <= 5; n++) pages.push(`page/${n}/index.html`);

  for (const page of pages) {
    let html;
    try {
      html = await loadBuiltPage(page);
    } catch (err) {
      if (err.code === 'ENOENT') continue; // page not built with current content
      throw err;
    }
    assert.ok(!html.includes('button-wall'), `no button wall on ${page}`);
    assert.ok(!HEADING.test(html), `no "buttons" heading on ${page}`);
  }
});
