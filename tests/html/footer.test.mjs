// Built-HTML tests for the footer and the migrated buttons. The footer shows
// the copyright line and the CC BY-NC-SA badge that has always lived there;
// the three buttons that used to live in the footer now belong to the
// homepage button wall with their destinations preserved. Assert rendered
// HTML a visitor receives — never CSS property values, markup minutiae, or
// script internals. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { COPYRIGHT, attr, visibleText } from './helpers.mjs';

// Representative pages: the homepage, the site directory, a plain page, and a
// blog post. Every route renders the same footer.
const PAGES = [
  'index.html',
  'paths/index.html',
  'about/index.html',
  'blog/hello-world/index.html',
];

// The footer badge that stays where it always was, and the destinations of
// the buttons migrated from the old footer. Kept as literals (not read from
// src/data/buttons.ts) so a data regression cannot rewrite the expectation.
const FOOTER_BADGE = {
  href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  src: '/images/cc-by-nc-sa.svg',
};
const MIGRATED_DESTINATIONS = [
  '/', // this site
  'https://xjtu.app/',
  'https://github.com/ht4w5',
];

/** The footer region of a built page, from <footer> to </footer>. */
function footerRegion(html) {
  const start = html.indexOf('<footer');
  assert.ok(start !== -1, 'page has a footer');
  const end = html.indexOf('</footer>', start);
  assert.ok(end !== -1, 'footer closes');
  return html.slice(start, end + '</footer>'.length);
}

/** Every anchor's attributes and inner content, each bounded by its own link. */
function anchors(html) {
  return [...html.matchAll(/<a\s([^>]*)>((?:(?!<\/a>)[\s\S])*?)<\/a>/g)].map((m) => ({
    attrs: m[1],
    inner: m[2],
  }));
}

for (const page of PAGES) {
  test(`footer on ${page} shows the copyright line`, async () => {
    const html = await loadBuiltPage(page);
    const footer = footerRegion(html);
    assert.match(footer, COPYRIGHT, 'footer shows the copyright line');
  });

  test(`footer on ${page} shows the CC BY-NC-SA badge and nothing besides`, async () => {
    const html = await loadBuiltPage(page);
    const footer = footerRegion(html);

    // The CC badge links to the licence, as it always has.
    const badgeAnchor = anchors(footer).find((a) => attr(a.attrs, 'href') === FOOTER_BADGE.href);
    assert.ok(badgeAnchor, 'footer links the CC badge to the licence');

    const badgeImg = badgeAnchor.inner.match(/<img\s[^>]*>/);
    assert.ok(badgeImg, 'the CC badge shows its image');
    assert.equal(attr(badgeImg[0], 'src'), FOOTER_BADGE.src, 'the CC badge art is unchanged');
    assert.ok(
      attr(badgeImg[0], 'alt')?.trim().length,
      'the CC badge has descriptive alt text'
    );

    // Nothing else renders in the footer: no other image, icon, or link.
    const images = [...footer.matchAll(/<img\s[^>]*>/g)];
    assert.equal(images.length, 1, 'the CC badge is the footer’s only image');
    assert.ok(!/<svg[\s>]/.test(footer), 'footer has no inline icons');
    const hrefs = anchors(footer).map((a) => attr(a.attrs, 'href'));
    assert.deepEqual(hrefs, [FOOTER_BADGE.href], 'the CC badge is the footer’s only link');

    // Visible text is exactly the copyright line — nothing else renders.
    const visible = visibleText(footer);
    const copyright = visible.match(COPYRIGHT)?.[0];
    assert.ok(copyright, 'footer shows the copyright line');
    assert.equal(visible, copyright, 'the copyright line is the only visible text');
  });
}

test('the button wall keeps every migrated destination with its 88×31 button', async () => {
  const html = await loadBuiltPage('index.html');

  for (const destination of MIGRATED_DESTINATIONS) {
    const button = anchors(html).find(
      (a) => attr(a.attrs, 'href') === destination && /<img\s[^>]*>/.test(a.inner)
    );
    assert.ok(button, `button wall links to ${destination} with its button image`);

    const img = button.inner.match(/<img\s[^>]*>/);
    assert.match(img[0], /\swidth="88"/, `image at ${destination} is 88 wide`);
    assert.match(img[0], /\sheight="31"/, `image at ${destination} is 31 tall`);
  }

  // The CC badge stays in the footer — it is not turned into a wall button.
  const ccButton = anchors(html).find(
    (a) => attr(a.attrs, 'href') === FOOTER_BADGE.href && /\swidth="88"/.test(a.inner)
  );
  assert.ok(!ccButton, 'the CC badge does not become an 88×31 wall button');
});
