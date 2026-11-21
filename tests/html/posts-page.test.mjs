// Built-HTML tests for the posts page (nav-posts-search ticket 01): the
// archive content a visitor receives — every post, newest first — and the
// filter's no-JS safety: the filter bar and the empty-result line ship hidden
// and are revealed only by the page's script. Assert what a visitor receives —
// never CSS property values, markup minutiae, or script internals.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBuiltPage } from './load-page.mjs';
import { attr, links, visibleText } from './helpers.mjs';

// The site's two posts, in the newest-first order the archive shows.
const NEWEST_POST = '/blog/pooling-slices-in-go-without-extra-allocations';
const OLDEST_POST = '/blog/hello-world';

test('the built posts page ships the filter bar hidden for its script to reveal', async () => {
  const html = await loadBuiltPage('posts/index.html');

  // The bar wraps the input and carries the brackets; hidden on the bar hides
  // the whole control.
  const barTag = html.match(/<span[^>]*class="posts-filter-bar"[^>]*>/)?.[0];
  assert.ok(barTag, 'the filter bar is rendered on the posts page');

  // Without JavaScript nothing reveals it, so a visitor never sees a dead
  // filter control.
  assert.ok(
    /(^|\s)hidden(\s|=|>|\/)/.test(barTag),
    `the filter bar ships hidden: ${barTag}`
  );

  const inputTag = html.match(/<input[^>]*class="posts-filter"[^>]*>/)?.[0];
  assert.ok(inputTag, 'the filter input is rendered inside the bar');
  assert.equal(attr(inputTag, 'placeholder'), 'filter posts');
  assert.equal(attr(inputTag, 'aria-label'), 'Filter posts');
});

test('the built posts page contains the complete post list newest first and no visible empty-result line', async () => {
  const html = await loadBuiltPage('posts/index.html');

  // Every post's link, newest first, as the archive's plain list.
  assert.deepEqual(
    links(html).map((link) => link.href).filter((href) => href.startsWith('/blog/')),
    [NEWEST_POST, OLDEST_POST]
  );

  // The empty-result line is pre-rendered but ships hidden — only the script
  // may show it, and only when the filter matches nothing.
  const emptyLineTag = html.match(/<[^>]*class="no-posts-match"[^>]*>/)?.[0];
  assert.ok(emptyLineTag, 'the empty-result line is rendered on the posts page');
  assert.ok(
    /(^|\s)hidden(\s|=|>|\/)/.test(emptyLineTag),
    `the empty-result line ships hidden: ${emptyLineTag}`
  );
  assert.match(visibleText(html), /no posts match/);
});
