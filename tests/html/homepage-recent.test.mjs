// Built-HTML tests for the trimmed homepage (nav-posts-search ticket 03):
// the recent-posts snapshot a visitor receives — at most the 10 most recent
// posts, newest first, in the post-entry markup — followed by one
// bracket-style [all posts] link to the complete list at /posts. Assert
// what a visitor receives — visible text, link destinations, and document
// order of that content — never CSS property values, markup minutiae, or
// script internals. Run via `pnpm test`, which builds first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { attr, anchors, links, visibleText } from './helpers.mjs';

test('the built homepage shows at most the 10 most recent posts, newest first', async () => {
  // The complete list, newest first, is the posts page's; the homepage
  // snapshot is its head, capped at 10. (The cap itself is verified with
  // fixture posts in the browser seam — the live content set has fewer
  // than 10 posts.)
  const home = await loadBuiltPage('index.html');
  const posts = await loadBuiltPage('posts/index.html');

  const onHomepage = links(home).map((l) => l.href).filter((h) => h.startsWith('/blog/'));
  const complete = links(posts).map((l) => l.href).filter((h) => h.startsWith('/blog/'));

  assert.ok(
    onHomepage.length <= 10,
    `the homepage shows at most 10 posts (got ${onHomepage.length})`
  );
  assert.deepEqual(onHomepage, complete.slice(0, 10));
});

test('the built homepage ends the post list with an [all posts] link to the complete list', async () => {
  const html = await loadBuiltPage('index.html');

  const allPosts = anchors(html).find((a) => visibleText(a.inner) === '[all posts]');
  assert.ok(allPosts, 'the homepage shows the [all posts] link');
  assert.equal(attr(allPosts.attrs, 'href'), '/posts', 'the link leads to the complete list');

  // It follows the post list it points past: every post link comes first.
  for (const link of links(html).filter((l) => l.href.startsWith('/blog/'))) {
    assert.ok(
      link.index < allPosts.index,
      `the post link ${link.href} comes before the [all posts] link`
    );
  }
});
