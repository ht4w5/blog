// Table-of-contents static structure (nav-posts-search ticket 02): what a
// visitor receives in the built post page is an always-expanded outline — a
// plain static "Contents" heading followed by the entry links, with no
// disclosure element left to fold it. Assert what a visitor receives in the
// HTML — never CSS property values or script internals. Run via `pnpm test`,
// which builds first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { visibleText } from './helpers.mjs';

const POST = 'blog/pooling-slices-in-go-without-extra-allocations/index.html';

/** The table-of-contents region of a built page, from <nav class="toc… to </nav>. */
function tocRegion(html) {
  const start = html.indexOf('<nav class="toc');
  const end = html.indexOf('</nav>', start);
  return html.slice(start, end);
}

test('the built post page carries an always-expanded table of contents', async () => {
  const html = await loadBuiltPage(POST);
  const toc = tocRegion(html);

  // Nothing folds: the disclosure markup is gone from the outline, so it is
  // expanded even before any script runs.
  assert.ok(!toc.includes('<details'), 'the outline has no disclosure to open');
  assert.ok(!toc.includes('<summary'), 'the outline has no disclosure label');

  // The plain static label and every entry are in the HTML itself.
  // Kept as literals so a regression cannot quietly drop the outline.
  const text = visibleText(toc);
  assert.ok(text.includes('Contents'), 'the static Contents label is rendered');
  for (const name of [
    'Interface assignment allocation',
    'The better approach',
    'A common pattern',
    'See also',
  ]) {
    assert.ok(text.includes(name), `the entry "${name}" is rendered`);
  }
});
