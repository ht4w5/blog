// Built-HTML tests for GFM footnotes on the Go sync.Pool slices post
// (src/content/blog/the-right-way-to-reuse-slices-in-go/ — in-flight fixture,
// used as-is). Asserts visitor-visible content and link destinations: every
// footnote reference points at its footnote definition, every Backref (↩)
// returns to its footnote reference, and the table of contents stays free of
// the screen-reader-only "Footnotes" heading. Never CSS property values or
// markup minutiae. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { attr, visibleText } from './helpers.mjs';

const FOOTNOTE_POST = 'blog/the-right-way-to-reuse-slices-in-go/index.html';

/** Every anchor's attribute string, in document order. */
function anchorAttrs(html) {
  return [...html.matchAll(/<a\s([^>]*)>/g)].map((m) => m[1]);
}

/** Anchors carrying the given semantics attribute, as { href, id } pairs. */
function footnoteAnchors(html, semantics) {
  const present = new RegExp(`(?:^|\\s)${semantics}(?:=|\\s|$)`);
  return anchorAttrs(html)
    .filter((attrs) => present.test(attrs))
    .map((attrs) => ({ href: attr(attrs, 'href'), id: attr(attrs, 'id') }));
}

/** Every element id on the page. */
function ids(html) {
  return new Set([...html.matchAll(/id="([^"]*)"/g)].map((m) => m[1]));
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
  const tocStart = html.indexOf('<nav class="toc"');
  assert.ok(tocStart !== -1, 'the post has a table of contents');
  const toc = html.slice(tocStart, html.indexOf('</nav>', tocStart));

  assert.ok(!toc.includes('footnote-label'), 'the TOC does not link to the footnote heading');
  assert.ok(!visibleText(toc).includes('Footnotes'), 'the TOC shows no "Footnotes" entry');
});

test('a post without footnotes keeps its table of contents entries', async () => {
  const html = await loadBuiltPage('blog/hello-world/index.html');
  const tocStart = html.indexOf('<nav class="toc"');
  assert.ok(tocStart !== -1, 'the post has a table of contents');
  const toc = html.slice(tocStart, html.indexOf('</nav>', tocStart));

  // Kept as literals so a regression cannot quietly drop normal headings.
  for (const [slug, text] of [
    ['code-examples', 'Code examples'],
    ['images', 'Images'],
  ]) {
    assert.ok(toc.includes(`href="#${slug}"`), `TOC links to #${slug}`);
    assert.ok(visibleText(toc).includes(text), `TOC lists "${text}"`);
  }
});
