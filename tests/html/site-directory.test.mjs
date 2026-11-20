// Built-HTML tests for the site directory (dist/paths/) and its [paths] nav
// item. Assert what a visitor receives — link destinations, visible text and
// link semantics — never CSS values, markup minutiae, or script internals.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';

test('header nav shows [paths] linking to the site directory on representative pages', async () => {
  const pages = ['index.html', 'about/index.html', 'blog/hello-world/index.html'];

  for (const page of pages) {
    const html = await loadBuiltPage(page);
    assert.match(html, /<a href="\/paths">\[paths\]<\/a>/, `${page} should link [paths] to /paths`);
  }
});
