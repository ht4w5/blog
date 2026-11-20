// Built-HTML tests for the site directory (dist/paths/) and its [paths] nav
// item. Assert what a visitor receives — link destinations, visible text and
// link semantics — never CSS values, markup minutiae, or script internals.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { assertOpensSafelyInNewTab } from './helpers.mjs';
import { directoryEntries } from '../../src/data/site-directory.ts';

// The data file is the maintainer-facing interface for the site directory:
// expectations derive from it, so data-file edits stay data-only while the
// rendering contract (order, labels, descriptions) stays under test.

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Find the entry's label link in the built HTML: the anchor whose visible
// text is exactly the entry label and whose href is the entry href.
function findEntryAnchor(html, entry) {
  for (const match of html.matchAll(/<a\s([^>]*)>([^<]*)<\/a>/g)) {
    const [, attrs, text] = match;
    if (
      text.trim() === escapeHtml(entry.label) &&
      attrs.includes(`href="${escapeHtml(entry.href)}"`)
    ) {
      return { index: match.index, attrs };
    }
  }
  return null;
}

test('site directory renders directory entries in data-file order with labels and descriptions', async () => {
  const html = await loadBuiltPage('paths/index.html');

  const anchors = directoryEntries.map((entry) => {
    const anchor = findEntryAnchor(html, entry);
    assert.ok(anchor, `entry "${entry.label}" should link to ${entry.href}`);
    return anchor;
  });

  // Data-file order is the display order.
  for (let i = 1; i < anchors.length; i++) {
    assert.ok(
      anchors[i - 1].index < anchors[i].index,
      `entry "${directoryEntries[i].label}" should render after "${directoryEntries[i - 1].label}"`,
    );
  }

  // Each entry's optional description shows as text right under its label,
  // before the next entry.
  for (let i = 0; i < directoryEntries.length; i++) {
    const entry = directoryEntries[i];
    if (!entry.description) continue;
    const nextIndex = i + 1 < anchors.length ? anchors[i + 1].index : html.length;
    const found = html.indexOf(escapeHtml(entry.description), anchors[i].index);
    assert.ok(
      found !== -1 && found < nextIndex,
      `entry "${entry.label}" should show its description before the next entry`,
    );
  }
});

test('root-relative directory entries link in the same tab; absolute-URL entries open in a new tab safely', async () => {
  const html = await loadBuiltPage('paths/index.html');

  for (const entry of directoryEntries) {
    const anchor = findEntryAnchor(html, entry);
    assert.ok(anchor, `entry "${entry.label}" should link to ${entry.href}`);

    // Spec rule, applied independently of the page: root-relative paths are
    // same-tab, absolute http(s) URLs open in a new tab with safe rel.
    if (entry.href.startsWith('/')) {
      assert.ok(
        !/\btarget=/.test(anchor.attrs),
        `entry "${entry.label}" should link in the same tab`,
      );
    } else {
      assertOpensSafelyInNewTab(anchor.attrs, `entry "${entry.label}"`);
    }
  }
});

test('header nav shows [paths] linking to the site directory on representative pages', async () => {
  const pages = ['index.html', 'about/index.html', 'blog/hello-world/index.html'];

  for (const page of pages) {
    const html = await loadBuiltPage(page);
    assert.match(html, /<a href="\/paths">\[paths\]<\/a>/, `${page} should link [paths] to /paths`);
  }
});
