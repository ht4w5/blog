// Built-HTML tests for GFM footnotes on the Go sync.Pool slices post
// (src/content/blog/pooling-slices-in-go-without-extra-allocations/). Asserts
// visitor-visible content and link destinations: every
// footnote reference points at its footnote definition, every Backref (↩)
// returns to its footnote reference, and the table of contents stays free of
// the screen-reader-only "Footnotes" heading. Never CSS property values or
// markup minutiae. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { anchors, attr, ids, visibleText } from './helpers.mjs';

const FOOTNOTE_POST = 'blog/pooling-slices-in-go-without-extra-allocations/index.html';

/** The table-of-contents region of a built page, from <nav class="toc" to </nav>. */
function tocRegion(html) {
  const start = html.indexOf('<nav class="toc"');
  assert.ok(start !== -1, 'the post has a table of contents');
  const end = html.indexOf('</nav>', start);
  assert.ok(end !== -1, 'the table of contents closes');
  return html.slice(start, end + '</nav>'.length);
}

/** Anchors carrying the given data attribute, as { href, id } pairs. */
function footnoteAnchors(html, dataAttr) {
  const present = new RegExp(`(?:^|\\s)${dataAttr}(?:=|\\s|$)`);
  return anchors(html)
    .filter(({ attrs }) => present.test(attrs))
    .map(({ attrs }) => ({ href: attr(attrs, 'href'), id: attr(attrs, 'id') }));
}

test('every footnote reference points at its footnote definition', async () => {
  const html = await loadBuiltPage(FOOTNOTE_POST);
  const refs = footnoteAnchors(html, 'data-footnote-ref');
  const pageIds = ids(html);

  assert.ok(refs.length > 0, 'the post has footnote references');
  for (const ref of refs) {
    assert.ok(ref.href.startsWith('#'), `reference is a page link: ${ref.href}`);
    assert.ok(
      pageIds.has(ref.href.slice(1)),
      `reference ${ref.href} points at a footnote definition id`
    );
  }
});

test('every Backref returns to its footnote reference', async () => {
  const html = await loadBuiltPage(FOOTNOTE_POST);
  const refs = footnoteAnchors(html, 'data-footnote-ref');
  const backrefs = footnoteAnchors(html, 'data-footnote-backref');
  const refIds = new Set(refs.map((ref) => ref.id));

  assert.ok(backrefs.length > 0, 'the post has Backrefs');
  assert.equal(backrefs.length, refs.length, 'each reference gets one Backref');
  for (const backref of backrefs) {
    assert.ok(
      refIds.has(backref.href.slice(1)),
      `Backref ${backref.href} returns to a footnote reference id`
    );
  }

  // The Backref is visitor-visible content.
  assert.ok(visibleText(html).includes('↩'), 'the Backref (↩) is rendered');
});

test('the table of contents has no "Footnotes" entry', async () => {
  const html = await loadBuiltPage(FOOTNOTE_POST);
  const toc = tocRegion(html);

  assert.ok(!toc.includes('footnote-label'), 'the TOC does not link to the footnote heading');
  assert.ok(!visibleText(toc).includes('Footnotes'), 'the TOC shows no "Footnotes" entry');
});

test('a post without footnotes keeps its table of contents entries', async () => {
  const html = await loadBuiltPage('blog/hello-world/index.html');
  const toc = tocRegion(html);

  // Kept as literals so a regression cannot quietly drop normal headings.
  for (const [slug, text] of [
    ['code-examples', 'Code examples'],
    ['images', 'Images'],
  ]) {
    assert.ok(toc.includes(`href="#${slug}"`), `TOC links to #${slug}`);
    assert.ok(visibleText(toc).includes(text), `TOC lists "${text}"`);
  }
});
