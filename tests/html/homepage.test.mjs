// Built-HTML smoke test: asserts visitor-visible content of the emitted
// homepage (dist/index.html). Assert rendered HTML a visitor receives —
// never CSS property values, markup minutiae, or script internals.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';

test('built homepage shows the site title to visitors', async () => {
  const html = await loadBuiltPage('index.html');

  // Visible in the browser tab.
  assert.match(html, /<title>Home - ht4w5<\/title>/);

  // Visible as the site title link in the header.
  assert.match(html, /<a href="\/">ht4w5<\/a>/);
});
