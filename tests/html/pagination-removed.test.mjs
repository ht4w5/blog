// Built-HTML regression guard for the removed numbered pagination route
// (nav-posts-search ticket 03): the posts page supersedes the /page/N pages,
// so a request for a page-2 URL must fall through to the site's 404 page.
// The standard build is served the way the real static host serves it
// (clean URLs, 404.html fallback) and the visitor's response is asserted —
// status code and visible text, never markup minutiae or script internals.
// Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDir } from '../static-server.ts';
import { loadBuiltPage, listBuiltPages } from './load-page.mjs';
import { visibleText } from './helpers.mjs';

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist');

test('a request for a page-2 URL returns the site 404 page', async () => {
  const server = await serveDir(distDir);
  try {
    // Sanity: the server answers the homepage normally, so the 404 below is
    // the site's answer and not a broken server.
    const home = await fetch(`${server.url}/`);
    assert.equal(home.status, 200, 'the homepage answers 200');

    const response = await fetch(`${server.url}/page/2`);
    assert.equal(response.status, 404, 'a page-2 URL answers 404');
    assert.match(visibleText(await response.text()), /Page not found/);
  } finally {
    await server.close();
  }
});

test('the build emits no numbered pagination pages', async () => {
  const pages = await listBuiltPages();
  assert.deepEqual(pages.filter((page) => page.startsWith('page/')), []);
});

test('the site keeps its 404 page for visitors arriving at gone URLs', async () => {
  const html = await loadBuiltPage('404.html');
  assert.match(visibleText(html), /Page not found/);
});
