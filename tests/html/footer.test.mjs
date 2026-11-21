// Built-HTML tests for the footer and the CC BY-NC-SA badge. The footer
// shows the copyright line and the CC BY-NC-SA badge that has always lived
// there — and nothing besides. Assert rendered HTML a visitor receives —
// never CSS property values, markup minutiae, or script internals. Run via
// `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { COPYRIGHT, anchors, attr, visibleText } from './helpers.mjs';

// Representative pages: the homepage, the site directory, a plain page, and a
// blog post. Every route renders the same footer.
const PAGES = [
  'index.html',
  'dirs/index.html',
  'about/index.html',
  'blog/hello-world/index.html',
];

// The footer badge that stays where it always has. Kept as a literal (not
// read from a data file) so a regression cannot rewrite the expectation.
const FOOTER_BADGE = {
  href: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  src: '/images/cc-by-nc-sa.svg',
};

/** The footer region of a built page, from <footer> to </footer>. */
function footerRegion(html) {
  const start = html.indexOf('<footer');
  assert.ok(start !== -1, 'page has a footer');
  const end = html.indexOf('</footer>', start);
  assert.ok(end !== -1, 'footer closes');
  return html.slice(start, end + '</footer>'.length);
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
